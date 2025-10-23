# Vercel UI: Critical Observations & Implementation Notes

**Purpose**: Distilled key observations from hands-on analysis of Vercel's configuration UI, focusing on specific details that make the interface exceptional.

**Source**: Personal investigation notes from screenshot analysis

---

## Table of Contents

1. [Save Button Behavior](#save-button-behavior)
2. [Framework Configuration Excellence](#framework-configuration-excellence)
3. [Domain Management Flows](#domain-management-flows)
4. [Environment Variable Management](#environment-variable-management)
5. [Authentication & Security](#authentication--security)
6. [Error Handling Specifics](#error-handling-specifics)
7. [Navigation & Page Structure](#navigation--page-structure)
8. [Conditional Field Disclosure](#conditional-field-disclosure)
9. [Documentation Integration](#documentation-integration)
10. [Plan-Based Feature Gating](#plan-based-feature-gating)
11. [Import/Export Functionality](#importexport-functionality)

---

## Save Button Behavior

### Critical Observation
**The save button state precisely reflects the form state**

**Specific Behaviors**:

1. **Disabled State (Default)**
   - Button is grayed out when no changes made
   - Not clickable
   - Visual: reduced opacity (~50%)
   - User cannot accidentally save unchanged data

2. **Enabled State (Dirty)**
   - Button becomes black/primary color when ANY field changes
   - Fully clickable
   - Visual: full opacity, primary button style
   - Clear call-to-action

3. **Loading State (Saving)**
   - Button shows spinner during save
   - Disabled during operation
   - Text may change to "Saving..."
   - Prevents duplicate submissions

4. **Section Isolation**
   - Each section has its own save button
   - Save buttons operate independently
   - No cascading saves between sections
   - User has complete control over what gets saved when

**Implementation Requirements**:
```typescript
// Track original vs current values
const [originalData, setOriginalData] = useState(initialData);
const [formData, setFormData] = useState(initialData);
const [isSaving, setIsSaving] = useState(false);

// Compute dirty state
const isDirty = !isEqual(originalData, formData);

// Save button props
const saveButtonProps = {
  disabled: !isDirty || isSaving,
  onClick: handleSave,
  loading: isSaving
};
```

**Why This Matters**:
- Prevents user anxiety about unsaved changes
- Provides clear feedback about form state
- Prevents accidental saves
- Professional, polished feel

---

## Framework Configuration Excellence

### The Override Pattern Done Right

**Key Insight**: Framework presets provide smart defaults that users can selectively override without losing the benefit of presets.

**Specific Implementation**:

1. **Preset Selection**
   ```
   Framework Preset: [Next.js ▼]
   ```
   - Dropdown with framework icons
   - Selection immediately updates ALL command fields
   - Previous overrides are preserved
   - Clear visual feedback when preset changes

2. **Command Fields with Override Toggle**
   ```
   Build Command                      [Override ⚪]
   ┌──────────────────────────────────────────┐
   │ next build                               │ (read-only, muted)
   └──────────────────────────────────────────┘
   
   (When override enabled:)
   Build Command                      [Override ⚫]
   ┌──────────────────────────────────────────┐
   │ next build                               │ (editable, active)
   └──────────────────────────────────────────┘
   ```

3. **Visual States**
   - **Default (No Override)**: Field muted/grayed, toggle OFF, read-only
   - **Override Active**: Field normal color, toggle ON, editable
   - **Default Value Always Visible**: Even when overridden, user can see what the default was

4. **Multiple Package Manager Support**
   ```
   Install Command: yarn install | pnpm install | npm install | bun install
   ```
   - Shows all alternatives
   - User can see all options at once
   - Acknowledges different workflows

**Implementation Pattern**:
```typescript
interface CommandFieldProps {
  label: string;
  defaultValue: string; // From preset
  value: string;        // Current value
  onChange: (value: string) => void;
  overridden: boolean;
  onOverrideChange: (overridden: boolean) => void;
  helpText?: string;
}

const CommandField = ({
  label, defaultValue, value, onChange,
  overridden, onOverrideChange, helpText
}: CommandFieldProps) => {
  const displayValue = overridden ? value : defaultValue;
  const isEditable = overridden;
  
  return (
    <div>
      <div className="flex justify-between">
        <Label>{label} {helpText && <HelpIcon />}</Label>
        <Switch checked={overridden} onCheckedChange={onOverrideChange}>
          Override
        </Switch>
      </div>
      <Input
        value={displayValue}
        onChange={e => onChange(e.target.value)}
        disabled={!isEditable}
        className={!isEditable ? 'text-muted-foreground' : ''}
      />
    </div>
  );
};
```

**Why This Matters**:
- Balances automation with flexibility
- Makes defaults explicit, not magical
- Users learn best practices from defaults
- Easy to revert to default (toggle off)
- Common pattern across all framework settings

---

## Domain Management Flows

### Comprehensive Configuration Workflow

**Critical Observation**: Domain addition is a multi-step process with hierarchical selections.

**Flow Details**:

1. **Add Domain Button**
   - Opens modal/expanded form (not new page)
   - Maintains context

2. **Domain Input**
   - Text field for domain name
   - Real-time validation
   - Format checking

3. **Redirect Configuration** (Hierarchical)
   ```
   Redirect Type: [Enum Dropdown ▼]
     • No Redirect
     • Permanent (301)
     • Temporary (302)
     • Custom
   
   (If redirect selected:)
   
   Redirect Target: [Hierarchical Selection ▼]
     Category 1: Production Branches
       • main
       • master
     Category 2: Preview Branches
       • develop
       • staging
   ```

**Key Details**:
- First dropdown: Simple enum (redirect type)
- Second dropdown: Hierarchical with categories
- Conditional - only appears if redirect type selected
- Clear visual hierarchy in dropdown

4. **View Existing Domain** (Modal Overlay)
   ```
   (Click on existing domain)
   → Opens modal overlay
   → Does NOT hide entire page
   → Can see domain list in background
   → Modal shows full domain configuration
   → Edit/Delete actions in modal
   ```

**Implementation Considerations**:
```typescript
// Hierarchical dropdown data structure
interface RedirectTarget {
  category: string;
  options: Array<{
    label: string;
    value: string;
    branch: string;
  }>;
}

const redirectTargets: RedirectTarget[] = [
  {
    category: 'Production Branches',
    options: [
      { label: 'main', value: 'main', branch: 'main' },
      { label: 'master', value: 'master', branch: 'master' }
    ]
  },
  {
    category: 'Preview Branches',
    options: [
      { label: 'develop', value: 'develop', branch: 'develop' },
      { label: 'staging', value: 'staging', branch: 'staging' }
    ]
  }
];
```

**Why This Matters**:
- Complex configuration made approachable
- Progressive disclosure reduces overwhelm
- Hierarchical selection organizes many options
- Modal overlay maintains context

---

## Environment Variable Management

### Multi-Faceted Excellence

**Critical Observations**:

### 1. Conditional Fields Based on Environment Selection
```
Environment Scope: [Dropdown ▼]
  • All Environments
  • Production
  • Preview           ← Selected
  • Development

(When "Preview" selected:)
  
  ↓ Additional field appears
  
  Preview Branch: [Dropdown ▼]
    • All Preview Branches
    • Specific Branch...
  
  (If "Specific Branch" selected:)
    ↓ Text input appears
    Branch Name: [___________]
```

**Implementation**:
```typescript
const [scope, setScope] = useState<'all' | 'production' | 'preview' | 'development'>('all');
const [previewBranch, setPreviewBranch] = useState<string | null>(null);

// Render logic
{scope === 'preview' && (
  <ConditionalField show={true} animation={true}>
    <SelectField
      label="Preview Branch"
      options={previewBranchOptions}
      value={previewBranch}
      onChange={setPreviewBranch}
    />
  </ConditionalField>
)}
```

### 2. Optional Note/Comment Field
```
Environment Variable Form:
  Name: [_____________]
  Value: [_____________]
  Environment: [Dropdown]
  
  [+ Add Note] ← Toggleable
  
  (When toggled on:)
  ↓
  Note (optional): [Text area for documentation]
  ┌────────────────────────────────────────┐
  │ Internal documentation about this var  │
  │ Visible to team, not in deployments   │
  └────────────────────────────────────────┘
```

**Why This Matters**:
- Team documentation travels with config
- Reduces dependency on external docs
- Context for future maintainers
- Optional - doesn't clutter for simple cases

### 3. Import from .env File
```
[Import .env File] button
  ↓ Opens modal with two options:
  
  Tab 1: Upload File
    [Click to upload] or drag & drop
    
  Tab 2: Paste Content
    ┌────────────────────────────────────────┐
    │ Paste your .env file contents here:    │
    │                                        │
    │ API_KEY=sk-abc123                      │
    │ DATABASE_URL=postgres://...           │
    │ SECRET_KEY=xyz789                     │
    └────────────────────────────────────────┘
    
  Preview detected variables:
    ✓ API_KEY
    ✓ DATABASE_URL  
    ✓ SECRET_KEY
    
  Import to: [Environment Dropdown]
  
  [Cancel] [Import Variables]
```

**Implementation Considerations**:
```typescript
// Parser for .env format
const parseEnvFile = (content: string): Record<string, string> => {
  return content
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .reduce((acc, line) => {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      if (key) acc[key.trim()] = value.trim();
      return acc;
    }, {} as Record<string, string>);
};
```

**Why This Matters**:
- Bridges local development and cloud deployment
- Reduces manual entry errors
- Speeds up migration
- Common workflow supported natively

### 4. Variable Action Menu (Three-Dot)
```
Each variable row has three-dot menu:

┌─────────────────────┐
│ Edit                │ ← Opens edit form inline
│ Detach              │ ← Removes from this environment
│ Remove              │ ← Deletes entirely (RED)
└─────────────────────┘
```

**Context-Dependent Actions**:
- **Edit**: Available for all variables
- **Detach**: Only for inherited variables (from "All Environments")
- **Remove**: Always available, shown in red (destructive)

### 5. Inline Edit Expansion
```
Variable List View:
  API_KEY     ••••••••    Production, Preview    [⋮]
  
(Click Edit:)
  ↓ Row expands inline
  
┌──────────────────────────────────────────────────────┐
│ Name: API_KEY                                        │
│ Value: [show/hide] sk-abc123...                      │
│ Environment: ☑ Production ☑ Preview ☐ Development   │
│ [+ Add Note]                                         │
│                                                      │
│ [Cancel] [Update Variable]                           │
└──────────────────────────────────────────────────────┘
```

**Why This Matters**:
- No navigation away from list
- Context preserved
- Quick edits
- Can see other variables while editing

### 6. Callout for Shared Variables
```
When editing a variable that's shared across environments:

┌──────────────────────────────────────────────────────┐
│ ℹ This variable is currently shared across all      │
│   environments. Changes will affect:                 │
│   • Production                                       │
│   • Preview                                          │
│   • Development                                      │
└──────────────────────────────────────────────────────┘
```

**Why This Matters**:
- Prevents accidental changes to production
- Clear impact communication
- Safety for shared resources

---

## Authentication & Security

### OPTIONS Allowlist Pattern

**Critical Observation**: Dynamic path collection with smart defaults.

**Specific Implementation**:
```
☑ Enable OPTIONS Allowlist
  ↓ Reveals path management
  
  Allowed Paths:
  ┌────────────────────────────────┐
  │ /api                      [×]  │ ← Removable
  ├────────────────────────────────┤
  │ /api/webhooks             [×]  │
  ├────────────────────────────────┤
  │ [/api ________________]   [+]  │ ← Add new
  └────────────────────────────────┘
      ↑ Gray placeholder text nudges user
```

**Key Details**:
1. Paths can be added infinitely
2. Each path has remove button (×)
3. Last row is always empty input for adding
4. Placeholder "/api" suggests common pattern
5. No limit on number of paths
6. Each path independent

**Implementation**:
```typescript
const [paths, setPaths] = useState<string[]>([]);
const [newPath, setNewPath] = useState('');

const addPath = () => {
  if (newPath && !paths.includes(newPath)) {
    setPaths([...paths, newPath]);
    setNewPath('');
  }
};

const removePath = (index: number) => {
  setPaths(paths.filter((_, i) => i !== index));
};

return (
  <div>
    {paths.map((path, index) => (
      <div key={index} className="flex gap-2">
        <Input value={path} disabled />
        <Button variant="ghost" onClick={() => removePath(index)}>×</Button>
      </div>
    ))}
    <div className="flex gap-2">
      <Input
        placeholder="/api"
        value={newPath}
        onChange={e => setNewPath(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && addPath()}
      />
      <Button onClick={addPath}>+</Button>
    </div>
  </div>
);
```

### Password Protection (Plan-Restricted)

**Visual Treatment**:
```
┌──────────────────────────────────────────┐
│ 🔒 Password Protection                   │ ← Lock icon
│                                          │
│ [Toggle] ─────────┐                     │
│    (disabled)     │  75% opacity        │
│                   │  (grayed out)       │
│ Password: [_____] │                     │
│    (disabled)     │                     │
│                   │                     │
│ ┌──────────────────────────────────────┐│
│ │ ℹ Available on Pro                  ││
│ │ $20/month per member                 ││
│ │                                      ││
│ │ [Upgrade to Pro]                     ││
│ └──────────────────────────────────────┘│
└──────────────────────────────────────────┘
```

**Critical Details**:
- Entire section visible but disabled
- 75% opacity (not completely grayed)
- Lock icon indicates restriction
- Pricing info right there (transparent)
- Direct upgrade CTA
- User understands value proposition
- NOT hidden - feature discovery

---

## Error Handling Specifics

### Multi-Level Error Display

**Critical Observation**: Errors shown at TWO levels simultaneously.

### Level 1: Toast Notification
```
(Bottom-right corner)
┌────────────────────────────────────┐
│ ✕  Validation Error           [×] │
│                                    │
│ Please fix the following issues:   │
│ • A developer name is required     │
│ • A public URL slug is required    │
│ • Contact email is required        │
│                                    │
│ [Dismiss]                          │
└────────────────────────────────────┘
```

**Behaviors**:
- Appears when user clicks "Create" or "Save"
- Auto-dismisses after 10 seconds
- Can be manually dismissed (× button)
- Lists ALL validation errors
- Does NOT prevent continued form interaction

### Level 2: Field-Level Indicators
```
┌─────────────────────────────────────┐
│ Developer Name [!]                  │ ← Error icon
├─────────────────────────────────────┤
│ [empty field]                       │ ← Red border
├─────────────────────────────────────┤
│ ⚠ A developer name is required      │ ← Error text
└─────────────────────────────────────┘
```

**Behaviors**:
- Red border on invalid field
- Error message below field
- Error icon on label
- Persists until field is fixed
- Remains visible even after toast disappears

**Critical Point**: Both levels work together:
- Toast grabs attention: "There are errors!"
- Field indicators guide correction: "Here's what's wrong"
- Toast can be dismissed, field errors remain
- User can fix errors at their own pace

**Implementation**:
```typescript
const [errors, setErrors] = useState<Record<string, string>>({});
const [showToast, setShowToast] = useState(false);

const handleSubmit = () => {
  const validationErrors = validate(formData);
  
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    showErrorToast(Object.values(validationErrors));
    return;
  }
  
  // Proceed with submission
};

// Toast component
const ErrorToast = ({ errors }) => {
  useEffect(() => {
    const timer = setTimeout(() => setShowToast(false), 10000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Toast variant="destructive">
      <ToastTitle>Validation Error</ToastTitle>
      <ToastDescription>
        <ul>
          {errors.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
      </ToastDescription>
    </Toast>
  );
};
```

---

## Navigation & Page Structure

### Hierarchical Sidebar Navigation

**Critical Observation**: Left sidebar serves as both outline and navigation.

**Structure**:
```
Profile and Settings
─────────────────────
► Profile               ← Collapsible sections
  • Avatar
  • Display Name
  • Username
  
► Team
  • Default Team
  
► Contact
  • Email
  • Phone
  
▼ Security              ← Expanded section
  • Authentication      ← Active item (highlighted)
  • Password
  • Two-Factor
```

**Behaviors**:

1. **Navigation**:
   - Click section header to navigate
   - Click subsection to scroll to that part
   - Active section highlighted
   - Smooth scroll to section

2. **Collapse/Expand**:
   - Click ► to expand section
   - Click ▼ to collapse section
   - State persists across sessions
   - Multiple sections can be expanded

3. **Visual Hierarchy**:
   - Section headers: Bold, larger
   - Subsections: Regular weight, indented
   - Active item: Primary color, bold
   - Inactive: Muted color

4. **All on Same Page**:
   - No separate pages for sections
   - Each section is a scroll anchor
   - Navigation updates URL hash (#security)
   - Back button works with hash navigation

**Implementation**:
```typescript
interface NavSection {
  id: string;
  label: string;
  subsections: Array<{
    id: string;
    label: string;
    anchor: string; // #authentication
  }>;
  isExpanded: boolean;
}

const NavigationSidebar = ({ sections, activeSection }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(['security']);
  
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };
  
  const navigateToSection = (anchor: string) => {
    const element = document.querySelector(anchor);
    element?.scrollIntoView({ behavior: 'smooth' });
    window.history.pushState({}, '', anchor);
  };
  
  return (
    <nav>
      {sections.map(section => (
        <div key={section.id}>
          <button onClick={() => toggleSection(section.id)}>
            {expandedSections.includes(section.id) ? '▼' : '►'} {section.label}
          </button>
          {expandedSections.includes(section.id) && (
            <ul>
              {section.subsections.map(sub => (
                <li
                  key={sub.id}
                  className={activeSection === sub.id ? 'active' : ''}
                  onClick={() => navigateToSection(sub.anchor)}
                >
                  {sub.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </nav>
  );
};
```

---

## Conditional Field Disclosure

### Toggle-Driven Field Revelation

**Critical Pattern**: Toggling a feature ON reveals related configuration.

**Examples Observed**:

### 1. Branch Tracking
```
Branch Tracking: [Toggle OFF]
  (Simple view)
  
Branch Tracking: [Toggle ON] ─────┐
  ↓ Reveals configuration         │
                                   │
┌──────────────────────────────────┘
│ Git Branch: [dropdown]
│ Auto-assign Domain: [toggle]
│ 
│ (If auto-assign ON:)
│   Domain Pattern: [input]
└─────────────────────────────────
```

### 2. Branch Tracking - Disable Warning
```
(When user toggles OFF after being ON:)

┌────────────────────────────────────────┐
│ ⚠ Disabling branch tracking            │
│                                        │
│ Existing preview deployments will      │
│ remain active but new commits won't    │
│ trigger deployments.                   │
│                                        │
│ [Cancel] [Disable Anyway]              │
└────────────────────────────────────────┘
```

**Critical Detail**: Warning modal BEFORE disabling, not after.

### 3. Environment Variable Sensitivity
```
☐ Sensitive Value
  (Regular input shown)
  Value: [_________________]
  
☑ Sensitive Value ───────┐
  ↓ Changes input type    │
                          │
  Value: [•••••••••••] 👁 │ ← Show/hide toggle
  
  ⚠ Team members will not be able to
    view this value after creation
```

**Implementation Pattern**:
```typescript
const [enabled, setEnabled] = useState(false);
const [showWarning, setShowWarning] = useState(false);

const handleToggleOff = () => {
  if (enabled) {
    setShowWarning(true); // Show warning before disable
  } else {
    setEnabled(false);
  }
};

const confirmDisable = () => {
  setEnabled(false);
  setShowWarning(false);
};
```

---

## Documentation Integration

### Consistent Link Placement

**Critical Observation**: Documentation links appear in EXACT same spot for every section.

**Pattern**:
```
┌────────────────────────────────────────┐
│ Section Header                         │
│ Description text...                    │
│                                        │
│ [Field 1]                              │
│ [Field 2]                              │
│ [Field 3]                              │
│                                        │
│ Learn more about [Feature Name] →      │ ← Always here
│                                        │
│ [Save Changes]                         │
└────────────────────────────────────────┘
```

**Positioning Rules**:
1. Above the save button
2. Below all fields
3. Left-aligned
4. Consistent link text pattern
5. External link icon (→)

**Benefits**:
- Users know where to look
- Doesn't interfere with fields
- Available when needed
- Consistent throughout app

---

## Plan-Based Feature Gating

### Tiered Messaging Strategy

**Critical Observation**: Different CTAs for different plan tiers.

### Pro Features (Upgrade Button)
```
┌────────────────────────────────────┐
│ ℹ Available on Pro                │
│ $20/month per member               │
│                                    │
│ [Upgrade to Pro]                   │
└────────────────────────────────────┘
```
- Specific pricing
- Direct upgrade button
- Self-service

### Enterprise Features (Contact Sales)
```
┌────────────────────────────────────┐
│ ℹ Available on Enterprise          │
│ Custom pricing                     │
│                                    │
│ [Contact Sales]                    │
└────────────────────────────────────┘
```
- "Custom pricing"
- Contact sales button
- Requires conversation

**Implementation**:
```typescript
interface PlanRestriction {
  requiredPlan: 'pro' | 'enterprise';
  currentPlan: 'free' | 'pro' | 'enterprise';
}

const PlanRestrictedFeature = ({ 
  requiredPlan, 
  currentPlan, 
  children 
}: PlanRestriction & { children: React.ReactNode }) => {
  const isRestricted = getPlanLevel(currentPlan) < getPlanLevel(requiredPlan);
  
  if (!isRestricted) return <>{children}</>;
  
  const isPro = requiredPlan === 'pro';
  
  return (
    <div className="relative">
      <div className="opacity-75 pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Available on {requiredPlan}</CardTitle>
            <CardDescription>
              {isPro ? '$20/month per member' : 'Custom pricing'}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button>
              {isPro ? 'Upgrade to Pro' : 'Contact Sales'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
```

---

## Import/Export Functionality

### .env Import Implementation

**Critical Details**:

1. **Two Input Methods**:
   - File upload (drag & drop or click)
   - Paste text content
   - Tabs to switch between methods

2. **Format Detection**:
   ```typescript
   // Detects and parses:
   // - Standard .env format (KEY=value)
   // - Comments (# comment)
   // - Empty lines (ignored)
   // - Quoted values ("value" or 'value')
   // - Multiline values (if needed)
   
   const parseEnvFile = (content: string) => {
     const lines = content.split('\n');
     const variables: Record<string, string> = {};
     
     lines.forEach(line => {
       // Skip comments and empty lines
       if (!line.trim() || line.trim().startsWith('#')) return;
       
       const [key, ...valueParts] = line.split('=');
       if (!key) return;
       
       let value = valueParts.join('='); // Handle = in values
       
       // Remove quotes
       value = value.replace(/^["']|["']$/g, '');
       
       variables[key.trim()] = value.trim();
     });
     
     return variables;
   };
   ```

3. **Preview Before Import**:
   ```
   Detected Variables (3):
   ✓ API_KEY
   ✓ DATABASE_URL
   ✓ SECRET_KEY
   
   Import to: [Production ▼]
   
   [Cancel] [Import 3 Variables]
   ```

4. **Error Handling**:
   - Invalid format warnings
   - Duplicate key detection
   - Invalid key names flagged
   - User can fix before importing

**Why This Matters**:
- Bridges local dev to cloud
- Reduces errors
- Fast migration path
- Standard format support

---

## Key Implementation Principles

### 1. Section Independence
✓ Each section saves separately
✓ No cascading saves
✓ Clear boundaries
✓ Independent dirty state

### 2. Progressive Disclosure
✓ Hide complexity until needed
✓ Smooth animations
✓ Preserve hidden values
✓ Clear trigger points

### 3. Smart Defaults
✓ Provide sensible defaults
✓ Make overriding explicit
✓ Show default values
✓ Easy revert to default

### 4. Clear Communication
✓ Explain every setting
✓ Link to docs contextually
✓ Transparent restrictions
✓ Actionable errors

### 5. Plan Transparency
✓ Show restricted features
✓ Clear pricing
✓ Direct upgrade paths
✓ Don't hide value proposition

---

## Critical Don'ts

❌ Don't hide restricted features
❌ Don't cascade saves between sections
❌ Don't clear hidden field values
❌ Don't use generic error messages
❌ Don't make defaults magical
❌ Don't interrupt user flow unnecessarily
❌ Don't remove error indicators prematurely
❌ Don't navigate away for simple operations

---

## Version History

**v1.0** — October 2025
- Initial consolidated observations
- Extracted from personal investigation notes
- Focus on specific, actionable details

---

**Remember**: These observations come from careful analysis of a production system used by millions. Trust these patterns—they're battle-tested.
