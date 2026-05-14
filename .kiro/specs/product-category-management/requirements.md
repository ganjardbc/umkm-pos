# Product Category Management - Requirements Document

## Introduction

The Product Category Management feature introduces a dedicated, merchant-scoped category system to replace the current simple string-based category field on products. This feature enables merchants to create, manage, and organize product categories with consistent naming, improved data integrity, and better user experience through category selection dropdowns. Categories will be unique per merchant and selectable when creating or editing products.

---

## Glossary

- **Merchant**: A business entity that owns products and categories within the system
- **Product**: A sellable item that belongs to a merchant and optionally belongs to a category
- **Category**: A named grouping for products, scoped to a merchant with unique naming per merchant
- **Category_Management_System**: The backend service responsible for CRUD operations on categories
- **Category_Selection_UI**: The frontend interface for selecting categories when creating or editing products
- **Category_Management_Page**: The frontend page for managing (create, read, update, delete) categories
- **Active_Category**: A category with `is_active` flag set to true, eligible for selection in product forms
- **Inactive_Category**: A category with `is_active` flag set to false, not displayed in product form dropdowns
- **Merchant_Isolation**: The principle that each merchant's categories are completely separate and inaccessible to other merchants
- **Cascade_Delete**: When a category is deleted, products referencing that category have their category reference set to NULL
- **Category_Uniqueness**: The constraint that category names must be unique within a merchant's scope
- **Permission_System**: The role-based access control system that governs who can perform category operations
- **Audit_Fields**: Metadata fields (created_by, updated_by, created_at, updated_at) that track changes to categories

---

## Requirements

### Requirement 1: Create Product Categories

**User Story:** As a merchant, I want to create product categories, so that I can organize my products and maintain consistent category naming across my inventory.

#### Acceptance Criteria

1. WHEN a merchant submits a valid category creation request, THE Category_Management_System SHALL create a new category record with the provided name, description, and active status
2. WHEN a category is created, THE Category_Management_System SHALL automatically set the merchant_id to the requesting merchant's ID
3. WHEN a category is created, THE Category_Management_System SHALL automatically populate created_by with the requesting user's ID and created_at with the current timestamp
4. WHEN a merchant attempts to create a category with a name that already exists for that merchant, THE Category_Management_System SHALL reject the request and return a conflict error
5. WHEN a category creation request is missing the required name field, THE Category_Management_System SHALL reject the request and return a validation error
6. WHEN a category name exceeds 100 characters, THE Category_Management_System SHALL reject the request and return a validation error
7. WHEN a merchant creates a category without specifying is_active status, THE Category_Management_System SHALL default is_active to true
8. WHEN a merchant creates a category without providing a description, THE Category_Management_System SHALL allow the category to be created with a null description

---

### Requirement 2: Retrieve Product Categories

**User Story:** As a merchant, I want to view all my product categories, so that I can see what categories exist and manage them effectively.

#### Acceptance Criteria

1. WHEN a merchant requests to list all categories, THE Category_Management_System SHALL return all categories belonging to that merchant with pagination support
2. WHEN a merchant requests to list categories with pagination parameters, THE Category_Management_System SHALL return the requested page with the specified limit
3. WHEN a merchant requests to list categories, THE Category_Management_System SHALL include all category fields (id, name, description, is_active, created_at, updated_at, created_by, updated_by)
4. WHEN a merchant requests to retrieve a specific category by ID, THE Category_Management_System SHALL return the category if it belongs to that merchant
5. WHEN a merchant requests to retrieve a category that does not exist or belongs to another merchant, THE Category_Management_System SHALL return a not found error
6. WHEN a merchant requests active categories for product form selection, THE Category_Management_System SHALL return only categories where is_active is true
7. WHEN a merchant requests active categories, THE Category_Management_System SHALL return categories sorted by name in ascending order

---

### Requirement 3: Update Product Categories

**User Story:** As a merchant, I want to update category details, so that I can correct information or change category status.

#### Acceptance Criteria

