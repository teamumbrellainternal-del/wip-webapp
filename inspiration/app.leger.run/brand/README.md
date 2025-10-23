# Leger Labs Brand Assets

This directory contains core brand assets for Leger Labs.

## Directory Structure
```
assets/
├── logo/
│   ├── leger-logo.svg           # Full lockup (circle + wordmark)
│   ├── leger-icon.svg           # Circle only
│   ├── leger-logo-dark.svg      # Optimized for dark backgrounds
│   ├── leger-logo-light.svg     # Optimized for light backgrounds
│   └── leger-logo.png           # Raster version (1024x1024)
├── colors/
│   └── palette.json             # Programmatic color access
├── templates/
│   ├── screenshot-frame.svg     # Browser window frame
│   └── social-card-template.svg # OG image template
└── examples/
    └── usage-examples.md
```

## Usage

- **Web/Digital:** Use SVG versions for crisp rendering at any size
- **Print:** Export SVG to high-res PNG/PDF at required dimensions
- **Social Media:** Use templates in `templates/` directory
- **Code/CLI:** See `ascii-logo.txt` in root directory

## Logo Guidelines

### Minimum Sizes
- Icon only: 16px minimum
- Full lockup: 80px minimum width

### Clear Space
Maintain clear space equal to 0.5x the circle diameter on all sides.

### Color Treatments
- Dark backgrounds: White logo (`leger-logo-dark.svg`)
- Light backgrounds: Black logo (`leger-logo-light.svg`)
- Always ensure sufficient contrast (WCAG AA minimum)

## Questions?

Refer to the complete brand guide at `/docs/brand-guide.md`
