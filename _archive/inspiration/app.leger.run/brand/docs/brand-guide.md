# Leger Labs Brand Style Guide

**Version 1.0** • October 2025

---

## Brand Essence

**Tagline:** *Infrastructure for Builders*

**Mission:** Leger removes the complexity barrier between power users and local AI infrastructure, respecting technical ability while eliminating configuration overhead.

**Positioning:** The Tailscale of AI infrastructure—technical credibility meets approachable implementation.

---

## 1. Logo System

### Primary Logo
- **Concept:** Solid white circle (or black in inverse) following Vercel's proportions
- **Wordmark:** "Leger" in Geist Sans Medium
- **Lockup:** Circle + wordmark with 1.5x circle diameter spacing

### Logo Specifications

```
Circle Dimensions:
- Diameter: 24px (icon), 32px (standard), 48px (hero)
- Clear space: 0.5x diameter on all sides
- Minimum size: 16px (never smaller)

ASCII Representation (for CLI):
● Leger    (using Unicode U+25CF BLACK CIRCLE)
```

### Logo Variants

**Full Lockup:**
```
[●] Leger
```

**Icon Only:**
```
[●]
```

**Text Treatment:**
- Wordmark always uses Geist Sans Medium
- No italics, no letterspacing adjustments
- Minimum size: 14px for readability

### Color Treatments

| Context | Background | Circle | Text |
|---------|-----------|--------|------|
| Dark (primary) | `#0a0a0a` | `#ffffff` | `#ffffff` |
| Light | `#ffffff` | `#0a0a0a` | `#0a0a0a` |
| Terminal | Black | White | White |
| Docs header | `#111111` | `#ffffff` | `#fafafa` |

---

## 2. Typography

### Font Stack

**Primary: Geist Sans**
- Source: https://vercel.com/font
- License: SIL Open Font License 1.1
- Weights: 400 (Regular), 500 (Medium), 600 (Semibold)
- Usage: UI, marketing, documentation body text

**Monospace: Geist Mono**
- Source: https://vercel.com/font  
- License: SIL Open Font License 1.1
- Weights: 400 (Regular), 500 (Medium)
- Usage: Code blocks, CLI output, technical specs

### Type Scale

```css
/* Headings - Pixel-based like Vercel */
--font-size-72: 72px;     /* Hero, line-height: 72px, letter-spacing: -4.32px */
--font-size-64: 64px;     /* Marketing, line-height: 64px, letter-spacing: -3.84px */
--font-size-56: 56px;     /* line-height: 60px, letter-spacing: -2.8px */
--font-size-48: 48px;     /* line-height: 56px, letter-spacing: -1.92px */
--font-size-40: 40px;     /* line-height: 48px, letter-spacing: -1.6px */
--font-size-32: 32px;     /* line-height: 40px, letter-spacing: -1.28px */
--font-size-24: 24px;     /* line-height: 32px, letter-spacing: -0.96px */
--font-size-20: 20px;     /* line-height: 28px, letter-spacing: -0.8px */
--font-size-16: 16px;     /* line-height: 24px, letter-spacing: -0.32px */
--font-size-14: 14px;     /* line-height: 20px */

/* Body/Copy - Relaxed line-heights */
--font-size-copy-24: 24px;  /* line-height: 36px */
--font-size-copy-20: 20px;  /* line-height: 30px */
--font-size-copy-18: 18px;  /* line-height: 28px */
--font-size-copy-16: 16px;  /* line-height: 24px */
--font-size-copy-14: 14px;  /* line-height: 20px */
--font-size-copy-13: 13px;  /* line-height: 20px */

/* Buttons */
--font-size-button-16: 16px;  /* line-height: 20px */
--font-size-button-14: 14px;  /* line-height: 18px */
--font-size-button-12: 12px;  /* line-height: 16px */

/* Labels - Tight line-heights for UI */
--font-size-label-20: 20px;  /* line-height: 20px */
--font-size-label-18: 18px;  /* line-height: 20px */
--font-size-label-16: 16px;  /* line-height: 20px */
--font-size-label-14: 14px;  /* line-height: 20px */
--font-size-label-13: 13px;  /* line-height: 20px */
--font-size-label-12: 12px;  /* line-height: 16px */
```

