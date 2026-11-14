# Design System & Color Palette

This document outlines the core color palette and design principles used in the Guides Nepal application to ensure a consistent, engaging, and professional user interface.

## Core Color Palette

### Primary Colors

| Color Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Dark Blue** | `#213448` | Primary text, Headings, Icons, Footer background, Active states. Represents trust and professionalism. |
| **Brand Yellow** | `#F4B400` | Call-to-Action (CTA) buttons, Highlights, Hover states, Focus rings. Represents energy, warmth, and optimism. |

### Background Colors

| Color Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Peach** | `#FFF0E6` | Hero sections, Testimonial backgrounds, Highlighted segments, Modal headers. Adds warmth and engagement. |
| **Light Blue** | `#E0F2FE` | "Things to do" / Experiences sections. Provides a fresh, calm contrast to the warm peach tones. |
| **White** | `#FFFFFF` | Main content backgrounds, Cards, Inputs. Ensures readability and cleanliness. |

### Secondary & Accent Colors

| Color Name | Hex Code | Usage |
| :--- | :--- | :--- |
| **Medium Blue** | `#547792` | Secondary elements, lighter text variations. |
| **Light Blue (Accent)** | `#94B4C1` | Subtle borders, decorative elements. |

## Typography

- **Font Family:** `Inter`, sans-serif
- **Headings:** Bold, typically Dark Blue (`#213448`) or Black/Gray-900.
- **Body Text:** Slate-600 or Gray-600 for readability.

## UI Components

### Buttons
- **Primary CTA:** Brand Yellow background (`#F4B400`) with Dark Blue text (`#213448`). Rounded full.
  - *Hover:* Darker Yellow (`#E5A800`) or shadow lift.
- **Secondary / Outline:** Transparent or White background with Dark Blue border and text.
  - *Hover:* Brand Yellow background with Dark Blue text.

### Cards
- **Experience Cards:** White background, rounded corners (`rounded-2xl` or `rounded-3xl`), shadow effects (`shadow-lg`, `hover:shadow-xl`).
- **Profile Cards:** Circular images, clean typography, hover effects on text color.

### Modals (Login/Signup)
- **Header:** Peach background (`#FFF0E6`) with centered iconography.
- **Inputs:** White/Gray-50 background with Brand Yellow focus ring (`focus:ring-brand-yellow`).

## Design Principles

1.  **Warmth & Engagement:** Use Peach and Yellow to create a welcoming atmosphere, moving away from cold, monochrome interfaces.
2.  **Clarity & Contrast:** Ensure high contrast between text (Dark Blue) and backgrounds (White/Peach) for accessibility.
3.  **Consistency:** Apply the same color patterns across all city pages (Kathmandu, Pokhara, etc.) and auth flows.
