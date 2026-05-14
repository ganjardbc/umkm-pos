# Product Category Feature Implementation Plan

## Overview
This plan outlines the implementation of a dedicated **Product Category** feature that will integrate with the existing Product feature. Categories will be merchant-scoped (like products) and selectable when creating or editing products.

---

## Current State Analysis

### Backend (BE)
- **Product Model**: Categories are currently stored as a simple optional string field (`category: String?`) on the `products` table
- **No dedicated category management**: No separate categories table, endpoints, or service
- **Merchant Scoping**: Products are scoped to merchants via `merchant_id` foreign key
- **API**: POST/GET/PATCH/DELETE endpoints for products with permission-based access control

### Frontend (FE)
- **Product Creation**: Category is a simple text input field (InputText)
- **Product Edit**: Category is also a text input field
- **No category selection**: Users manually type category names (prone to inconsistency)
- **No category management UI**: No dedicated page to manage categories

---

## Proposed Solution

### Architecture Overview
```
merchants (1) ──── (many) product_categories
                        │
                        └──── (many) products
```

**Key Principle**: Categories are merchant-scoped, just like products. Each merchant has their own set of categories.

---

## Implementation Plan

### Phase 1: Backend Implementation

#### 1.1 Database Schema Changes

**Create new `product_categories` table:**
```prisma
model product_categories {
  id            String    @id @default(dbgenerated("(uuid())")) @db.Char(36)
  merchant_id   String    @db.Char(36)
  name          String    @db.VarChar(100)
  description   String?   @db.Text
  is_active     Boolean   @default(true)
  created_at    DateTime  @default(now()) @db.Timestamp(0)
  updated_at    DateTime  @default(now()) @db.Timestamp(0)
  created_by    String?   @db.Char(36)
  updated_by    String?   @db.Char(36)
  
  merchants     merchants @relation(fields: [merchant_id], references: [id], onDelete: Cascade, onUpdate: NoAction)
  products      products[]
  
  @@unique([merchant_id, name], map: "unique_merchant_category_name")
  @@index([merchant_id], map: "idx_product_categories_merchant")
  @@index([is_active], map: "idx_product_categories_active")
}
```

**Update `products` table:**
- Replace `category: String?` with `category_id: String?` (foreign key)
- Add relation to `product_categories`

```prisma
model products {
  // ... existing fields ...
  category_id   String?             @db.Char(36)
  
  // ... existing relations ...
  product_categories product_categories? @relation(fields: [category_id], references: [id], onDelete: SetNull, onUpdate: NoAction)
  
  @@index([category_id], map: "idx_products_category")
}
```

**Update `merchants` table:**
- Add relation to `product_categories`

```prisma
model merchants {
  // ... existing fields ...
  product_categories product_categories[]
}
```

**Migration Steps:**
1. Create new `product_categories` table
2. Add `category_id` column to `products` table
3. Migrate existing category strings to new table (create categories from unique product categories)
4. Drop old `category` column from `products` table

#### 1.2 Create Category Service

**File**: `src/products/categories/categories.service.ts`

```typescript
@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // List all categories for a merchant
  async findAll(merchantId: string, pagination: PaginationDto)
  
  // Get single category
  async findOne(id: string, merchantId: string)
  
  // Create category
  async create(dto: CreateCategoryDto, merchantId: string, userId: string)
  
  // Update category
  async update(id: string, dto: UpdateCategoryDto, merchantId: string, userId: string)
  
  // Delete category (soft delete or cascade)
  async remove(id: string, merchantId: string)
  
  // Get categories for dropdown/select (active only)
  async findActiveCategories(merchantId: string)
}
```

#### 1.3 Create Category Controller

**File**: `src/products/categories/categories.controller.ts`

Endpoints:
- `GET /products/categories` - List all categories (paginated)
- `GET /products/categories/:id` - Get single category
- `POST /products/categories` - Create category
- `PATCH /products/categories/:id` - Update category
- `DELETE /products/categories/:id` - Delete category
- `GET /products/categories/active/list` - Get active categories for dropdown

#### 1.4 Create DTOs

**File**: `src/products/categories/dto/create-category.dto.ts`
```typescript
export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
```

**File**: `src/products/categories/dto/update-category.dto.ts`
```typescript
export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
```

#### 1.5 Update Product DTOs

**Update `CreateProductDto`:**
```typescript
export class CreateProductDto {
  // ... existing fields ...
  
  @ApiPropertyOptional({ example: 'uuid', description: 'Product category ID' })
  @IsOptional()
  @IsString()
  @IsUUID()
  category_id?: string;
}
```

**Update `UpdateProductDto`:**
```typescript
export class UpdateProductDto {
  // ... existing fields ...
  
  @ApiPropertyOptional({ example: 'uuid', description: 'Product category ID' })
  @IsOptional()
  @IsString()
  @IsUUID()
  category_id?: string;
}
```

#### 1.6 Update Product Service

- Update `create()` method to accept `category_id` instead of `category`
- Update `update()` method to handle `category_id`
- Update `findAll()` to include category relation
- Update `findOne()` to include category relation

#### 1.7 Add Permissions

Add new permissions to the database:
- `category.create` - Create product categories
- `category.read` - Read product categories
- `category.update` - Update product categories
- `category.delete` - Delete product categories

Assign these permissions to appropriate roles (e.g., Admin, Manager).

---

### Phase 2: Frontend Implementation

#### 2.1 Create Category Service

**File**: `src/modules/product/services/category-api.ts`

