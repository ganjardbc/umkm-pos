import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { URL } from 'url';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const url = new URL(databaseUrl);

const adapter = new PrismaMariaDb({
  host: url.hostname || 'localhost',
  port: url.port ? parseInt(url.port, 10) : 3306,
  user: url.username || 'root',
  password: url.password || '',
  database: url.pathname.slice(1),
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // 1. Create Merchants
  console.log('📦 Creating merchants...');

  // Admin Merchant (for system admin)
  const adminMerchant = await prisma.merchants.upsert({
    where: { slug: 'merchant-admin' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Merchant Admin',
      slug: 'merchant-admin',
    },
  });
  console.log(
    `✅ Merchant created: ${adminMerchant.name} (${adminMerchant.slug})`,
  );

  // Demo Store Merchant (for regular users)
  const merchant = await prisma.merchants.upsert({
    where: { slug: 'demo-store' },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: 'Demo Store',
      slug: 'demo-store',
    },
  });
  console.log(`✅ Merchant created: ${merchant.name} (${merchant.slug})\n`);

  // 2. Create Outlets
  console.log('🏪 Creating outlets...');

  // Admin Outlet (for system admin)
  const adminOutlet = await prisma.outlets.upsert({
    where: {
      merchant_id_slug: {
        merchant_id: adminMerchant.id,
        slug: 'outlet-admin',
      },
    },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440020',
      merchant_id: adminMerchant.id,
      slug: 'outlet-admin',
      name: 'Outlet Admin',
      location: 'System Admin Outlet',
      is_active: true,
    },
  });
  console.log(`✅ Outlet created: ${adminOutlet.name} (${adminOutlet.slug})`);

  const mainOutlet = await prisma.outlets.upsert({
    where: {
      merchant_id_slug: {
        merchant_id: merchant.id,
        slug: 'main-branch',
      },
    },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440021',
      merchant_id: merchant.id,
      slug: 'main-branch',
      name: 'Main Branch',
      location: 'Jl. Ahmad Yani No. 1, Jakarta',
      is_active: true,
    },
  });
  console.log(`✅ Outlet created: ${mainOutlet.name} (${mainOutlet.slug})`);

  const secondOutlet = await prisma.outlets.upsert({
    where: {
      merchant_id_slug: {
        merchant_id: merchant.id,
        slug: 'second-branch',
      },
    },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440022',
      merchant_id: merchant.id,
      slug: 'second-branch',
      name: 'Second Branch',
      location: 'Jl. Sudirman No. 88, Jakarta',
      is_active: true,
    },
  });
  console.log(
    `✅ Outlet created: ${secondOutlet.name} (${secondOutlet.slug})\n`,
  );

  // 3. Create Users
  console.log('👤 Creating users...');

  const hashedPassword = await bcrypt.hash('password123', 10);

  // System Admin User (belongs to Merchant Admin)
  const adminUser = await prisma.users.upsert({
    where: {
      merchant_id_email: {
        merchant_id: adminMerchant.id,
        email: 'admin@demo.com',
      },
    },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440010',
      merchant_id: adminMerchant.id,
      name: 'System Admin',
      username: 'admin',
      email: 'admin@demo.com',
      password_hash: hashedPassword,
      is_active: true,
    },
  });
  console.log(`✅ User created: ${adminUser.name} (${adminUser.email})`);

  // Cashier User
  const cashierUser = await prisma.users.upsert({
    where: {
      merchant_id_email: {
        merchant_id: merchant.id,
        email: 'cashier@demo.com',
      },
    },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440012',
      merchant_id: merchant.id,
      name: 'Cashier User',
      username: 'cashier',
      email: 'cashier@demo.com',
      password_hash: hashedPassword,
      is_active: true,
    },
  });
  console.log(`✅ User created: ${cashierUser.name} (${cashierUser.email})`);

  // Manager User
  const managerUser = await prisma.users.upsert({
    where: {
      merchant_id_email: {
        merchant_id: merchant.id,
        email: 'manager@demo.com',
      },
    },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440013',
      merchant_id: merchant.id,
      name: 'Manager User',
      username: 'manager',
      email: 'manager@demo.com',
      password_hash: hashedPassword,
      is_active: true,
    },
  });
  console.log(`✅ User created: ${managerUser.name} (${managerUser.email})`);

  // Viewer User
  const viewerUser = await prisma.users.upsert({
    where: {
      merchant_id_email: {
        merchant_id: merchant.id,
        email: 'viewer@demo.com',
      },
    },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440014',
      merchant_id: merchant.id,
      name: 'Viewer User',
      username: 'viewer',
      email: 'viewer@demo.com',
      password_hash: hashedPassword,
      is_active: true,
    },
  });
  console.log(`✅ User created: ${viewerUser.name} (${viewerUser.email})`);

  // Owner User
  const ownerUser = await prisma.users.upsert({
    where: {
      merchant_id_email: {
        merchant_id: merchant.id,
        email: 'owner@demo.com',
      },
    },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440015',
      merchant_id: merchant.id,
      name: 'Owner User',
      username: 'owner',
      email: 'owner@demo.com',
      password_hash: hashedPassword,
      is_active: true,
    },
  });
  console.log(`✅ User created: ${ownerUser.name} (${ownerUser.email})`);

  // Store Manager User (for Demo Store)
  const storeManagerUser = await prisma.users.upsert({
    where: {
      merchant_id_email: {
        merchant_id: merchant.id,
        email: 'store-manager@demo.com',
      },
    },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440016',
      merchant_id: merchant.id,
      name: 'Store Manager User',
      username: 'store-manager',
      email: 'store-manager@demo.com',
      password_hash: hashedPassword,
      is_active: true,
    },
  });
  console.log(
    `✅ User created: ${storeManagerUser.name} (${storeManagerUser.email})\n`,
  );

  // 4. Create Products (for both merchants)
  console.log('🛒 Creating products...');

  // Products for Admin Merchant
  await prisma.products.upsert({
    where: {
      merchant_id_slug: {
        merchant_id: adminMerchant.id,
        slug: 'admin-product',
      },
    },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440030',
      merchant_id: adminMerchant.id,
      slug: 'admin-product',
      name: 'Admin Product',
      category: 'System',
      price: 0,
      cost: 0,
      stock_qty: 0,
      min_stock: 0,
      is_active: true,
    },
  });
  console.log('✅ Product created: Admin Product (admin-product)');

  // Products for Demo Store
  await prisma.products.upsert({
    where: {
      merchant_id_slug: {
        merchant_id: merchant.id,
        slug: 'kopi-hitam',
      },
    },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440031',
      merchant_id: merchant.id,
      slug: 'kopi-hitam',
      name: 'Kopi Hitam',
      category: 'Beverages',
      price: 15000,
      cost: 5000,
      stock_qty: 100,
      min_stock: 10,
      is_active: true,
    },
  });
  console.log('✅ Product created: Kopi Hitam (kopi-hitam)');

  await prisma.products.upsert({
    where: {
      merchant_id_slug: {
        merchant_id: merchant.id,
        slug: 'teh-manis',
      },
    },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440032',
      merchant_id: merchant.id,
      slug: 'teh-manis',
      name: 'Teh Manis',
      category: 'Beverages',
      price: 10000,
      cost: 3000,
      stock_qty: 150,
      min_stock: 10,
      is_active: true,
    },
  });
  console.log('✅ Product created: Teh Manis (teh-manis)');

  await prisma.products.upsert({
    where: {
      merchant_id_slug: {
        merchant_id: merchant.id,
        slug: 'air-mineral',
      },
    },
    update: {},
    create: {
      id: '550e8400-e29b-41d4-a716-446655440033',
      merchant_id: merchant.id,
      slug: 'air-mineral',
      name: 'Air Mineral',
      category: 'Beverages',
      price: 5000,
      cost: 1500,
      stock_qty: 200,
      min_stock: 20,
      is_active: true,
    },
  });
  console.log('✅ Product created: Air Mineral (air-mineral)\n');

  // 5. Create Shifts (cashier shifts)
  console.log('⏰ Creating shifts...');

  const SHIFT_1_ID = '550e8400-e29b-41d4-a716-446655440041'; // closed shift (main-branch, cashier)
  const SHIFT_2_ID = '550e8400-e29b-41d4-a716-446655440042'; // open shift (main-branch, cashier)

  const shift1Exists = await prisma.shifts.findFirst({
    where: { id: SHIFT_1_ID },
  });
  if (!shift1Exists) {
    const shift1StartTime = new Date();
    shift1StartTime.setHours(shift1StartTime.getHours() - 10);
    const shift1EndTime = new Date();
    shift1EndTime.setHours(shift1EndTime.getHours() - 2);

    await prisma.shifts.create({
      data: {
        id: SHIFT_1_ID,
        outlet_id: mainOutlet.id,
        shift_owner_id: cashierUser.id,
        start_time: shift1StartTime,
        end_time: shift1EndTime,
        status: 'closed',
        created_by: cashierUser.id,
        updated_by: cashierUser.id,
      },
    });
    console.log('✅ Shift 1 created: Main Branch — cashier (closed)');
  } else {
    console.log('⏭️  Shift 1 already exists, skipping.');
  }

  const shift2Exists = await prisma.shifts.findFirst({
    where: { id: SHIFT_2_ID },
  });
  if (!shift2Exists) {
    const shift2StartTime = new Date();
    shift2StartTime.setHours(shift2StartTime.getHours() - 1);

    await prisma.shifts.create({
      data: {
        id: SHIFT_2_ID,
        outlet_id: mainOutlet.id,
        shift_owner_id: storeManagerUser.id,
        start_time: shift2StartTime,
        status: 'open',
        created_by: storeManagerUser.id,
        updated_by: storeManagerUser.id,
      },
    });
    console.log('✅ Shift 2 created: Main Branch — store-manager (open)\n');
  } else {
    console.log('⏭️  Shift 2 already exists, skipping.\n');
  }

  // 6. Create Transactions & Transaction Items
  console.log('💳 Creating transactions...');

  const TX_1_ID = '550e8400-e29b-41d4-a716-446655440051';
  const TX_2_ID = '550e8400-e29b-41d4-a716-446655440052';

  // Transaction 1: Main Branch — store-manager buys Kopi Hitam x2 + Teh Manis x1 (linked to closed shift)
  const tx1Exists = await prisma.transactions.findFirst({
    where: { id: TX_1_ID },
  });
  if (!tx1Exists) {
    await prisma.transactions.create({
      data: {
        id: TX_1_ID,
        outlet_id: mainOutlet.id,
        user_id: storeManagerUser.id,
        shift_id: SHIFT_1_ID,
        payment_method: 'cash',
        total_amount: 40000, // 15000*2 + 10000*1
        is_offline: false,
        created_by: storeManagerUser.id,
        updated_by: storeManagerUser.id,
      },
    });

    await prisma.transaction_items.createMany({
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440061',
          transaction_id: TX_1_ID,
          product_id: '550e8400-e29b-41d4-a716-446655440031', // kopi-hitam
          product_name_snapshot: 'Kopi Hitam',
          price_snapshot: 15000,
          qty: 2,
          subtotal: 30000,
          created_by: storeManagerUser.id,
          updated_by: storeManagerUser.id,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440062',
          transaction_id: TX_1_ID,
          product_id: '550e8400-e29b-41d4-a716-446655440032', // teh-manis
          product_name_snapshot: 'Teh Manis',
          price_snapshot: 10000,
          qty: 1,
          subtotal: 10000,
          created_by: storeManagerUser.id,
          updated_by: storeManagerUser.id,
        },
      ],
    });

    // Decrement stock for tx1 items
    await prisma.products.update({
      where: { id: '550e8400-e29b-41d4-a716-446655440031' },
      data: { stock_qty: { decrement: 2 } },
    });
    await prisma.products.update({
      where: { id: '550e8400-e29b-41d4-a716-446655440032' },
      data: { stock_qty: { decrement: 1 } },
    });

    // Stock logs for tx1
    await prisma.stock_logs.createMany({
      data: [
        {
          product_id: '550e8400-e29b-41d4-a716-446655440031',
          change_qty: -2,
          reason: 'sale',
          ref_id: TX_1_ID,
          created_by: storeManagerUser.id,
          updated_by: storeManagerUser.id,
        },
        {
          product_id: '550e8400-e29b-41d4-a716-446655440032',
          change_qty: -1,
          reason: 'sale',
          ref_id: TX_1_ID,
          created_by: storeManagerUser.id,
          updated_by: storeManagerUser.id,
        },
      ],
    });
    console.log(
      '✅ Transaction 1 created: Main Branch — Kopi Hitam x2 + Teh Manis x1',
    );
  } else {
    console.log('⏭️  Transaction 1 already exists, skipping.');
  }

  // Transaction 2: Second Branch — cashier buys Air Mineral x3
  const tx2Exists = await prisma.transactions.findFirst({
    where: { id: TX_2_ID },
  });
  if (!tx2Exists) {
    await prisma.transactions.create({
      data: {
        id: TX_2_ID,
        outlet_id: secondOutlet.id,
        user_id: cashierUser.id,
        payment_method: 'qris',
        total_amount: 15000, // 5000*3
        is_offline: false,
        created_by: cashierUser.id,
        updated_by: cashierUser.id,
      },
    });

    await prisma.transaction_items.createMany({
      data: [
        {
          id: '550e8400-e29b-41d4-a716-446655440063',
          transaction_id: TX_2_ID,
          product_id: '550e8400-e29b-41d4-a716-446655440033', // air-mineral
          product_name_snapshot: 'Air Mineral',
          price_snapshot: 5000,
          qty: 3,
          subtotal: 15000,
          created_by: cashierUser.id,
          updated_by: cashierUser.id,
        },
      ],
    });

    // Decrement stock for tx2 items
    await prisma.products.update({
      where: { id: '550e8400-e29b-41d4-a716-446655440033' },
      data: { stock_qty: { decrement: 3 } },
    });

    // Stock logs for tx2
    await prisma.stock_logs.createMany({
      data: [
        {
          product_id: '550e8400-e29b-41d4-a716-446655440033',
          change_qty: -3,
          reason: 'sale',
          ref_id: TX_2_ID,
          created_by: cashierUser.id,
          updated_by: cashierUser.id,
        },
      ],
    });
    console.log('✅ Transaction 2 created: Second Branch — Air Mineral x3\n');
  } else {
    console.log('⏭️  Transaction 2 already exists, skipping.\n');
  }

  // 7. Manual Stock Adjustments (restock & damage log examples)
  console.log('📦 Creating stock adjustments...');

  const STOCK_ADJ_1_ID = '550e8400-e29b-41d4-a716-446655440071';
  const STOCK_ADJ_2_ID = '550e8400-e29b-41d4-a716-446655440072';

  // Restock: Kopi Hitam +50 (manual restock by manager)
  const adj1Exists = await prisma.stock_logs.findFirst({
    where: { id: STOCK_ADJ_1_ID },
  });
  if (!adj1Exists) {
    await prisma.stock_logs.create({
      data: {
        id: STOCK_ADJ_1_ID,
        product_id: '550e8400-e29b-41d4-a716-446655440031', // kopi-hitam
        change_qty: 50,
        reason: 'restock',
        ref_id: null,
        created_by: managerUser.id,
        updated_by: managerUser.id,
      },
    });
    await prisma.products.update({
      where: { id: '550e8400-e29b-41d4-a716-446655440031' },
      data: { stock_qty: { increment: 50 } },
    });
    console.log('✅ Stock adjustment: Kopi Hitam +50 (restock)');
  } else {
    console.log('⏭️  Stock adjustment 1 already exists, skipping.');
  }

  // Damage: Teh Manis -5 (damaged goods, removed by manager)
  const adj2Exists = await prisma.stock_logs.findFirst({
    where: { id: STOCK_ADJ_2_ID },
  });
  if (!adj2Exists) {
    await prisma.stock_logs.create({
      data: {
        id: STOCK_ADJ_2_ID,
        product_id: '550e8400-e29b-41d4-a716-446655440032', // teh-manis
        change_qty: -5,
        reason: 'damage',
        ref_id: null,
        created_by: managerUser.id,
        updated_by: managerUser.id,
      },
    });
    await prisma.products.update({
      where: { id: '550e8400-e29b-41d4-a716-446655440032' },
      data: { stock_qty: { decrement: 5 } },
    });
    console.log('✅ Stock adjustment: Teh Manis -5 (damage)\n');
  } else {
    console.log('⏭️  Stock adjustment 2 already exists, skipping.\n');
  }

  // 8. RBAC — Roles, Permissions, Role-Permissions, User-Roles
  console.log('🔐 Seeding RBAC (roles & permissions)...');

  // ── Roles ──────────────────────────────────────────────────────────
  const ROLE_OWNER_ID = '550e8400-e29b-41d4-a716-446655440080';
  const ROLE_ADMIN_ID = '550e8400-e29b-41d4-a716-446655440081';
  const ROLE_MANAGER_ID = '550e8400-e29b-41d4-a716-446655440082';
  const ROLE_CASHIER_ID = '550e8400-e29b-41d4-a716-446655440083';
  const ROLE_VIEWER_ID = '550e8400-e29b-41d4-a716-446655440084';

  const rolesData = [
    {
      id: ROLE_OWNER_ID,
      name: 'owner',
      description: 'Business owner with full control',
    },
    { id: ROLE_ADMIN_ID, name: 'admin', description: 'Full system access' },
    {
      id: ROLE_MANAGER_ID,
      name: 'manager',
      description: 'Manage store operations',
    },
    {
      id: ROLE_CASHIER_ID,
      name: 'cashier',
      description: 'Handle POS transactions',
    },
    { id: ROLE_VIEWER_ID, name: 'viewer', description: 'Read-only access' },
  ];

  for (const role of rolesData) {
    const existing = await prisma.roles.findFirst({ where: { id: role.id } });
    if (!existing) {
      await prisma.roles.create({ data: role });
    }
    console.log(`✅ Role: ${role.name}`);
  }

  // ── Permissions ────────────────────────────────────────────────────
  // No hardcoded IDs — the DB auto-generates UUIDs; we resolve them after upsert.
  const permissionsData = [
    // Merchant management
    { code: 'merchants.create', description: 'Create merchants' },
    { code: 'merchants.read', description: 'Read merchants' },
    { code: 'merchants.update', description: 'Update merchant details' },
    { code: 'merchants.delete', description: 'Delete merchants' },
    // Outlet management
    { code: 'outlet.create', description: 'Create outlets' },
    { code: 'outlet.read', description: 'Read outlets' },
    { code: 'outlet.update', description: 'Update outlet details' },
    { code: 'outlet.delete', description: 'Delete outlets' },
    // Shift management
    { code: 'shift.create', description: 'Open cashier shifts' },
    { code: 'shift.read', description: 'Read cashier shifts' },
    { code: 'shift.update', description: 'Close cashier shifts' },
    // Role management
    { code: 'role.create', description: 'Create roles' },
    { code: 'role.read', description: 'Read roles' },
    { code: 'role.update', description: 'Update roles & assign permissions' },
    { code: 'role.delete', description: 'Delete roles' },
    { code: 'role.assign', description: 'Assign & revoke user roles' },
    // Permission management
    { code: 'permission.create', description: 'Create permissions' },
    { code: 'permission.read', description: 'Read permissions' },
    { code: 'permission.delete', description: 'Delete permissions' },
    // User management
    { code: 'user.create', description: 'Create users' },
    { code: 'user.read', description: 'Read users' },
    { code: 'user.update', description: 'Update users' },
    { code: 'user.delete', description: 'Delete (deactivate) users' },
    // Product management
    { code: 'product.create', description: 'Create products' },
    { code: 'product.read', description: 'Read products' },
    { code: 'product.update', description: 'Update products' },
    { code: 'product.delete', description: 'Delete products' },
    // Category management
    { code: 'category.create', description: 'Create product categories' },
    { code: 'category.read', description: 'Read product categories' },
    { code: 'category.update', description: 'Update product categories' },
    { code: 'category.delete', description: 'Delete product categories' },
    // Transactions
    { code: 'transaction.create', description: 'Create transactions (POS)' },
    { code: 'transaction.read', description: 'Read transactions' },
    // Reports & Stock
    { code: 'report.read', description: 'Read reports & dashboard' },
    { code: 'stock.adjust', description: 'Adjust stock manually' },
    { code: 'stock.read', description: 'Read stock logs' },
    // File uploads
    { code: 'upload.create', description: 'Upload files to S3' },
    { code: 'upload.read', description: 'View file metadata & signed URLs' },
    { code: 'upload.delete', description: 'Delete uploaded files' },
  ];

  for (const perm of permissionsData) {
    await prisma.permissions.upsert({
      where: { code: perm.code },
      update: { description: perm.description },
      create: perm,
    });
  }
  console.log(`✅ ${permissionsData.length} permissions seeded\n`);

  // ── Resolve real IDs from DB after upsert ──────────────────────────
  const dbPerms = await prisma.permissions.findMany({
    where: { code: { in: permissionsData.map((p) => p.code) } },
    select: { id: true, code: true },
  });
  // Helper: look up a permission's DB id by code
  const pid = (code: string): string => {
    const found = dbPerms.find((p) => p.code === code);
    if (!found) throw new Error(`Permission not found in DB: ${code}`);
    return found.id;
  };

  // ── Role → Permissions ─────────────────────────────────────────────
  console.log('🔗 Assigning permissions to roles...');

  const allPermIds = dbPerms.map((p) => p.id);

  const ownerPermIds = [
    'merchants.read',
    'merchants.update',
    'outlet.create',
    'outlet.read',
    'outlet.update',
    'outlet.delete',
    'shift.create',
    'shift.read',
    'shift.update',
    'role.read',
    'role.assign',
    'permission.read',
    'user.create',
    'user.read',
    'user.update',
    'user.delete',
    'product.create',
    'product.read',
    'product.update',
    'product.delete',
    'category.create',
    'category.read',
    'category.update',
    'category.delete',
    'transaction.create',
    'transaction.read',
    'report.read',
    'stock.adjust',
    'stock.read',
    'upload.create',
    'upload.read',
    'upload.delete',
  ].map(pid);

  const managerPermIds = [
    'merchants.read',
    'merchants.update',
    'outlet.create',
    'outlet.read',
    'outlet.update',
    'shift.create',
    'shift.read',
    'shift.update',
    'role.read',
    'permission.read',
    'user.create',
    'user.read',
    'user.update',
    'product.create',
    'product.read',
    'product.update',
    'category.create',
    'category.read',
    'category.update',
    'category.delete',
    'transaction.read',
    'report.read',
    'stock.adjust',
    'stock.read',
    'upload.create',
    'upload.read',
  ].map(pid);

  const cashierPermIds = [
    'outlet.read',
    'shift.create',
    'shift.read',
    'shift.update',
    'product.read',
    'category.read',
    'transaction.create',
    'transaction.read',
    'upload.create',
    'upload.read',
  ].map(pid);

  const viewerPermIds = [
    'merchants.read',
    'outlet.read',
    'shift.read',
    'role.read',
    'permission.read',
    'user.read',
    'product.read',
    'transaction.read',
    'report.read',
    'stock.read',
    'upload.read',
  ].map(pid);

  const rolePermMap: { roleId: string; permIds: string[] }[] = [
    { roleId: ROLE_OWNER_ID, permIds: ownerPermIds }, // Owner has most permissions (except merchants.create/delete)
    { roleId: ROLE_ADMIN_ID, permIds: allPermIds }, // Admin has all permissions
    { roleId: ROLE_MANAGER_ID, permIds: managerPermIds }, // Manager has operational permissions
    { roleId: ROLE_CASHIER_ID, permIds: cashierPermIds }, // Cashier has POS permissions
    { roleId: ROLE_VIEWER_ID, permIds: viewerPermIds }, // Viewer has read-only permissions
  ];

  for (const { roleId, permIds } of rolePermMap) {
    // Delete any stale assignments not in the current set
    await prisma.role_permissions.deleteMany({
      where: {
        role_id: roleId,
        permission_id: { notIn: permIds },
      },
    });

    // Insert missing assignments
    for (const permissionId of permIds) {
      const exists = await prisma.role_permissions.findFirst({
        where: { role_id: roleId, permission_id: permissionId },
      });
      if (!exists) {
        await prisma.role_permissions.create({
          data: { role_id: roleId, permission_id: permissionId },
        });
      }
    }
  }
  console.log('✅ Role-permission assignments synced\n');

  // ── User → Roles (per outlet) ──────────────────────────────────────
  console.log('👥 Assigning roles to users...');

  const userRolesData = [
    // System admin → admin role @ Outlet Admin (full access to entire project)
    {
      user_id: adminUser.id,
      role_id: ROLE_ADMIN_ID,
      outlet_id: adminOutlet.id,
    },
    // Demo Store users
    // Owner → owner role @ Main Branch & Second Branch
    {
      user_id: ownerUser.id,
      role_id: ROLE_OWNER_ID,
      outlet_id: mainOutlet.id,
    },
    {
      user_id: ownerUser.id,
      role_id: ROLE_OWNER_ID,
      outlet_id: secondOutlet.id,
    },
    // Store Manager → manager role @ Main Branch & Second Branch
    {
      user_id: storeManagerUser.id,
      role_id: ROLE_MANAGER_ID,
      outlet_id: mainOutlet.id,
    },
    {
      user_id: storeManagerUser.id,
      role_id: ROLE_MANAGER_ID,
      outlet_id: secondOutlet.id,
    },
    // Cashier → cashier role @ Main Branch & Second Branch
    {
      user_id: cashierUser.id,
      role_id: ROLE_CASHIER_ID,
      outlet_id: mainOutlet.id,
    },
    {
      user_id: cashierUser.id,
      role_id: ROLE_CASHIER_ID,
      outlet_id: secondOutlet.id,
    },
    // Manager → manager role @ Main Branch & Second Branch
    {
      user_id: managerUser.id,
      role_id: ROLE_MANAGER_ID,
      outlet_id: mainOutlet.id,
    },
    {
      user_id: managerUser.id,
      role_id: ROLE_MANAGER_ID,
      outlet_id: secondOutlet.id,
    },
    // Viewer → viewer role @ Main Branch & Second Branch
    {
      user_id: viewerUser.id,
      role_id: ROLE_VIEWER_ID,
      outlet_id: mainOutlet.id,
    },
    {
      user_id: viewerUser.id,
      role_id: ROLE_VIEWER_ID,
      outlet_id: secondOutlet.id,
    },
  ];

  for (const ur of userRolesData) {
    const exists = await prisma.user_roles.findFirst({
      where: {
        user_id: ur.user_id,
        role_id: ur.role_id,
        outlet_id: ur.outlet_id,
      },
    });
    if (!exists) {
      await prisma.user_roles.create({ data: ur });
    }
  }
  console.log(`✅ ${userRolesData.length} user-role assignments seeded\n`);

  // 9. Daily Reports (aggregated report rows)
  console.log('📊 Seeding daily reports...');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  const dailyReportsData = [
    {
      merchant_id: merchant.id,
      outlet_id: mainOutlet.id,
      report_date: twoDaysAgo,
      total_sales: 55000, // e.g. Kopi x2 + Teh x1 + Air x3
      total_transactions: 2,
    },
    {
      merchant_id: merchant.id,
      outlet_id: mainOutlet.id,
      report_date: yesterday,
      total_sales: 40000,
      total_transactions: 1,
    },
    {
      merchant_id: merchant.id,
      outlet_id: mainOutlet.id,
      report_date: today,
      total_sales: 15000,
      total_transactions: 1,
    },
    {
      merchant_id: merchant.id,
      outlet_id: secondOutlet.id,
      report_date: twoDaysAgo,
      total_sales: 10000,
      total_transactions: 1,
    },
    {
      merchant_id: merchant.id,
      outlet_id: secondOutlet.id,
      report_date: yesterday,
      total_sales: 20000,
      total_transactions: 2,
    },
    {
      merchant_id: merchant.id,
      outlet_id: secondOutlet.id,
      report_date: today,
      total_sales: 15000,
      total_transactions: 1,
    },
  ];

  for (const report of dailyReportsData) {
    // Delete existing record if it exists
    await prisma.daily_reports.deleteMany({
      where: {
        merchant_id: report.merchant_id,
        outlet_id: report.outlet_id,
        report_date: report.report_date,
      },
    });

    // Create new record
    await prisma.daily_reports.create({
      data: {
        merchant_id: report.merchant_id,
        outlet_id: report.outlet_id,
        report_date: report.report_date,
        total_sales: report.total_sales,
        total_transactions: report.total_transactions,
      },
    });
  }
  console.log(`✅ ${dailyReportsData.length} daily reports seeded\n`);

  console.log('🎉 Seeding completed successfully!\n');
  console.log('📝 Test Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('System Admin (Full Project Access):');
  console.log('  Email: admin@demo.com');
  console.log('  Password: password123');
  console.log('  Merchant: Merchant Admin');
  console.log('  Outlet: Outlet Admin');
  console.log('  Role: admin');
  console.log('');
  console.log('Demo Store Users (Merchant: Demo Store):');
  console.log('  Email: owner@demo.com');
  console.log('  Password: password123');
  console.log('  Role: owner (Main Branch & Second Branch)');
  console.log('');
  console.log('  Email: store-manager@demo.com');
  console.log('  Password: password123');
  console.log('  Role: manager (Main Branch & Second Branch)');
  console.log('');
  console.log('  Email: cashier@demo.com');
  console.log('  Password: password123');
  console.log('  Role: cashier (Main Branch & Second Branch)');
  console.log('');
  console.log('  Email: manager@demo.com');
  console.log('  Password: password123');
  console.log('  Role: manager (Main Branch & Second Branch)');
  console.log('');
  console.log('  Email: viewer@demo.com');
  console.log('  Password: password123');
  console.log('  Role: viewer (Main Branch & Second Branch)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