1. WHEN a merchant submits a valid category update request, THE Category_Management_System SHALL update the specified category with the provided fields
2. WHEN a merchant updates a category name to a value that already exists for that merchant, THE Category_Management_System SHALL reject the request and return a conflict error
3. WHEN a merchant updates a category, THE Category_Management_System SHALL update the updated_by field with the requesting user's ID and updated_at with the current timestamp
4. WHEN a merchant updates a category that does not exist or belongs to another merchant, THE Category_Management_System SHALL return a not found error
5. WHEN a merchant updates a category's is_active status to false, THE Category_Management_System SHALL allow the update without affecting existing product associations
6. WHEN a merchant updates a category's is_active status to false, THE Category_Selection_UI SHALL no longer display that category in product form dropdowns
7. WHEN a merchant updates only specific fields of a category, THE Category_Management_System SHALL preserve all other fields unchanged

---

### Requirement 4: Delete Product Categories

**User Story:** As a merchant, I want to delete product categories, so that I can remove categories that are no longer needed.

#### Acceptance Criteria

1. WHEN a merchant requests to delete a category, THE Category_Management_System SHALL delete the category record
2. WHEN a category is deleted, THE Category_Management_System SHALL set the category_id to NULL for all products that referenced that category
3. WHEN a merchant attempts to delete a category that does not exist or belongs to another merchant, THE Category_Management_System SHALL return a not found error
4. WHEN a category is deleted, THE Category_Management_System SHALL not delete the associated products
5. WHEN a category is deleted, THE Category_Management_System SHALL remove the category from all product form dropdowns

---

### Requirement 5: Merchant-Scoped Category Isolation

**User Story:** As a system, I want to ensure categories are isolated per merchant, so that merchants cannot access or interfere with other merchants' categories.

#### Acceptance Criteria

1. WHEN a merchant creates a category, THE Category_Management_System SHALL associate it exclusively with that merchant via merchant_id
2. WHEN a merchant requests categories, THE Category_Management_System SHALL return only categories where merchant_id matches the requesting merchant
3. WHEN a merchant attempts to access a category belonging to another merchant, THE Category_Management_System SHALL return a not found error
4. WHEN a merchant attempts to update a category belonging to another merchant, THE Category_Management_System SHALL return a not found error
5. WHEN a merchant attempts to delete a category belonging to another merchant, THE Category_Management_System SHALL return a not found error
6. WHEN the database enforces the unique constraint on (merchant_id, category_name), THE Category_Management_System SHALL prevent duplicate category names within a merchant's scope

---

### Requirement 6: Category Selection in Product Creation

**User Story:** As a merchant, I want to select a category when creating a product, so that I can organize products into categories without manual typing.

#### Acceptance Criteria

1. WHEN a merchant opens the product creation form, THE Category_Selection_UI SHALL display a dropdown containing all active categories for that merchant
2. WHEN a merchant opens the product creation form, THE Category_Selection_UI SHALL load active categories on component initialization
3. WHEN a merchant selects a category from the dropdown, THE Category_Selection_UI SHALL store the selected category_id in the form
4. WHEN a merchant submits a product creation form with a selected category, THE Category_Management_System SHALL create the product with the category_id foreign key set to the selected category
5. WHEN a merchant submits a product creation form without selecting a category, THE Category_Management_System SHALL create the product with category_id set to NULL
6. WHEN a merchant submits a product creation form with an invalid category_id, THE Category_Management_System SHALL reject the request and return a validation error
7. WHEN a merchant submits a product creation form with a category_id belonging to another merchant, THE Category_Management_System SHALL reject the request and return a validation error

---

### Requirement 7: Category Selection in Product Editing

**User Story:** As a merchant, I want to change a product's category when editing, so that I can reorganize products as needed.

#### Acceptance Criteria

1. WHEN a merchant opens the product edit form, THE Category_Selection_UI SHALL display a dropdown containing all active categories for that merchant
2. WHEN a merchant opens the product edit form, THE Category_Selection_UI SHALL pre-select the product's current category if one exists
3. WHEN a merchant changes the category selection and submits the form, THE Category_Management_System SHALL update the product's category_id to the newly selected category
4. WHEN a merchant clears the category selection and submits the form, THE Category_Management_System SHALL set the product's category_id to NULL
5. WHEN a merchant submits a product edit form with an invalid category_id, THE Category_Management_System SHALL reject the request and return a validation error
6. WHEN a merchant submits a product edit form with a category_id belonging to another merchant, THE Category_Management_System SHALL reject the request and return a validation error

