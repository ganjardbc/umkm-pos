# Implementation Plan: Product Category Management

## Overview

This implementation plan breaks down the Product Category Management feature into discrete, actionable tasks organized into logical phases. Each task builds incrementally on previous work, with clear dependencies and requirements references. The implementation follows a backend-first approach, establishing the data layer and service layer before moving to API endpoints, then frontend components.

---

## Phase 1: Backend Database & Schema

- [x] 1.1 Create Prisma migration for product_categories table
  - Create migration file with product_categories table schema
  - Add columns: id, merchant_id, name, description, is_active, created_at, updated_at, created_by, updated_by
  - Add unique constraint on (merchant_id, name)
  - Add indexes on merchant_id and is_active
  - Add foreign key to merchants table with CASCADE delete
  - _Requirements: 1.1, 5.1, 10.1_

- [x] 1.2 Update products table schema with category_id
  - Create migration to add category_id column to products table
  - Add foreign key constraint to product_categories with SET NULL on delete
  - Add index on category_id for query performance
  - _Requirements: 6.4, 7.3_

- [x] 1.3 Create database indexes for query performance
  - Verify indexes exist on product_categories(merchant_id)
  - Verify indexes exist on product_categories(is_active)
  - Verify indexes exist on products(category_id)
  - Run migration and verify schema
  - _Requirements: NFR1, NFR2_

- [x] 1.4 Update Prisma schema models
  - Update product_categories model in schema.prisma
  - Update products model to include category_id and relation
  - Update merchants model to include product_categories relation
  - Run `prisma generate` to update generated client
  - _Requirements: 1.1, 5.1_

---

## Phase 2: Backend Service Layer - Categories Service

- [x] 2.1 Create CategoriesService with core structure
  - Create src/products/categories/categories.service.ts
  - Inject PrismaService
  - Implement constructor and basic service structure
  - _Requirements: 1.1, 2.1_

- [x] 2.2 Implement findAll method with pagination
  - Implement findAll(merchantId, pagination) method
  - Query product_categories filtered by merchant_id
  - Support pagination with page and limit parameters
  - Return paginated results with metadata (page, limit, total, totalPages)
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 2.3 Implement findOne method with merchant scoping
  - Implement findOne(id, merchantId) method
  - Query product_categories by id AND merchant_id
  - Throw NotFoundException if not found or belongs to different merchant
  - _Requirements: 2.4, 2.5, 5.2_

- [x] 2.4 Implement create method with validation
  - Implement create(dto, merchantId, userId) method
  - Validate category name is unique within merchant scope
  - Set merchant_id, created_by, created_at automatically
  - Default is_active to true if not provided
  - Throw ConflictException for duplicate names
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.7, 1.8_

- [x] 2.5 Implement update method with validation
  - Implement update(id, dto, merchantId, userId) method
  - Validate category exists and belongs to merchant
  - Check for duplicate names within merchant scope
  - Update updated_by and updated_at automatically
  - Preserve unchanged fields
  - _Requirements: 3.1, 3.2, 3.3, 3.7_

- [x] 2.6 Implement remove method with cascade logic
  - Implement remove(id, merchantId) method
  - Validate category exists and belongs to merchant
  - Set category_id to NULL for all products referencing this category
  - Delete the category record
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 2.7 Implement findActiveCategories method
  - Implement findActiveCategories(merchantId) method
  - Query only categories where is_active = true
  - Sort by name in ascending order
  - Return only id and name fields for efficiency
  - _Requirements: 2.6, 2.7, 6.1_

- [ ]* 2.8 Write unit tests for CategoriesService
  - Test create with valid data
  - Test create with duplicate names (should fail)
  - Test create with missing required fields (should fail)
  - Test create with name exceeding 100 characters (should fail)
  - Test findAll returns paginated results
  - Test findAll filters by merchant_id
  - Test findOne returns category if accessible
  - Test findOne throws NotFoundException for inaccessible categories
  - Test update modifies fields correctly
  - Test update rejects duplicate names
  - Test remove deletes category and cascades to products
  - Test findActiveCategories returns only active categories sorted by name
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

