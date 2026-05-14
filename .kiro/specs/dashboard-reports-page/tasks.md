# Implementation Plan: Dashboard Reports Page

## Overview

This implementation plan breaks down the dashboard reports page feature into discrete, incremental coding tasks. The feature integrates 5 backend reporting API endpoints with interactive Chart.js visualizations, date range filtering, and mobile-responsive design using Vue 3, TypeScript, PrimeVue, and Tailwind CSS.

The implementation follows a bottom-up approach: starting with type definitions and API services, then building individual chart components, and finally assembling everything into the dashboard page with responsive layout and comprehensive error handling.

## Tasks

- [ ] 1. Set up TypeScript type definitions and API service layer
  - [x] 1.1 Create TypeScript interfaces for all API requests and responses
    - Create `src/modules/dashboard/types/reports.ts` file
    - Define request parameter types: `BaseReportParams`, `TopProductsParams`, `DashboardParams`
    - Define response data types for all 5 endpoints: `SalesSummaryResponse`, `DailyReportsResponse`, `TopProductsResponse`, `OutletComparisonResponse`, `DashboardResponse`
    - Define chart component props types and date range types
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [x] 1.2 Implement centralized API service layer
    - Create `src/modules/dashboard/services/api.ts` file
    - Implement `getSalesSummary()` function with typed parameters and return type
    - Implement `getDailyReports()` function with typed parameters and return type
    - Implement `getTopProducts()` function with typed parameters and return type
    - Implement `getOutletComparison()` function with typed parameters and return type
    - Implement `getDashboardData()` function with typed parameters and return type
    - Use existing axios instance from `@/plugins/axios.ts`
    - Construct URLs using `/reports/` base path
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_

- [ ] 2. Create chart component directory structure and base components
  - [x] 2.1 Create chart components directory
    - Create `src/modules/dashboard/components/` directory
    - _Requirements: 10.5_

  - [x] 2.2 Implement SalesSummaryChart component
    - Create `src/modules/dashboard/components/SalesSummaryChart.vue`
    - Accept props: data, loading, error, title (using TypeScript interfaces)
    - Display loading indicator when loading is true
    - Display error message with retry button when error exists
    - Render card-based metrics display for sales summary data
    - Use Chart.js for optional pie chart breakdown if applicable
    - Implement Chart.js instance cleanup in `onBeforeUnmount`
    - Apply responsive styling with Tailwind CSS
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 10.2, 10.3, 10.4, 10.7, 12.4_

  - [ ]* 2.3 Write property test for SalesSummaryChart error handling
    - **Property 7: Chart Component Error Display**
    - **Validates: Requirements 4.5**
    - Test that any error state displays error message and prevents chart rendering

  - [x] 2.4 Implement DailyReportsChart component
    - Create `src/modules/dashboard/components/DailyReportsChart.vue`
    - Accept props: data, loading, error, title (using TypeScript interfaces)
    - Display loading indicator when loading is true
    - Display error message with retry button when error exists
    - Render line chart using Chart.js showing daily trends
    - Configure x-axis for dates and y-axis for sales metrics
    - Implement smooth curves with tension: 0.4
    - Implement Chart.js instance cleanup in `onBeforeUnmount`
    - Apply responsive styling with Tailwind CSS
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 10.2, 10.3, 10.4, 10.7, 12.1_

  - [ ]* 2.5 Write property test for DailyReportsChart data rendering
    - **Property 9: Chart Component Data Rendering**
    - **Validates: Requirements 5.4**
    - Test that valid data with loading false renders all data points

  - [x] 2.6 Implement TopProductsChart component
    - Create `src/modules/dashboard/components/TopProductsChart.vue`
    - Accept props: data, loading, error, title (using TypeScript interfaces)
    - Display loading indicator when loading is true
    - Display error message with retry button when error exists
    - Render horizontal bar chart using Chart.js
    - Display product names on y-axis and sales metrics on x-axis
    - Sort products in descending order by sales
    - Implement Chart.js instance cleanup in `onBeforeUnmount`
    - Apply responsive styling with Tailwind CSS
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 10.2, 10.3, 10.4, 10.7, 12.2_

  - [ ]* 2.7 Write property test for TopProductsChart ranking order
    - **Property 10: Product Ranking Order**
    - **Validates: Requirements 6.6**
    - Test that products are displayed in descending order by sales

  - [x] 2.8 Implement OutletComparisonChart component
    - Create `src/modules/dashboard/components/OutletComparisonChart.vue`
    - Accept props: data, loading, error, title (using TypeScript interfaces)
    - Display loading indicator when loading is true
    - Display error message with retry button when error exists
    - Render grouped bar chart using Chart.js
    - Display outlet names on x-axis with multiple metrics as grouped bars
    - Clearly label each outlet for identification
    - Implement Chart.js instance cleanup in `onBeforeUnmount`
    - Apply responsive styling with Tailwind CSS
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 10.2, 10.3, 10.4, 10.7, 12.3_

  - [ ]* 2.9 Write property test for OutletComparisonChart label visibility
    - **Property 17: Outlet Label Visibility**
    - **Validates: Requirements 7.7**
    - Test that each outlet has a clearly visible label

  - [x] 2.10 Implement DashboardOverviewChart component
    - Create `src/modules/dashboard/components/DashboardOverviewChart.vue`
    - Accept props: data, loading, error, title (using TypeScript interfaces)
    - Display loading indicator when loading is true
    - Display error message with retry button when error exists
    - Render consolidated dashboard metrics using mixed visualization types
    - Display metric cards for summary data
    - Display mini line chart for recent trends
    - Display mini bar chart for top products
    - Implement Chart.js instance cleanup in `onBeforeUnmount`
    - Apply responsive styling with Tailwind CSS
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 10.2, 10.3, 10.4, 10.7, 12.5_

