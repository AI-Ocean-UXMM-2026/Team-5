# The Citadel Design System

**Status:** Draft foundation  
**Version:** 1.0  
**Updated:** 2026-10-21  
**Primary use:** The Citadel web app

> Measurements and color applications are recommended starting points. Validate the final implementation in real browser rendering and accessibility checks.

## 1. Product identity

The Citadel should feel structured, confident, human-centered, and authored—not like a generic AI-generated dashboard.

### Design principles

- **Clear before clever:** hierarchy and navigation should be immediately understandable.
- **Structured, not rigid:** use strong alignment with room for editorial moments.
- **Recognizable accents:** burgundy is the primary identity signal; yellow is selective.
- **Quiet surfaces, expressive details:** use white and soft gray as the canvas.
- **Useful motion:** motion should explain state, progress, or hierarchy.
- **Human scale:** preserve readable type, generous whitespace, and comfortable touch targets.

Avoid default purple/blue gradients, glassmorphism, excessive pill shapes, decorative blobs, oversized hero copy, and repeated floating cards.

## 2. Logo system

The logo system uses a modular citadel emblem with a bold lowercase wordmark. The emblem may stand alone for compact contexts.

### Logo assets

- [Primary logo lockup](./the-citadel-logo-set/the-citadel-logo-primary.png)
- [Reversed logo lockup](./the-citadel-logo-set/the-citadel-logo-reversed.png)
- [Primary icon](./the-citadel-logo-set/the-citadel-icon-primary.png)
- [App icon / favicon](./the-citadel-logo-set/the-citadel-app-icon.png)
- [Wordmark-only exploration](./the-citadel-logo-set/the-citadel-wordmark-logo.png)
- [Complete logo package](./the-citadel-logo-set.zip)

### Logo usage

| Context | Asset |
|---|---|
| Light web header | Primary logo lockup |
| Dark navigation or footer | Reversed logo lockup |
| Favicon, avatar, compact navigation | Primary icon or app icon |
| Splash screen or mobile shortcut | App icon |

- Preserve original proportions and clear space.
- Do not stretch, rotate, outline, shadow, or add gradients.
- Switch to the icon when the full logo becomes too small to read.
- Transparent pixels outside the app-icon tile are intentional; checkerboard pixels shown by image viewers are not part of the logo.
- These are raster PNG exports. Create a matching vector master before final brand registration or large-format production.
- Complete formal trademark clearance separately before public launch.

## 3. Color foundations

### Brand colors

| Token | Hex | Role |
|---|---|---|
| `brand.burgundy` | `#963D50` | Primary action, active state, focus, brand mark |
| `brand.yellow` | `#F8D064` | Highlight, progress, selected accent |

### Neutral colors

| Token | Hex | Role |
|---|---|---|
| `neutral.white` | `#FFFFFF` | Page and card surfaces |
| `neutral.50` | `#FAFAFB` | Subtle page tint |
| `neutral.100` | `#F7F7F8` | Search fields and quiet controls |
| `neutral.200` | `#F1F1F2` | Disabled surfaces |
| `neutral.300` | `#E8E8EA` | Borders and dividers |
| `neutral.500` | `#96969D` | Placeholder and tertiary text |
| `neutral.600` | `#6F7078` | Secondary text and icons |
| `neutral.900` | `#18181B` | Primary text |
| `neutral.black` | `#111111` | Strongest text and logo treatment |

Use color with text, icon, or shape changes. Never communicate a critical state with color alone.

## 4. Typography

- **Headings:** `Sora`
- **Body and interface:** `Plus Jakarta Sans`

| Token | Size / line height | Weight | Use |
|---|---:|---:|---|
| `type.display` | `48 / 56px` | 600–700 | Major product moments |
| `type.h1` | `36 / 44px` | 600 | Page titles |
| `type.h2` | `28 / 36px` | 600 | Major sections |
| `type.h3` | `22 / 30px` | 600 | Card groups |
| `type.h4` | `18 / 26px` | 600 | Component headings |
| `type.body-lg` | `16 / 24px` | 400–500 | Intro copy |
| `type.body` | `14 / 22px` | 400 | Default interface text |
| `type.body-sm` | `13 / 20px` | 400 | Supporting text |
| `type.caption` | `12 / 18px` | 500 | Metadata and labels |

Use Sora for hierarchy and Plus Jakarta Sans for inputs, buttons, navigation, and body content. Prefer sentence case.

## 5. Spacing, layout, and shape

### Spacing scale

