# Requirements Document

## Introduction

The POS Terminal Interface is a frontend module for the UMKM-POS application that enables cashiers to process sales transactions efficiently. The interface provides a dual-grid layout: one for browsing and selecting products, and another for managing the shopping cart and completing transactions. The module integrates with existing NestJS backend APIs for product retrieval and transaction processing.

## Glossary

- **POS_Terminal**: The frontend interface component that enables cashiers to process sales transactions
- **Product_Grid**: The display component showing available products with their details
- **Cart_Grid**: The display component showing selected items awaiting checkout
- **Product_Service**: The backend API service providing product data
- **Transaction_Service**: The backend API service handling transaction creation and processing
- **Cart_Store**: The Pinia state management store maintaining cart state
- **Checkout_Handler**: The component responsible for processing transaction submissions
- **Stock_Validator**: The component that verifies product availability before transaction
- **Payment_Selector**: The UI component for selecting payment method
- **Transaction_DTO**: The data transfer object containing transaction details for backend submission
- **Cashier**: The user operating the POS terminal to process sales

## Requirements

### Requirement 1: Product Display

**User Story:** As a cashier, I want to view all available products with their details, so that I can select items for customer purchases.

#### Acceptance Criteria

1. WHEN the POS_Terminal loads, THE Product_Service SHALL fetch products from GET /products endpoint
2. THE Product_Grid SHALL display product name, price, and current stock for each product
3. WHEN products are loading, THE Product_Grid SHALL display a loading indicator
4. IF the Product_Service returns an error, THEN THE Product_Grid SHALL display an error message
5. THE Product_Grid SHALL paginate results when more than 20 products exist

### Requirement 2: Product Search and Filter

**User Story:** As a cashier, I want to search and filter products, so that I can quickly find items customers want to purchase.

#### Acceptance Criteria

1. THE Product_Grid SHALL provide a search input field
2. WHEN a cashier enters text in the search field, THE Product_Grid SHALL filter products by name matching the search term
3. THE Product_Grid SHALL update filtered results within 300ms of search input
4. WHEN the search field is cleared, THE Product_Grid SHALL display all products again

### Requirement 3: Add Product to Cart

**User Story:** As a cashier, I want to add products to the cart by clicking them, so that I can build a customer's order.

#### Acceptance Criteria

1. WHEN a cashier clicks a product in the Product_Grid, THE Cart_Store SHALL add the product to the cart with quantity 1
2. IF the product already exists in the cart, THEN THE Cart_Store SHALL increment its quantity by 1
3. WHEN a product is added, THE Cart_Grid SHALL display visual feedback within 200ms
4. IF a product has zero stock, THEN THE Product_Grid SHALL disable the product and prevent selection

### Requirement 4: Cart Item Display

**User Story:** As a cashier, I want to see all items in the cart with their details, so that I can verify the customer's order.

#### Acceptance Criteria

1. THE Cart_Grid SHALL display product name, unit price, quantity, and subtotal for each cart item
2. THE Cart_Grid SHALL calculate subtotal as unit price multiplied by quantity
3. WHEN the cart is empty, THE Cart_Grid SHALL display a message indicating no items
4. THE Cart_Grid SHALL update immediately when cart contents change

### Requirement 5: Modify Cart Quantities

**User Story:** As a cashier, I want to adjust item quantities in the cart, so that I can correct order details.

#### Acceptance Criteria

1. THE Cart_Grid SHALL provide quantity input controls for each cart item
2. WHEN a cashier changes quantity, THE Cart_Store SHALL update the item quantity
3. THE Cart_Grid SHALL validate that quantity is at least 1
4. IF quantity exceeds available stock, THEN THE Cart_Grid SHALL display a validation error and prevent the change
5. WHEN quantity changes, THE Cart_Grid SHALL recalculate the subtotal immediately

### Requirement 6: Remove Cart Items

**User Story:** As a cashier, I want to remove items from the cart, so that I can correct mistakes or handle customer changes.

#### Acceptance Criteria

1. THE Cart_Grid SHALL provide a remove button for each cart item
2. WHEN a cashier clicks the remove button, THE Cart_Store SHALL remove the item from the cart
3. THE Cart_Grid SHALL update the display within 200ms of removal
4. WHEN the last item is removed, THE Cart_Grid SHALL display the empty cart message

### Requirement 7: Calculate Order Total

**User Story:** As a cashier, I want to see the total amount for the order, so that I can inform the customer of the payment amount.

#### Acceptance Criteria

1. THE Cart_Grid SHALL display the total amount as the sum of all item subtotals
2. WHEN cart contents change, THE Cart_Grid SHALL recalculate the total immediately
3. THE Cart_Grid SHALL format the total amount with proper currency formatting
4. WHEN the cart is empty, THE Cart_Grid SHALL display the total as zero

### Requirement 8: Payment Method Selection

**User Story:** As a cashier, I want to select the payment method, so that the transaction is recorded with the correct payment type.

#### Acceptance Criteria

1. THE Payment_Selector SHALL provide options for cash, qris, and transfer payment methods
2. THE Payment_Selector SHALL default to cash payment method
3. WHEN a cashier selects a payment method, THE Cart_Store SHALL store the selected method
4. THE Payment_Selector SHALL display the currently selected payment method clearly

### Requirement 9: Stock Validation Before Checkout

**User Story:** As a cashier, I want the system to validate stock availability, so that I cannot complete transactions for out-of-stock items.

#### Acceptance Criteria

