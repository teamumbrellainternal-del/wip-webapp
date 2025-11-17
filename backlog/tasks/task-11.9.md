---
id: task-11.9
title: "Branding Assets"
status: "To Do"
assignee: []
created_date: "2025-11-17"
labels: ["frontend", "P1", "branding"]
milestone: "M11 - Pre-Launch Readiness & Compliance"
dependencies: []
estimated_hours: 2
---

## Description
Generate and add favicon and app icons in all required sizes for browser tabs and mobile home screens.

## Acceptance Criteria
- [ ] Favicon.ico created (16x16, 32x32, 48x48)
- [ ] PNG favicons created (32x32, 96x96, 192x192)
- [ ] Apple touch icon created (180x180)
- [ ] Android chrome icons created (192x192, 512x512)
- [ ] Web manifest file created (manifest.json)
- [ ] All icons linked in index.html <head>
- [ ] Icons use Umbrella brand colors
- [ ] Icons recognizable at small sizes
- [ ] Tested on multiple browsers (Chrome, Safari, Firefox)
- [ ] Tested on mobile (iOS "Add to Home Screen", Android)

## Implementation Plan
1. Design icon:
   - Use Umbrella logo or simplified version
   - Must work at 16x16px (simple design)
   - Use brand kit colors
   - Save as SVG for scaling
2. Generate all sizes:
   - Use favicon generator (realfavicongenerator.net or favicon.io)
   - Upload SVG/high-res PNG
   - Download all generated sizes
3. Add to public/ directory:
   - public/favicon.ico
   - public/favicon-16x16.png
   - public/favicon-32x32.png
   - public/favicon-96x96.png
   - public/apple-touch-icon.png
   - public/android-chrome-192x192.png
   - public/android-chrome-512x512.png
   - public/site.webmanifest
4. Update index.html <head>:
   ```html
   <link rel="icon" type="image/x-icon" href="/favicon.ico">
   <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
   <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">
   <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
   <link rel="manifest" href="/site.webmanifest">
   ```
5. Create site.webmanifest:
   ```json
   {
     "name": "Umbrella",
     "short_name": "Umbrella",
     "icons": [
       { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
       { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" }
     ],
     "theme_color": "#8B5CF6",
     "background_color": "#ffffff",
     "display": "standalone"
   }
   ```
6. Test:
   - Open in browser, check tab icon
   - Add to home screen on iOS
   - Add to home screen on Android
   - Verify correct icon and name

## Notes & Comments
**Priority:** P1 - Important for branding (not launch blocking but very visible)

**Files to Create:**
- public/favicon.ico
- public/favicon-*.png
- public/apple-touch-icon.png
- public/android-chrome-*.png
- public/site.webmanifest

**Files to Modify:**
- index.html (add icon links)

**Icon Design:** Keep simple (complex logos don't work at 16x16). Use high contrast. Test at smallest size first.

**PWA Note:** site.webmanifest enables "Add to Home Screen" (basic PWA support). For full PWA (offline, push notifications), need Service Worker (future enhancement).