---

## Phase 3: Backend Service Layer - Products Service Updates

- [x] 3.1 Update ProductsService to handle category_id in create
  - Modify create method to accept category_id in DTO
  - Validate category_id exists and belongs to same merchant (if provided)
  - Allow null category_id
  - Throw BadRequestException for invalid category_id
  - _Requirements: 6.4, 6.6, 6.7_

- [x] 3.2 Update ProductsService to handle category_id in update
  - Modify update method to accept category_id in DTO
  - Validate category_id exists and belongs to same merchant (if provided)
  - Allow clearing category_id (set to null)
  - Throw BadRequestException for invalid category_id
  - _Requirements: 7.3, 7.4, 7.5, 7.6_

- [x] 3.3 Update ProductsService findAll to include category relation
  - Modify findAll to include product_categories relation
  - Ensure category data is returned with product data
  - _Requirements: 11.1, 11.2, 11.3_

- [x] 3.4 Update ProductsService findOne to include category relation
  - Modify findOne to include product_categories relation
  - Ensure category data is returned with product data
  - _Requirements: 11.3_

- [ ]* 3.5 Write unit tests for ProductsService category integration
  - Test create product with valid category_id
  - Test create product with invalid category_id (should fail)
  - Test create product with category from different merchant (should fail)
  - Test create product with null category_id
  - Test update product category
  - Test update product to clear category
  - Test findAll includes category relation
  - Test findOne includes category relation
  - _Requirements: 6.4, 6.6, 6.7, 7.3, 7.5, 7.6_

---

## Phase 4: Backend DTOs & Validation

- [x] 4.1 Create CreateCategoryDto with validation
  - Create src/products/categories/dto/create-category.dto.ts
  - Add name field: required, string, max 100 chars, min 1 char, alphanumeric + spaces/hyphens/underscores
  - Add description field: optional, string, max 500 chars
  - Add is_active field: optional, boolean, defaults to true
  - Use class-validator decorators
  - _Requirements: 1.5, 1.6, 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 4.2 Create UpdateCategoryDto with validation
  - Create src/products/categories/dto/update-category.dto.ts
  - Add name field: optional, string, max 100 chars, min 1 char, alphanumeric + spaces/hyphens/underscores
  - Add description field: optional, string, max 500 chars
  - Add is_active field: optional, boolean
  - Use class-validator decorators
  - _Requirements: 3.1, 14.1, 14.2, 14.3, 14.4, 14.5_

- [x] 4.3 Create CategoryResponseDto
  - Create src/products/categories/dto/category-response.dto.ts
  - Include all category fields: id, merchant_id, name, description, is_active, created_by, updated_by, created_at, updated_at
  - Use for API responses
  - _Requirements: 2.3, 10.5, 15.1_

- [x] 4.4 Update CreateProductDto to include category_id
  - Modify src/products/dto/create-product.dto.ts
  - Add category_id field: optional, string (UUID)
  - Add validation to check category exists (done in service)
  - _Requirements: 6.4, 6.5_

- [x] 4.5 Update UpdateProductDto to include category_id
  - Modify src/products/dto/update-product.dto.ts
  - Add category_id field: optional, string (UUID)
  - Add validation to check category exists (done in service)
  - _Requirements: 7.3, 7.4_

---

## Phase 5: Backend API Layer - Categories Controller

- [x] 5.1 Create CategoriesController with basic structure
  - Create src/products/categories/categories.controller.ts
  - Inject CategoriesService
  - Add @UseGuards(JwtAuthGuard) to all endpoints
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 5.2 Implement POST /products/categories endpoint
  - Create endpoint to create new category
  - Add @UseGuards(PermissionGuard) with 'category.create' permission
  - Validate CreateCategoryDto
  - Extract merchantId and userId from request context
  - Call CategoriesService.create()
  - Return 201 with CategoryResponseDto
  - _Requirements: 1.1, 1.2, 1.3, 9.1_

