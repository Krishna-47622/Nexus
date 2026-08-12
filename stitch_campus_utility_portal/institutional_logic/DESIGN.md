---
name: Institutional Logic
colors:
  surface: '#f7fafc'
  surface-dim: '#d7dadc'
  surface-bright: '#f7fafc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f6'
  surface-container: '#ebeef0'
  surface-container-high: '#e5e9eb'
  surface-container-highest: '#e0e3e5'
  on-surface: '#181c1e'
  on-surface-variant: '#43474e'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eef1f3'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#455f88'
  primary: '#002045'
  on-primary: '#ffffff'
  primary-container: '#1a365d'
  on-primary-container: '#86a0cd'
  inverse-primary: '#adc7f7'
  secondary: '#545f72'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f7'
  on-secondary-container: '#586377'
  tertiary: '#1b2127'
  on-tertiary: '#ffffff'
  tertiary-container: '#30363c'
  on-tertiary-container: '#989fa6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#adc7f7'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#2d476f'
  secondary-fixed: '#d8e3fa'
  secondary-fixed-dim: '#bcc7dd'
  on-secondary-fixed: '#111c2c'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#dde3eb'
  tertiary-fixed-dim: '#c1c7cf'
  on-tertiary-fixed: '#161c22'
  on-tertiary-fixed-variant: '#41474e'
  background: '#f7fafc'
  on-background: '#181c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 12px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is rooted in institutional clarity and utilitarian efficiency. It is designed for a campus environment where information density and navigational speed are prioritized over decorative elements. The brand personality is authoritative, reliable, and academic.

The design style follows a **Strict Minimalism** approach combined with **Institutional Brutalism**. It rejects depth, shadows, and rounded corners in favor of a flat, grid-based architecture. Every element serves a functional purpose, utilizing high-contrast borders and structured layouts to organize complex campus data into digestible, actionable interfaces. The emotional response is one of order, competence, and focus.

## Colors

The palette is restricted to a professional, academic spectrum to ensure legibility and a serious tone.

- **Primary (Navy - #1A365D):** Reserved for core brand elements, primary actions, and high-level headers. It denotes authority and stability.
- **Secondary (Slate - #4A5568):** Used for body text, icons, and secondary information where contrast remains critical but hierarchy must be lowered.
- **Tertiary/Border (Light Steel - #E2E8F0):** The structural backbone of the UI. This color is used exclusively for 1px borders to define containers and separate list items.
- **Neutral/Background (Light Grey - #F7FAFC):** A subtle, off-white background color that reduces eye strain compared to pure white while maintaining a clean, institutional feel.

## Typography

This design system utilizes **Inter** for all roles to maintain a systematic and utilitarian appearance. The typeface was chosen for its exceptional legibility at small sizes, which is critical for high-density campus schedules and data tables.

- **Headlines:** Use bold weights and slight negative letter-spacing for a grounded, impactful look.
- **Body:** Standardized on 14px and 16px to balance information density with readability.
- **Labels:** Small caps or bold weights are used for metadata, such as course codes or room numbers, to differentiate them from prose.
- **Scaling:** On mobile, large headlines scale down significantly to prevent line-wrapping in narrow columns.

## Layout & Spacing

The layout philosophy is based on a **high-density fluid grid**. Efficiency of space is paramount, allowing students and staff to see maximum information with minimal scrolling.

- **Grid Model:** A 12-column system is used for desktop, 6-column for tablet, and 4-column for mobile. 
- **Density:** Spacing is tighter than consumer-facing apps. Use `8px` (sm) for internal element padding and `12px` (gutter) for separation between distinct components.
- **Alignment:** All elements must align strictly to the 4px baseline grid. Containers should span the full width of their grid columns to maintain a modular, "blocked" appearance.

## Elevation & Depth

This design system adopts a **Flat/Zero-Depth** model. Depth is conveyed through structural containment and tonal shifts rather than shadows.

- **No Shadows:** Shadows are strictly prohibited. Elevation is never used to lift elements off the page.
- **Outlines:** Physical separation is achieved via `1px` solid borders using the `#E2E8F0` token.
- **Layering:** To indicate a modal or temporary overlay, use a solid `1px` border of Navy (#1A365D) or a high-contrast Slate (#4A5568) to differentiate the "top" layer from the background.
- **Surface Tones:** Use the Neutral background (#F7FAFC) for the main canvas and pure white (#FFFFFF) for interactive zones like input fields and card interiors to signal "workable" areas.

## Shapes

The shape language is **strictly orthogonal**. All corners are sharp (0px radius) to reflect a professional, institutional aesthetic. 

- **Containers:** All cards, buttons, inputs, and modals must have square corners.
- **Consistency:** Even in the case of "pills" or "tags," keep corners sharp. Do not use rounded caps for progress bars or selection indicators.

## Components

### Buttons
- **Primary:** Solid Navy (#1A365D) fill with White text. 0px radius.
- **Secondary:** Transparent fill with a 1px Slate (#4A5568) border. 0px radius.
- **Sizing:** Compact height (32px or 40px) to maintain the high-density requirement.

### Input Fields
- **Styling:** White background with a 1px `#E2E8F0` border. Sharp corners.
- **Focus State:** Border color changes to Navy (#1A365D) with no outer glow or shadow.
- **Labels:** Placed above the field in `label-md` style.

### Cards & Lists
- **Cards:** No shadows. Defined by a 1px `#E2E8F0` border. Use a White background to distinguish from the light grey canvas.
- **Lists:** Items separated by 1px horizontal rules. High vertical density (padding: 8px 0).

### Icons
- **Style:** 2px stroke line icons. Do not place icons inside circular or rounded containers.
- **Color:** Use Slate (#4A5568) for standard utility icons and Navy (#1A365D) for active navigation states.

### Data Tables
- **Essential Component:** Tables should use a "Zebra Stripe" pattern (alternating between White and Light Grey) for readability. Headers should be Navy with White text or bold Slate with a bottom border.