- [x] 3. Checkpoint - Ensure all chart components render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement dashboard page with date filtering and data orchestration
  - [x] 4.1 Implement date range filtering and validation
    - Update `src/modules/dashboard/pages/index.vue`
    - Import PrimeVue DatePicker component
    - Create reactive date range state using `ref()`
    - Initialize default date range to last 30 days in `onMounted()`
    - Implement date formatting function (Date to YYYY-MM-DD)
    - Implement date range validation (start <= end, no future dates)
    - Display validation error messages for invalid ranges
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7, 3.8_

  - [ ]* 4.2 Write property test for date range validation
    - **Property 1: Date Range Validation**
    - **Validates: Requirements 3.4, 3.8**
    - Test that invalid date ranges prevent API calls and show error

  - [ ]* 4.3 Write property test for date formatting consistency
    - **Property 2: Date Formatting Consistency**
    - **Validates: Requirements 2.3, 3.6**
    - Test that any Date object formats to YYYY-MM-DD

  - [x] 4.4 Implement API data fetching and state management
    - Import all 5 API service functions
    - Create reactive state for each chart's data, loading, and error states
    - Implement `fetchAllReports()` function that calls all 5 API endpoints in parallel
    - Implement individual error handling for each API call (independent failures)
    - Trigger `fetchAllReports()` on component mount
    - Use `watch()` to trigger `fetchAllReports()` when date range changes
    - Ensure loading states are cleared when all requests complete
    - _Requirements: 3.5, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_

  - [ ]* 4.5 Write property test for API endpoint URL construction
    - **Property 3: API Endpoint URL Construction**
    - **Validates: Requirements 1.8**
    - Test that all API functions construct correct URLs

  - [ ]* 4.6 Write property test for date range triggering all API calls
    - **Property 6: Date Range Triggers All API Calls**
    - **Validates: Requirements 3.5**
    - Test that valid date selection triggers all 5 endpoint calls

  - [ ]* 4.7 Write property test for independent error handling
    - **Property 12: Independent Error Handling**
    - **Validates: Requirements 11.6**
    - Test that single endpoint failure doesn't affect other charts

  - [x] 4.8 Integrate all chart components into dashboard page
    - Import all 5 chart components
    - Pass data, loading, error, and title props to each chart component
    - Implement retry mechanism that re-triggers specific API calls
    - Send limit parameter of 10 to TopProductsAPI and DashboardAPI
    - _Requirements: 4.7, 5.4, 6.4, 7.5, 8.7, 10.1, 10.2_

  - [ ]* 4.9 Write property test for chart component reactivity
    - **Property 11: Chart Component Reactivity**
    - **Validates: Requirements 4.7**
    - Test that date range changes trigger automatic chart updates

