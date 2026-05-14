# Design Document: Dashboard Reports Page

## Overview

The Dashboard Reports Page is a comprehensive analytics interface for the UMKM POS system that provides visual insights through five distinct reporting endpoints. Built with Vue 3 Composition API, TypeScript, PrimeVue components, and Chart.js, this feature delivers real-time sales analytics, product performance metrics, and outlet comparisons through interactive charts and visualizations.

The design follows a modular component architecture where each chart is an independent, reusable component that handles its own rendering, loading states, and error handling. The parent dashboard page orchestrates data fetching, date range filtering, and responsive layout management. All API interactions are centralized in a dedicated service layer with full TypeScript type safety.

Key technical decisions:
- **Chart.js 4.5.0**: Selected for its robust charting capabilities, extensive customization options, and active maintenance
- **Composition API**: Leverages Vue 3's reactivity system for cleaner state management and better TypeScript integration
- **Mobile-first responsive design**: Uses CSS Grid and Flexbox with Tailwind CSS for adaptive layouts
- **Centralized error handling**: Each chart component independently manages its error and loading states to prevent cascade failures
- **Type-safe API layer**: All API requests and responses are fully typed using TypeScript interfaces

## Architecture

### Component Hierarchy

```
DashboardPage (index.vue)
├── DateRangeFilter (PrimeVue DatePicker)
├── SalesSummaryChart (component)
├── DailyReportsChart (component)
├── TopProductsChart (component)
├── OutletComparisonChart (component)
└── DashboardOverviewChart (component)
```

### Module Structure

```
src/modules/dashboard/
├── pages/
│   └── index.vue                    # Main dashboard page
├── components/
│   ├── SalesSummaryChart.vue        # Sales summary visualization
│   ├── DailyReportsChart.vue        # Daily trends line chart
│   ├── TopProductsChart.vue         # Top products horizontal bar chart
│   ├── OutletComparisonChart.vue    # Outlet comparison grouped bar chart
│   └── DashboardOverviewChart.vue   # Consolidated dashboard metrics
├── services/
│   └── api.ts                       # Centralized API service layer
└── types/
    └── reports.ts                   # TypeScript type definitions
```

### Data Flow

1. **User Interaction**: User selects date range via PrimeVue DatePicker
2. **Validation**: Dashboard page validates date range (start ≤ end)
3. **API Calls**: Dashboard page triggers parallel API calls to all 5 endpoints
4. **State Management**: Each chart component receives data, loading, and error states as props
5. **Rendering**: Chart components render visualizations using Chart.js
6. **Updates**: Date range changes trigger reactive updates across all charts

### State Management Strategy

The dashboard uses Vue 3's reactive state management without Pinia, keeping state local to the dashboard page component:

- **dateRange**: Reactive ref containing start and end dates
- **chartData**: Reactive refs for each endpoint's response data
- **loadingStates**: Reactive refs tracking loading state per endpoint
- **errorStates**: Reactive refs tracking error messages per endpoint

This approach is suitable because:
- Dashboard state is not shared across other modules
- All data is fetched fresh on mount and date range changes
- No need for persistent state or complex state mutations

## Components and Interfaces

### Dashboard Page Component (index.vue)

The main orchestrator component that manages date filtering, API calls, and layout.

**Responsibilities:**
- Initialize default date range (last 30 days)
- Handle date range selection and validation
- Fetch data from all 5 reporting endpoints
- Pass data, loading, and error states to child chart components
- Manage responsive grid layout
- Provide retry mechanism for failed requests

**Key Composition API Features:**
- `ref()` for reactive state management
- `computed()` for derived values (formatted dates, validation)
- `watch()` to trigger API calls on date range changes
- `onMounted()` for initial data fetch
- `onUnmounted()` for cleanup if needed

**Props:** None (root page component)

**Emits:** None

### Chart Components

All chart components follow a consistent interface pattern:

**Common Props:**
```typescript
interface ChartProps<T> {
  data: T | null;           // Chart-specific data type
  loading: boolean;         // Loading state
  error: string | null;     // Error message if request failed
  title: string;            // Chart title
}
```

**Common Responsibilities:**
- Render Chart.js visualization when data is available
- Display loading spinner when loading is true
- Display error message with retry button when error exists
- Clean up Chart.js instance on unmount to prevent memory leaks
- Responsive canvas sizing

**Chart.js Integration Pattern:**
Each component will:
1. Create a canvas element with ref
2. Initialize Chart.js instance in `onMounted()` after data is available
3. Update chart data using `chart.update()` when props change
4. Destroy chart instance in `onBeforeUnmount()`

### SalesSummaryChart.vue

Displays aggregated sales metrics for the selected date range.