1. WHEN a cashier initiates checkout, THE Stock_Validator SHALL verify each cart item quantity against current stock
2. IF any item quantity exceeds available stock, THEN THE Stock_Validator SHALL display an error message identifying the problematic items
3. IF any item quantity exceeds available stock, THEN THE Checkout_Handler SHALL prevent transaction submission
4. THE Stock_Validator SHALL fetch current stock data from GET /products/:id endpoint for validation

### Requirement 10: Transaction Submission

**User Story:** As a cashier, I want to submit the transaction to the backend, so that the sale is recorded and inventory is updated.

#### Acceptance Criteria

1. THE Cart_Grid SHALL provide a checkout button
2. WHEN the cart is empty, THE Cart_Grid SHALL disable the checkout button
3. WHEN a cashier clicks checkout, THE Checkout_Handler SHALL construct a Transaction_DTO with outlet_id, payment_method, and items array
4. THE Checkout_Handler SHALL submit the Transaction_DTO to POST /transactions endpoint
5. WHEN the transaction is processing, THE Checkout_Handler SHALL disable the checkout button and display a loading indicator
6. IF the Transaction_Service returns an error, THEN THE Checkout_Handler SHALL display the error message to the cashier

### Requirement 11: Transaction DTO Validation

**User Story:** As a developer, I want to validate transaction data before submission, so that invalid data is caught before reaching the backend.

#### Acceptance Criteria

1. THE Checkout_Handler SHALL use Zod schema to validate Transaction_DTO structure
2. THE Checkout_Handler SHALL validate that outlet_id is a valid UUID
3. THE Checkout_Handler SHALL validate that payment_method is one of cash, qris, or transfer
4. THE Checkout_Handler SHALL validate that each item has a valid product_id UUID and quantity greater than zero
5. IF validation fails, THEN THE Checkout_Handler SHALL display validation errors and prevent submission

### Requirement 12: Transaction Confirmation

**User Story:** As a cashier, I want to see confirmation after successful checkout, so that I know the transaction completed successfully.

#### Acceptance Criteria

1. WHEN the Transaction_Service returns success, THE POS_Terminal SHALL display a success confirmation dialog
2. THE confirmation dialog SHALL display the transaction ID and total amount
3. THE confirmation dialog SHALL provide a close button
4. WHEN the confirmation dialog is closed, THE Cart_Store SHALL clear all cart items
5. WHEN the cart is cleared, THE POS_Terminal SHALL be ready for the next transaction

### Requirement 13: Responsive Layout

**User Story:** As a cashier, I want the interface to work well on different screen sizes, so that I can use various devices.

#### Acceptance Criteria

1. THE POS_Terminal SHALL use a two-column grid layout on screens wider than 1024px
2. THE POS_Terminal SHALL stack the Product_Grid above the Cart_Grid on screens narrower than 1024px
3. THE Product_Grid SHALL occupy 60% width and the Cart_Grid SHALL occupy 40% width on desktop layouts
4. THE POS_Terminal SHALL maintain usability on screens as small as 768px width

### Requirement 14: Touch-Friendly Interface

**User Story:** As a cashier, I want touch-friendly controls, so that I can efficiently use touchscreen devices.

#### Acceptance Criteria

1. THE Product_Grid SHALL render product cards with minimum touch target size of 44px by 44px
2. THE Cart_Grid SHALL render buttons with minimum touch target size of 44px by 44px
3. THE Payment_Selector SHALL render options with minimum touch target size of 44px by 44px
4. THE POS_Terminal SHALL provide adequate spacing of at least 8px between interactive elements

### Requirement 15: Visual Feedback for Actions

**User Story:** As a cashier, I want clear visual feedback for my actions, so that I know the system is responding.

#### Acceptance Criteria

1. WHEN a cashier clicks a product, THE Product_Grid SHALL display a visual highlight animation
2. WHEN a cart item is added or updated, THE Cart_Grid SHALL display a brief highlight animation on the affected row
3. WHEN the checkout button is clicked, THE Checkout_Handler SHALL display a loading spinner
4. WHEN an error occurs, THE POS_Terminal SHALL display error messages in red with an error icon

### Requirement 16: State Management

**User Story:** As a developer, I want centralized state management, so that cart data is consistent across components.

#### Acceptance Criteria

1. THE Cart_Store SHALL maintain cart items as an array of objects with product_id, name, price, quantity, and stock
2. THE Cart_Store SHALL provide actions for addItem, updateQuantity, removeItem, and clearCart
3. THE Cart_Store SHALL provide computed properties for cartTotal and itemCount
4. THE Cart_Store SHALL persist cart state during the user session
5. WHEN the browser tab is closed, THE Cart_Store SHALL clear cart state

### Requirement 17: Error Handling

**User Story:** As a cashier, I want clear error messages when problems occur, so that I can take appropriate action.

#### Acceptance Criteria

1. WHEN the Product_Service fails to fetch products, THE Product_Grid SHALL display a user-friendly error message with a retry button
2. WHEN the Transaction_Service fails to create a transaction, THE Checkout_Handler SHALL display the error message from the backend
3. IF a network error occurs, THEN THE POS_Terminal SHALL display a message indicating connection problems
4. THE POS_Terminal SHALL log all errors to the browser console for debugging

### Requirement 18: Accessibility Compliance

**User Story:** As a user with accessibility needs, I want the interface to be accessible, so that I can use assistive technologies.

#### Acceptance Criteria

1. THE Product_Grid SHALL provide ARIA labels for product cards
2. THE Cart_Grid SHALL provide ARIA labels for quantity inputs and remove buttons
3. THE Payment_Selector SHALL provide ARIA labels for payment method options
4. THE POS_Terminal SHALL support keyboard navigation for all interactive elements
5. THE POS_Terminal SHALL maintain focus management when dialogs open and close