- [x] 5. Checkpoint - Ensure data fetching and chart integration works
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement responsive layout and mobile optimization
  - [x] 6.1 Implement responsive grid layout
    - Apply Tailwind CSS grid classes to dashboard page
    - Use `grid-cols-1` for mobile (< 768px)
    - Use `md:grid-cols-2` for tablet (≥ 768px)
    - Use `lg:grid-cols-3` for desktop (≥ 1024px)
    - Configure appropriate column spans for each chart component
    - Apply responsive padding: `p-4 md:p-6 lg:p-8`
    - _Requirements: 9.1, 9.2, 9.3, 9.7_

  - [x] 6.2 Optimize chart components for mobile
    - Ensure DatePicker remains usable on mobile screens
    - Configure Chart.js responsive options with appropriate aspect ratios
    - Adjust aspect ratio based on viewport width (square on mobile, wider on desktop)
    - Ensure chart labels and legends remain readable on small screens
    - Apply responsive font sizes using Tailwind classes
    - _Requirements: 9.4, 9.5, 9.6_

  - [ ]* 6.3 Write property test for responsive layout adaptation
    - **Property 15: Responsive Layout Adaptation**
    - **Validates: Requirements 9.1, 9.5**
    - Test that layout adapts correctly across viewport widths

- [ ] 7. Implement comprehensive error handling and validation
  - [x] 7.1 Implement parameter validation
    - Add validation for limit parameter (range 1-50)
    - Add validation for outlet_id parameter (UUID format or null)
    - Display validation errors to user
    - _Requirements: 2.4, 2.5_

  - [ ]* 7.2 Write property test for limit parameter validation
    - **Property 4: Parameter Validation - Limit Range**
    - **Validates: Requirements 2.5**
    - Test that limit values outside 1-50 are rejected or clamped

  - [ ]* 7.3 Write property test for UUID parameter validation
    - **Property 5: Parameter Validation - UUID Format**
    - **Validates: Requirements 2.4**
    - Test that outlet_id validates as UUID or null

  - [x] 7.2 Implement data format validation
    - Add runtime validation for API response data structures
    - Display data format error messages when validation fails
    - Prevent chart rendering with invalid data
    - _Requirements: 11.4_

  - [ ]* 7.5 Write property test for invalid data format handling
    - **Property 16: Invalid Data Format Handling**
    - **Validates: Requirements 11.4**
    - Test that malformed data displays error instead of rendering

  - [x] 7.6 Implement Chart.js error handling
    - Wrap Chart.js initialization in try-catch blocks
    - Handle canvas unavailability errors
    - Log chart rendering errors for debugging
    - Display user-friendly error messages
    - _Requirements: 10.7_

- [ ] 8. Final integration and polish
  - [x] 8.1 Configure Chart.js styling and options
    - Apply consistent color palette across all charts
    - Configure tooltips with proper formatting
    - Configure legends with appropriate positioning
    - Configure animations with smooth easing
    - Ensure proper axis labels and formatting
    - _Requirements: 12.6, 12.7_

  - [x] 8.2 Implement Chart.js cleanup and memory management
    - Verify all chart components destroy Chart.js instances on unmount
    - Test for memory leaks with component mounting/unmounting
    - _Requirements: 10.7_

  - [ ]* 8.3 Write property test for Chart.js instance cleanup
    - **Property 14: Chart Instance Cleanup**
    - **Validates: Requirements 10.7**
    - Test that unmounted components destroy Chart.js instances

  - [ ]* 8.4 Write property test for loading state cleanup
    - **Property 13: Loading State Cleanup**
    - **Validates: Requirements 11.7**
    - Test that completed requests clear all loading indicators

  - [x] 8.5 Add accessibility improvements
    - Ensure proper ARIA labels for charts
    - Ensure keyboard navigation works for date picker
    - Ensure sufficient color contrast for text and charts
    - Add loading announcements for screen readers
    - _Requirements: 9.4_

- [x] 9. Final checkpoint - Comprehensive testing and validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Chart.js 4.5.0 is already installed in package.json
- The design uses TypeScript with Vue 3 Composition API
- All API calls use the existing axios instance from `@/plugins/axios.ts`
- Property-based tests require fast-check library (not yet installed)
- Checkpoints ensure incremental validation throughout implementation
- Independent error handling ensures one failing endpoint doesn't break the entire dashboard