Use a 4px base unit: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64px`.

### Layout guidance

- Desktop content max width: approximately `1200–1280px`.
- Page side padding: `24px` mobile, `32px` tablet, `48px` desktop starting points.
- Use a 12-column desktop grid and a 4-column mobile grid when useful.
- Prefer a strong primary column with supporting content over equal-weight panels everywhere.

### Shape tokens

| Token | Value | Use |
|---|---:|---|
| `radius.sm` | `8px` | Small controls and tags |
| `radius.md` | `12px` | Search bars, inputs, buttons |
| `radius.lg` | `16px` | Cards and panels |
| `radius.xl` | `24px` | Feature surfaces |
| `radius.full` | `999px` | Pills only when semantically appropriate |

Keep elevation low. Use borders or subtle shadows for separation, not both by default.

## 6. Iconography and imagery

- Use simple rounded line icons with consistent stroke weight.
- Recommended icon sizes: `16px`, `18px`, `20px`, and `24px`.
- Use the modular citadel emblem for brand identity, not as a generic decorative icon.
- Keep illustrations simple, high-contrast, and purposeful.
- Provide text alternatives for meaningful images.

## 7. Core components

### Buttons

- **Primary:** burgundy fill, white text.
- **Secondary:** white or soft-gray fill, neutral text, subtle border.
- **Tertiary:** text-only, burgundy or neutral text.

Use `40px` default height and `44px` minimum touch height. Use `12px` radius and clear hover/focus states.

### Inputs

- Height: `40px` desktop, `44px` touch.
- Surface: white or soft gray.
- Border: `1px` neutral border.
- Focus: burgundy border plus visible focus ring.
- Keep labels available to assistive technology.

### Cards and panels

- Use cards to group related content, not to decorate every section.
- Recommended padding: `20–24px`.
- Recommended radius: `16px`.
- Use a border or very light elevation, not both by default.

### Navigation

- Keep primary navigation visually quiet.
- Use the full logo in wide layouts and the icon in compact layouts.
- Active navigation may use burgundy, a soft burgundy-tinted surface, or a clear indicator.
- Preserve keyboard focus and logical tab order.

## 8. Search bar component

The search bar is a compact navigation and discovery control with a soft-gray surface, leading magnifier, editable input, optional divider, and optional trailing utility.

### Anatomy

`Container → leading icon → input → optional divider → optional trailing utility`

### Recommended desktop sizing

| Property | Value |
|---|---:|
| Width | `280px` starting point; allow `240–360px` |
| Height | `40px` |
| Radius | `12px` |
| Horizontal padding | `12px` |
| Internal gap | `10px` |
| Leading icon | `18×18px` |
| Divider | `1×20px` |
| Text | `14 / 20px` |

### States

- **Default:** soft-gray surface, muted placeholder, no heavy shadow.
- **Hover:** slightly darker surface or subtle neutral border.
- **Focus-visible:** burgundy border and external focus ring.
- **Filled:** primary text and optional clear action.
- **Disabled:** disabled surface and native disabled semantics.
- **Loading:** preserve the query and show progress only when needed.

### Search behavior

- Use a native `input type="search"` whenever possible.
- Clicking the container focuses the input.
- `Enter` submits or confirms the search.
- `Escape` closes suggestions or the overlay without unexpectedly erasing the query.
- A clear action returns focus to the input.
- Use an accessible combobox/listbox pattern for suggestions.

## 9. Motion and interaction

- Use short transitions for hover, focus, expand, and dismiss behavior.
- Favor opacity, color, and small position changes over large movement.
- Use motion to explain cause and effect.
- Respect `prefers-reduced-motion`.

## 10. Accessibility requirements

- Meet WCAG contrast requirements for text, controls, and focus indicators.
- Provide visible keyboard focus with `:focus-visible`.
- Keep interactive targets at least `44×44px` on touch surfaces.
- Use semantic HTML before ARIA enhancements.
- Provide accessible names for icon-only controls.
- Do not use placeholder text as the only label.
- Preserve logical heading hierarchy.
- Support keyboard navigation for menus, dialogs, comboboxes, and popovers.
- Announce meaningful asynchronous result changes appropriately.
- Associate error messages with the relevant field.

## 11. Do / don’t

### Do

- Use burgundy for primary identity and active emphasis.
- Use yellow in small, intentional moments such as progress or selection.
- Keep white and soft gray as the main canvas.
- Use the logo set consistently across header, favicon, mobile, and dark-surface contexts.
- Combine strong hierarchy with generous whitespace.

### Don’t

- Don’t use the logo as a decorative pattern or background texture.
- Don’t recreate or retype the logo using a substitute font.
- Don’t use yellow for small body text or as the only focus state.
- Don’t make every component a floating rounded card.
- Don’t rely on AI-generated text or iconography without review.
- Don’t treat the name or logo as legally cleared without trademark review.

## 12. Web implementation tokens

```css
:root {
  --citadel-burgundy: #963D50;
  --citadel-yellow: #F8D064;
  --citadel-white: #FFFFFF;
  --citadel-surface-subtle: #F7F7F8;
  --citadel-surface-disabled: #F1F1F2;
  --citadel-border: #E8E8EA;
  --citadel-text-primary: #18181B;
  --citadel-text-secondary: #6F7078;
  --citadel-text-placeholder: #96969D;
  --citadel-radius-control: 12px;
  --citadel-radius-card: 16px;
  --citadel-focus-ring: rgb(150 61 80 / 20%);
  --citadel-font-heading: "Sora", sans-serif;
  --citadel-font-body: "Plus Jakarta Sans", sans-serif;
}
```

## 13. Delivery checklist

- [ ] Load Sora and Plus Jakarta Sans.
- [ ] Add the logo assets to the web project.
- [ ] Set up color, typography, spacing, radius, and focus tokens.
- [ ] Implement responsive navigation and search-bar states.
- [ ] Test keyboard, screen-reader, focus, and touch behavior.
- [ ] Validate contrast in light and dark surfaces.
- [ ] Review new components against the differentiation principle.
- [ ] Complete trademark and brand clearance before public launch.