### Heading Hierarchy

```css
h1 {
  font-family: 'Geist Sans', sans-serif;
  font-size: 48px;
  font-weight: 600;
  line-height: 56px;
  letter-spacing: -1.92px;
}

h2 {
  font-family: 'Geist Sans', sans-serif;
  font-size: 32px;
  font-weight: 600;
  line-height: 40px;
  letter-spacing: -1.28px;
}

h3 {
  font-family: 'Geist Sans', sans-serif;
  font-size: 24px;
  font-weight: 600;
  line-height: 32px;
  letter-spacing: -0.96px;
}

h4 {
  font-family: 'Geist Sans', sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 28px;
  letter-spacing: -0.8px;
}

body {
  font-family: 'Geist Sans', sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: 0;
}

code, pre {
  font-family: 'Geist Mono', monospace;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
}
```

---

## 3. Color Palette

### Philosophy
Dark mode is the primary interface. Colors balance technical precision with warmth—avoiding generic SaaS blue while maintaining professional credibility.

### Primary Colors

**Brand Primary: Yellow (Catppuccin Mocha)**
```css
--color-primary-50:  #fef9ec;
--color-primary-100: #fdf3d6;
--color-primary-200: #fcedb8;
--color-primary-300: #fae699;
--color-primary-400: #f9e2af;  /* ← Primary accent (Catppuccin Yellow) */
--color-primary-500: #f5d97d;
--color-primary-600: #e5c55a;
--color-primary-700: #c9a842;
--color-primary-800: #a38835;
--color-primary-900: #7d6829;
```

**Why Yellow (Catppuccin):**
- Warm and approachable (counterbalances technical subject matter)
- Part of cohesive Catppuccin Mocha palette
- High visibility in dark mode without being harsh
- Evokes "light" and "power" (appropriate for AI/compute)
- Differentiates from typical tech blues/greens
- WCAG AA compliant on dark backgrounds

### Neutral Palette

**Dark Mode (Primary):**
```css
--color-bg-primary:   #0a0a0a;    /* Main background */
--color-bg-secondary: #111111;    /* Elevated surfaces */
--color-bg-tertiary:  #1a1a1a;    /* Cards, modals */
--color-bg-hover:     #252525;    /* Interactive hover */
--color-bg-active:    #2a2a2a;    /* Interactive active */

--color-text-primary:   #fafafa;  /* Headings, primary text */
--color-text-secondary: #a3a3a3;  /* Body text */
--color-text-tertiary:  #737373;  /* Muted text, labels */
--color-text-disabled:  #525252;  /* Disabled states */

--color-border-primary:   #262626; /* Default borders */
--color-border-secondary: #1f1f1f; /* Subtle dividers */
--color-border-hover:     #404040; /* Interactive borders */
```

**Light Mode (Optional):**
```css
--color-bg-primary:   #ffffff;
--color-bg-secondary: #fafafa;
--color-bg-tertiary:  #f5f5f5;
--color-bg-hover:     #e5e5e5;
--color-bg-active:    #d4d4d4;

--color-text-primary:   #0a0a0a;
--color-text-secondary: #525252;
--color-text-tertiary:  #737373;
--color-text-disabled:  #a3a3a3;

--color-border-primary:   #e5e5e5;
--color-border-secondary: #f5f5f5;
--color-border-hover:     #d4d4d4;
```

### Semantic Colors

