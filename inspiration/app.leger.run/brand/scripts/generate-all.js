const fs = require('fs');
const path = require('path');

// Load design tokens
const tokens = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../tokens/design-tokens.json'), 'utf8')
);

// Ensure dist directory exists
const distDir = path.join(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// =============================================================================
// GENERATE FONTS.CSS
// =============================================================================
function generateFontCSS() {
  const css = `/**
 * Geist Font Family - Variable Fonts
 * License: SIL Open Font License 1.1
 * Generated from leger-labs-brand
 */

@font-face {
  font-family: 'Geist Sans';
  src: url('./fonts/geist-sans/GeistVF.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Geist Mono';
  src: url('./fonts/geist-sans/GeistMonoVF.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
`;

  fs.writeFileSync(path.join(distDir, 'fonts.css'), css);
  console.log('✅ Generated fonts.css');
}

// =============================================================================
// COPY FONTS TO DISTRIBUTION
// =============================================================================
function copyFontsToDistribution() {
  const fontsSource = path.join(__dirname, '../fonts');
  const fontsDest = path.join(__dirname, '../dist/fonts');
  
  console.log('📦 Copying fonts from', fontsSource, 'to', fontsDest);
  
  // Check if source fonts directory exists
  if (!fs.existsSync(fontsSource)) {
    console.error('❌ Error: Fonts directory not found at', fontsSource);
    throw new Error('Fonts directory not found - run download-fonts.js first');
  }
  
  // Recursively copy fonts directory to dist
  function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src, { withFileTypes: true });
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
        console.log('  ✓ Copied', entry.name);
      }
    }
  }
  
  try {
    copyDir(fontsSource, fontsDest);
    console.log('✅ Copied fonts to dist/fonts/');
    
    // Verify the copy worked
    if (!fs.existsSync(path.join(fontsDest, 'geist-sans'))) {
      throw new Error('Font copy verification failed');
    }
    console.log('✓ Verified fonts in dist/fonts/');
  } catch (error) {
    console.error('❌ Error copying fonts:', error.message);
    throw error;
  }
}

// =============================================================================
// GENERATE TOKENS.CSS (HSL FORMAT FOR TAILWIND OPACITY)
// =============================================================================
function hexToHSL(hex) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
}

