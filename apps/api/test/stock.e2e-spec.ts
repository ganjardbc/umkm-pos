import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/database/prisma.service';
import { ValidationPipe } from './../src/common/pipes/validation.pipe';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { TransformInterceptor } from './../src/common/interceptors/transform.interceptor';

/**
 * e2e coverage for POST /api/v1/stock/adjust
 *
 * Proves change_qty validation runs server-side (not just the FE zod schema),
 * covering: negative-overflow rejection, change_qty === 0 rejection,
 * a valid adjustment happy-path, and multi-tenant isolation.
 *
 * Fixture data comes from prisma/seed.ts (demo-store merchant, main-branch
 * outlet, kopi-hitam product, owner@demo.com user with `stock.adjust`).
 */
describe('Stock Adjust (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let ownerToken: string;

  // Seeded fixtures (see prisma/seed.ts)
  const DEMO_MERCHANT_ID = '550e8400-e29b-41d4-a716-446655440001';
  const MAIN_OUTLET_ID = '550e8400-e29b-41d4-a716-446655440021';
  const KOPI_HITAM_PRODUCT_ID = '550e8400-e29b-41d4-a716-446655440031';

  // Fixtures belonging to a different merchant, used for the multi-tenant guard test.
  const ADMIN_OUTLET_ID = '550e8400-e29b-41d4-a716-446655440020';
  const ADMIN_PRODUCT_ID = '550e8400-e29b-41d4-a716-446655440030';

  const BASELINE_STOCK_QTY = 20;

  let inventoryExistedBeforeTest = false;
  const createdMovementIds: string[] = [];

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());
    await app.init();

    prisma = app.get(PrismaService);

    // Login as seeded owner (has `stock.adjust` permission on demo-store merchant).
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'owner@demo.com', password: 'password123' })
      .expect(201);

    ownerToken = loginRes.body.data.access_token;

    // Ensure a known, deterministic baseline for outlet_product_inventory
    // (kopi-hitam @ main-branch) so assertions are not flaky across re-runs.
    const existing = await prisma.outlet_product_inventory.findUnique({
      where: {
        outlet_id_product_id: {
          outlet_id: MAIN_OUTLET_ID,
          product_id: KOPI_HITAM_PRODUCT_ID,
        },
      },
    });

    if (existing) {
      inventoryExistedBeforeTest = true;
      await prisma.outlet_product_inventory.update({
        where: {
          outlet_id_product_id: {
            outlet_id: MAIN_OUTLET_ID,
            product_id: KOPI_HITAM_PRODUCT_ID,
          },
        },
        data: { stock_qty: BASELINE_STOCK_QTY },
      });
    } else {
      await prisma.outlet_product_inventory.create({
        data: {
          merchant_id: DEMO_MERCHANT_ID,
          outlet_id: MAIN_OUTLET_ID,
          product_id: KOPI_HITAM_PRODUCT_ID,
          stock_qty: BASELINE_STOCK_QTY,
          min_stock: 10,
          is_active: true,
        },
      });
    }
  });

  afterAll(async () => {
    // Clean up movements created during this run.
    if (createdMovementIds.length > 0) {
      await prisma.inventory_movements.deleteMany({
        where: { id: { in: createdMovementIds } },
      });
    }

    // Restore inventory row to pre-test state.
    if (inventoryExistedBeforeTest) {
      await prisma.outlet_product_inventory.update({
        where: {
          outlet_id_product_id: {
            outlet_id: MAIN_OUTLET_ID,
            product_id: KOPI_HITAM_PRODUCT_ID,
          },
        },
        data: { stock_qty: BASELINE_STOCK_QTY },
      });
    } else {
      await prisma.outlet_product_inventory.delete({
        where: {
          outlet_id_product_id: {
            outlet_id: MAIN_OUTLET_ID,
            product_id: KOPI_HITAM_PRODUCT_ID,
          },
        },
      });
    }

    await app.close();
  });

  const adjust = (payload: Record<string, unknown>) =>
    request(app.getHttpServer())
      .post('/api/v1/stock/adjust')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(payload);

  it('rejects change_qty that would push stock_qty below 0', async () => {
    const res = await adjust({
      outlet_id: MAIN_OUTLET_ID,
      product_id: KOPI_HITAM_PRODUCT_ID,
      change_qty: -(BASELINE_STOCK_QTY + 1000),
      reason: 'damage',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Stock cannot go below 0');
  });

  it('rejects change_qty === 0', async () => {
    const res = await adjust({
      outlet_id: MAIN_OUTLET_ID,
      product_id: KOPI_HITAM_PRODUCT_ID,
      change_qty: 0,
      reason: 'restock',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('change_qty must not be 0');
  });

  it('applies a valid adjustment and writes an inventory_movements record', async () => {
    const changeQty = 5;

    const res = await adjust({
      outlet_id: MAIN_OUTLET_ID,
      product_id: KOPI_HITAM_PRODUCT_ID,
      change_qty: changeQty,
      reason: 'restock',
      note: 'e2e test restock',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.outlet_inventory.stock_qty).toBe(
      BASELINE_STOCK_QTY + changeQty,
    );
    expect(res.body.data.movement).toBeDefined();
    expect(res.body.data.movement.change_qty).toBe(changeQty);

    createdMovementIds.push(res.body.data.movement.id);

    const movementInDb = await prisma.inventory_movements.findUnique({
      where: { id: res.body.data.movement.id },
    });
    expect(movementInDb).not.toBeNull();
    expect(movementInDb?.stock_after).toBe(BASELINE_STOCK_QTY + changeQty);

    const inventoryInDb = await prisma.outlet_product_inventory.findUnique({
      where: {
        outlet_id_product_id: {
          outlet_id: MAIN_OUTLET_ID,
          product_id: KOPI_HITAM_PRODUCT_ID,
        },
      },
    });
    expect(inventoryInDb?.stock_qty).toBe(BASELINE_STOCK_QTY + changeQty);
  });

  it('does not leak another merchant data (404, not adjustment) when product/outlet belong to a different merchant', async () => {
    const res = await adjust({
      outlet_id: ADMIN_OUTLET_ID,
      product_id: ADMIN_PRODUCT_ID,
      change_qty: 5,
      reason: 'restock',
    });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
