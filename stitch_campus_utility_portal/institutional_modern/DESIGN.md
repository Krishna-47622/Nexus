---
name: Institutional Modern
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#43474e'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#455f87'
  primary: '#022448'
  on-primary: '#ffffff'
  primary-container: '#1e3a5f'
  on-primary-container: '#8aa4cf'
  inverse-primary: '#adc8f5'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#341f00'
  on-tertiary: '#ffffff'
  tertiary-container: '#503300'
  on-tertiary-container: '#c69b5f'
  error: '#DC2626'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#adc8f5'
  on-primary-fixed: '#001c3b'
  on-primary-fixed-variant: '#2d486d'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffddb2'
  tertiary-fixed-dim: '#edbf7f'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#60410c'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
  surface-glass: rgba(255, 255, 255, 0.7)
  success: '#10B981'
  warning: '#F59E0B'
  border-light: rgba(255, 255, 255, 0.3)
  border-dark: rgba(30, 58, 95, 0.1)
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  container-max: 1280px
---

## Brand & Style

The design system is built on the philosophy of "Institutional Logic," blending the authoritative nature of academic administration with the fluidity of modern technology. The brand personality is professional, efficient, and transparent.

The aesthetic follows a **Glassmorphism-lite** approach within a **Minimalist** framework. It utilizes high-density layouts that remain legible through strict structural alignment and rhythmic whitespace. The core visual metaphor is "The Glass Reveal"—where information surfaces through semi-transparent, blurred layers, suggesting depth and clarity in a complex ecosystem. Use high-tech precision, sharp detailing, and an absence of traditional shadows in favor of light-reflecting borders.

## Colors

The color palette is anchored by **Deep Navy (#1E3A5F)**, providing a foundation of institutional trust. This is balanced by **Glass Surfaces**, which use a semi-transparent white mix to prevent the UI from feeling heavy.

- **Primary:** Use the Navy for headers, primary navigation backgrounds, and high-level headings.
- **Secondary (Action):** A vibrant Blue (#3B82F6) is reserved for interactive elements like primary buttons and active states.
- **Semantic Logic:** Emerald Green for success/approvals, Crimson for errors/rejections, and Amber for warnings/pending status.
- **Surface Strategy:** Backgrounds should be a soft off-white or light slate, with interactive "glass" cards overlaying them.

## Typography

This design system utilizes **Inter** exclusively to maintain a utilitarian, high-precision feel. 

- **Hierarchy:** Use bold weights for headlines to create a "strong" institutional presence. 
- **Labels:** Small labels use increased letter spacing and semi-bold weights for high legibility in dense data views.
- **Color Application:** Headings should predominantly use the primary Navy color, while body text uses a dark slate for optimal reading contrast.

## Layout & Spacing

The layout follows a **Fluid Grid** model with high information density. 

- **Grid:** Use a 12-column grid for desktop and a 4-column grid for mobile.
- **Density:** Elements are packed efficiently using a 4px base unit. Vertical rhythm should be tight (16px or 24px between logical groups) to maximize the visible data on a single screen.
- **Margins:** Desktop views should maintain a generous 32px outer margin to frame the content, while mobile uses 16px to maximize horizontal real estate.

## Elevation & Depth

Depth is communicated through **Backdrop Blurs** rather than shadows. 

1. **Surface 0 (Base):** Solid light slate background.
2. **Surface 1 (Cards):** `rgba(255, 255, 255, 0.7)` with a `10px` backdrop-blur and a `1px` solid border (`rgba(30, 58, 95, 0.1)`).
3. **Surface 2 (Modals/Popovers):** `rgba(255, 255, 255, 0.9)` with a `20px` backdrop-blur and a more pronounced `1px` border.

Avoid all drop shadows. Depth is purely a result of the frosted glass effect and subtle contrast in border opacity.

## Shapes

The shape language is disciplined and professional. 

- **Corner Radius:** Standard components (buttons, inputs) use a **4px (Soft)** radius. Larger containers like cards may use up to **8px** for a slightly friendlier touch on mobile interfaces. 
- **Consistency:** Maintain sharp internal corners within nested components to reinforce the "Institutional Modern" aesthetic.

## Components

- **Buttons:** Primary buttons are solid vibrant blue (#3B82F6) with white text. Secondary buttons use the Navy text with a 1px Navy border.
- **Glass Cards:** The signature component. These must have `backdrop-filter: blur(10px)` and a thin 1px border. Used for student IDs, course modules, and schedule items.
- **Inputs:** Clean, white backgrounds with 1px borders that change to the vibrant blue on focus. Use "Inter" for all placeholder and input text.
- **Chips/Badges:** Small, 4px rounded rectangles with light tinted backgrounds corresponding to their status (e.g., light green background with dark green text for "Approved").
- **Lists:** High-density rows with 1px horizontal separators. Use the "Label-md" style for metadata and "Body-md" for primary list content.
- **Status Indicators:** Use small circular dots (8px) using the semantic color tokens to indicate live status or urgency without cluttering the UI.