- [x] 5.3 Implement GET /products/categories endpoint
  - Create endpoint to list all categories with pagination
  - Add @UseGuards(PermissionGuard) with 'category.read' permission
  - Accept page and limit query parameters
  - Extract merchantId from request context
  - Call CategoriesService.findAll()
  - Return 200 with paginated results and metadata
  - _Requirements: 2.1, 2.2, 2.3, 9.2, 15.2_

- [x] 5.4 Implement GET /products/categories/:id endpoint
  - Create endpoint to retrieve single category
  - Add @UseGuards(PermissionGuard) with 'category.read' permission
  - Extract merchantId from request context
  - Call CategoriesService.findOne()
  - Return 200 with CategoryResponseDto or 404 if not found
  - _Requirements: 2.4, 2.5, 9.2_

- [x] 5.5 Implement PATCH /products/categories/:id endpoint
  - Create endpoint to update category
  - Add @UseGuards(PermissionGuard) with 'category.update' permission
  - Validate UpdateCategoryDto
  - Extract merchantId and userId from request context
  - Call CategoriesService.update()
  - Return 200 with updated CategoryResponseDto or 404 if not found
  - _Requirements: 3.1, 3.2, 3.3, 9.3_

- [x] 5.6 Implement DELETE /products/categories/:id endpoint
  - Create endpoint to delete category
  - Add @UseGuards(PermissionGuard) with 'category.delete' permission
  - Extract merchantId from request context
  - Call CategoriesService.remove()
  - Return 200 with deleted CategoryResponseDto or 404 if not found
  - _Requirements: 4.1, 4.2, 4.3, 9.4_

- [x] 5.7 Implement GET /products/categories/active/list endpoint
  - Create endpoint to get active categories for dropdown
  - Add @UseGuards(PermissionGuard) with 'category.read' permission
  - Extract merchantId from request context
  - Call CategoriesService.findActiveCategories()
  - Return 200 with array of {id, name} objects
  - _Requirements: 2.6, 2.7, 6.1, 15.4_

- [x] 5.8 Add Swagger documentation to all endpoints
  - Add @ApiOperation decorators with descriptions
  - Add @ApiResponse decorators for success and error responses
  - Add @ApiParam decorators for path parameters
  - Add @ApiQuery decorators for query parameters
  - Add @ApiBody decorators for request bodies
  - _Requirements: 15.1, 15.2, 15.3_

- [ ]* 5.9 Write unit tests for CategoriesController
  - Test POST /products/categories requires category.create permission
  - Test POST /products/categories validates DTO
  - Test POST /products/categories returns 201 with created category
  - Test POST /products/categories returns 409 for duplicate names
  - Test GET /products/categories requires category.read permission
  - Test GET /products/categories returns paginated results
  - Test GET /products/categories/:id requires category.read permission
  - Test GET /products/categories/:id returns category or 404
  - Test PATCH /products/categories/:id requires category.update permission
  - Test PATCH /products/categories/:id updates category or returns 404
  - Test DELETE /products/categories/:id requires category.delete permission
  - Test DELETE /products/categories/:id deletes category or returns 404
  - Test GET /products/categories/active/list returns active categories sorted by name
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

---

## Phase 6: Backend Integration - Products Controller Updates

- [x] 6.1 Update ProductsController POST endpoint to handle category_id
  - Modify create product endpoint to accept category_id in request
  - Ensure category_id is passed to ProductsService.create()
  - Return product with category data in response
  - _Requirements: 6.4, 6.5_

- [x] 6.2 Update ProductsController PATCH endpoint to handle category_id
  - Modify update product endpoint to accept category_id in request
  - Ensure category_id is passed to ProductsService.update()
  - Return product with category data in response
  - _Requirements: 7.3, 7.4_

- [x] 6.3 Update ProductsController GET endpoints to include category data
  - Modify findAll endpoint to return products with category names
  - Modify findOne endpoint to return product with category name
  - _Requirements: 11.1, 11.2, 11.3_

- [ ]* 6.4 Write integration tests for product-category operations
  - Test create product with category
  - Test update product category
  - Test product list includes category names
  - Test product detail includes category name
  - Test cascade delete when category deleted
  - _Requirements: 6.4, 7.3, 11.1_