function generateTokensCSS() {
  const lines = [
    '/**',
    ' * Leger Labs Design System - CSS Custom Properties',
    ' * Generated from design-tokens.json',
    ' * HSL format for Tailwind opacity modifiers',
    ' */',
    '',
    '@layer base {',
    '  :root {',
  ];

  // Primary brand color (yellow) - HSL format for Tailwind
  lines.push('    /* Brand - Catppuccin Yellow (HSL for opacity) */');
  lines.push(`    --primary: ${hexToHSL(tokens.colors.brand.primary.DEFAULT)};`);
  lines.push(`    --primary-foreground: ${hexToHSL(tokens.colors.dark.background.primary)};`);
  lines.push('');

  // Background colors - map to your existing CSS var names
  lines.push('    /* Backgrounds - Dark Mode (Catppuccin Mocha) */');
  lines.push(`    --background: ${hexToHSL(tokens.colors.dark.background.primary)};`);
  lines.push(`    --foreground: ${hexToHSL(tokens.colors.dark.text.primary)};`);
  lines.push('');
  
  lines.push('    /* Cards */');
  lines.push(`    --card: ${hexToHSL(tokens.colors.dark.background.secondary)};`);
  lines.push(`    --card-foreground: ${hexToHSL(tokens.colors.dark.text.primary)};`);
  lines.push('');
  
  lines.push('    /* Popovers */');
  lines.push(`    --popover: ${hexToHSL(tokens.colors.dark.background.tertiary)};`);
  lines.push(`    --popover-foreground: ${hexToHSL(tokens.colors.dark.text.primary)};`);
  lines.push('');
  
  lines.push('    /* Secondary */');
  lines.push(`    --secondary: ${hexToHSL(tokens.colors.dark.background.secondary)};`);
  lines.push(`    --secondary-foreground: ${hexToHSL(tokens.colors.dark.text.primary)};`);
  lines.push('');
  
  lines.push('    /* Muted */');
  lines.push(`    --muted: ${hexToHSL(tokens.colors.dark.text.tertiary)};`);
  lines.push(`    --muted-foreground: ${hexToHSL(tokens.colors.dark.text.secondary)};`);
  lines.push('');
  
  lines.push('    /* Accent - Catppuccin Lavender */');
  lines.push(`    --accent: ${hexToHSL(tokens.colors.catppuccin.lavender)};`);
  lines.push(`    --accent-foreground: ${hexToHSL(tokens.colors.dark.background.primary)};`);
  lines.push('');
  
  lines.push('    /* Destructive - Catppuccin Red */');
  lines.push(`    --destructive: ${hexToHSL(tokens.colors.catppuccin.red)};`);
  lines.push(`    --destructive-foreground: ${hexToHSL(tokens.colors.dark.text.primary)};`);
  lines.push('');
  
  lines.push('    /* Borders */');
  lines.push(`    --border: ${hexToHSL(tokens.colors.dark.border.primary)};`);
  lines.push(`    --input: ${hexToHSL(tokens.colors.dark.border.primary)};`);
  lines.push(`    --ring: ${hexToHSL(tokens.colors.brand.primary.DEFAULT)};`);
  lines.push('');
  
  // Full Catppuccin palette (hex format for direct use)
  lines.push('    /* Catppuccin Mocha Palette (hex) */');
  Object.entries(tokens.colors.catppuccin).forEach(([key, value]) => {
    lines.push(`    --catppuccin-${key}: ${value};`);
  });
  lines.push('');
  
  // Border radius
  lines.push('    /* Border Radius */');
  lines.push(`    --radius: ${tokens.borderRadius.md};`);
  lines.push('');
  
  lines.push('  }');
  lines.push('');
  
  // Light mode overrides
  lines.push('  .light {');
  lines.push(`    --background: 0 0% 100%;`);
  lines.push(`    --foreground: ${hexToHSL(tokens.colors.light.text.primary)};`);
  lines.push(`    --card: 0 0% 100%;`);
  lines.push(`    --card-foreground: ${hexToHSL(tokens.colors.light.text.primary)};`);
  lines.push(`    --popover: 0 0% 100%;`);
  lines.push(`    --popover-foreground: ${hexToHSL(tokens.colors.light.text.primary)};`);
  lines.push(`    --primary: ${hexToHSL(tokens.colors.brand.primary.DEFAULT)};`);
  lines.push(`    --primary-foreground: ${hexToHSL(tokens.colors.light.text.primary)};`);
  lines.push(`    --secondary: ${hexToHSL(tokens.colors.light.background.secondary)};`);
  lines.push(`    --secondary-foreground: ${hexToHSL(tokens.colors.light.text.primary)};`);
  lines.push(`    --muted: ${hexToHSL(tokens.colors.light.background.tertiary)};`);
  lines.push(`    --muted-foreground: ${hexToHSL(tokens.colors.light.text.secondary)};`);
  lines.push(`    --accent: ${hexToHSL(tokens.colors.catppuccin.lavender)};`);
  lines.push(`    --accent-foreground: ${hexToHSL(tokens.colors.light.text.primary)};`);
  lines.push(`    --destructive: ${hexToHSL(tokens.colors.semantic.error.DEFAULT)};`);
  lines.push(`    --destructive-foreground: 0 0% 100%;`);
  lines.push(`    --border: ${hexToHSL(tokens.colors.light.border.primary)};`);
  lines.push(`    --input: ${hexToHSL(tokens.colors.light.border.primary)};`);
  lines.push(`    --ring: ${hexToHSL(tokens.colors.brand.primary.DEFAULT)};`);
  lines.push('  }');
  lines.push('}');
  lines.push('');
  
  // Base styles matching your existing setup
  lines.push('@layer base {');
  lines.push('  * {');
  lines.push('    @apply border-border;');
  lines.push('  }');
  lines.push('  body {');
  lines.push('    @apply bg-background text-foreground;');
  lines.push('    font-feature-settings: "rlig" 1, "calt" 1;');
  lines.push('  }');
  lines.push('}');
  lines.push('');
  
  // ==========================================================================
  // VERCEL-STYLE TYPOGRAPHY UTILITY CLASSES
  // ==========================================================================
  lines.push('/* ============================================');
  lines.push('   VERCEL-STYLE TYPOGRAPHY UTILITIES');
  lines.push('   Auto-generated from design-tokens.json');
  lines.push('   ============================================ */');
  lines.push('');
  
  // Heading classes
  lines.push('/* Headings */');
  const headingSizes = [
    { size: '72', lineHeight: '72', letterSpacing: '-4.32px' },
    { size: '64', lineHeight: '64', letterSpacing: '-3.84px' },
    { size: '56', lineHeight: '60', letterSpacing: '-2.8px' },
    { size: '48', lineHeight: '56', letterSpacing: '-1.92px' },
    { size: '40', lineHeight: '48', letterSpacing: '-1.6px' },
    { size: '32', lineHeight: '40', letterSpacing: '-1.28px' },
    { size: '24', lineHeight: '32', letterSpacing: '-0.96px' },
    { size: '20', lineHeight: '28', letterSpacing: '-0.8px' },
    { size: '16', lineHeight: '24', letterSpacing: '-0.32px' },
  ];
  
  headingSizes.forEach(({ size, lineHeight, letterSpacing }) => {
    lines.push(`.text-heading-${size} {`);
    lines.push(`  font-family: ${tokens.typography.fontFamily.sans};`);
    lines.push(`  font-size: ${size}px;`);
    lines.push(`  font-weight: 600;`);
    lines.push(`  line-height: ${lineHeight}px;`);
    lines.push(`  letter-spacing: ${letterSpacing};`);
    lines.push('}');
    lines.push('');
  });
  
  // Copy/Body text classes
  lines.push('/* Copy (Body Text) */');
  const copySizes = [
    { size: '24', lineHeight: '36' },
    { size: '20', lineHeight: '30' },
    { size: '18', lineHeight: '28' },
    { size: '16', lineHeight: '24' },
    { size: '14', lineHeight: '20' },
    { size: '13', lineHeight: '20' },
  ];
  
  copySizes.forEach(({ size, lineHeight }) => {
    lines.push(`.text-copy-${size} {`);
    lines.push(`  font-family: ${tokens.typography.fontFamily.sans};`);
    lines.push(`  font-size: ${size}px;`);
    lines.push(`  font-weight: 400;`);
    lines.push(`  line-height: ${lineHeight}px;`);
    lines.push('}');
    lines.push('');
  });
  
  // Label classes
  lines.push('/* Labels */');
  const labelSizes = [
    { size: '20', lineHeight: '20' },
    { size: '18', lineHeight: '20' },
    { size: '16', lineHeight: '20' },
    { size: '14', lineHeight: '20' },
    { size: '13', lineHeight: '20' },
    { size: '12', lineHeight: '16' },
  ];
  
  labelSizes.forEach(({ size, lineHeight }) => {
    lines.push(`.text-label-${size} {`);
    lines.push(`  font-family: ${tokens.typography.fontFamily.sans};`);
    lines.push(`  font-size: ${size}px;`);
    lines.push(`  font-weight: 400;`);
    lines.push(`  line-height: ${lineHeight}px;`);
    lines.push('}');
    lines.push('');
    
    // Mono variant
    lines.push(`.text-label-${size}-mono {`);
    lines.push(`  font-family: ${tokens.typography.fontFamily.mono};`);
    lines.push(`  font-size: ${size}px;`);
    lines.push(`  font-weight: 400;`);
    lines.push(`  line-height: ${lineHeight}px;`);
    lines.push('}');
    lines.push('');
  });
  
  // Button classes
  lines.push('/* Buttons */');
  const buttonSizes = [
    { size: '16', lineHeight: '20' },
    { size: '14', lineHeight: '18' },
    { size: '12', lineHeight: '16' },
  ];
  
  buttonSizes.forEach(({ size, lineHeight }) => {
    lines.push(`.text-button-${size} {`);
    lines.push(`  font-family: ${tokens.typography.fontFamily.sans};`);
    lines.push(`  font-size: ${size}px;`);
    lines.push(`  font-weight: 500;`);
    lines.push(`  line-height: ${lineHeight}px;`);
    lines.push('}');
    lines.push('');
  });
  
  // Strong modifiers
  lines.push('/* Font weight modifiers */');
  lines.push('[class^="text-copy-"] strong,');
  lines.push('[class^="text-label-"] strong {');
  lines.push('  font-weight: 500;');
  lines.push('}');
  lines.push('');
  lines.push('[class^="text-heading-"] strong {');
  lines.push('  font-weight: 700;');
  lines.push('}');

  const css = lines.join('\n');
  fs.writeFileSync(path.join(distDir, 'tokens.css'), css);
  console.log('✅ Generated tokens.css (HSL format + utility classes)');
}

