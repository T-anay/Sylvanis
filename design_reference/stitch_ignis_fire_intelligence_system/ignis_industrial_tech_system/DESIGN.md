---
name: Ignis Industrial Tech System
colors:
  surface: '#1f0f0b'
  surface-dim: '#1f0f0b'
  surface-bright: '#49342e'
  surface-container-lowest: '#190a06'
  surface-container-low: '#281712'
  surface-container: '#2d1b16'
  surface-container-high: '#382620'
  surface-container-highest: '#44302a'
  on-surface: '#fcdcd3'
  on-surface-variant: '#e6beb2'
  inverse-surface: '#fcdcd3'
  inverse-on-surface: '#3f2c26'
  outline: '#ad897e'
  outline-variant: '#5c4037'
  surface-tint: '#ffb59e'
  primary: '#ffb59e'
  on-primary: '#5e1700'
  primary-container: '#ff571a'
  on-primary-container: '#521300'
  inverse-primary: '#ae3200'
  secondary: '#c8c6c5'
  on-secondary: '#313030'
  secondary-container: '#474746'
  on-secondary-container: '#b7b5b4'
  tertiary: '#b9c7e0'
  on-tertiary: '#233144'
  tertiary-container: '#8392a9'
  on-tertiary-container: '#1c2a3d'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59e'
  on-primary-fixed: '#3a0b00'
  on-primary-fixed-variant: '#852400'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#d5e3fd'
  tertiary-fixed-dim: '#b9c7e0'
  on-tertiary-fixed: '#0d1c2f'
  on-tertiary-fixed-variant: '#3a485c'
  background: '#1f0f0b'
  on-background: '#fcdcd3'
  surface-variant: '#44302a'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
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
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
---

## Brand & Style
The design system is engineered for high-stakes, real-time fire detection and emergency response. The brand personality is **authoritative, urgent, and hyper-functional**, balancing the rugged utility of industrial hardware with the precision of modern aerospace interfaces.

The visual style is a hybrid of **Industrial Tech and Clean Modernism**. It utilizes a "Dark Ops" aesthetic to reduce eye strain during long-shift monitoring while ensuring critical alerts demand immediate cognitive attention. Key attributes include:
- **Precision Engineering:** Grid-aligned layouts that suggest stability and reliability.
- **High-Intensity Signaling:** Strategic use of high-chroma safety colors against a muted, technical backdrop.
- **Functional Depth:** Use of glassmorphism for situational overlays (maps and feeds) to maintain environmental context without losing data clarity.

## Colors
This design system utilizes a high-contrast dark palette optimized for mission-critical visibility. 

- **Primary (Safety Orange):** Reserved exclusively for active alerts, primary actions, and critical status indicators. It must never be used for decorative elements.
- **Surface Palette:** The base is `Deep Charcoal` (#1A1A1A), providing a neutral foundation that eliminates glare. `Slate Gray` (#334155) is used for secondary containers, sidebars, and structural housing.
- **Semantic Layer:** These follow international safety standards for emergency response. Red, Yellow, and Green communicate immediate hazard levels, while Info Blue is used for non-critical data like weather updates.

## Typography
The typography system prioritizes legibility under duress. 

- **Headlines:** Use **Inter** in Bold/ExtraBold weights. This provides a clean, neutral, yet commanding presence.
- **Body:** **Inter** is used for its high x-height and readability in dense data environments.
- **Technical Data:** **JetBrains Mono** is introduced for labels, coordinates, timestamps, and sensor readings. The monospaced nature ensures that fluctuating numerical data doesn't cause layout "jitter" and feels appropriately "instrument-like."

## Layout & Spacing
The layout follows a strict **4px baseline grid** to maintain industrial precision. 

- **Grid Strategy:** A 12-column fluid grid is used for dashboard layouts, allowing for modular "widgets" to be rearranged. 
- **Density:** The system supports a "Compact" density by default to maximize the amount of information visible on a single screen without scrolling.
- **Adaptive Rules:** On mobile, columns collapse to a single stack, but critical "Emergency Action Bar" elements remain docked to the bottom of the viewport for thumb-access.

## Elevation & Depth
Depth is used to establish a hierarchy of "Information Layers."

1.  **Floor (Level 0):** Background surfaces using `Deep Charcoal`. No shadows.
2.  **Panels (Level 1):** Primary UI containers. Subtle `1px` inner borders (Slate Gray at 20% opacity) define the edges.
3.  **Overlays (Glassmorphism):** Map controls and floating HUD elements use a backdrop blur of `12px` and a semi-transparent Slate Gray background (`#334155` at 60%). This allows the user to maintain sight of the underlying geographic data.
4.  **Critical Alerts (Level 2):** These use an **Ambient Glow**. Instead of standard black shadows, active alerts use a diffused shadow tinted with the alert color (e.g., a Safety Orange outer glow) to simulate a physical warning light.

## Shapes
The shape language is **geometric and rigid**. 

A **Soft (0.25rem)** border radius is the standard for most components, providing just enough refinement to feel modern while maintaining a professional, "tool-like" appearance. Sharp corners are avoided to prevent the UI from feeling aggressive, but large radii (pills) are strictly forbidden as they conflict with the industrial aesthetic.

## Components
- **Buttons:** Primary buttons use `Safety Orange` with white text. On hover, they gain a subtle `4px` Safety Orange glow. Secondary buttons use an "Outlined" style with `Slate Gray` borders.
- **Alert Chips:** Highly visible status indicators. They include a pulsating "active" dot icon to signify real-time monitoring.
- **Data Visualizations:** Gauges and charts should use `Success Green` for "within-bounds" data and transition to `Warning Yellow` or `Emergency Red` as thresholds are breached. Avoid decorative gradients; use solid fills or stepped increments.
- **Input Fields:** Dark-themed fields with `Slate Gray` backgrounds. Focus states are indicated by a `2px` Safety Orange left-border accent rather than a full outline.
- **Glass HUD Cards:** Used for map overlays. They feature a `1px` translucent border and a `blur(12px)` filter to ensure text legibility over complex satellite imagery.
- **Icons:** Use a custom set of "thick-stroke" (2px) technical icons. Weather, fire, and hazard icons must be unmistakable at small sizes.