---

## Phase 7: Backend Permissions & Audit

- [x] 7.1 Add category permissions to database
  - Create migration or seed script to add four new permissions:
    - category.create
    - category.read
    - category.update
    - category.delete
  - Assign all permissions to Admin role
  - Assign all permissions to Manager role
  - Assign category.read to Cashier role
  - _Requirements: 9.6_

- [x] 7.2 Verify audit fields are set correctly
  - Verify created_by is set on category creation
  - Verify created_at is set on category creation
  - Verify updated_by is set on category update
  - Verify updated_at is set on category update
  - Verify audit fields are returned in API responses
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

---

## Phase 8: Backend Testing & Checkpoint

- [x] 8.1 Run all backend unit tests
  - Execute `npm run test -- src/products/categories`
  - Ensure all CategoriesService tests pass
  - Ensure all CategoriesController tests pass
  - Ensure all ProductsService category tests pass
  - Ensure all ProductsController category tests pass
  - Achieve 90%+ code coverage for categories module
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

- [x] 8.2 Run integration tests
  - Execute `npm run test:e2e` for category operations
  - Test full CRUD workflow
  - Test merchant isolation
  - Test permission enforcement
  - Test cascade delete behavior
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 8.3 Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Phase 9: Data Migration

- [x] 9.1 Create data migration script
  - Create migration script to convert existing string categories
  - Query all unique category values from products table
  - For each unique category, create product_categories record
  - Assign category to product's merchant
  - Set is_active to true for all migrated categories
  - Set created_by to system user or NULL
  - _Requirements: 13.1, 13.2, 13.4, 13.5_

- [x] 9.2 Implement category_id population
  - Update products table to set category_id for each product
  - Match products to categories by merchant_id and category name
  - Verify all products have correct category_id
  - _Requirements: 13.3_

- [x] 9.3 Test migration with sample data
  - Create test database with sample products and categories
  - Run migration script
  - Verify all categories created correctly
  - Verify all products have correct category_id
  - Verify no data loss
  - _Requirements: 13.1, 13.2, 13.3_

- [x] 9.4 Remove old category column from products table
  - Create migration to drop category column from products table
  - Verify migration completes successfully
  - Verify products table structure is correct
  - _Requirements: 13.6_

---

## Phase 10: Frontend API Service Layer

- [x] 10.1 Create category-types.ts with TypeScript interfaces
  - Create src/modules/product/services/category-types.ts
  - Define ProductCategory interface with all fields
  - Define CreateCategoryRequest interface
  - Define UpdateCategoryRequest interface
  - Define CategoryListResponse interface with pagination metadata
  - Define ActiveCategoryResponse interface
  - _Requirements: 2.3, 15.1, 15.2, 15.4_

- [x] 10.2 Create category-api.ts service
  - Create src/modules/product/services/category-api.ts
  - Implement createCategory(data) method
  - Implement getCategories(page, limit) method
  - Implement getCategory(id) method
  - Implement updateCategory(id, data) method
  - Implement deleteCategory(id) method
  - Implement getActiveCategories() method
  - Add error handling for all methods
  - _Requirements: 1.1, 2.1, 2.4, 3.1, 4.1, 2.6_

- [x] 10.3 Update product-types.ts to include category_id
  - Modify src/modules/product/services/types.ts
  - Add category_id field to Product interface
  - Add category field to Product interface (optional, for category name)
  - Add category_id field to CreateProductRequest interface
  - Add category_id field to UpdateProductRequest interface
  - _Requirements: 6.4, 7.3_

- [ ]* 10.4 Write tests for category API service
  - Test createCategory calls correct endpoint
  - Test getCategories calls correct endpoint with pagination
  - Test getCategory calls correct endpoint
  - Test updateCategory calls correct endpoint
  - Test deleteCategory calls correct endpoint
  - Test getActiveCategories calls correct endpoint
  - Test error handling for all methods
  - _Requirements: 1.1, 2.1, 3.1, 4.1_

---

## Phase 11: Frontend Components - Category Management Page