// =============================================================================
// GENERATE TAILWIND PRESET
// =============================================================================
function generateTailwindPreset() {
  const preset = {
    darkMode: ['class'],
    content: [],
    theme: {
      container: {
        center: true,
        padding: '2rem',
        screens: {
          '2xl': '1400px',
        },
      },
      extend: {
        colors: {
          border: 'hsl(var(--border))',
          input: 'hsl(var(--input))',
          ring: 'hsl(var(--ring))',
          background: 'hsl(var(--background))',
          foreground: 'hsl(var(--foreground))',
          primary: {
            DEFAULT: 'hsl(var(--primary))',
            foreground: 'hsl(var(--primary-foreground))',
          },
          secondary: {
            DEFAULT: 'hsl(var(--secondary))',
            foreground: 'hsl(var(--secondary-foreground))',
          },
          destructive: {
            DEFAULT: 'hsl(var(--destructive))',
            foreground: 'hsl(var(--destructive-foreground))',
          },
          muted: {
            DEFAULT: 'hsl(var(--muted))',
            foreground: 'hsl(var(--muted-foreground))',
          },
          accent: {
            DEFAULT: 'hsl(var(--accent))',
            foreground: 'hsl(var(--accent-foreground))',
          },
          popover: {
            DEFAULT: 'hsl(var(--popover))',
            foreground: 'hsl(var(--popover-foreground))',
          },
          card: {
            DEFAULT: 'hsl(var(--card))',
            foreground: 'hsl(var(--card-foreground))',
          },
          // Full Catppuccin palette
          catppuccin: tokens.colors.catppuccin,
        },
        borderRadius: {
          lg: 'var(--radius)',
          md: 'calc(var(--radius) - 2px)',
          sm: 'calc(var(--radius) - 4px)',
        },
        fontFamily: {
          sans: tokens.typography.fontFamily.sans.split(',').map(f => f.trim()),
          mono: tokens.typography.fontFamily.mono.split(',').map(f => f.trim()),
        },
        fontSize: (() => {
          const sizes = {};
          Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
            const lineHeight = tokens.typography.lineHeight[key];
            const letterSpacing = tokens.typography.letterSpacing[`heading-${key}`] || '0';
            sizes[key] = [value, { lineHeight, letterSpacing, fontWeight: '600' }];
          });
          return sizes;
        })(),
        fontWeight: tokens.typography.fontWeight,
        spacing: tokens.spacing,
        boxShadow: {
          sm: tokens.boxShadow.sm,
          DEFAULT: tokens.boxShadow.md,
          md: tokens.boxShadow.md,
          lg: tokens.boxShadow.lg,
          xl: tokens.boxShadow.xl,
        },
        keyframes: {
          'accordion-down': {
            from: { height: '0' },
            to: { height: 'var(--radix-accordion-content-height)' },
          },
          'accordion-up': {
            from: { height: 'var(--radix-accordion-content-height)' },
            to: { height: '0' },
          },
        },
        animation: {
          'accordion-down': 'accordion-down 0.2s ease-out',
          'accordion-up': 'accordion-up 0.2s ease-out',
        },
      },
    },
  };

  const output = `// Generated from design-tokens.json - DO NOT EDIT
module.exports = ${JSON.stringify(preset, null, 2)};
`;

  fs.writeFileSync(path.join(distDir, 'tailwind.preset.cjs'), output);
  console.log('✅ Generated tailwind.preset.cjs');
}

// =============================================================================
// GENERATE JS MODULE
// =============================================================================
function generateJSModule() {
  const output = `// Generated from design-tokens.json - DO NOT EDIT
export const tokens = ${JSON.stringify(tokens, null, 2)};

// Convenience exports
export const colors = tokens.colors;
export const typography = tokens.typography;
export const spacing = tokens.spacing;
export const borderRadius = tokens.borderRadius;
export const boxShadow = tokens.boxShadow;
export const transitionDuration = tokens.transitionDuration;
export const zIndex = tokens.zIndex;

export default tokens;
`;

  fs.writeFileSync(path.join(distDir, 'tokens.js'), output);
  console.log('✅ Generated tokens.js');
}

// =============================================================================
// RUN ALL GENERATORS
// =============================================================================
generateFontCSS();
copyFontsToDistribution();
generateTokensCSS();
generateTailwindPreset();
generateJSModule();

console.log('\n✅ All design system files generated successfully!');
console.log('\n📦 Generated files:');
console.log('  - dist/fonts.css');
console.log('  - dist/fonts/ (copied font files)');
console.log('  - dist/tokens.css (HSL variables + utility classes)');
console.log('  - dist/tailwind.preset.cjs');
console.log('  - dist/tokens.js');