```typescript
export const getCategories = async (options: any = {}) => {
  return apiClient.get('/products/categories', options);
};

export const getCategoryDetail = async (id: string, options: any = {}) => {
  return apiClient.get(`/products/categories/${id}`, options);
};

export const getActiveCategories = async (options: any = {}) => {
  return apiClient.get('/products/categories/active/list', options);
};

export const createCategory = async (data: any, options: any = {}) => {
  return apiClient.post('/products/categories', data, options);
};

export const updateCategory = async (id: string, data: any, options: any = {}) => {
  return apiClient.patch(`/products/categories/${id}`, data, options);
};

export const deleteCategory = async (id: string, options: any = {}) => {
  return apiClient.delete(`/products/categories/${id}`, options);
};
```

#### 2.2 Create Category Types

**File**: `src/modules/product/services/category-types.ts`

```typescript
export interface Category {
  id: string;
  merchant_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryForm {
  name: string;
  description?: string;
  is_active: boolean;
}

export interface UpdateCategoryForm {
  name?: string;
  description?: string;
  is_active?: boolean;
}
```

#### 2.3 Update Product Types

**Update `src/modules/product/services/types.ts`:**

```typescript
export interface FormCreate {
  slug: string;
  name: string;
  category_id?: string;  // Changed from category: string
  thumbnail: string;
  price: number;
  cost: number;
  stock_qty: number;
  min_stock: number;
  is_active: boolean;
}

export interface FormEdit {
  name: string;
  category_id?: string;  // Changed from category: string
  price: number;
  cost: number;
  min_stock: number;
  is_active: boolean;
}
```

#### 2.4 Create Category Management Page

**File**: `src/modules/product/pages/categories.vue`

Features:
- List all categories (paginated)
- Create new category
- Edit category
- Delete category
- Search/filter categories
- Active/inactive toggle

#### 2.5 Update Product Create Page

**File**: `src/modules/product/pages/create.vue`

Changes:
- Replace text input for category with a dropdown/select component
- Load active categories on component mount
- Validate that selected category exists
- Update form submission to send `category_id` instead of `category`

```vue
<UiFormGroup label="Category" variant="vertical">
  <Dropdown
    name="category_id"
    :options="categories"
    optionLabel="name"
    optionValue="id"
    placeholder="Select a category"
    fluid
  />
</UiFormGroup>
```

#### 2.6 Update Product Edit Page

**File**: `src/modules/product/pages/edit.vue`

Changes:
- Same as create page
- Load categories on component mount
- Pre-select current category when loading product details

#### 2.7 Update Product List Page

**File**: `src/modules/product/pages/list.vue` (if exists)

Changes:
- Display category name instead of raw string
- Add category filter/search

---

### Phase 3: Integration & Testing

#### 3.1 Backend Testing
- Unit tests for CategoriesService
- Integration tests for category endpoints
- Test merchant scoping (categories from different merchants don't interfere)
- Test permission checks
- Test cascade delete behavior

#### 3.2 Frontend Testing
- Test category dropdown loads correctly
- Test category selection in create/edit forms
- Test form validation
- Test error handling
- Test category management page CRUD operations

#### 3.3 Data Migration
- Create migration script to convert existing string categories to new table
- Handle edge cases (null categories, duplicate category names per merchant)
- Verify data integrity after migration

---

## Implementation Order

### Backend (Priority Order)
1. Create Prisma migration for new schema
2. Create CategoriesService
3. Create CategoriesController
4. Create DTOs
5. Update ProductsService and ProductsController
6. Add permissions to database
7. Write tests

### Frontend (Priority Order)
1. Create category API service
2. Create category types
3. Update product types
4. Create category management page
5. Update product create page
6. Update product edit page
7. Update product list page (if needed)
8. Write tests

---

## Key Design Decisions

1. **Merchant Scoping**: Categories are merchant-scoped with unique constraint on (merchant_id, name)
2. **Foreign Key Relationship**: Products reference categories via `category_id` (not denormalized)
3. **Soft Delete Option**: Consider soft delete for categories to maintain historical data
4. **Cascade Delete**: When category is deleted, products' `category_id` is set to NULL
5. **Active Flag**: Categories have `is_active` flag for filtering in dropdowns
6. **Permissions**: New permissions added for category management

---

## Benefits

✅ **Data Consistency**: Categories are normalized, preventing typos and inconsistencies
✅ **Merchant Isolation**: Each merchant has their own categories
✅ **Better UX**: Dropdown selection instead of free-text input
✅ **Scalability**: Easy to add category features (e.g., category-level pricing, discounts)
✅ **Reporting**: Can generate reports by category
✅ **Maintainability**: Centralized category management

---

## Migration Strategy

### Step 1: Deploy Backend Changes
1. Create new `product_categories` table
2. Add `category_id` column to `products`
3. Deploy CategoriesService and Controller

### Step 2: Data Migration
1. Create categories from existing product categories
2. Populate `category_id` in products table
3. Verify data integrity

### Step 3: Deploy Frontend Changes
1. Update product create/edit pages
2. Create category management page
3. Deploy new UI

### Step 4: Cleanup
1. Remove old `category` column from `products` table
2. Update API documentation

---

## Rollback Plan

If issues occur:
1. Keep old `category` column temporarily
2. Revert to using string categories
3. Investigate and fix issues
4. Re-attempt migration

---

## Future Enhancements

- Category hierarchies (parent/child categories)
- Category-specific pricing rules
- Category-based discounts
- Category analytics and reporting
- Category images/icons
- Category-based inventory management