---

### Requirement 8: Category Management Page

**User Story:** As a merchant, I want a dedicated page to manage categories, so that I can perform all category operations in one place.

#### Acceptance Criteria

1. WHEN a merchant navigates to the category management page, THE Category_Management_Page SHALL display a list of all categories for that merchant
2. WHEN the category list is displayed, THE Category_Management_Page SHALL show category name, description, active status, and action buttons (edit, delete)
3. WHEN a merchant clicks the create category button, THE Category_Management_Page SHALL display a form to create a new category
4. WHEN a merchant submits the create category form, THE Category_Management_Page SHALL create the category and refresh the list
5. WHEN a merchant clicks the edit button for a category, THE Category_Management_Page SHALL display a form pre-populated with the category's current data
6. WHEN a merchant submits the edit category form, THE Category_Management_Page SHALL update the category and refresh the list
7. WHEN a merchant clicks the delete button for a category, THE Category_Management_Page SHALL display a confirmation dialog
8. WHEN a merchant confirms the delete action, THE Category_Management_Page SHALL delete the category and refresh the list
9. WHEN a category operation fails, THE Category_Management_Page SHALL display an error message to the user
10. WHEN a category operation succeeds, THE Category_Management_Page SHALL display a success message to the user

---

### Requirement 9: Category Permissions

**User Story:** As a system administrator, I want to control who can manage categories, so that only authorized users can create, update, or delete categories.

#### Acceptance Criteria

1. WHEN a user without category.create permission attempts to create a category, THE Category_Management_System SHALL reject the request and return a forbidden error
2. WHEN a user without category.read permission attempts to list categories, THE Category_Management_System SHALL reject the request and return a forbidden error
3. WHEN a user without category.update permission attempts to update a category, THE Category_Management_System SHALL reject the request and return a forbidden error
4. WHEN a user without category.delete permission attempts to delete a category, THE Category_Management_System SHALL reject the request and return a forbidden error
5. WHEN a user with appropriate permissions attempts a category operation, THE Category_Management_System SHALL allow the operation to proceed
6. WHEN the system initializes, THE Category_Management_System SHALL register four new permissions: category.create, category.read, category.update, category.delete

---

### Requirement 10: Category Audit Trail

**User Story:** As a merchant, I want to track who created and modified categories, so that I can maintain an audit trail of category changes.

#### Acceptance Criteria

1. WHEN a category is created, THE Category_Management_System SHALL automatically set created_by to the requesting user's ID
2. WHEN a category is created, THE Category_Management_System SHALL automatically set created_at to the current timestamp
3. WHEN a category is updated, THE Category_Management_System SHALL automatically set updated_by to the requesting user's ID
4. WHEN a category is updated, THE Category_Management_System SHALL automatically set updated_at to the current timestamp
5. WHEN a merchant retrieves category details, THE Category_Management_System SHALL include created_by, created_at, updated_by, and updated_at fields

---

### Requirement 11: Product Category Display

**User Story:** As a merchant, I want to see category names in product lists, so that I can quickly identify which category each product belongs to.

#### Acceptance Criteria

1. WHEN a merchant views the product list, THE Category_Management_Page SHALL display the category name for each product that has a category assigned
2. WHEN a merchant views the product list, THE Category_Management_Page SHALL display an empty value or placeholder for products without a category
3. WHEN a merchant views product details, THE Category_Management_Page SHALL display the category name if the product has a category assigned
4. WHEN a category is updated with a new name, THE Category_Management_Page SHALL reflect the new name in all product displays

---

### Requirement 12: Category Filtering in Product Lists

**User Story:** As a merchant, I want to filter products by category, so that I can view products in a specific category.

#### Acceptance Criteria

1. WHEN a merchant opens the product list page, THE Category_Management_Page SHALL display a category filter dropdown
2. WHEN a merchant selects a category from the filter dropdown, THE Category_Management_Page SHALL display only products belonging to that category
3. WHEN a merchant clears the category filter, THE Category_Management_Page SHALL display all products
4. WHEN a merchant applies a category filter, THE Category_Management_Page SHALL include only active categories in the filter dropdown

---

### Requirement 13: Data Migration from String Categories

**User Story:** As a system, I want to migrate existing string-based categories to the new category system, so that existing data is preserved and functional.