**Visualization Type:** Card-based metrics display with optional pie chart for breakdown

**Data Structure:**
```typescript
interface SalesSummaryData {
  total_revenue: number;
  total_transactions: number;
  average_transaction_value: number;
  total_items_sold: number;
}
```

**Chart Configuration:**
- If breakdown data is available, use pie chart
- Otherwise, display metrics in card format with large numbers
- Use currency formatting for revenue values
- Use number formatting with thousand separators

### DailyReportsChart.vue

Shows day-by-day sales trends over the selected date range.

**Visualization Type:** Line chart

**Data Structure:**
```typescript
interface DailyReportData {
  date: string;              // YYYY-MM-DD format
  revenue: number;
  transactions: number;
  items_sold: number;
}

type DailyReportsData = DailyReportData[];
```

**Chart Configuration:**
- X-axis: Dates (formatted as MMM DD)
- Y-axis: Revenue (primary) and transactions (secondary)
- Line chart with points
- Smooth curves for better visual appeal
- Tooltip showing all metrics for each day
- Legend to distinguish between metrics

### TopProductsChart.vue

Displays the best-selling products ranked by sales volume or revenue.

**Visualization Type:** Horizontal bar chart

**Data Structure:**
```typescript
interface TopProductData {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
}

type TopProductsData = TopProductData[];
```

**Chart Configuration:**
- Y-axis: Product names (truncate if too long)
- X-axis: Quantity sold or revenue
- Horizontal bars for better label readability
- Sorted in descending order (highest at top)
- Color gradient or distinct colors per bar
- Tooltip showing both quantity and revenue

### OutletComparisonChart.vue

Compares performance metrics across different outlets.

**Visualization Type:** Grouped bar chart

**Data Structure:**
```typescript
interface OutletComparisonData {
  outlet_id: string;
  outlet_name: string;
  revenue: number;
  transactions: number;
  items_sold: number;
}

type OutletComparisonDataArray = OutletComparisonData[];
```

**Chart Configuration:**
- X-axis: Outlet names
- Y-axis: Metric values
- Grouped bars for multiple metrics (revenue, transactions, items)
- Different colors for each metric
- Legend to identify metrics
- Tooltip showing all metrics for each outlet

### DashboardOverviewChart.vue

Provides a consolidated view of key performance indicators.

**Visualization Type:** Mixed (cards + charts)

**Data Structure:**
```typescript
interface DashboardOverviewData {
  summary: {
    total_revenue: number;
    total_transactions: number;
    average_transaction_value: number;
  };
  top_products: TopProductData[];
  recent_trend: {
    date: string;
    revenue: number;
  }[];
}
```

**Chart Configuration:**
- Top section: Metric cards (similar to SalesSummaryChart)
- Middle section: Mini line chart for recent trend
- Bottom section: Top 5 products mini bar chart
- Compact layout optimized for overview

## Data Models

### TypeScript Interfaces

Location: `src/modules/dashboard/types/reports.ts`

```typescript
// ============================================================================
// Request Parameter Types
// ============================================================================

/**
 * Base parameters for all reporting endpoints
 */
export interface BaseReportParams {
  date_from: string;  // ISO 8601 format: YYYY-MM-DD
  date_to: string;    // ISO 8601 format: YYYY-MM-DD
  outlet_id?: string; // Optional UUID filter
}

/**
 * Parameters for top products endpoint
 */
export interface TopProductsParams extends BaseReportParams {
  limit?: number;     // Range: 1-50, default: 10
}

/**
 * Parameters for dashboard endpoint
 */
export interface DashboardParams extends BaseReportParams {
  limit?: number;     // Range: 1-50, default: 10 (for top products)
}

// ============================================================================
// Response Data Types
// ============================================================================

/**
 * Sales summary aggregated metrics
 */
export interface SalesSummaryResponse {
  data: {
    total_revenue: number;
    total_transactions: number;
    average_transaction_value: number;
    total_items_sold: number;
    date_from: string;
    date_to: string;
  };
}

/**
 * Single day's report data
 */
export interface DailyReportItem {
  date: string;              // YYYY-MM-DD
  revenue: number;
  transactions: number;
  items_sold: number;
}

/**
 * Daily reports response
 */
export interface DailyReportsResponse {
  data: DailyReportItem[];
}

/**
 * Single product performance data
 */
export interface TopProductItem {
  product_id: string;
  product_name: string;
  quantity_sold: number;
  revenue: number;
}

/**
 * Top products response
 */
export interface TopProductsResponse {
  data: TopProductItem[];
}

/**
 * Single outlet comparison data
 */
export interface OutletComparisonItem {
  outlet_id: string;
  outlet_name: string;
  revenue: number;
  transactions: number;
  items_sold: number;
}

/**
 * Outlet comparison response
 */
export interface OutletComparisonResponse {
  data: OutletComparisonItem[];
}

/**
 * Dashboard consolidated data
 */
export interface DashboardResponse {
  data: {
    summary: {
      total_revenue: number;
      total_transactions: number;
      average_transaction_value: number;
      total_items_sold: number;
    };
    top_products: TopProductItem[];
    daily_trend: DailyReportItem[];
    outlet_summary: OutletComparisonItem[];
  };
}

// ============================================================================
// Chart Component Props Types
// ============================================================================

/**
 * Generic chart component props
 */
export interface ChartComponentProps<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  title: string;
}

// ============================================================================
// Date Range Types
// ============================================================================

/**
 * Date range selection state
 */
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

/**
 * Formatted date range for API calls
 */
export interface FormattedDateRange {
  date_from: string;  // YYYY-MM-DD
  date_to: string;    // YYYY-MM-DD
}
```

