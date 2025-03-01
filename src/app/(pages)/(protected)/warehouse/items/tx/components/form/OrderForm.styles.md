# OrderForm Component Styles Documentation

## Layout Structure

The OrderForm uses a combination of Flexbox and Grid layouts to create a responsive two-column design:

- Main form container uses `flex flex-col h-full` to create a vertical layout that fills available height
- Content area uses `space-y-6` for consistent vertical spacing between sections
- Two-column layout achieved with `grid grid-cols-1 md:grid-cols-[2fr,3fr]` where:
  - Left column takes 2 parts (form fields)
  - Right column takes 3 parts (items table)

## Movement Type Badges

The IN/OUT movement type badges use custom styling for visual distinction:

- Base styles: `px-4 py-1 cursor-pointer rounded-full transition-all`
- IN badge:
  - Default: Green tinted background (`bg-green-50`)
  - Selected: Full green background (`bg-green-500`)
  - Hover effects: `hover:bg-green-100` or `hover:bg-green-600`
  - White text when selected (`text-white`)

- OUT badge:
  - Default: Red tinted background (`bg-red-50`)
  - Selected: Full red background (`bg-red-500`)
  - Hover effects: `hover:bg-red-100` or `hover:bg-red-600`
  - White text when selected (`text-white`)

## Status Select Styling

The status dropdown uses dynamic background colors to indicate different states:

- DRAFT: Light gray background (`bg-gray-100`)
- PENDING: Light blue background (`bg-blue-200`) with semi-bold text
- PROCESSING: Light yellow background (`bg-yellow-300/70`)
- READY: Light green background (`bg-green-400/50`)
- COMPLETED: Gray background (`bg-gray-200`)

## Items Table

The items table uses responsive design patterns:

- Full width table with border collapse
- Header row hidden on mobile (`hidden md:table-header-group`)
- Columns layout:
  - Index column: Fixed width (`w-12`)
  - Item column: Flexible width
  - Quantity column: Fixed width (`w-24`)
  - Action column: Minimal width (`w-1`)

## Responsive Design

The component implements several responsive breakpoints:

- Mobile-first design with single column layout
- Switches to two-column layout at medium screens (`md:grid-cols-[2fr,3fr]`)
- Table headers visible only on desktop (`hidden md:table-header-group`)
- Padding adjustments for different screen sizes:
  - Small screens: `px-4`
  - Medium and up: `sm:px-6`

## Footer Section

The form footer uses:
- Border top separator
- Light slate background (`bg-slate-100`)
- Consistent padding across screen sizes
- Right-aligned buttons with gap spacing