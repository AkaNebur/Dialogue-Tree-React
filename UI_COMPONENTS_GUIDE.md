# UI Component Library Guide

This document provides an overview of the new UI component library created to streamline development and maintain consistency across the application.

## Overview

The component library consists of reusable UI elements that encapsulate styling, functionality, and accessibility features. These components leverage the centralized styling system to ensure consistency.

## Available Components

### Button

A versatile button component that supports different variants, sizes, and states.

```tsx
import Button from './components/ui/Button';

// Primary button
<Button variant="primary">Submit</Button>

// Secondary button with icon
<Button 
  variant="secondary" 
  leftIcon={<Icon size={16} />}
  onClick={handleClick}
>
  Cancel
</Button>

// Danger button (for destructive actions)
<Button variant="danger" isLoading={isDeleting}>
  Delete
</Button>
```

### IconButton

A simple icon-only button with tooltip support.

```tsx
import IconButton from './components/ui/IconButton';
import { Settings } from 'lucide-react';

<IconButton 
  icon={<Settings size={18} />} 
  label="Open Settings"
  variant="primary"
  onClick={openSettings} 
/>
```

### Input

A form input component with support for labels, validation, and icons.

```tsx
import Input from './components/ui/Input';
import { Search } from 'lucide-react';

// Basic input with label
<Input
  label="Username"
  placeholder="Enter your username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>

// Input with validation error
<Input
  label="Email"
  type="email"
  value={email}
  onChange={handleEmailChange}
  error={emailError}
/>

// Input with icon
<Input
  placeholder="Search..."
  leftIcon={<Search size={16} />}
/>
```

### Panel

A container component for grouping related content.

```tsx
import Panel from './components/ui/Panel';
import Button from './components/ui/Button';

<Panel 
  title="User Settings"
  variant="sidebar"
  actions={<Button size="sm">Add New</Button>}
  footer={<Button variant="primary">Save</Button>}
>
  Content goes here
</Panel>
```

### Modal

A dialog component for displaying content that requires user attention or interaction.

```tsx
import Modal from './components/ui/Modal';
import Button from './components/ui/Button';

<Modal
  isOpen={isModalOpen}
  onClose={closeModal}
  title="Confirm Action"
  footer={
    <>
      <Button variant="secondary" onClick={closeModal}>Cancel</Button>
      <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
    </>
  }
>
  <p>Are you sure you want to proceed with this action?</p>
</Modal>
```

## Benefits

### 1. Code Reduction

Before:
```tsx
<button 
  className="px-4 py-2 text-sm font-medium rounded-md shadow-sm transition-colors duration-200 
            text-white bg-gray-500 hover:bg-gray-600 focus:outline-none focus:ring-2 
            focus:ring-gray-500 focus:ring-offset-1 disabled:opacity-70 disabled:cursor-not-allowed"
  onClick={handleAction}
  disabled={isLoading}
>
  {isLoading ? <Spinner /> : null}
  Submit
</button>
```

After:
```tsx
<Button 
  variant="primary" 
  onClick={handleAction}
  isLoading={isLoading}
>
  Submit
</Button>
```

### 2. Consistency

All instances of buttons, inputs, panels, etc. now share consistent styling, padding, and behavior across the application.

### 3. Maintainability

Styling changes can be made in one place and automatically applied everywhere. For example, changing the primary button color only requires updating the `buttonStyles.variant.primary` in our styling system.

### 4. Accessibility

Components include built-in accessibility features like proper ARIA attributes, keyboard navigation support, and focus management.

### 5. Developer Experience

Clear component APIs with TypeScript support make it easier to understand what props are available and required.

## How to Contribute

When adding new UI elements:

1. Check if an existing component can be extended or composed
2. Add styles to the centralized styling system in `src/styles/commonStyles.ts`
3. Create the component with comprehensive TypeScript types
4. Include accessibility attributes and keyboard support
5. Document the component in this guide