### API Response Wrapper

All API responses follow the standard format:

```typescript
interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}
```

The API service layer will extract the `data` property and return it to the components.

## API Service Implementation

Location: `src/modules/dashboard/services/api.ts`

```typescript
import api from '@/plugins/axios';
import type {
  BaseReportParams,
  TopProductsParams,
  DashboardParams,
  SalesSummaryResponse,
  DailyReportsResponse,
  TopProductsResponse,
  OutletComparisonResponse,
  DashboardResponse,
} from '../types/reports';

const REPORTS_BASE_PATH = '/reports';

/**
 * Fetch sales summary for a date range
 */
export async function getSalesSummary(
  params: BaseReportParams
): Promise<SalesSummaryResponse['data']> {
  const response = await api.get<SalesSummaryResponse>(
    `${REPORTS_BASE_PATH}/summary`,
    { params }
  );
  return response.data.data;
}

/**
 * Fetch daily reports for a date range
 */
export async function getDailyReports(
  params: BaseReportParams
): Promise<DailyReportsResponse['data']> {
  const response = await api.get<DailyReportsResponse>(
    `${REPORTS_BASE_PATH}/daily`,
    { params }
  );
  return response.data.data;
}

/**
 * Fetch top products for a date range
 */
export async function getTopProducts(
  params: TopProductsParams
): Promise<TopProductsResponse['data']> {
  const { limit = 10, ...baseParams } = params;
  const response = await api.get<TopProductsResponse>(
    `${REPORTS_BASE_PATH}/top-products`,
    { params: { ...baseParams, limit } }
  );
  return response.data.data;
}

/**
 * Fetch outlet comparison for a date range
 */
export async function getOutletComparison(
  params: BaseReportParams
): Promise<OutletComparisonResponse['data']> {
  const response = await api.get<OutletComparisonResponse>(
    `${REPORTS_BASE_PATH}/outlet-comparison`,
    { params }
  );
  return response.data.data;
}

/**
 * Fetch consolidated dashboard data
 */
export async function getDashboardData(
  params: DashboardParams
): Promise<DashboardResponse['data']> {
  const { limit = 10, ...baseParams } = params;
  const response = await api.get<DashboardResponse>(
    `${REPORTS_BASE_PATH}/dashboard`,
    { params: { ...baseParams, limit } }
  );
  return response.data.data;
}
```

### API Service Design Decisions

1. **Axios Instance Reuse**: Uses the existing configured axios instance from `@/plugins/axios.ts` which includes authentication headers and error interceptors

2. **Type Safety**: All functions are fully typed with request parameters and return types

3. **Response Unwrapping**: Functions extract and return only the `data` property from the API response, simplifying component code

4. **Default Parameters**: Applies sensible defaults (e.g., `limit = 10`) at the service layer

5. **Error Handling**: Relies on axios interceptors for global error handling; components handle specific error states

## Date Range Filtering

### PrimeVue DatePicker Integration

The dashboard uses PrimeVue's DatePicker component in range selection mode:

```vue
<DatePicker
  v-model="dateRange"
  selection-mode="range"
  :max-date="new Date()"
  date-format="yy-mm-dd"
  show-button-bar
  :manual-input="false"
  placeholder="Select date range"
/>
```

**Configuration:**
- `selection-mode="range"`: Enables start and end date selection
- `max-date`: Prevents future date selection
- `date-format`: Displays dates in YYYY-MM-DD format
- `show-button-bar`: Provides "Today" and "Clear" buttons
- `manual-input="false"`: Prevents manual typing to ensure valid dates

### Date Validation Logic

```typescript
const isValidDateRange = computed(() => {
  if (!dateRange.value || !dateRange.value[0] || !dateRange.value[1]) {
    return false;
  }
  return dateRange.value[0] <= dateRange.value[1];
});
```