```css
/* Success - Green (Catppuccin) */
--color-success-light:  #c7f0c4;
--color-success:        #a6e3a1;
--color-success-dark:   #85d680;
--color-success-bg:     #2a3a2a;

/* Warning - Peach (Catppuccin) */
--color-warning-light:  #fcd4b8;
--color-warning:        #fab387;
--color-warning-dark:   #f79e65;
--color-warning-bg:     #3a2e25;

/* Error - Red (Catppuccin) */
--color-error-light:    #f9becf;
--color-error:          #f38ba8;
--color-error-dark:     #ed6888;
--color-error-bg:       #3a2530;

/* Info - Blue (Catppuccin) */
--color-info-light:     #b5d5fb;
--color-info:           #89b4fa;
--color-info-dark:      #6a9ff9;
--color-info-bg:        #252e3a;
```

### Syntax Highlighting (Dark Mode)

Based on **Tokyo Night Storm** with adjustments:

```css
--syntax-bg:        #1a1b26;
--syntax-fg:        #a9b1d6;
--syntax-comment:   #565f89;
--syntax-keyword:   #bb9af7;  /* Purple */
--syntax-string:    #9ece6a;  /* Green */
--syntax-function:  #7aa2f7;  /* Blue */
--syntax-variable:  #c0caf5;  /* Light blue */
--syntax-number:    #ff9e64;  /* Orange */
--syntax-operator:  #89ddff;  /* Cyan */
--syntax-class:     #ffc777;  /* Yellow */
--syntax-error:     #f7768e;  /* Red */
```

### Color Usage Guidelines

**Primary Yellow Usage:**
- Call-to-action buttons
- Active navigation states
- Interactive highlights
- Code block headers
- Success indicators (deploys, installations)

**Reserved Uses:**
- Red: Errors, destructive actions only
- Green: Successful operations, checkmarks
- Blue: Informational, non-critical notices
- Yellow: Primary brand actions

**Accessibility:**
- All text/background combinations pass WCAG AA (4.5:1)
- Interactive elements have 3:1 contrast minimum
- Focus indicators use `--color-primary-400` with 2px outline

---

## 4. Design Principles

### Visual Tone: **Confident Minimalism**

1. **Economical** — Every element serves a purpose. No decoration for decoration's sake.
2. **Precise** — Technical accuracy matters. Specs are exact, instructions are clear.
3. **Breathable** — Generous whitespace. Never cramped or cluttered.
4. **Honest** — No marketing fluff. Show, don't oversell.

### Layout Philosophy

**Spacing Scale (Tailwind-compatible):**
```css
--space-0:   0;
--space-1:   0.25rem;  /* 4px */
--space-2:   0.5rem;   /* 8px */
--space-3:   0.75rem;  /* 12px */
--space-4:   1rem;     /* 16px */
--space-6:   1.5rem;   /* 24px */
--space-8:   2rem;     /* 32px */
--space-12:  3rem;     /* 48px */
--space-16:  4rem;     /* 64px */
--space-24:  6rem;     /* 96px */
--space-32:  8rem;     /* 128px */
```

**Grid System:**
- Max content width: 1280px
- Reading width: 680px (documentation)
- Code block width: 100% of content (no horizontal scroll)

**Component Style:**
- Border radius: `4px` (subtle, modern)
- Button radius: `6px` (slightly softer)
- Card radius: `8px` (containers)
- Shadow: Minimal (0 1px 3px rgba(0,0,0,0.3) for elevation)

### Interaction Patterns

**Buttons:**
```css
/* Primary */
background: var(--color-primary-400);
color: var(--color-bg-primary);
padding: 0.5rem 1rem;
border-radius: 6px;
font-weight: 500;
transition: all 0.2s ease;

/* Hover */
background: var(--color-primary-500);
transform: translateY(-1px);
```

**Links:**
- Body text: `color: var(--color-primary-400)` with underline on hover
- Navigation: No underline, primary color when active
- External links: Indicate with icon or arrow

**Focus States:**
- 2px solid `--color-primary-400`
- 4px offset for buttons/interactive elements
- Always visible, never removed

---

## 5. Brand Voice

### Personality

**We are:**
- **Builders talking to builders** — Peer-to-peer, not vendor-to-customer
- **Respectfully direct** — No fluff, but not terse or cold
- **Technically precise** — Accurate without being pedantic
- **Quietly confident** — Let the work speak, don't oversell

