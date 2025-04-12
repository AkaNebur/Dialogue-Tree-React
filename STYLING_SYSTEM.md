# Dialogue Builder Styling System

This document outlines the new centralized styling system introduced to improve consistency and reduce code duplication.

## Overview

The styling system is organized in `src/styles/commonStyles.ts` and provides:

- **Consistent styling tokens**: Colors, typography, effects, and more
- **Component-specific styles**: Pre-defined styles for buttons, inputs, panels, etc.
- **Utility compositions**: Common combinations of utility classes

## How to Use

### Import Styles

```typescript
import { 
  buttonStyles, 
  inputStyles, 
  panelStyles, 
  colors, 
  typography 
} from 'src/styles/commonStyles';
```

### Apply to Components

```typescript
<button className={`${buttonStyles.base} ${buttonStyles.variant.primary} ${buttonStyles.size.md}`}>
  Submit
</button>

<input 
  className={inputStyles.base} 
  placeholder="Enter your text" 
/>

<div className={`${panelStyles.base} ${panelStyles.variants.sidebar}`}>
  <div className={panelStyles.header.base}>
    <h2 className={panelStyles.header.title}>Panel Title</h2>
  </div>
  <div className={panelStyles.body.base}>
    Content goes here
  </div>
</div>
```

### Combine with Custom Styles

```typescript
<div className={`${cardItemStyles.base} ${isSelected ? cardItemStyles.selected : cardItemStyles.idle} my-custom-class`}>
  Card content
</div>
```

## Style Categories

### Colors

- `colors.bg`: Background colors
- `colors.border`: Border colors
- `colors.text`: Text colors
- `colors.accent`: Accent colors for interactions

### Typography

- `typography.heading`: Heading styles
- `typography.body`: Body text styles
- `typography.label`: Form label styles
- `typography.sectionTitle`: Section title styles

### Effects

- `effects.focus`: Focus ring styles
- `effects.transition`: Transition effects
- `effects.shadow`: Shadow styles

### Component Styles

- `buttonStyles`: All button variations
- `inputStyles`: Form input styles
- `panelStyles`: Panel/card container styles
- `cardItemStyles`: List item styles
- `modalStyles`: Modal dialog styles
- `tooltipStyles`: Tooltip styles
- `formStyles`: Form-related styles
- `alertStyles`: Alert/notification styles
- `badgeStyles`: Badge styles

### Layout

- `layoutStyles`: Common layout patterns
- `utilStyles`: Utility composites
- `rootStyles`: Root element styles

## Benefits

- **Consistency**: Standardized styling across components
- **Maintenance**: Update styles in one place
- **Readability**: Clearer, more semantic class names
- **Code reduction**: Reduced style duplication

## Example Refactoring

### Before:

```tsx
<button 
  className="px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors duration-200 
            text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 
            focus:ring-gray-500 focus:ring-offset-1 disabled:opacity-70 disabled:cursor-not-allowed"
>
  Submit
</button>
```

### After:

```tsx
<button className={`${buttonStyles.base} ${buttonStyles.variant.primary} ${buttonStyles.size.md}`}>
  Submit
</button>
```

## Future Improvements

- Consider extracting to a UI component library
- Add theme support for light/dark mode variations
- Implement CSS variables for dynamic theming