### Date Formatting

Converts Date objects to YYYY-MM-DD format for API calls:

```typescript
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const formattedDateRange = computed(() => {
  if (!dateRange.value || !dateRange.value[0] || !dateRange.value[1]) {
    return null;
  }
  return {
    date_from: formatDate(dateRange.value[0]),
    date_to: formatDate(dateRange.value[1]),
  };
});
```

### Default Date Range

Initializes to the last 30 days on component mount:

```typescript
const initializeDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  dateRange.value = [start, end];
};

onMounted(() => {
  initializeDateRange();
});
```

## Chart.js Integration

### Installation and Setup

Chart.js 4.5.0 is already included in package.json. No additional installation needed.

### Chart.js Usage Pattern

Each chart component follows this pattern:

```typescript
import { Chart, registerables } from 'chart.js';
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

// Register Chart.js components
Chart.register(...registerables);

const chartCanvas = ref<HTMLCanvasElement | null>(null);
let chartInstance: Chart | null = null;

const initializeChart = () => {
  if (!chartCanvas.value || !props.data) return;
  
  // Destroy existing instance
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  // Create new chart
  chartInstance = new Chart(chartCanvas.value, {
    type: 'line', // or 'bar', 'pie', etc.
    data: {
      // Chart data configuration
    },
    options: {
      // Chart options configuration
    },
  });
};

onMounted(() => {
  if (props.data && !props.loading) {
    initializeChart();
  }
});

watch(() => props.data, () => {
  if (props.data && !props.loading) {
    initializeChart();
  }
});

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});
```

### Chart Configuration Standards

All charts will follow these configuration standards:

**Responsive Behavior:**
```typescript
options: {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2, // Adjust per chart type
}
```

**Tooltips:**
```typescript
options: {
  plugins: {
    tooltip: {
      enabled: true,
      mode: 'index',
      intersect: false,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#ddd',
      borderWidth: 1,
    },
  },
}
```

**Legends:**
```typescript
options: {
  plugins: {
    legend: {
      display: true,
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 15,
      },
    },
  },
}
```

**Animations:**
```typescript
options: {
  animation: {
    duration: 750,
    easing: 'easeInOutQuart',
  },
}
```

### Chart Type Specifications

**Line Chart (Daily Reports):**
- Type: `'line'`
- Tension: 0.4 (smooth curves)
- Fill: false (no area fill)
- Point radius: 3
- Point hover radius: 5

**Horizontal Bar Chart (Top Products):**
- Type: `'bar'`
- Index axis: 'y'
- Bar thickness: 20
- Max bar thickness: 30

**Grouped Bar Chart (Outlet Comparison):**
- Type: `'bar'`
- Index axis: 'x'
- Grouped: true
- Bar percentage: 0.8
- Category percentage: 0.9

**Pie Chart (Sales Summary breakdown):**
- Type: `'pie'`
- Cutout: 0 (full pie, not doughnut)
- Border width: 2

### Color Palette

Consistent color scheme across all charts:

```typescript
const CHART_COLORS = {
  primary: '#3B82F6',      // Blue
  secondary: '#10B981',    // Green
  tertiary: '#F59E0B',     // Amber
  quaternary: '#EF4444',   // Red
  quinary: '#8B5CF6',      // Purple
  senary: '#EC4899',       // Pink
};

const CHART_COLOR_ARRAY = [
  '#3B82F6', '#10B981', '#F59E0B', 
  '#EF4444', '#8B5CF6', '#EC4899',
  '#06B6D4', '#F97316', '#84CC16',
];
```

## Responsive Layout Strategy

### Mobile-First Approach

The dashboard uses Tailwind CSS with a mobile-first responsive strategy:

**Breakpoints:**
- Mobile: < 768px (default, no prefix)
- Tablet: ≥ 768px (`md:` prefix)
- Desktop: ≥ 1024px (`lg:` prefix)
- Large Desktop: ≥ 1280px (`xl:` prefix)

### Layout Grid

```vue
<div class="w-full p-4 md:p-6 lg:p-8">
  <!-- Date Range Filter -->
  <div class="mb-6">
    <DatePicker ... />
  </div>
  
  <!-- Charts Grid -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
    <!-- Each chart component -->
    <div class="col-span-1 md:col-span-2 lg:col-span-3">
      <DashboardOverviewChart ... />
    </div>
    
    <div class="col-span-1 md:col-span-1 lg:col-span-1">
      <SalesSummaryChart ... />
    </div>
    
    <div class="col-span-1 md:col-span-1 lg:col-span-2">
      <DailyReportsChart ... />
    </div>
    
    <div class="col-span-1 md:col-span-1 lg:col-span-1">
      <TopProductsChart ... />
    </div>
    
    <div class="col-span-1 md:col-span-1 lg:col-span-1">
      <OutletComparisonChart ... />
    </div>
  </div>
</div>
```

