# Implementation Plan: POS Terminal Interface

## Overview

This plan implements a Vue 3 + TypeScript POS terminal interface with dual-grid layout for product browsing and cart management. The implementation follows a layered architecture with Pinia state management, Zod validation, and comprehensive property-based testing using fast-check.

## Tasks

- [x] 1. Set up core types and validation schemas
  - Create TypeScript interfaces in `types/index.ts` (Product, CartItem, TransactionDTO, TransactionResponse, ApiError)
  - Create Zod validation schemas in `services/validation.ts` (transactionDTOSchema, paymentMethodSchema, uuidSchema)
  - Create constants file in `services/constants.ts` (PaymentMethod enum, pagination constants)
  - _Requirements: 11.1, 11.2, 11.3, 11.4_

- [ ] 2. Implement Pinia cart store with modular pattern
  - [x] 2.1 Create cart state interface in `stores/state.ts`
    - Define CartState with items, payment_method, outlet_id
    - _Requirements: 16.1_
  
  - [x] 2.2 Create cart getters in `stores/getters.ts`
    - Implement total, itemCount, isEmpty, canCheckout computed properties
    - _Requirements: 7.1, 16.3_
  
  - [ ]* 2.3 Write property test for cart total calculation
    - **Property 12: Cart Total Calculation**
    - **Validates: Requirements 7.1, 7.2**
  
  - [x] 2.4 Create cart actions in `stores/actions.ts`
    - Implement addItem, updateQuantity, removeItem, setPaymentMethod, clearCart, initializeOutlet
    - Add stock validation logic in addItem and updateQuantity
    - _Requirements: 3.1, 3.2, 5.2, 6.2, 8.3, 12.4, 16.2_
  
  - [ ]* 2.5 Write property test for add product to cart
    - **Property 5: Add Product to Cart**
    - **Property 6: Increment Existing Cart Item**
    - **Validates: Requirements 3.1, 3.2**
  
  - [ ]* 2.6 Write property test for subtotal calculation
    - **Property 8: Subtotal Calculation**
    - **Validates: Requirements 4.2**
  
  - [x] 2.7 Wire store modules together in `stores/index.ts`
    - Export useCartStore with state, getters, and actions
    - _Requirements: 16.1, 16.2, 16.3_

- [ ] 3. Implement API services layer
  - [x] 3.1 Create product API functions in `services/api.ts`
    - Implement getProducts with search, pagination params
    - Implement getProductById for stock validation
    - Add error handling with Axios interceptors
    - _Requirements: 1.1, 9.4_
  
  - [x] 3.2 Create transaction API functions in `services/api.ts`
    - Implement createTransaction with TransactionDTO
    - Add error handling and response transformation
    - _Requirements: 10.4_
  
  - [x] 3.3 Create ValidationService in `services/validation.ts`
    - Implement validateStock method with API calls
    - Implement validateTransactionDTO with Zod
    - Add error message formatting
    - _Requirements: 9.1, 9.2, 11.1, 11.5_
  
  - [ ]* 3.4 Write property tests for validation
    - **Property 20: UUID Validation**
    - **Property 21: Payment Method Validation**
    - **Property 22: Transaction Item Validation**
    - **Validates: Requirements 11.2, 11.3, 11.4**

- [x] 4. Checkpoint - Ensure core services work
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement ProductCard component
  - [x] 5.1 Create ProductCard.vue in `components/`
    - Implement props interface (product, disabled)
    - Add click handler with add-to-cart emit
    - Style with Tailwind (44x44px minimum, hover effects)
    - Add ARIA labels and keyboard navigation
    - Implement disabled state for zero stock
    - _Requirements: 1.2, 3.1, 3.4, 14.1, 15.1, 18.1, 18.4_
  
  - [ ]* 5.2 Write unit tests for ProductCard
    - Test rendering with product data
    - Test disabled state when stock is zero
    - Test click event emission
    - Test ARIA labels
  
  - [ ]* 5.3 Write property test for product display
    - **Property 1: Product Display Completeness**
    - **Validates: Requirements 1.2**

- [ ] 6. Implement ProductGrid component
  - [x] 6.1 Create ProductGrid.vue in `components/`
    - Implement reactive state (products, filteredProducts, searchQuery, loading, error, pagination)
    - Add search input with 300ms debounce
    - Implement product filtering logic
    - Add PrimeVue DataView with pagination (20 items per page)
    - Add loading skeleton and error states with retry
    - Wire ProductCard components with add-to-cart handler
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 17.1_
  
  - [ ]* 6.2 Write property tests for search functionality
    - **Property 3: Search Filter Accuracy**
    - **Property 4: Search Clear Restoration**
    - **Validates: Requirements 2.2, 2.4**
  
  - [ ]* 6.3 Write property test for pagination
    - **Property 2: Pagination Threshold**
    - **Validates: Requirements 1.5**
  
  - [ ]* 6.4 Write unit tests for ProductGrid
    - Test product loading and error states
    - Test search debounce behavior
    - Test pagination controls

