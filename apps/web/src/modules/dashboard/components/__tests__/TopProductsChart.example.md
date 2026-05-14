# TopProductsChart Component Usage Example

## Component Implementation

The `TopProductsChart` component has been successfully implemented with the following features:

### Props Interface
```typescript
interface Props {
  data: TopProductItem[] | null;
  loading: boolean;
  error: string | null;
  title: string;
}
```

### Features Implemented

✅ **Loading State**: Displays a spinner with "Loading chart data..." message when `loading` is true
✅ **Error State**: Displays error message with retry button when `error` is not null
✅ **No Data State**: Displays "No data available" message when data array is empty
✅ **Chart Rendering**: Renders horizontal bar chart with Chart.js when valid data is provided
✅ **Product Sorting**: Automatically sorts products in descending order by quantity sold
✅ **Product Name Truncation**: Truncates long product names (> 30 characters) with ellipsis
✅ **Color Gradient**: Uses blue gradient colors for bars (distinct color per product)
✅ **Responsive Design**: Adapts aspect ratio based on viewport width (1:1 on mobile, 2:1 on desktop)
✅ **Rich Tooltips**: Shows both quantity sold and revenue for each product
✅ **Chart Cleanup**: Properly destroys Chart.js instance in `onBeforeUnmount` to prevent memory leaks
✅ **Tailwind Styling**: Uses responsive Tailwind CSS classes for styling

### Usage Example

```vue
<template>
  <TopProductsChart
    :data="topProductsData"
    :loading="isLoading"
    :error="errorMessage"
    title="Top Selling Products"
    @retry="handleRetry"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TopProductsChart from '@/modules/dashboard/components/TopProductsChart.vue';
import type { TopProductItem } from '@/modules/dashboard/types/reports';

const topProductsData = ref<TopProductItem[]>([
  {
    product_id: '123e4567-e89b-12d3-a456-426614174000',
    product_name: 'Nasi Goreng Special',
    quantity_sold: 150,
    revenue: 1500000,
  },
  {
    product_id: '123e4567-e89b-12d3-a456-426614174001',
    product_name: 'Mie Ayam Bakso',
    quantity_sold: 120,
    revenue: 1200000,
  },
  {
    product_id: '123e4567-e89b-12d3-a456-426614174002',
    product_name: 'Es Teh Manis',
    quantity_sold: 200,
    revenue: 600000,
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

- **Chart Type**: Horizontal bar chart (`indexAxis: 'y'`)
- **Bar Thickness**: 20px (max 30px)
- **Colors**: Blue gradient (HSL hue from 210 to lower values)
- **Legend**: Hidden (single dataset doesn't need legend)
- **Tooltip**: Shows both quantity sold and revenue formatted in IDR
- **Animation**: 750ms with easeInOutQuart easing
- **Scales**:
  - X-axis: Quantity sold with compact notation
  - Y-axis: Product names (truncated if > 30 characters)

### Data Sorting

The component automatically sorts products in descending order by `quantity_sold`:

```typescript
const sortedData = [...props.data].sort((a, b) => b.quantity_sold - a.quantity_sold);
```

This ensures the highest-selling products appear at the top of the chart.

### Product Name Handling

Long product names are truncated for better readability:

```typescript
const maxLength = 30;
return item.product_name.length > maxLength
  ? item.product_name.substring(0, maxLength) + '...'
  : item.product_name;
```

### Color Gradient

Each bar gets a distinct color from a blue gradient:

```typescript
const colors = sortedData.map((_, index) => {
  const hue = 210 - (index * 15); // Blue gradient
  return `hsl(${hue}, 70%, 55%)`;
});
```

This creates a visually appealing gradient effect from lighter to darker blue.

### Requirements Validated

This implementation satisfies the following requirements from the spec:

- ✅ 6.1: Display Chart_Component for Top_Products_API data
- ✅ 6.2: Use horizontal bar Chart_Type to rank products
- ✅ 6.3: Display product names and corresponding sales quantities/revenue
- ✅ 6.4: Send limit parameter of 10 by default (handled by parent)
- ✅ 6.5: Implemented as separate Vue component
- ✅ 6.6: Sort and display products in descending order by sales
- ✅ 6.7: Display error message when API request fails
- ✅ 10.2: Accept data as props from parent
- ✅ 10.3: Accept loading state as prop
- ✅ 10.4: Accept error state as prop
- ✅ 10.7: Clean up Chart.js instance on unmount
- ✅ 12.2: Use horizontal bar chart for product rankings

### TypeScript Type Safety

The component is fully typed with TypeScript:
- Props interface defined with strict types
- Chart.js types imported from 'chart.js'
- TopProductItem interface from types/reports.ts
- Proper null handling for data prop

### Responsive Behavior

The component adapts to different screen sizes:
- **Mobile (< 768px)**: Square aspect ratio (1:1), smaller padding (p-4)
- **Desktop (≥ 768px)**: Wider aspect ratio (2:1), larger padding (md:p-6)
- Font sizes scale responsively using Tailwind's `md:` prefix
- Chart canvas automatically resizes to fit container

### Memory Management

The component properly manages Chart.js instances:
1. Destroys existing instance before creating new one
2. Cleans up instance in `onBeforeUnmount` lifecycle hook
3. Sets instance to null after destruction
4. Prevents memory leaks during component lifecycle

### Tooltip Formatting

The tooltip displays comprehensive information:
- **Quantity Sold**: Formatted with Indonesian locale number formatting
- **Revenue**: Formatted as IDR currency with no decimal places

Example tooltip output:
```
Quantity Sold: 150
Revenue: Rp1.500.000
```

### Error Handling

The component includes try-catch blocks around Chart.js initialization:
```typescript
try {
  chartInstance = new Chart(chartCanvas.value, config);
} catch (err) {
  console.error('Chart rendering error:', err);
}
```

This prevents the component from crashing if Chart.js encounters an error.