### Chart Container Styling

Each chart component wraps its content in a card-style container:

```vue
<div class="bg-white rounded-lg shadow-md p-4 md:p-6">
  <h3 class="text-lg md:text-xl font-semibold mb-4">{{ title }}</h3>
  <div class="relative" style="min-height: 300px;">
    <!-- Chart canvas or loading/error state -->
  </div>
</div>
```

### Mobile Optimizations

1. **Stacked Layout**: All charts stack vertically on mobile (< 768px)
2. **Reduced Padding**: Smaller padding on mobile to maximize content area
3. **Font Scaling**: Responsive font sizes using Tailwind's responsive classes
4. **Touch-Friendly**: Larger touch targets for interactive elements
5. **Simplified Charts**: Consider hiding secondary metrics on very small screens

### Chart Responsiveness

Chart.js responsive configuration ensures charts resize properly:

```typescript
options: {
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: window.innerWidth < 768 ? 1 : 2, // Square on mobile, wider on desktop
}
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all 84 acceptance criteria, I identified the following redundancies and consolidations:

**Redundant Error Handling Properties:**
- Requirements 4.5, 5.6, 6.7, 7.6, 8.6, 11.2 all specify that chart components should display error messages when API requests fail
- These can be consolidated into a single property: "For any chart component with an error state, an error message should be displayed"

**Redundant Loading State Properties:**
- Requirements 4.6, 5.7, 11.1 all specify that loading indicators should be shown during API requests
- These can be consolidated into a single property: "For any chart component with loading state true, a loading indicator should be displayed"

**Redundant Data Display Properties:**
- Requirements 4.2, 5.4, 6.6, 7.5, 8.2, 8.5 all specify that chart components should render data when available
- These can be consolidated into a single property: "For any chart component with valid data, the chart should render all data points"

**Redundant Chart Type Properties:**
- Requirements 12.1, 12.2, 12.3, 12.4, 12.5 are all examples of specific chart type selections
- These are better tested as examples rather than properties since they're specific implementation choices

**Redundant Component Structure Properties:**
- Requirements 1.1-1.5 are all examples of API service function signatures
- These are better verified as examples in unit tests

**Combined Properties:**
- Date validation (3.4) and invalid date handling (3.8) can be combined into a comprehensive date validation property
- URL construction (1.8) and API parameter formatting (3.6) relate to the same concern about correct API calls

After reflection, the unique, non-redundant properties are:

### Property 1: Date Range Validation

For any date range selection where start date is after end date, the dashboard should prevent API calls and display a validation error message.

**Validates: Requirements 3.4, 3.8**

### Property 2: Date Formatting Consistency

For any Date object, when formatted for API calls, the output should match the ISO 8601 format YYYY-MM-DD.

**Validates: Requirements 2.3, 3.6**

### Property 3: API Endpoint URL Construction

For any reporting API function call, the request URL should be constructed as `/reports/{endpoint-name}` where endpoint-name matches the function's purpose (summary, daily, top-products, outlet-comparison, or dashboard).

**Validates: Requirements 1.8**

### Property 4: Parameter Validation - Limit Range

For any API call that accepts a limit parameter, values outside the range 1-50 should be rejected or clamped to valid bounds.

**Validates: Requirements 2.5**

### Property 5: Parameter Validation - UUID Format

For any API call that accepts an outlet_id parameter, the value should be validated as a valid UUID format or null/undefined.

**Validates: Requirements 2.4**

### Property 6: Date Range Triggers All API Calls

For any valid date range selection, the dashboard should trigger API calls to all five reporting endpoints (summary, daily, top-products, outlet-comparison, dashboard) with the selected date parameters.

**Validates: Requirements 3.5**

### Property 7: Chart Component Error Display

For any chart component in an error state, an error message should be displayed to the user, and the chart should not render.

**Validates: Requirements 4.5, 5.6, 6.7, 7.6, 8.6, 11.2**

### Property 8: Chart Component Loading Display

For any chart component with loading state set to true, a loading indicator should be displayed, and the chart should not render until loading completes.

**Validates: Requirements 4.6, 5.7, 11.1**

### Property 9: Chart Component Data Rendering

For any chart component with valid data and loading state false, the chart should render and display all data points from the provided dataset.

**Validates: Requirements 4.2, 5.4, 7.5, 8.2, 8.5**

### Property 10: Product Ranking Order

For any top products data, when rendered in the chart, products should be displayed in descending order by sales quantity or revenue.

**Validates: Requirements 6.6**

### Property 11: Chart Component Reactivity

For any chart component, when the date range changes and new data is provided, the chart should automatically update to reflect the new data without requiring a page refresh.

**Validates: Requirements 4.7**

### Property 12: Independent Error Handling

For any single API endpoint failure, the other chart components should continue to function normally and display their data if their API calls succeed.

**Validates: Requirements 11.6**

### Property 13: Loading State Cleanup

For any dashboard state where all API requests have completed (either successfully or with errors), no loading indicators should be visible.

**Validates: Requirements 11.7**

### Property 14: Chart Instance Cleanup

For any chart component that is unmounted, the Chart.js instance should be destroyed to prevent memory leaks.

**Validates: Requirements 10.7**

### Property 15: Responsive Layout Adaptation

For any viewport width, the dashboard layout should adapt appropriately: stacking charts vertically on mobile (< 768px) and using grid layout on larger screens (≥ 768px).

**Validates: Requirements 9.1, 9.5**

### Property 16: Invalid Data Format Handling

For any API response with invalid or malformed data structure, the chart component should display a data format error message instead of attempting to render.

**Validates: Requirements 11.4**

### Property 17: Outlet Label Visibility

For any outlet comparison data, each outlet should have a clearly visible label in the chart that identifies it by name.

**Validates: Requirements 7.7**

### Property 18: Product Data Completeness

For any top products data, the chart should display both the product name and its corresponding sales metrics (quantity and/or revenue).

**Validates: Requirements 6.3**

### Property 19: Outlet Metrics Completeness

For any outlet comparison data, the chart should display the outlet name and all corresponding performance metrics (revenue, transactions, items sold).

**Validates: Requirements 7.3**

### Property 20: Daily Reports Date Coverage

For any date range selection, the daily reports chart should include data points for all days within the selected range, even if some days have zero values.

**Validates: Requirements 5.4**

## Error Handling

### Error Categories

The dashboard implements a comprehensive error handling strategy that categorizes errors into distinct types:

1. **Validation Errors**: Client-side validation failures (invalid date ranges, parameter bounds)
2. **Network Errors**: Connection failures, timeouts, server unavailability
3. **API Errors**: Server-side errors with HTTP status codes (400, 401, 403, 404, 500, etc.)
4. **Data Format Errors**: Responses that don't match expected TypeScript interfaces
5. **Chart Rendering Errors**: Failures in Chart.js initialization or rendering

### Error Handling Patterns

**API Service Layer:**
```typescript
try {
  const response = await api.get<ResponseType>(url, { params });
  return response.data.data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error status
      throw new Error(`API Error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
    } else if (error.request) {
      // Request made but no response received
      throw new Error('Network Error: Unable to reach the server');
    }
  }
  // Other errors
  throw new Error('Unexpected error occurred');
}
```

**Component Error State:**
```typescript
const errorState = ref<string | null>(null);
const loadingState = ref<boolean>(false);

const fetchData = async () => {
  loadingState.value = true;
  errorState.value = null;
  
  try {
    const data = await apiService.getData(params);
    chartData.value = data;
  } catch (error) {
    errorState.value = error instanceof Error ? error.message : 'An error occurred';
  } finally {
    loadingState.value = false;
  }
};
```

**Error Display UI:**
```vue
<div v-if="error" class="error-container">
  <div class="error-icon">⚠️</div>
  <p class="error-message">{{ error }}</p>
  <button @click="retry" class="retry-button">Retry</button>
</div>
```

### Retry Mechanism

Each chart component provides a retry button that:
1. Clears the current error state
2. Re-triggers the API call with the same parameters
3. Updates loading state appropriately
4. Handles new errors if they occur

```typescript
const retry = () => {
  fetchData();
};
```

### Global Error Handling

The axios interceptor in `@/plugins/axios.ts` handles:
- 401 Unauthorized: Redirects to login page
- Token expiration: Prompts user to re-authenticate
- Global error logging (if implemented)

### Validation Error Prevention

Client-side validation prevents invalid API calls:

```typescript
const validateDateRange = (start: Date, end: Date): boolean => {
  if (start > end) {
    errorState.value = 'Start date must be before or equal to end date';
    return false;
  }
  if (end > new Date()) {
    errorState.value = 'End date cannot be in the future';
    return false;
  }
  return true;
};
```

### Data Format Validation

Response data is validated against TypeScript interfaces:

```typescript
const validateResponseData = (data: unknown): data is ExpectedType => {
  // Runtime validation logic
  if (!data || typeof data !== 'object') return false;
  // Check required fields
  return 'required_field' in data;
};

const fetchData = async () => {
  try {
    const data = await apiService.getData(params);
    if (!validateResponseData(data)) {
      throw new Error('Invalid data format received from server');
    }
    chartData.value = data;
  } catch (error) {
    // Handle error
  }
};
```

### Chart Rendering Error Handling

Chart.js errors are caught and handled gracefully:

```typescript
const initializeChart = () => {
  try {
    if (!chartCanvas.value) {
      throw new Error('Chart canvas not available');
    }
    
    chartInstance = new Chart(chartCanvas.value, config);
  } catch (error) {
    errorState.value = 'Failed to render chart';
    console.error('Chart rendering error:', error);
  }
};
```

### Error Logging

All errors should be logged for debugging and monitoring:

```typescript
const logError = (context: string, error: Error) => {
  console.error(`[${context}]`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
  });
  
  // Optional: Send to error tracking service
  // errorTrackingService.captureException(error);
};
```

## Testing Strategy

### Dual Testing Approach

The dashboard reports page will be tested using both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** focus on:
- Specific examples and edge cases
- Component rendering with specific data
- User interaction flows
- Integration between components
- API service function signatures

**Property-Based Tests** focus on:
- Universal properties that hold for all inputs
- Data validation across random inputs
- Error handling across various failure scenarios
- Responsive behavior across viewport ranges
- Chart rendering with generated datasets

### Testing Framework Selection

**Unit Testing:**
- Framework: Vitest (already in devDependencies)
- Component Testing: @vue/test-utils
- Mocking: vi.mock() for API calls

**Property-Based Testing:**
- Library: fast-check (needs to be added)
- Minimum iterations: 100 per property test
- Integration with Vitest

### Property-Based Test Configuration

Install fast-check:
```bash
npm install --save-dev fast-check
```

Each property test will:
1. Run minimum 100 iterations with randomized inputs
2. Reference the design document property number
3. Use descriptive test names matching property titles
4. Include comments with the tag format: `Feature: dashboard-reports-page, Property {number}: {property_text}`

### Test Organization

```
src/modules/dashboard/
├── __tests__/
│   ├── unit/
│   │   ├── api.test.ts                    # API service unit tests
│   │   ├── DashboardPage.test.ts          # Dashboard page unit tests
│   │   ├── SalesSummaryChart.test.ts      # Chart component unit tests
│   │   ├── DailyReportsChart.test.ts
│   │   ├── TopProductsChart.test.ts
│   │   ├── OutletComparisonChart.test.ts
│   │   └── DashboardOverviewChart.test.ts
│   └── properties/
│       ├── dateValidation.property.test.ts      # Properties 1-2
│       ├── apiCalls.property.test.ts            # Properties 3-6
│       ├── chartStates.property.test.ts         # Properties 7-9
│       ├── dataDisplay.property.test.ts         # Properties 10, 17-20
│       ├── reactivity.property.test.ts          # Properties 11-13
│       ├── cleanup.property.test.ts             # Property 14
│       ├── responsive.property.test.ts          # Property 15
│       └── errorHandling.property.test.ts       # Property 16
```

### Unit Test Examples

**API Service Function Signature Tests:**
```typescript
// Feature: dashboard-reports-page, Requirement 1.1-1.5
describe('API Service', () => {
  it('should have getSalesSummary function with correct signature', () => {
    expect(typeof getSalesSummary).toBe('function');
  });
  
  it('should have getDailyReports function with correct signature', () => {
    expect(typeof getDailyReports).toBe('function');
  });
  
  // ... similar tests for other functions
});
```

**Component Rendering Tests:**
```typescript
// Feature: dashboard-reports-page, Requirement 3.1
describe('Dashboard Page', () => {
  it('should display DatePicker at the top of the page', () => {
    const wrapper = mount(DashboardPage);
    const datePicker = wrapper.findComponent({ name: 'DatePicker' });
    expect(datePicker.exists()).toBe(true);
  });
});
```

**Chart Type Selection Tests:**
```typescript
// Feature: dashboard-reports-page, Requirement 12.1
describe('DailyReportsChart', () => {
  it('should use line chart type', async () => {
    const wrapper = mount(DailyReportsChart, {
      props: { data: mockDailyData, loading: false, error: null, title: 'Daily Reports' }
    });
    await wrapper.vm.$nextTick();
    // Verify Chart.js was initialized with type: 'line'
  });
});
```

### Property-Based Test Examples

**Property 1: Date Range Validation**
```typescript
import fc from 'fast-check';

// Feature: dashboard-reports-page, Property 1: For any date range selection where start date is after end date, the dashboard should prevent API calls and display a validation error message
describe('Date Range Validation Property', () => {
  it('should prevent API calls when start date is after end date', () => {
    fc.assert(
      fc.property(
        fc.date(),
        fc.date(),
        (date1, date2) => {
          const [start, end] = date1 > date2 ? [date1, date2] : [date2, date1];
          
          // Arrange: start > end (invalid range)
          const wrapper = mount(DashboardPage);
          
          // Act: Set invalid date range
          wrapper.vm.dateRange = [start, end];
          
          // Assert: API calls should not be triggered
          expect(wrapper.vm.apiCallsTriggered).toBe(false);
          expect(wrapper.vm.errorState).toBeTruthy();
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property 2: Date Formatting Consistency**
```typescript
// Feature: dashboard-reports-page, Property 2: For any Date object, when formatted for API calls, the output should match the ISO 8601 format YYYY-MM-DD
describe('Date Formatting Property', () => {
  it('should format any date as YYYY-MM-DD', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') }),
        (date) => {
          const formatted = formatDate(date);
          
          // Assert: Matches YYYY-MM-DD pattern
          expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          
          // Assert: Can be parsed back to equivalent date
          const parsed = new Date(formatted);
          expect(parsed.getFullYear()).toBe(date.getFullYear());
          expect(parsed.getMonth()).toBe(date.getMonth());
          expect(parsed.getDate()).toBe(date.getDate());
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property 7: Chart Component Error Display**
```typescript
// Feature: dashboard-reports-page, Property 7: For any chart component in an error state, an error message should be displayed to the user
describe('Chart Error Display Property', () => {
  it('should display error message for any error state', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }), // Random error message
        (errorMessage) => {
          const wrapper = mount(SalesSummaryChart, {
            props: {
              data: null,
              loading: false,
              error: errorMessage,
              title: 'Test Chart'
            }
          });
          
          // Assert: Error message is displayed
          expect(wrapper.text()).toContain(errorMessage);
          
          // Assert: Chart canvas is not rendered
          expect(wrapper.find('canvas').exists()).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

**Property 15: Responsive Layout Adaptation**
```typescript
// Feature: dashboard-reports-page, Property 15: For any viewport width, the dashboard layout should adapt appropriately
describe('Responsive Layout Property', () => {
  it('should adapt layout based on viewport width', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 320, max: 2560 }), // Random viewport width
        (viewportWidth) => {
          // Arrange: Set viewport width
          global.innerWidth = viewportWidth;
          const wrapper = mount(DashboardPage);
          
          // Assert: Layout adapts correctly
          if (viewportWidth < 768) {
            // Mobile: vertical stack
            expect(wrapper.find('.grid').classes()).toContain('grid-cols-1');
          } else {
            // Desktop: grid layout
            expect(wrapper.find('.grid').classes()).toContain('md:grid-cols-2');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test Coverage Goals

- Unit test coverage: ≥ 80% for all components and services
- Property test coverage: All 20 correctness properties implemented
- Integration test coverage: Key user flows (date selection → data fetch → chart render)
- Edge case coverage: Empty data, single data point, maximum data points
- Error scenario coverage: All error types (network, validation, data format, rendering)

### Continuous Integration

Tests should run automatically on:
- Pre-commit hooks (unit tests only for speed)
- Pull request creation (full test suite)
- Main branch merges (full test suite + coverage report)

### Test Data Generators

For property-based tests, create reusable generators:

```typescript
// generators.ts
import fc from 'fast-check';

export const dateRangeArbitrary = () => 
  fc.tuple(fc.date(), fc.date()).map(([d1, d2]) => 
    d1 <= d2 ? { start: d1, end: d2 } : { start: d2, end: d1 }
  );

export const salesDataArbitrary = () =>
  fc.record({
    total_revenue: fc.double({ min: 0, max: 1000000 }),
    total_transactions: fc.integer({ min: 0, max: 10000 }),
    average_transaction_value: fc.double({ min: 0, max: 10000 }),
    total_items_sold: fc.integer({ min: 0, max: 100000 }),
  });

export const productDataArbitrary = () =>
  fc.array(
    fc.record({
      product_id: fc.uuid(),
      product_name: fc.string({ minLength: 1, maxLength: 50 }),
      quantity_sold: fc.integer({ min: 0, max: 1000 }),
      revenue: fc.double({ min: 0, max: 100000 }),
    }),
    { minLength: 1, maxLength: 50 }
  );
```

### Manual Testing Checklist

In addition to automated tests, manual testing should verify:

- [ ] Visual appearance matches design mockups
- [ ] Charts are readable and aesthetically pleasing
- [ ] Color contrast meets WCAG AA standards
- [ ] Touch interactions work on mobile devices
- [ ] Keyboard navigation is functional
- [ ] Screen reader compatibility (basic check)
- [ ] Performance with large datasets (1000+ data points)
- [ ] Cross-browser compatibility (Chrome, Firefox, Safari, Edge)