- [x] 11.1 Create CategoryManagementPage component
  - Create src/modules/product/pages/categories.vue
  - Add page layout with header and action buttons
  - Add CategoryList component to display categories
  - Add create category button
  - Add error/success message display
  - Add loading states
  - _Requirements: 8.1, 8.2, 8.9, 8.10_

- [x] 11.2 Create CategoryList component
  - Create src/modules/product/components/CategoryList.vue
  - Display table with columns: name, description, active status, actions
  - Add edit button for each category
  - Add delete button for each category
  - Add pagination controls
  - Add loading state
  - _Requirements: 8.2, 8.3_

- [x] 11.3 Create CategoryForm component
  - Create src/modules/product/components/CategoryForm.vue
  - Add name input field with validation
  - Add description textarea field
  - Add is_active toggle
  - Add submit button
  - Add cancel button
  - Support both create and edit modes
  - _Requirements: 8.3, 8.4, 8.5, 8.6_

- [x] 11.4 Create ConfirmDeleteDialog component
  - Create src/modules/product/components/ConfirmDeleteDialog.vue
  - Display confirmation message
  - Add confirm and cancel buttons
  - Handle delete action
  - _Requirements: 8.7, 8.8_

- [x] 11.5 Implement category creation flow
  - Add create button click handler
  - Show CategoryForm in modal
  - Call category-api.createCategory() on submit
  - Refresh category list on success
  - Display success message
  - Display error message on failure
  - _Requirements: 8.3, 8.4_

- [x] 11.6 Implement category edit flow
  - Add edit button click handler
  - Load category data
  - Show CategoryForm in modal with pre-populated data
  - Call category-api.updateCategory() on submit
  - Refresh category list on success
  - Display success message
  - Display error message on failure
  - _Requirements: 8.5, 8.6_

- [x] 11.7 Implement category delete flow
  - Add delete button click handler
  - Show ConfirmDeleteDialog
  - Call category-api.deleteCategory() on confirm
  - Refresh category list on success
  - Display success message
  - Display error message on failure
  - _Requirements: 8.7, 8.8_

- [ ]* 11.8 Write tests for category management page
  - Test page loads and displays categories
  - Test create category flow
  - Test edit category flow
  - Test delete category flow
  - Test error handling
  - Test success messages
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

---

## Phase 12: Frontend Components - Category Selection

- [x] 12.1 Create CategorySelect dropdown component
  - Create src/modules/product/components/CategorySelect.vue
  - Accept v-model for selected category_id
  - Load active categories on component mount
  - Display categories sorted by name
  - Support clearing selection
  - Add loading state
  - Add error handling
  - _Requirements: 6.1, 6.2, 6.3, 2.6, 2.7_

- [x] 12.2 Create useCategories composable
  - Create src/modules/product/composables/useCategories.ts
  - Implement loadActiveCategories() function
  - Implement error handling
  - Implement loading state management
  - _Requirements: 6.1, 6.2_

- [ ]* 12.3 Write tests for CategorySelect component
  - Test component loads active categories on mount
  - Test categories are sorted by name
  - Test v-model binding works
  - Test clearing selection works
  - Test error handling
  - Test loading state
  - _Requirements: 6.1, 6.2, 6.3_

---

## Phase 13: Frontend - Product Create Form Updates

- [x] 13.1 Update product create form to use CategorySelect
  - Modify src/modules/product/pages/create.vue
  - Replace text input with CategorySelect component
  - Bind CategorySelect to form.category_id
  - _Requirements: 6.1, 6.3_

- [x] 13.2 Update product create form validation
  - Ensure category_id validation works (optional field)
  - Validate selected category exists (done in backend)
  - _Requirements: 6.5, 6.6_

- [x] 13.3 Update product create form submission
  - Ensure category_id is sent in request
  - Handle response with category data
  - _Requirements: 6.4, 6.5_

- [x] 13.4 Test product create form with categories
  - Test form loads categories on mount
  - Test category selection works
  - Test form submission with category
  - Test form submission without category
  - _Requirements: 6.1, 6.3, 6.4, 6.5_

---

## Phase 14: Frontend - Product Edit Form Updates