**We are not:**
- Corporate/formal (avoid: "leverage," "solutions," "ecosystem")
- Artificially casual (avoid: excessive emoji, "hey friend!")
- Condescending (assume competence, explain clearly)
- Hype-driven (avoid: "revolutionary," "game-changing," "10x")

### Writing Guidelines

**Documentation:**
```markdown
✅ Good:
"Run `leger init` to deploy your configured services. This takes 
about 10 minutes on first run."

❌ Avoid:
"Simply leverage our revolutionary CLI to seamlessly deploy your 
bespoke AI infrastructure in minutes!"
```

**Marketing:**
```markdown
✅ Good:
"Leger deploys local AI infrastructure on your AMD hardware. Configure 
once via web UI, deploy via CLI. No YAML editing required."

❌ Avoid:
"Transform your AI workflow with our cutting-edge, enterprise-grade 
platform that revolutionizes local compute!"
```

**Changelog/Updates:**
```markdown
✅ Good:
"Added support for custom Whisper models. You can now specify model 
size in the web UI."

❌ Avoid:
"We're thrilled to announce an amazing new feature that unlocks..."
```

### Vocabulary

**Preferred Terms:**
- "Deploy" (not "spin up," "provision")
- "Configure" (not "customize," "tailor")
- "Local" (not "on-prem," "self-hosted")
- "Services" (not "microservices," "components")
- "Stack" (not "solution," "platform")

**Technical Language:**
- Use technical terms correctly (Podman, not Docker when it's actually Podman)
- Explain complex concepts, don't gatekeep
- Link to deeper docs rather than over-explaining inline

### Tone Examples

**CLI Help Text:**
```bash
leger init

Deploy your configured AI services to this machine.

This command will:
  • Install Podman quadlets
  • Configure Tailscale networking
  • Pull required container images
  • Start configured services

First run typically takes 10-15 minutes depending on your network.

Options:
  --force    Skip confirmation prompts
  --dry-run  Show what would be deployed without changes

Need help? Visit docs.leger.run
```

**Error Messages:**
```bash
❌ Service deployment failed
   
   OpenWebUI container failed to start due to insufficient memory.
   
   Your system has 16GB RAM but Leger requires 32GB minimum
   for the services you configured.
   
   Options:
   • Disable some services at app.leger.run
   • Add more RAM to your system
   
   Details: https://docs.leger.run/troubleshooting#memory
```

**Documentation Headers:**
```markdown
# Getting Started

Leger deploys local AI infrastructure on your AMD hardware. This 
guide walks through installation and first deployment.

**Time required:** 20 minutes  
**Prerequisites:** AMD Strix Halo with 128GB unified memory
```

---

## 6. Quick Start Kit

### CSS Variables (Complete Set)

```css
:root {
  /* Colors - Dark Mode */
  --color-brand: #fbbf24;
  --color-bg-primary: #0a0a0a;
  --color-bg-secondary: #111111;
  --color-bg-tertiary: #1a1a1a;
  --color-text-primary: #fafafa;
  --color-text-secondary: #a3a3a3;
  --color-border: #262626;
  
  /* Typography */
  --font-sans: 'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'Geist Mono', 'SF Mono', Monaco, 'Cascadia Code', monospace;
  --font-size-base: 1rem;
  --line-height-base: 1.6;
  
  /* Spacing */
  --space-xs: 0.5rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2rem;
  --space-xl: 3rem;
  
  /* Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  
  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
  --transition-slow: 0.3s ease;
}

/* Light mode overrides */
@media (prefers-color-scheme: light) {
  :root {
    --color-bg-primary: #ffffff;
    --color-bg-secondary: #fafafa;
    --color-bg-tertiary: #f5f5f5;
    --color-text-primary: #0a0a0a;
    --color-text-secondary: #525252;
    --color-border: #e5e5e5;
  }
}
```

### Base Styles

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: var(--font-sans);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  color: var(--color-text-secondary);
  background: var(--color-bg-primary);
  letter-spacing: -0.01em;
}

