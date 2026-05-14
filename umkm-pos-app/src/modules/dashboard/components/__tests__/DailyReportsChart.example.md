# DailyReportsChart Component Usage Example

## Component Implementation

The `DailyReportsChart` component has been successfully implemented with the following features:

### Props Interface
```typescript
interface Props {
  data: DailyReportItem[] | null;
  loading: boolean;
  error: string | null;
  title: string;
}
```

### Features Implemented

✅ **Loading State**: Displays a spinner with "Loading chart data..." message when `loading` is true
✅ **Error State**: Displays error message with retry button when `error` is not null
✅ **No Data State**: Displays "No data available" message when data array is empty
✅ **Chart Rendering**: Renders line chart with Chart.js when valid data is provided
✅ **Dual Y-Axis**: Revenue on left axis, Transactions on right axis
✅ **Smooth Curves**: Implemented with `tension: 0.4` as specified
✅ **Date Formatting**: X-axis shows dates formatted as "MMM DD" (e.g., "Jan 01")
✅ **Responsive Design**: Adapts aspect ratio based on viewport width (1:1 on mobile, 2:1 on desktop)
✅ **Tooltips**: Interactive tooltips showing formatted values (currency for revenue, numbers for transactions)
✅ **Chart Cleanup**: Properly destroys Chart.js instance in `onBeforeUnmount` to prevent memory leaks
✅ **Tailwind Styling**: Uses responsive Tailwind CSS classes for styling

### Usage Example

```vue
<template>
  <DailyReportsChart
    :data="dailyReportsData"
    :loading="isLoading"
    :error="errorMessage"
    title="Daily Sales Trends"
    @retry="handleRetry"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DailyReportsChart from '@/modules/dashboard/components/DailyReportsChart.vue';
import type { DailyReportItem } from '@/modules/dashboard/types/reports';

const dailyReportsData = ref<DailyReportItem[]>([
  {
    date: '2024-01-01',
    revenue: 1000000,
    transactions: 50,
    items_sold: 150,
  },
  {
    date: '2024-01-02',
    revenue: 1200000,
    transactions: 60,
    items_sold: 180,
  },
  {
    date: '2024-01-03',
    revenue: 950000,
    transactions: 45,
    items_sold: 135,
  },
]);

const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

const handleRetry = () => {
  // Retry logic here
  console.log('Retrying...');
};
</script>
```

### Chart Configuration

The component uses the following Chart.js configuration:

- **Chart Type**: Line chart
- **Tension**: 0.4 (smooth curves)
- **Colors**: 
  - Revenue: Blue (#3B82F6)
  - Transactions: Green (#10B981)
- **Point Radius**: 3 (normal), 5 (hover)
- **Legend**: Top position with point style
- **Tooltip**: Index mode, non-intersecting
- **Animation**: 750ms with easeInOutQuart easing
- **Scales**:
  - X-axis: Date labels (MMM DD format)
  - Y-axis (left): Revenue in IDR with compact notation
  - Y1-axis (right): Transaction count

### Requirements Validated

This implementation satisfies the following requirements from the spec:

- ✅ 5.1: Display Chart_Component for Daily_Reports_API data
- ✅ 5.2: Use line Chart_Type to show temporal trends
- ✅ 5.3: Display dates on x-axis and sales metrics on y-axis
- ✅ 5.4: Render all days within selected date range
- ✅ 5.5: Implemented as separate Vue component
- ✅ 5.6: Display error message when API request fails
- ✅ 5.7: Display loading indicator when loading
- ✅ 10.2: Accept data as props from parent
- ✅ 10.3: Accept loading state as prop
- ✅ 10.4: Accept error state as prop
- ✅ 10.7: Clean up Chart.js instance on unmount
- ✅ 12.1: Use line chart for daily trends

### TypeScript Type Safety

The component is fully typed with TypeScript:
- Props interface defined with strict types
- Chart.js types imported from 'chart.js'
- DailyReportItem interface from types/reports.ts
- Proper null handling for data prop

### Responsive Behavior

The component adapts to different screen sizes:
- **Mobile (< 768px)**: Square aspect ratio (1:1), smaller padding
- **Desktop (≥ 768px)**: Wider aspect ratio (2:1), larger padding
- Font sizes scale responsively using Tailwind's `md:` prefix

### Memory Management

The component properly manages Chart.js instances:
1. Destroys existing instance before creating new one
2. Cleans up instance in `onBeforeUnmount` lifecycle hook
3. Sets instance to null after destruction
4. Prevents memory leaks during component lifecycle
