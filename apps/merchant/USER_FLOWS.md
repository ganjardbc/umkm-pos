# User Flows & Acceptance Criteria
## UMKM-POS App

---

## 🎯 Overview

This document defines user flows and acceptance criteria for the UMKM-POS App, covering all major features and user interactions.

---

## 📋 Table of Contents

1. [Authentication Flows](#authentication-flows)
2. [POS Terminal Flows](#pos-terminal-flows)
3. [Dashboard Flows](#dashboard-flows)
4. [Transaction Management Flows](#transaction-management-flows)
5. [Product Management Flows](#product-management-flows)
6. [User Management Flows](#user-management-flows)
7. [Reports & Analytics Flows](#reports--analytics-flows)
8. [Offline Sync Flows](#offline-sync-flows)

---

## Authentication Flows

### Flow 1.1: User Login

**Actor:** Cashier / Admin / Merchant

**Preconditions:**
- User has valid credentials
- API is accessible
- User is not already logged in

**Steps:**
1. User navigates to `/auth/login`
2. User enters email address
3. User enters password
4. User clicks "Login" button
5. System validates credentials via API
6. System stores JWT token
7. System redirects to dashboard or POS based on role

**Acceptance Criteria:**
- [ ] Login page displays email and password fields
- [ ] Email field validates email format
- [ ] Password field masks input
- [ ] "Login" button is disabled until both fields are filled
- [ ] On successful login, JWT token is stored securely
- [ ] User is redirected to appropriate dashboard based on role
- [ ] Error message displays for invalid credentials
- [ ] Error message displays for network errors
- [ ] Loading state shows during API call
- [ ] Token persists across page refreshes
- [ ] User can navigate back to login if not authenticated

---

### Flow 1.2: User Logout

**Actor:** Any authenticated user

**Preconditions:**
- User is logged in
- User is on any authenticated page

**Steps:**
1. User clicks logout button (in sidebar/menu)
2. System clears JWT token from storage
3. System clears user data from store
4. System redirects to login page

**Acceptance Criteria:**
- [ ] Logout button is visible in navigation
- [ ] Clicking logout immediately clears token
- [ ] User is redirected to login page
- [ ] Back button doesn't allow access to protected pages
- [ ] All user data is cleared from memory
- [ ] Confirmation dialog appears before logout (optional)

---

### Flow 1.3: Session Expiry

**Actor:** System

**Preconditions:**
- User is logged in
- JWT token has expired

**Steps:**
1. User makes API request with expired token
2. API returns 401 Unauthorized
3. System detects 401 response
4. System clears token and user data
5. System redirects to login page
6. System displays "Session expired" message

**Acceptance Criteria:**
- [ ] Expired token triggers automatic logout
- [ ] User sees "Session expired" message
- [ ] User is redirected to login page
- [ ] All protected pages redirect to login on 401
- [ ] Axios interceptor handles 401 globally

---

## POS Terminal Flows

### Flow 2.1: Create Transaction (Happy Path)

**Actor:** Cashier

**Preconditions:**
- User is logged in with cashier role
- User has permission to create transactions
- Products exist in system
- Stock is available

**Steps:**
1. User navigates to `/pos`
2. System displays product list/search
3. User searches for product (optional)
4. User clicks on product
5. System displays product details with price
6. User enters quantity
7. User clicks "Add to Cart"
8. System adds item to cart and updates total
9. User can add more items (repeat steps 3-8)
10. User clicks "Checkout"
11. System displays cart summary
12. User selects payment method
13. User clicks "Confirm Transaction"
14. System creates transaction atomically:
    - Creates transaction record
    - Creates transaction items
    - Reduces stock
    - Writes stock logs
15. System displays transaction success with receipt
16. User can print receipt (optional)
17. User clicks "New Transaction"
18. Cart clears and user returns to product list

**Acceptance Criteria:**
- [ ] Product list displays with images, names, prices
- [ ] Search filters products by name/category
- [ ] Product details show current stock level
- [ ] Quantity input validates positive numbers
- [ ] "Add to Cart" button adds item to cart
- [ ] Cart displays all items with subtotal
- [ ] Cart allows editing quantity or removing items
- [ ] Total price updates correctly
- [ ] Payment method selector shows available options
- [ ] "Confirm Transaction" button is disabled until payment method selected
- [ ] Transaction creation shows loading state
- [ ] Success message displays with transaction ID
- [ ] Receipt can be printed or downloaded
- [ ] Stock is reduced immediately after transaction
- [ ] Cart clears after successful transaction
- [ ] User can start new transaction immediately

---

### Flow 2.2: Add Item to Cart with Stock Validation

**Actor:** Cashier

**Preconditions:**
- User is on POS page
- Product has limited stock

**Steps:**
1. User enters quantity greater than available stock
2. User clicks "Add to Cart"
3. System validates stock availability
4. System displays error message
5. User adjusts quantity to available amount
6. User clicks "Add to Cart" again
7. System adds item to cart

**Acceptance Criteria:**
- [ ] System validates quantity against available stock
- [ ] Error message shows "Insufficient stock" with available quantity
- [ ] Quantity input has max value set to available stock
- [ ] User can adjust quantity and retry
- [ ] Stock validation happens before adding to cart

---

### Flow 2.3: Edit Cart Items

**Actor:** Cashier

**Preconditions:**
- User has items in cart
- User is on checkout page

**Steps:**
1. User views cart summary
2. User clicks edit button on item
3. System displays quantity editor
4. User changes quantity
5. System updates cart total
6. User can remove item by setting quantity to 0
7. System removes item from cart

**Acceptance Criteria:**
- [ ] Cart displays all items with quantity and price
- [ ] Edit button allows quantity adjustment
- [ ] Quantity validation prevents exceeding stock
- [ ] Total updates in real-time
- [ ] Remove button deletes item from cart
- [ ] Empty cart shows message and disables checkout

---

### Flow 2.4: Void Transaction

**Actor:** Cashier / Admin

**Preconditions:**
- Transaction exists
- User has permission to void transactions
- Transaction is recent (within configurable time)

**Steps:**
1. User navigates to transaction history
2. User finds transaction to void
3. User clicks "Void" button
4. System displays confirmation dialog
5. User confirms void action
6. System voids transaction:
    - Marks transaction as voided
    - Restores stock
    - Creates stock log entry
7. System displays success message

**Acceptance Criteria:**
- [ ] Void button only appears for voidable transactions
- [ ] Confirmation dialog shows transaction details
- [ ] Void action is logged with user and timestamp
- [ ] Stock is restored to original amount
- [ ] Stock log shows void reason
- [ ] Voided transaction shows "VOIDED" status
- [ ] Cannot void already voided transaction

---

### Flow 2.5: Start/End Shift

**Actor:** Cashier

**Preconditions:**
- User is logged in
- No active shift exists (for start)
- Active shift exists (for end)

**Steps:**

**Start Shift:**
1. User clicks "Start Shift" button
2. System displays shift start dialog
3. User confirms shift start
4. System creates shift record with start_time
5. System displays shift active indicator

**End Shift:**
1. User clicks "End Shift" button
2. System displays shift summary
3. System shows transactions in shift
4. System shows total sales
5. User confirms shift end
6. System closes shift with end_time
7. System displays shift summary report

**Acceptance Criteria:**
- [ ] Start Shift button visible when no active shift
- [ ] End Shift button visible when shift is active
- [ ] Shift start time is recorded
- [ ] Shift end time is recorded
- [ ] Transactions can be linked to shift
- [ ] Shift summary shows correct transaction count
- [ ] Shift summary shows correct total sales
- [ ] Cannot start new shift without ending current one

---

## Dashboard Flows

### Flow 3.1: View Dashboard Overview

**Actor:** Admin / Merchant

**Preconditions:**
- User is logged in with admin role
- User has permission to view dashboard

**Steps:**
1. User navigates to `/dashboard`
2. System fetches dashboard data:
    - Today's sales
    - Transaction count
    - Top products
    - Revenue metrics
3. System displays dashboard with charts and metrics
4. User can view different time periods (today, week, month)
5. User can filter by outlet (if multi-outlet)

**Acceptance Criteria:**
- [ ] Dashboard loads within 3 seconds
- [ ] Sales metrics display correctly
- [ ] Transaction count is accurate
- [ ] Top products list shows correct data
- [ ] Charts render without errors
- [ ] Time period filter updates data
- [ ] Outlet filter updates data
- [ ] Data refreshes on page reload
- [ ] Loading state shows while fetching data
- [ ] Error message displays if data fetch fails

---

### Flow 3.2: Navigate Dashboard Sections

**Actor:** Admin / Merchant

**Preconditions:**
- User is on dashboard
- User has appropriate permissions

**Steps:**
1. User clicks on navigation menu
2. System displays available sections based on role
3. User clicks on section (Transactions, Products, Reports, etc.)
4. System navigates to section
5. Section loads with relevant data

**Acceptance Criteria:**
- [ ] Navigation menu is always visible
- [ ] Menu items are based on user permissions
- [ ] Active menu item is highlighted
- [ ] Navigation is responsive on mobile
- [ ] Page transitions are smooth
- [ ] Breadcrumb shows current location

---

## Transaction Management Flows

### Flow 4.1: View Transaction History

**Actor:** Admin / Cashier

**Preconditions:**
- User is logged in
- User has permission to view transactions
- Transactions exist in system

**Steps:**
1. User navigates to `/transactions`
2. System fetches transaction list with pagination
3. System displays transactions in table:
    - Transaction ID
    - Date/Time
    - Amount
    - Payment method
    - Status
4. User can search by transaction ID
5. User can filter by date range
6. User can filter by status (completed, voided)
7. User can sort by column
8. User can paginate through results

**Acceptance Criteria:**
- [ ] Transaction list displays with all required fields
- [ ] Pagination works correctly
- [ ] Search filters transactions by ID
- [ ] Date range filter works
- [ ] Status filter works
- [ ] Column sorting works
- [ ] Loading state shows while fetching
- [ ] Empty state message shows if no transactions
- [ ] Table is responsive on mobile

---

### Flow 4.2: View Transaction Details

**Actor:** Admin / Cashier

**Preconditions:**
- User is on transaction history page
- Transaction exists

**Steps:**
1. User clicks on transaction row
2. System navigates to `/transactions/:id`
3. System displays transaction details:
    - Transaction ID
    - Date/Time
    - Items with prices
    - Total amount
    - Payment method
    - Shift information
    - User who created transaction
4. User can view receipt
5. User can print receipt
6. User can void transaction (if permitted)

**Acceptance Criteria:**
- [ ] Transaction details page loads quickly
- [ ] All transaction information displays correctly
- [ ] Items show price snapshot
- [ ] Receipt preview is accurate
- [ ] Print button works
- [ ] Void button appears only if permitted
- [ ] Back button returns to transaction list

---

### Flow 4.3: Search & Filter Transactions

**Actor:** Admin

**Preconditions:**
- User is on transaction history page
- Multiple transactions exist

**Steps:**
1. User enters search criteria (ID, date range, status)
2. System filters transactions in real-time
3. System displays filtered results
4. User can clear filters
5. System resets to full transaction list

**Acceptance Criteria:**
- [ ] Search works by transaction ID
- [ ] Date range filter works
- [ ] Status filter works
- [ ] Multiple filters can be applied together
- [ ] Results update in real-time
- [ ] Clear filters button resets all filters
- [ ] Result count shows filtered amount

---

## Product Management Flows

### Flow 5.1: View Product List

**Actor:** Admin

**Preconditions:**
- User is logged in with admin role
- User has permission to view products
- Products exist in system

**Steps:**
1. User navigates to `/products`
2. System fetches product list
3. System displays products in table/grid:
    - Product name
    - Category
    - Price
    - Cost
    - Current stock
    - Status
4. User can search by product name
5. User can filter by category
6. User can sort by column
7. User can paginate

**Acceptance Criteria:**
- [ ] Product list displays with all fields
- [ ] Search filters by product name
- [ ] Category filter works
- [ ] Sorting works on all columns
- [ ] Pagination works
- [ ] Loading state shows
- [ ] Empty state message shows if no products

---

### Flow 5.2: Create Product

**Actor:** Admin

**Preconditions:**
- User is on products page
- User has permission to create products

**Steps:**
1. User clicks "Add Product" button
2. System displays product form with fields:
    - Product name
    - Category
    - Description
    - Price
    - Cost
    - Initial stock
3. User fills in all required fields
4. User clicks "Save"
5. System validates form data
6. System creates product via API
7. System displays success message
8. System redirects to product list

**Acceptance Criteria:**
- [ ] Form displays all required fields
- [ ] Form validates required fields
- [ ] Price and cost must be positive numbers
- [ ] Stock must be non-negative number
- [ ] Form shows validation errors
- [ ] Save button is disabled until form is valid
- [ ] Success message displays after creation
- [ ] New product appears in list
- [ ] User can cancel and return to list

---

### Flow 5.3: Edit Product

**Actor:** Admin

**Preconditions:**
- User is on products page
- Product exists
- User has permission to edit products

**Steps:**
1. User clicks on product or edit button
2. System navigates to `/products/:id`
3. System displays product form pre-filled with data
4. User modifies fields
5. User clicks "Save"
6. System validates form
7. System updates product via API
8. System displays success message
9. System redirects to product list

**Acceptance Criteria:**
- [ ] Form pre-fills with current product data
- [ ] All fields are editable
- [ ] Validation works same as create
- [ ] Save button shows loading state
- [ ] Success message displays
- [ ] Changes appear in product list
- [ ] User can cancel without saving

---

### Flow 5.4: Adjust Stock

**Actor:** Admin

**Preconditions:**
- User is on products page
- Product exists
- User has permission to adjust stock

**Steps:**
1. User clicks on product
2. User clicks "Adjust Stock" button
3. System displays stock adjustment dialog:
    - Current stock
    - Adjustment type (add/reduce)
    - Adjustment quantity
    - Reason (optional)
4. User selects adjustment type
5. User enters quantity
6. User enters reason (optional)
7. User clicks "Confirm"
8. System creates stock log entry
9. System updates product stock
10. System displays success message

**Acceptance Criteria:**
- [ ] Stock adjustment dialog displays current stock
- [ ] Adjustment type selector works
- [ ] Quantity input validates positive numbers
- [ ] Reason field is optional
- [ ] Confirm button disabled until quantity entered
- [ ] Stock updates immediately
- [ ] Stock log entry is created
- [ ] Success message displays
- [ ] Cannot reduce stock below 0

---

### Flow 5.5: View Stock Audit Log

**Actor:** Admin

**Preconditions:**
- User is on product details page
- Stock adjustments exist

**Steps:**
1. User clicks "Stock History" tab
2. System displays stock log entries:
    - Date/Time
    - Adjustment type
    - Quantity
    - Reason
    - User who made adjustment
3. User can filter by date range
4. User can sort by column

**Acceptance Criteria:**
- [ ] Stock log displays all entries
- [ ] Entries show correct information
- [ ] Date range filter works
- [ ] Sorting works
- [ ] Pagination works if many entries
- [ ] Empty state shows if no history

---

## User Management Flows

### Flow 6.1: View User List

**Actor:** Admin / Merchant

**Preconditions:**
- User is logged in with admin role
- User has permission to manage users
- Users exist in system

**Steps:**
1. User navigates to `/users`
2. System fetches user list
3. System displays users in table:
    - Name
    - Email
    - Role
    - Outlet
    - Status (active/inactive)
    - Last login
4. User can search by name/email
5. User can filter by role
6. User can filter by outlet
7. User can sort by column

**Acceptance Criteria:**
- [ ] User list displays with all fields
- [ ] Search works by name and email
- [ ] Role filter works
- [ ] Outlet filter works
- [ ] Sorting works
- [ ] Pagination works
- [ ] Loading state shows

---

### Flow 6.2: Create User

**Actor:** Admin / Merchant

**Preconditions:**
- User is on users page
- User has permission to create users

**Steps:**
1. User clicks "Add User" button
2. System displays user form with fields:
    - Full name
    - Email
    - Password
    - Role
    - Outlet assignment
3. User fills in all fields
4. User clicks "Save"
5. System validates form
6. System creates user via API
7. System displays success message
8. System redirects to user list

**Acceptance Criteria:**
- [ ] Form displays all required fields
- [ ] Email validation works
- [ ] Password strength validation works
- [ ] Role selector shows available roles
- [ ] Outlet selector shows available outlets
- [ ] Form validates all required fields
- [ ] Save button disabled until form valid
- [ ] Success message displays
- [ ] New user appears in list
- [ ] User receives welcome email (optional)

---

### Flow 6.3: Edit User

**Actor:** Admin / Merchant

**Preconditions:**
- User is on users page
- User exists
- User has permission to edit users

**Steps:**
1. User clicks on user or edit button
2. System navigates to `/users/:id`
3. System displays user form pre-filled
4. User modifies fields (except email)
5. User clicks "Save"
6. System validates form
7. System updates user via API
8. System displays success message

**Acceptance Criteria:**
- [ ] Form pre-fills with user data
- [ ] Email field is read-only
- [ ] Password field is optional (for updates)
- [ ] Role can be changed
- [ ] Outlet assignment can be changed
- [ ] Validation works
- [ ] Success message displays
- [ ] Changes appear in user list

---

### Flow 6.4: Deactivate User

**Actor:** Admin / Merchant

**Preconditions:**
- User is on users page
- User exists
- User has permission to deactivate users

**Steps:**
1. User clicks on user
2. User clicks "Deactivate" button
3. System displays confirmation dialog
4. User confirms deactivation
5. System deactivates user via API
6. System displays success message
7. User status changes to "Inactive"

**Acceptance Criteria:**
- [ ] Deactivate button appears for active users
- [ ] Confirmation dialog shows user name
- [ ] User status changes to inactive
- [ ] Inactive user cannot login
- [ ] User can be reactivated
- [ ] Success message displays

---

### Flow 6.5: Assign Permissions

**Actor:** Admin / Merchant

**Preconditions:**
- User is on user details page
- User exists
- User has permission to manage permissions

**Steps:**
1. User clicks "Permissions" tab
2. System displays available permissions
3. System shows current user permissions
4. User can check/uncheck permissions
5. User clicks "Save"
6. System updates user permissions via API
7. System displays success message

**Acceptance Criteria:**
- [ ] Permissions list displays all available permissions
- [ ] Current permissions are checked
- [ ] User can toggle permissions
- [ ] Save button disabled until changes made
- [ ] Success message displays
- [ ] Permissions take effect immediately

---

## Reports & Analytics Flows

### Flow 7.1: View Daily Report

**Actor:** Admin / Merchant

**Preconditions:**
- User is logged in with admin role
- User has permission to view reports
- Transactions exist

**Steps:**
1. User navigates to `/reports`
2. System displays report options
3. User selects "Daily Report"
4. System displays date picker
5. User selects date
6. System fetches daily report data:
    - Total sales
    - Transaction count
    - Average transaction value
    - Top products
    - Payment methods breakdown
7. System displays report with charts

**Acceptance Criteria:**
- [ ] Report loads within 3 seconds
- [ ] Date picker works
- [ ] Report shows correct data for selected date
- [ ] Charts render correctly
- [ ] Data is accurate
- [ ] Report can be exported to PDF
- [ ] Report can be printed

---

### Flow 7.2: View Sales Analytics

**Actor:** Admin / Merchant

**Preconditions:**
- User is on reports page
- Transactions exist

**Steps:**
1. User selects "Sales Analytics"
2. System displays time period selector (week, month, year)
3. User selects time period
4. System displays charts:
    - Sales trend line chart
    - Sales by product bar chart
    - Sales by outlet pie chart
5. User can filter by outlet
6. User can export data

**Acceptance Criteria:**
- [ ] Charts display correctly
- [ ] Time period filter works
- [ ] Outlet filter works
- [ ] Data is accurate
- [ ] Charts are interactive
- [ ] Export to CSV works
- [ ] Export to PDF works

---

### Flow 7.3: View Stock Report

**Actor:** Admin

**Preconditions:**
- User is on reports page
- Products exist

**Steps:**
1. User selects "Stock Report"
2. System displays stock information:
    - Current stock levels
    - Low stock items
    - Stock movement history
3. User can filter by category
4. User can sort by stock level
5. User can export report

**Acceptance Criteria:**
- [ ] Stock levels are accurate
- [ ] Low stock items are highlighted
- [ ] Category filter works
- [ ] Sorting works
- [ ] Export works
- [ ] Report shows stock movement

---

## Offline Sync Flows

### Flow 8.1: Create Transaction Offline

**Actor:** Cashier

**Preconditions:**
- User is on POS page
- Internet connection is lost
- User has offline capability enabled

**Steps:**
1. User creates transaction as normal
2. System detects no internet connection
3. System stores transaction in local queue
4. System displays "Offline Mode" indicator
5. System shows transaction as "Pending Sync"
6. User can continue creating transactions
7. Each transaction is queued locally

**Acceptance Criteria:**
- [ ] Offline mode indicator displays
- [ ] Transactions are stored locally
- [ ] Transactions show "Pending Sync" status
- [ ] User can create multiple transactions offline
- [ ] Cart functionality works offline
- [ ] Stock validation uses local data
- [ ] No error messages displayed

---

### Flow 8.2: Sync Transactions When Online

**Actor:** System / Cashier

**Preconditions:**
- User has offline transactions in queue
- Internet connection is restored
- User is on POS page

**Steps:**
1. System detects internet connection restored
2. System displays "Sync Available" notification
3. User clicks "Sync Now" button (or auto-sync)
4. System syncs transactions to server:
    - Sends each queued transaction
    - Validates server response
    - Removes synced transactions from queue
5. System displays sync progress
6. System displays sync results:
    - Successful syncs
    - Failed syncs (if any)
7. System clears offline indicator

**Acceptance Criteria:**
- [ ] Sync notification appears when online
- [ ] Sync button triggers sync process
- [ ] Progress indicator shows during sync
- [ ] Successful transactions are removed from queue
- [ ] Failed transactions remain in queue
- [ ] User can retry failed syncs
- [ ] Sync results are displayed
- [ ] Offline indicator clears after successful sync

---

### Flow 8.3: Handle Sync Conflicts

**Actor:** System

**Preconditions:**
- Offline transaction conflicts with server data
- User is syncing transactions

**Steps:**
1. System attempts to sync transaction
2. System detects conflict (e.g., stock insufficient)
3. System applies server-authoritative resolution
4. System marks transaction as "Sync Failed"
5. System displays conflict message to user
6. User can view conflict details
7. User can retry or discard transaction

**Acceptance Criteria:**
- [ ] Conflicts are detected
- [ ] Server-authoritative resolution is applied
- [ ] User is notified of conflicts
- [ ] Conflict details are displayed
- [ ] User can retry sync
- [ ] User can discard transaction
- [ ] Failed transactions are logged

---

### Flow 8.4: View Sync Queue

**Actor:** Cashier / Admin

**Preconditions:**
- User has offline transactions
- User is on POS or dashboard page

**Steps:**
1. User clicks "Sync Queue" button
2. System displays queue status:
    - Pending transactions count
    - Failed transactions count
    - Last sync time
3. User can view queue details
4. User can retry failed syncs
5. User can clear queue (with confirmation)

**Acceptance Criteria:**
- [ ] Queue status displays correctly
- [ ] Pending count is accurate
- [ ] Failed count is accurate
- [ ] Queue details show transaction info
- [ ] Retry button works
- [ ] Clear queue requires confirmation
- [ ] Queue clears after confirmation

---

## 🎯 Cross-Cutting Acceptance Criteria

### Performance
- [ ] All pages load within 3 seconds
- [ ] API responses complete within 2 seconds
- [ ] Charts render within 1 second
- [ ] Search results appear within 500ms
- [ ] No memory leaks on page navigation

### Accessibility
- [ ] All forms are keyboard navigable
- [ ] All buttons have proper labels
- [ ] Color contrast meets WCAG AA standards
- [ ] Error messages are clear and actionable
- [ ] Loading states are announced

### Error Handling
- [ ] All API errors display user-friendly messages
- [ ] Network errors are handled gracefully
- [ ] Validation errors are specific and helpful
- [ ] Error messages suggest corrective actions
- [ ] Errors are logged for debugging

### Security
- [ ] JWT tokens are stored securely
- [ ] Sensitive data is not logged
- [ ] CSRF protection is enabled
- [ ] XSS protection is enabled
- [ ] SQL injection is prevented (via API)
- [ ] User data is merchant-scoped

### Responsive Design
- [ ] App works on desktop (1920x1080)
- [ ] App works on tablet (768x1024)
- [ ] App works on mobile (375x667)
- [ ] Touch targets are at least 44x44px
- [ ] Navigation adapts to screen size

### Data Validation
- [ ] All inputs are validated on client
- [ ] All inputs are validated on server
- [ ] Invalid data is rejected with clear messages
- [ ] Whitelist validation is used
- [ ] Type validation is enforced

---

## 📊 Success Metrics

- [ ] 95%+ of user flows complete successfully
- [ ] Average page load time < 2 seconds
- [ ] 99%+ API success rate
- [ ] Zero critical bugs in production
- [ ] User satisfaction score > 4.5/5
- [ ] Offline sync success rate > 98%
- [ ] Zero data loss incidents