- [ ] 7. Implement CartItem component
  - [x] 7.1 Create CartItem.vue in `components/`
    - Implement props interface (item)
    - Add PrimeVue InputNumber for quantity with validation
    - Add remove button with confirmation
    - Display product name, price, quantity, subtotal, stock
    - Add inline validation error messages
    - Style with Tailwind and touch-friendly targets
    - Add ARIA labels for inputs and buttons
    - _Requirements: 4.1, 4.2, 5.1, 5.3, 5.4, 5.5, 6.1, 14.2, 18.2, 18.4_
  
  - [ ]* 7.2 Write property tests for quantity validation
    - **Property 9: Quantity Update**
    - **Property 10: Quantity Validation**
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
  
  - [ ]* 7.3 Write unit tests for CartItem
    - Test quantity input validation
    - Test remove button click
    - Test subtotal display
    - Test error message display

- [ ] 8. Implement PaymentSelector component
  - [x] 8.1 Create PaymentSelector.vue in `components/`
    - Implement PrimeVue RadioButton group for payment methods
    - Add icons for cash, qris, transfer
    - Set default to cash
    - Wire to cart store setPaymentMethod action
    - Style with Tailwind (44x44px touch targets)
    - Add ARIA labels for radio options
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 14.3, 18.3, 18.4_
  
  - [ ]* 8.2 Write property test for payment method storage
    - **Property 14: Payment Method Storage**
    - **Property 15: Payment Method Display**
    - **Validates: Requirements 8.3, 8.4**
  
  - [ ]* 8.3 Write unit tests for PaymentSelector
    - Test default selection
    - Test payment method change
    - Test visual indication of selected method

- [ ] 9. Implement CheckoutButton component
  - [x] 9.1 Create CheckoutButton.vue in `components/`
    - Implement props interface (disabled, loading)
    - Add PrimeVue Button with loading spinner
    - Implement checkout click handler with validation flow
    - Call ValidationService.validateStock before submission
    - Call ValidationService.validateTransactionDTO
    - Call createTransaction API
    - Emit success/error events to parent
    - _Requirements: 9.1, 9.2, 9.3, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 11.5, 15.3_
  
  - [ ]* 9.2 Write property tests for checkout validation
    - **Property 16: Stock Validation Before Checkout**
    - **Property 17: Prevent Invalid Checkout**
    - **Property 18: Transaction DTO Construction**
    - **Property 23: Validation Error Prevention**
    - **Validates: Requirements 9.1, 9.2, 9.3, 10.3, 11.5**
  
  - [ ]* 9.3 Write unit tests for CheckoutButton
    - Test disabled state when cart is empty
    - Test loading state during submission
    - Test error handling
    - Test success flow

- [ ] 10. Implement CartGrid component
  - [x] 10.1 Create CartGrid.vue in `components/`
    - Wire to cart store (items, total, itemCount, canCheckout)
    - Render CartItem components for each item
    - Display cart summary with formatted total
    - Add PaymentSelector component
    - Add CheckoutButton component
    - Implement empty state message
    - Add highlight animations for item changes
    - Format currency with proper notation
    - _Requirements: 4.1, 4.3, 4.4, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 10.1, 10.2, 15.2_
  
  - [ ]* 10.2 Write property test for cart item display
    - **Property 7: Cart Item Display Completeness**
    - **Validates: Requirements 4.1, 5.1, 6.1**
  
  - [ ]* 10.3 Write property test for currency formatting
    - **Property 13: Currency Formatting**
    - **Validates: Requirements 7.3**
  
  - [ ]* 10.4 Write unit tests for CartGrid
    - Test empty cart display
    - Test cart items rendering
    - Test total calculation display
    - Test checkout button state

- [x] 11. Checkpoint - Ensure all components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement main POS Terminal page
  - [x] 12.1 Update `pages/index.vue` with complete implementation
    - Implement responsive grid layout (60/40 split on desktop, stacked on mobile)
    - Add ProductGrid and CartGrid components
    - Initialize cart store with outlet_id from auth context
    - Add PrimeVue Dialog for transaction confirmation
    - Implement success confirmation handler
    - Add PrimeVue Toast for error notifications
    - Add error boundary with onErrorCaptured
    - Implement focus management for dialogs
    - _Requirements: 10.6, 12.1, 12.2, 12.3, 12.4, 12.5, 13.1, 13.2, 13.3, 13.4, 14.4, 15.4, 17.2, 17.3, 17.4, 18.5_
  
  - [ ]* 12.2 Write property tests for transaction flow
    - **Property 19: Transaction Error Display**
    - **Property 24: Success Confirmation Display**
    - **Property 25: Cart Clear After Confirmation**
    - **Validates: Requirements 10.6, 12.2, 12.4, 17.2**
  
  - [ ]* 12.3 Write unit tests for POS Terminal page
    - Test layout responsiveness
    - Test confirmation dialog display
    - Test error toast notifications
    - Test cart clear after success

