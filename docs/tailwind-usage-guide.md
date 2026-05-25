# Tailwind CSS Usage Guide

Quick reference for when and how to use Tailwind CSS in this project.

## When to Use Tailwind

### ✅ Use Tailwind For:

#### 1. Layout & Flexbox
```tsx
<div className="flex items-center justify-between gap-4">
```

#### 2. Grid Layouts
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
```

#### 3. Spacing (Padding/Margin)
```tsx
<div className="p-8 space-y-4">
```

#### 4. Container & Max Width
```tsx
<div className="max-w-4xl mx-auto">
```

#### 5. Quick Responsive Design
```tsx
<div className="hidden md:block">
```

#### 6. Custom Shadows/Borders
```tsx
<Card className="shadow-2xl border-t-4 border-blue-500">
```

#### 7. Overflow & Scrolling
```tsx
<div className="overflow-y-auto max-h-96">
```

### ❌ Don't Use Tailwind For:

#### 1. UI Components
Use Ant Design instead

```tsx
// ❌ Don't do this
<button className="bg-blue-500 text-white px-4 py-2 rounded">

// ✅ Do this
<Button type="primary">Click Me</Button>
```

#### 2. Colors
Use Ant Design theme

```tsx
// ❌ Avoid
<div className="text-blue-600 bg-blue-50">

// ✅ Better
<Tag color="blue">Status</Tag>
```

#### 3. Typography
Use Ant Design Typography

```tsx
// ❌ Inconsistent
<h1 className="text-3xl font-bold">

// ✅ Consistent with theme
<Typography.Title level={1}>Title</Typography.Title>
```

## Common Patterns

### Pattern: Page Layout

```tsx
export default function Page() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Users" />

      <Card>
        <FilterBar />
        <Table />
      </Card>
    </div>
  )
}
```

**Tailwind Classes Used:**
- `p-6` - Page padding
- `space-y-6` - Vertical spacing between sections

### Pattern: Responsive Grid

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  {items.map(item => (
    <Card key={item.id}>{item.name}</Card>
  ))}
</div>
```

**Breakpoints:**
- Mobile: 1 column
- Tablet (≥576px): 2 columns
- Desktop (≥992px): 4 columns

### Pattern: Centered Modal Content

```tsx
<Modal open={open} onCancel={onCancel}>
  <div className="space-y-4">
    <Form>
      <Form.Item>
        <Input />
      </Form.Item>
    </Form>
    <div className="flex justify-end gap-2">
      <Button>Cancel</Button>
      <Button type="primary">Submit</Button>
    </div>
  </div>
</Modal>
```

### Pattern: Flex with Alignment

```tsx
<div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    <Avatar />
    <div>
      <h3 className="font-semibold">User Name</h3>
      <p className="text-sm text-gray-500">user@email.com</p>
    </div>
  </div>
  <Button type="link">Edit</Button>
</div>
```

## Spacing Scale

Consistent spacing using Tailwind:

| Class | Size | Use Case |
|-------|------|----------|
| `p-2` | 8px | Tight spacing |
| `p-4` | 16px | Default spacing |
| `p-6` | 24px | Card padding, section spacing |
| `p-8` | 32px | Page padding |
| `gap-2` | 8px | Close elements (buttons in group) |
| `gap-4` | 16px | Standard gap (form fields, cards) |
| `gap-6` | 24px | Generous gap (dashboard sections) |

**Match Ant Design:**
- Ant Design uses: 8, 12, 16, 24, 32
- Tailwind uses: 8, 16, 24, 32 (p-2, p-4, p-6, p-8)
- They align well for consistency

## Responsive Breakpoints

| Prefix | Min Width | Ant Design Equivalent |
|--------|-----------|----------------------|
| `sm:` | 576px | sm |
| `md:` | 768px | md |
| `lg:` | 992px | lg |
| `xl:` | 1200px | xl |
| `2xl:` | 1600px | xxl |

**Example:**
```tsx
<div className="block md:hidden">Mobile only</div>
<div className="hidden md:block">Desktop only</div>
```

## Quick Reference

### Flex Layouts
```tsx
className="flex"                    // Flexbox container
className="flex items-center"       // Vertical center
className="flex justify-between"    // Space between
className="flex-col"                // Vertical direction
className="flex-wrap"               // Allow wrapping
className="gap-4"                   // Gap between items
```

### Grid Layouts
```tsx
className="grid grid-cols-3"       // 3 columns
className="grid-cols-1 md:grid-cols-3"  // Responsive
className="gap-4"                  // Gap between cells
className="col-span-2"             // Span 2 columns
```

### Spacing
```tsx
className="p-4"      // Padding all sides
className="px-4"     // Horizontal padding
className="py-4"     // Vertical padding
className="m-4"      // Margin all sides
className="space-y-4"  // Vertical spacing between children
className="space-x-4"  // Horizontal spacing between children
```

### Sizing
```tsx
className="w-full"    // 100% width
className="h-full"    // 100% height
className="max-w-md"  // Max width (448px)
className="min-h-screen"  // Min height viewport
```

### Position
```tsx
className="relative"    // Position relative
className="absolute"    // Position absolute
className="fixed"       // Position fixed
className="sticky"      // Position sticky
className="top-0 right-0"  // Positioning
```

## Migration Examples

### Before (Inline Styles)
```tsx
<div style={{ padding: '32px' }}>
  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
    <Card style={{ flex: 1 }}>
      <h2 style={{ marginBottom: '8px' }}>Title</h2>
    </Card>
  </div>
</div>
```

### After (Tailwind)
```tsx
<div className="p-8">
  <div className="flex gap-4 mb-4">
    <Card className="flex-1">
      <h2 className="mb-2">Title</h2>
    </Card>
  </div>
</div>
```

**Benefits:**
- ✅ Concise utility classes
- ✅ Consistent spacing scale
- ✅ Easy to read and maintain
- ✅ Rapid prototyping

## Tips

1. **Start with Ant Design components** - Always use Ant Design for UI elements
2. **Add Tailwind for layout** - Use utilities for spacing and positioning
3. **Stay consistent** - Use the same spacing values across pages
4. **Responsive first** - Think about mobile, tablet, and desktop layouts
5. **Don't fight the system** - If it's easier with Ant Design, use Ant Design

---

**Remember:** When in doubt, use Ant Design components first, add Tailwind utilities for layout second.

**Test Page:** Visit `/test-integration` to see examples of both libraries working together.