h1, h2, h3, h4, h5, h6 {
  color: var(--color-text-primary);
  font-weight: 600;
  line-height: 1.2;
}

code {
  font-family: var(--font-mono);
  font-size: 0.875em;
  background: var(--color-bg-secondary);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
}

pre code {
  background: none;
  padding: 0;
}

a {
  color: var(--color-brand);
  text-decoration: none;
  transition: opacity var(--transition-base);
}

a:hover {
  opacity: 0.8;
}
```

### Component Examples

```css
/* Button */
.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all var(--transition-base);
}

.btn-primary {
  background: var(--color-brand);
  color: var(--color-bg-primary);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

/* Card */
.card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
}

/* Code Block */
.code-block {
  background: #1a1b26;
  border-radius: var(--radius-md);
  padding: var(--space-md);
  overflow-x: auto;
}

.code-block code {
  font-size: 0.875rem;
  line-height: 1.6;
  color: #a9b1d6;
}
```

---

## 7. Implementation Checklist

### Phase 1: Foundation (Immediate)
- [ ] Install Geist fonts (Sans + Mono)
- [ ] Set up CSS variables in global stylesheet
- [ ] Create logo SVG (circle + wordmark)
- [ ] Generate ASCII logo for CLI

### Phase 2: Documentation (Week 1)
- [ ] Apply styles to Astro Starlight docs
- [ ] Configure syntax highlighting (Tokyo Night)
- [ ] Set up proper heading hierarchy
- [ ] Add logo to header

### Phase 3: Web UI (Week 2)
- [ ] Apply color palette to Cloudflare Workers UI
- [ ] Implement button and card components
- [ ] Test dark/light mode switching
- [ ] Verify WCAG contrast compliance

### Phase 4: CLI (Week 3)
- [ ] Add ASCII logo to `leger --version`
- [ ] Style help text with color codes (if supported)
- [ ] Implement spinner/progress indicators
- [ ] Format error messages according to voice guide

### Phase 5: Marketing (Week 4)
- [ ] Apply brand to Starlog changelog
- [ ] Create hero section for landing page
- [ ] Design feature cards
- [ ] Build screenshot templates

---

## 8. File Structure

Suggested asset organization:

```
/brand
  /logo
    leger-logo.svg           # Full lockup
    leger-icon.svg           # Circle only
    leger-logo-dark.svg      # Dark backgrounds
    leger-logo-light.svg     # Light backgrounds
  /fonts
    geist-sans/              # Variable font files
    geist-mono/              # Variable font files
  /colors
    palette.json             # Programmatic access
  /templates
    screenshot-frame.svg     # For docs/marketing
    social-card.svg          # OG images
```

---

## 9. Resources

### Fonts
- **Geist Sans & Mono:** https://vercel.com/font
- **License:** SIL Open Font License 1.1
- **Backup:** System fonts (SF Pro, Segoe UI)

### Design Tools
- **Figma:** Use for component design
- **Excalidraw:** Use for architecture diagrams
- **Carbon:** Use for code screenshots (https://carbon.now.sh)

### Color Tools
- **Contrast Checker:** https://contrast-ratio.com
- **Palette Generator:** https://uicolors.app
- **Dark Mode Testing:** Browser DevTools forced colors

### Inspiration
- Vercel Design: https://vercel.com/design
- Tailscale Brand: https://tailscale.com
- Astro Docs: https://docs.astro.build
- Linear Design: https://linear.app

---

## Version History

**v1.0** — October 2025  
Initial brand system. Covers logo, typography, colors, voice, and implementation guidelines.

---

**Questions or Feedback:**  
As you implement this system, track what works and what needs adjustment. Brand systems evolve with the product—this is your foundation, not your ceiling.

**Next Steps:**
1. Generate the logo SVG (I can help with this)
2. Install Geist fonts locally
3. Apply CSS variables to your Astro docs
4. Create ASCII art logo for CLI
5. Build first marketing page with brand applied

Ready to start implementing?