- [ ] 13. Implement accessibility features
  - [x] 13.1 Add comprehensive ARIA labels to all components
    - Verify ProductCard ARIA labels
    - Verify CartItem ARIA labels
    - Verify PaymentSelector ARIA labels
    - Verify CheckoutButton ARIA label
    - _Requirements: 18.1, 18.2, 18.3_
  
  - [x] 13.2 Implement keyboard navigation support
    - Test Tab navigation through all interactive elements
    - Test Enter/Space activation for buttons and cards
    - Test Arrow keys for radio buttons
    - _Requirements: 18.4_
  
  - [x] 13.3 Implement focus management for dialogs
    - Focus moves to dialog on open
    - Focus returns to trigger element on close
    - _Requirements: 18.5_
  
  - [ ]* 13.4 Write property tests for accessibility
    - **Property 26: Minimum Touch Target Size**
    - **Property 33: ARIA Labels for All Interactive Elements**
    - **Property 34: Keyboard Navigation Support**
    - **Property 35: Focus Management for Dialogs**
    - **Validates: Requirements 14.1, 14.2, 14.3, 18.1, 18.2, 18.3, 18.4, 18.5**

- [ ] 14. Implement visual feedback and animations
  - [x] 14.1 Add product click highlight animation
    - 200ms highlight effect on ProductCard click
    - _Requirements: 15.1_
  
  - [x] 14.2 Add cart item change animations
    - Brief highlight on CartItem add/update
    - _Requirements: 15.2_
  
  - [x] 14.3 Style error messages consistently
    - Red color with error icon for all errors
    - _Requirements: 15.4_
  
  - [ ]* 14.4 Write property tests for visual feedback
    - **Property 28: Product Click Visual Feedback**
    - **Property 29: Error Display Styling**
    - **Validates: Requirements 15.1, 15.4**

- [ ] 15. Implement error handling and recovery
  - [x] 15.1 Add error handling to ProductGrid
    - Network error detection and retry button
    - User-friendly error messages
    - _Requirements: 17.1, 17.3_
  
  - [x] 15.2 Add error handling to CheckoutButton
    - API error display with backend messages
    - Network error detection
    - _Requirements: 17.2, 17.3_
  
  - [x] 15.3 Add global error logging
    - Console logging for all errors
    - _Requirements: 17.4_
  
  - [ ]* 15.4 Write property tests for error handling
    - **Property 32: Error Logging**
    - **Validates: Requirements 17.4**

- [ ] 16. Implement state persistence and cart data structure
  - [x] 16.1 Verify cart item data structure
    - Ensure all CartItem fields present (product_id, name, price, quantity, stock, subtotal)
    - _Requirements: 16.1_
  
  - [x] 16.2 Implement session-based state persistence
    - Cart persists during session
    - Cart clears on browser tab close
    - _Requirements: 16.4, 16.5_
  
  - [ ]* 16.3 Write property tests for cart state
    - **Property 30: Cart Item Data Structure**
    - **Property 31: Cart State Persistence**
    - **Validates: Requirements 16.1, 16.4**

- [ ] 17. Implement responsive design and touch optimization
  - [x] 17.1 Verify responsive layout breakpoints
    - Test 60/40 split on desktop (≥1024px)
    - Test stacked layout on mobile/tablet (<1024px)
    - Test minimum width support (768px)
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [x] 17.2 Verify touch target sizes
    - Ensure all interactive elements meet 44x44px minimum
    - Verify 8px spacing between elements
    - _Requirements: 14.1, 14.2, 14.3, 14.4_
  
  - [ ]* 17.3 Write property test for touch targets and spacing
    - **Property 27: Interactive Element Spacing**
    - **Validates: Requirements 14.4**

- [ ] 18. Final integration and testing
  - [x] 18.1 Wire all components together in POS Terminal page
    - Verify ProductGrid → Cart Store → CartGrid data flow
    - Verify CheckoutButton → API → Confirmation flow
    - Test complete user journey from product selection to checkout
    - _Requirements: All_
  
  - [ ]* 18.2 Run all property-based tests
    - Execute all 35 property tests with 100 iterations each
    - Verify all properties pass
  
  - [ ]* 18.3 Run all unit tests and check coverage
    - Execute complete unit test suite
    - Verify minimum 80% line coverage
    - Verify minimum 75% branch coverage

- [x] 19. Final checkpoint - Complete system verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check with 100 iterations minimum
- All property tests include feature tag comments
- Components use PrimeVue for UI consistency
- Styling uses Tailwind CSS with responsive breakpoints
- State management follows Pinia modular pattern (state.ts, getters.ts, actions.ts)
- Validation uses Zod schemas for runtime type safety
- Error handling includes network, API, validation, and runtime errors
- Accessibility follows WCAG guidelines with ARIA labels and keyboard navigation
