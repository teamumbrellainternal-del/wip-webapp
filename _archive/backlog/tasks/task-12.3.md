---
id: task-11.3
title: "Generate Component Catalog"
status: "To Do"
assignee: []
created_date: "2025-11-16"
labels: ["documentation", "P1", "automation", "frontend"]
milestone: "M11 - Documentation & Developer Tooling"
dependencies: []
estimated_hours: null
---

## Description
Auto-generate UI component documentation from src/components/ using Claude Code. Create a catalog that shows all reusable components, their props, variants, usage patterns, and dependencies.

## Acceptance Criteria
- [ ] docs/COMPONENTS.md created with all ~30 components documented
- [ ] For each component, document:
  - Component name and file path
  - Props with types, defaults, and descriptions
  - Visual variants (if applicable)
  - Usage examples (code snippets)
  - Dependencies on other components
  - Used in which pages/components
- [ ] Components grouped by category (UI primitives, forms, cards, layouts)
- [ ] Theming section showing design tokens and customization
- [ ] Cross-references to pages that use each component
- [ ] Screenshots or visual examples (optional but nice)
- [ ] File validates against actual components in codebase

## Implementation Plan

### 1. Create Claude Code Prompt
```
Prompt: "Scan src/components/ directory and generate docs/COMPONENTS.md 
with the following structure:

# Component Catalog

## UI Primitives

### Button
**File:** src/components/ui/button.tsx

**Props:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'  // default: 'primary'
  size?: 'sm' | 'md' | 'lg'  // default: 'md'
  disabled?: boolean  // default: false
  loading?: boolean  // default: false
  onClick?: () => void
  children: React.ReactNode
}
```

**Variants:**
- primary: Purple background, white text (main CTAs)
- secondary: Outline style (secondary actions)
- danger: Red background (destructive actions)
- ghost: Transparent background (tertiary actions)

**Usage:**
```tsx
import { Button } from '@/components/ui/button'

// Primary CTA
<Button variant="primary" onClick={handleSave}>
  Save Changes
</Button>

// Danger action
<Button variant="danger" onClick={handleDelete}>
  Delete Account
</Button>

// Loading state
<Button loading={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>
```

**Used In:**
- ProfileEditPage (Save button)
- OnboardingStep1 (Next button)
- DashboardPage (Quick actions)

**Dependencies:** None (primitive component)

---

### Input
[... similar structure for each component ...]

## Forms

### FormField
[...]

## Cards

### GigCard
**File:** src/components/GigCard.tsx

**Props:**
```typescript
interface GigCardProps {
  gig: Gig  // Gig model from types/models.ts
  onApply?: (gigId: string) => void
  showUrgency?: boolean  // default: true
}
```

**Usage:**
```tsx
import { GigCard } from '@/components/GigCard'

<GigCard 
  gig={gigData} 
  onApply={handleApply}
  showUrgency={true}
/>
```

**Used In:**
- MarketplacePage (gig listing)
- DashboardPage (opportunities widget)

**Dependencies:**
- Badge (for urgency indicator)
- Button (for apply CTA)

---

[Continue for all components...]

## Theming

### Design Tokens
```css
/* Colors */
--color-primary: #8B5CF6       /* Purple */
--color-secondary: #EC4899     /* Pink */

/* Typography */
--font-display: 'Inter', sans  /* Headings */
--font-body: 'Inter', sans     /* Body text */

/* Spacing */
--space-md: 1rem               /* 16px */
--space-lg: 1.5rem             /* 24px */
```

### Customization
To change the entire app aesthetic:
1. Update design tokens in tailwind.config.js
2. Re-run build
3. All components automatically use new theme

Use actual code from src/components/*.tsx to extract props.
Include usage examples from actual pages.
Show component dependencies (which components use which).
"
```

### 2. Run Generation
- Point Claude Code at src/components/ directory
- Extract prop types from TypeScript interfaces
- Generate initial draft of COMPONENTS.md

### 3. Add Usage Examples
- Find actual usage in src/pages/*.tsx
- Add real code snippets (not synthetic examples)
- Show common patterns (loading states, error states, variants)

### 4. Add Component Dependencies
- Map which components use which other components
- Create dependency tree if helpful
- Note circular dependencies (if any)

### 5. Extract Theming Info
- Read tailwind.config.js for design tokens
- Document color palette with semantic meaning
- Show how to customize (for client aesthetic changes)

### 6. Validation Pass
- Verify all reusable components documented
- Check prop types match actual TypeScript
- Ensure usage examples are accurate

## Notes & Comments
**References:**
- src/components/ directory - All component implementations
- src/pages/ directory - Component usage examples
- tailwind.config.js - Design tokens and theming
- types/models.ts - Data models used in props

**Priority:** P1 - Enables fast UI changes
**File:** docs/COMPONENTS.md
**Can Run Parallel With:** task-11.1, task-11.2, task-11.4, task-11.5

**Why This Matters:**
Post-MVP, UI changes are common. Need to know: "Which components exist? How do I use them? What are the variants?" This document prevents re-inventing components and ensures consistency.

**Example Use Case:**
```
Client: "Can we add a 'warning' variant to buttons?"
Developer: [Reads COMPONENTS.md]
Developer: "Button component has variants: primary, secondary, danger, ghost"
Agent: [Ingests only: COMPONENTS.md, src/components/ui/button.tsx]
Agent: [Adds 'warning' variant, updates docs]