#### Acceptance Criteria

1. WHEN the migration runs, THE Category_Management_System SHALL create a product_categories record for each unique category string found in the products table
2. WHEN the migration runs, THE Category_Management_System SHALL assign each created category to the product's merchant
3. WHEN the migration runs, THE Category_Management_System SHALL update each product's category_id to reference the corresponding category record
4. WHEN the migration runs, THE Category_Management_System SHALL set all migrated categories' is_active status to true
5. WHEN the migration runs, THE Category_Management_System SHALL set all migrated categories' created_by to a system user or NULL
6. WHEN the migration completes successfully, THE Category_Management_System SHALL remove the old category string column from the products table

---

### Requirement 14: Category Validation

**User Story:** As a system, I want to validate category data, so that only valid categories are created and stored.

#### Acceptance Criteria

1. WHEN a category creation request is submitted with an empty name, THE Category_Management_System SHALL reject the request and return a validation error
2. WHEN a category creation request is submitted with a name containing only whitespace, THE Category_Management_System SHALL reject the request and return a validation error
3. WHEN a category creation request is submitted with a name exceeding 100 characters, THE Category_Management_System SHALL reject the request and return a validation error
4. WHEN a category creation request is submitted with an invalid is_active value, THE Category_Management_System SHALL reject the request and return a validation error
5. WHEN a category creation request is submitted with a description exceeding reasonable length limits, THE Category_Management_System SHALL reject the request and return a validation error

---

### Requirement 15: API Response Format

**User Story:** As a frontend developer, I want consistent API response formats, so that I can reliably parse and handle category data.

#### Acceptance Criteria

1. WHEN the Category_Management_System returns a single category, THE API response SHALL include all category fields in a consistent JSON structure
2. WHEN the Category_Management_System returns a list of categories, THE API response SHALL include pagination metadata (page, limit, total, totalPages)
3. WHEN the Category_Management_System returns an error, THE API response SHALL include an error code and descriptive message
4. WHEN the Category_Management_System returns a list of active categories for dropdown selection, THE API response SHALL include only id and name fields for efficiency

---

## Business Rules

### BR1: Category Uniqueness Per Merchant
Each merchant must have unique category names. The system enforces this through a database unique constraint on (merchant_id, category_name).

### BR2: Cascade Delete Behavior
When a category is deleted, all products referencing that category shall have their category_id set to NULL rather than being deleted. This preserves product data while removing the category association.

### BR3: Active Category Filtering
Only categories with is_active = true shall appear in product form dropdowns and category filter dropdowns. Inactive categories are hidden from selection but remain in the database.

### BR4: Merchant Isolation
All category operations must be scoped to the requesting merchant. Cross-merchant access is strictly prohibited at all levels (read, write, delete).

### BR5: Permission-Based Access Control
All category operations require appropriate permissions (category.create, category.read, category.update, category.delete). Users without these permissions cannot perform the corresponding operations.

### BR6: Audit Trail Maintenance
All category records must maintain audit fields (created_by, updated_by, created_at, updated_at) to track who made changes and when.

### BR7: Backward Compatibility
The migration from string-based categories to the new system must preserve all existing category data and maintain product-category associations.

---

## Non-Functional Requirements

### NFR1: Performance
Category list queries for a merchant with up to 1000 categories shall complete within 200ms.

### NFR2: Data Integrity
The system shall maintain referential integrity between products and categories through foreign key constraints.

### NFR3: Scalability
The category system shall support merchants with up to 10,000 products and 500 categories without performance degradation.

### NFR4: Consistency
All category operations shall be atomic; partial updates shall not occur.

---

## Acceptance Criteria Summary

The Product Category Management feature is complete when:

1. ✅ Merchants can create, read, update, and delete categories
2. ✅ Categories are unique per merchant
3. ✅ Products can be created and edited with category selection via dropdown
4. ✅ A dedicated category management page exists with full CRUD functionality
5. ✅ Category operations respect permission-based access control
6. ✅ Products display category names in lists and detail views
7. ✅ Products can be filtered by category
8. ✅ Existing string-based categories are migrated to the new system
9. ✅ All category operations maintain audit trails
10. ✅ Merchant isolation is enforced at all levels
