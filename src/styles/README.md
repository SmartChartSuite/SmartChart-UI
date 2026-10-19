# Styles Architecture

This directory contains the modular SCSS architecture for SmartChart UI.

## Structure

```
src/styles/
├── _variables.scss          # Design tokens and CSS custom properties
├── _material-overrides.scss # Angular Material component customizations
├── _utilities.scss          # Utility classes (margins, padding, flex, etc.)
├── _layout.scss            # App-level layout classes
├── _components.scss        # Reusable component patterns
├── _animations.scss        # Keyframes and animations
└── README.md              # This file
```

## Import Order

The main `styles.scss` file imports modules in this order:

1. **Variables** - Design tokens, spacing scale, colors
2. **Material Overrides** - Angular Material customizations
3. **Utilities** - Utility classes for common patterns
4. **Layout** - App-level layout structure
5. **Components** - Component-specific styles
6. **Animations** - Keyframes and animation definitions

## Design Tokens

All design tokens are defined as CSS custom properties in `_variables.scss`:

- **Spacing**: `--spacing-xs` through `--spacing-xl` (0.25rem to 2rem)
- **Colors**: Semantic color variables for primary, error, borders, etc.
- **Typography**: Font family definitions
- **Border Radius**: Consistent border radius values
- **Transitions**: Standard transition durations

## Key Features

### 1. REM-Based Sizing
All sizing uses `rem` units instead of pixels for better accessibility and scalability.

### 2. Programmatic Utility Generation
Utility classes are generated programmatically using SCSS loops:
- Margin utilities: `.m-{size}`, `.mt-{size}`, `.mb-{size}`, etc.
- Padding utilities: `.p-{size}`, `.pt-{size}`, `.pb-{size}`, etc.
- Supports: xs, sm, md, lg, xl sizes

### 3. CSS Custom Properties
Modern CSS variables enable runtime theming and easier maintenance:
```scss
background-color: var(--color-primary);
padding: var(--spacing-md);
```

### 4. Material Design Overrides
All Angular Material component customizations are centralized in one file with consistent rem-based sizing.

## Usage Examples

### Using Utility Classes (New Convention)
```html
<div class="flex-col p-md m-sm">
  <h1 class="mb-lg">Title</h1>
  <p class="text-center">Content</p>
</div>
```

### Backward Compatibility
The old utility class naming convention is still supported for backward compatibility:
```html
<!-- Old convention (still works) -->
<div class="margin-sm padding-md">
  <h1 class="margin-bottom-lg">Title</h1>
</div>

<!-- New convention (preferred) -->
<div class="m-sm p-md">
  <h1 class="mb-lg">Title</h1>
</div>
```

**Note:** While the old naming convention (`margin-*`, `padding-*`) is supported, the new shorter convention (`m-*`, `p-*`) is preferred for new code.

### Using Design Tokens
```scss
.custom-component {
  padding: var(--spacing-md);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
}
```

## Migration Notes

This refactoring addressed:
- ✅ Converted all px to rem units
- ✅ Removed duplicate body styles
- ✅ Consolidated Material overrides
- ✅ Programmatic utility class generation
- ✅ Removed TODO comments
- ✅ Modular file structure
- ✅ CSS custom properties for theming

## Best Practices

1. **Use utility classes** for common patterns (margins, padding, flex)
2. **Use CSS custom properties** for values that might change
3. **Keep component-specific styles** in component SCSS files
4. **Use rem units** for all sizing (not px)
5. **Follow the import order** when adding new modules