- [x] 14.1 Update product edit form to use CategorySelect
  - Modify src/modules/product/pages/edit.vue
  - Replace text input with CategorySelect component
  - Bind CategorySelect to form.category_id
  - _Requirements: 7.1, 7.2_

- [x] 14.2 Implement category pre-selection in edit form
  - Load product data including category_id
  - Pre-select current category in CategorySelect
  - Support clearing category selection
  - _Requirements: 7.2, 7.4_

- [x] 14.3 Update product edit form submission
  - Ensure category_id is sent in request
  - Handle response with updated category data
  - _Requirements: 7.3, 7.4_

- [x] 14.4 Test product edit form with categories
  - Test form loads with current category selected
  - Test category can be changed
  - Test category can be cleared
  - Test form submission with new category
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

---

## Phase 15: Frontend - Product List Updates

- [x] 15.1 Update product list to display category names
  - Modify src/modules/product/pages/list.vue
  - Add category column to product table
  - Display category name if product has category
  - Display placeholder for products without category
  - _Requirements: 11.1, 11.2_

- [x] 15.2 Add category filter dropdown to product list
  - Add filter dropdown above product table
  - Load active categories for filter
  - Display "All Categories" option
  - _Requirements: 12.1, 12.4_

- [x] 15.3 Implement category filtering logic
  - Filter products by selected category
  - Update product list query with category_id filter
  - Clear filter when "All Categories" selected
  - _Requirements: 12.2, 12.3_

- [x] 15.4 Test product list with categories
  - Test category column displays correctly
  - Test category filter dropdown loads
  - Test filtering by category works
  - Test clearing filter works
  - _Requirements: 11.1, 11.2, 12.1, 12.2, 12.3_

---

## Phase 16: Frontend Testing & Checkpoint

- [x] 16.1 Run all frontend component tests
  - Execute tests for CategorySelect component
  - Execute tests for CategoryManagementPage
  - Execute tests for product form updates
  - Execute tests for product list updates
  - Ensure all tests pass
  - _Requirements: 6.1, 8.1, 11.1, 12.1_

- [x] 16.2 Checkpoint - Ensure all frontend tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Phase 17: Integration & Final Testing

- [x] 17.1 End-to-end testing of category management
  - Test creating a category
  - Test editing a category
  - Test deleting a category
  - Test category appears in product forms
  - Test product can be created with category
  - Test product can be edited with category
  - Test product list displays categories
  - Test product list filters by category
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 6.1, 7.1, 11.1, 12.1_

- [x] 17.2 Test merchant isolation
  - Test merchant A cannot see merchant B's categories
  - Test merchant A cannot edit merchant B's categories
  - Test merchant A cannot delete merchant B's categories
  - Test products from merchant A cannot use merchant B's categories
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 17.3 Test permission enforcement
  - Test user without category.create cannot create categories
  - Test user without category.read cannot list categories
  - Test user without category.update cannot update categories
  - Test user without category.delete cannot delete categories
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 17.4 Test cascade delete behavior
  - Create category with products
  - Delete category
  - Verify products still exist with category_id = NULL
  - Verify category no longer appears in dropdowns
  - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [x] 17.5 Test data migration
  - Run migration on test database
  - Verify all existing categories migrated
  - Verify all products have correct category_id
  - Verify no data loss
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [x] 17.6 Performance testing
  - Test category list query with 1000 categories completes in < 200ms
  - Test active categories query completes in < 100ms
  - Test product list with categories completes in < 300ms
  - _Requirements: NFR1, NFR3_

- [x] 17.7 Final checkpoint - All tests pass
  - Ensure all backend tests pass
  - Ensure all frontend tests pass
  - Ensure all integration tests pass
  - Ensure all e2e tests pass
  - Ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP, but are recommended for production quality
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and early error detection
- Backend is implemented before frontend to ensure API stability
- All category operations enforce merchant isolation at the service layer
- Permission checks are enforced at the controller layer
- Audit fields are automatically managed by the service layer
- Database indexes ensure query performance targets are met
- Migration preserves all existing category data

