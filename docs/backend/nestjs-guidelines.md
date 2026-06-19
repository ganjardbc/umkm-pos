# NestJS Guidelines — WisataPOS

## Module Structure

```txt
module-name/
├── dto/
│   ├── create-module.dto.ts
│   ├── update-module.dto.ts
│   └── query-module.dto.ts
├── module-name.module.ts
├── module-name.controller.ts
└── module-name.service.ts
```

---

## Controller Pattern

```ts
@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequirePermission('products.read')
  findAll(@CurrentUser() user: AuthUser, @Query() query: QueryProductDto) {
    return this.productsService.findAll(user.merchantId, query);
  }

  @Post()
  @RequirePermission('products.write')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateProductDto) {
    return this.productsService.create(user.merchantId, dto);
  }
}
```

Controller rules:
- Tidak boleh ada Prisma call
- Tidak boleh ada business logic
- Hanya DTO, decorator, dan service call

---

## Service Pattern

```ts
@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(merchantId: string, query: QueryProductDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where = {
      merchant_id: merchantId,
      ...(search && { name: { contains: search } }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.products.findMany({ where, skip, take: limit }),
      this.prisma.products.count({ where }),
    ]);

    return {
      data: items,
      meta: { page, limit, total, total_pages: Math.ceil(total / limit) },
    };
  }
}
```

---

## Common Decorators

```ts
@CurrentUser()           // inject AuthUser dari JWT payload
@RequirePermission('x.y') // require permission code
@Public()                // skip JWT auth
```

---

## DTO Pattern

```ts
import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category_id?: string;
}
```

Query DTO untuk pagination:

```ts
export class QueryProductDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string;
}
```

---

## POS Atomic Transaction

```ts
async commitTransaction(merchantId: string, dto: CreateTransactionDto) {
  return this.prisma.$transaction(async (tx) => {
    const trx = await tx.transactions.create({
      data: {
        outlet_id: dto.outletId,
        payment_method: dto.paymentMethod,
        total_amount: dto.totalAmount,
        // ...
      },
    });

    await tx.transaction_items.createMany({
      data: dto.items.map((item) => ({
        transaction_id: trx.id,
        product_id: item.productId,
        product_name_snapshot: item.productName,
        price_snapshot: item.price,
        qty: item.qty,
        subtotal: item.price * item.qty,
      })),
    });

    for (const item of dto.items) {
      await tx.products.update({
        where: { id: item.productId },
        data: { stock_qty: { decrement: item.qty } },
      });

      await tx.stock_logs.create({
        data: {
          product_id: item.productId,
          change_qty: -item.qty,
          reason: 'sale',
          ref_id: trx.id,
        },
      });
    }

    return trx;
  });
}
```

---

## Error Handling

Gunakan NestJS built-in exceptions:

```ts
throw new NotFoundException('Product not found');
throw new ForbiddenException('Access denied');
throw new BadRequestException('Invalid input');
throw new ConflictException('Resource already exists');
```

Global `HttpExceptionFilter` sudah terpasang — semua exception otomatis dibungkus response format standard.

---

## Multi-Tenant Enforcement Checklist

Sebelum query:
1. Ambil `merchantId` dari `currentUser.merchantId`
2. Tambahkan `where: { merchant_id: merchantId }` ke semua findMany/findFirst
3. Untuk outlet-scoped: juga cek `outlet_id` ada di merchant

---

## Module Registration

Daftarkan module baru di:

```ts
// apps/api/src/app.module.ts
@Module({
  imports: [
    // ...existing modules
    ProductsModule,
  ],
})
export class AppModule {}
```

---

## Swagger

Aktifkan Swagger docs di `main.ts` (sudah terpasang):

URL: `http://localhost:3000/docs`

Semua DTO harus pakai `@ApiProperty`.
Semua controller harus pakai `@ApiTags`.
Auth bearer sudah dikonfigurasi.
