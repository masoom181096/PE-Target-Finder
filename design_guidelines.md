# PE Target Finder - Design Guidelines

## Design Approach

**Selected Framework:** Material Design 3 (adapted for financial services)

**Rationale:** This is a utility-focused, information-dense professional tool requiring clarity, credibility, and efficiency. Material Design provides robust patterns for forms, data display, and conversational interfaces while maintaining a trustworthy, enterprise-grade aesthetic.

**Key Principles:**
- Clarity over decoration: Every element serves a functional purpose
- Hierarchical information architecture: Clear visual distinction between thinking process, chat, and data displays
- Professional credibility: Clean, structured layouts that inspire confidence
- Responsive information density: Adapt complexity gracefully across viewports

---

## Layout System

### Grid Structure
- **Desktop (≥1024px):** Three-column layout
  - Left: Phase progress sidebar (280px fixed)
  - Center: Chat window (flex-1, max-width: 800px)
  - Right: Thinking panel (360px fixed)
- **Tablet (768-1023px):** Two-column layout
  - Main: Chat window (flex-1)
  - Right: Thinking panel (320px fixed)
  - Phase progress: Horizontal stepper above chat
- **Mobile (<768px):** Single column stack
  - Tabbed interface: Chat | Thinking (toggle between views)
  - Phase progress: Compact horizontal stepper at top

### Spacing System
**Core units:** Tailwind 2, 4, 6, 8, 12, 16 (multiples of 4px)
- Component padding: `p-6` (24px)
- Section spacing: `space-y-8` (32px between major sections)
- Inline spacing: `gap-4` (16px for form fields, buttons)
- Container margins: `mx-auto max-w-7xl px-4 md:px-6 lg:px-8`

---

## Typography

### Font Stack
**Primary:** Inter (Google Fonts)
- Readable at small sizes
- Professional, neutral character
- Excellent number legibility (critical for financial data)

**Monospace:** JetBrains Mono (for thinking steps, technical output)

### Type Scale
- **Headings:**
  - H1 (Report titles): `text-3xl font-bold` (30px)
  - H2 (Section headers): `text-2xl font-semibold` (24px)
  - H3 (Subsections): `text-xl font-semibold` (20px)
  - H4 (Card titles): `text-lg font-medium` (18px)

- **Body:**
  - Large body (chat messages): `text-base leading-relaxed` (16px, 1.625 line-height)
  - Regular body (forms, tables): `text-sm` (14px)
  - Small text (metadata, timestamps): `text-xs` (12px)

- **Monospace (thinking steps):**
  - `font-mono text-sm leading-loose` (14px, generous spacing for readability)

---

## Core Components

### Chat Window
**Structure:**
- Messages container: `flex flex-col space-y-6 p-6`
- User messages: Right-aligned, `max-w-lg ml-auto`
- Assistant messages: Left-aligned, `max-w-2xl`
- Message bubbles: `rounded-2xl px-6 py-4` with subtle borders
- Typing indicator: Three animated dots when processing
- Input area: Fixed bottom, `sticky bottom-0` with backdrop blur

**Input Field:**
- Large textarea: `min-h-[120px] resize-none rounded-xl border-2`
- Send button: Icon button (arrow/send), positioned absolute right
- Character count: `text-xs` below input (if needed for long responses)

### Thinking Panel
**Layout:**
- Header: `text-sm font-semibold uppercase tracking-wide` (e.g., "Agent Thinking")
- Scrollable content: `h-screen overflow-y-auto`
- Thinking steps: `space-y-3`
- Each step: `font-mono text-sm p-3 rounded-lg border-l-4` (emphasis border)
- Auto-scroll to latest: JavaScript smooth scroll on new steps
- Phase badges: Small pills showing current phase, `text-xs px-3 py-1 rounded-full`

### Phase Progress Sidebar
**Desktop vertical stepper:**
- Each phase: Circle icon + label
- Completed: Checkmark icon, connected line
- Current: Pulsing indicator
- Upcoming: Outlined circle, muted
- Vertical connecting lines between phases: `border-l-2`
- Spacing: `space-y-6`

**Mobile horizontal stepper:**
- Compact dots with numbers
- Current phase label displayed above
- Swipeable or auto-scroll to current step

### Form Components (Mandate/Weights/Thresholds)

**Input Groups:**
- Labels: `text-sm font-medium mb-2`
- Text inputs: `rounded-lg border-2 px-4 py-3 text-base`
- Number inputs: Aligned right for numerical data
- Select dropdowns: Full-width with chevron icon
- Checkbox groups: `space-y-3` with clear labels
- Slider inputs (for weights): Range input with live value display

**Multi-field Forms:**
- Grid layout: `grid grid-cols-1 md:grid-cols-2 gap-6`
- Related fields grouped visually with subtle background
- Submit button: Full-width on mobile, `w-auto px-8` on desktop

**Weight Adjuster (Special Component):**
- 10 parameters in 2-column grid
- Each row: Label + Number input + Slider
- Live total display at bottom: `text-xl font-bold` (must equal 100)
- Visual feedback when sum ≠ 100 (border treatment on total)

### Recommendations Table

**Structure:**
- Desktop: Full table with columns: Rank | Company | Country | Sector | Score | Action
- Mobile: Stacked cards with key info prominent
- Rank badge: Large circular badge, `w-12 h-12` with number
- Company name: `text-lg font-semibold`
- Score: Progress bar + numerical value (e.g., 87/100)
- Action: "Generate Report" button, `rounded-lg px-6 py-3`

**Ranking Visual Hierarchy:**
- Rank 1: Larger card, emphasized border
- Ranks 2-3: Standard size, subtle borders
- Hover: Lift effect (subtle shadow increase)

### Report View

**Layout:**
- Two-column on desktop: Sticky nav outline (left 280px) + Content (flex-1)
- Single column on mobile
- Header section: Full-width banner with company name, metadata
- Source badges: Pills showing data sources (Pitchbook, Crunchbase, etc.)

**Content Sections:**
- Section headers: `border-b-2 pb-4 mb-6`
- Executive summary: Bulleted list with `space-y-3`, larger text
- Tables: Responsive `overflow-x-auto` wrapper
  - Header row: `font-semibold`
  - Striped rows for readability
  - Aligned columns (text left, numbers right)
- Key points: Card-style highlights with icon indicators

**Navigation Outline:**
- Sticky sidebar links to report sections
- Active section: Bold + indicator bar
- Click to scroll to section (smooth scroll)

---

## Animations

**Minimal, purposeful motion:**
- Thinking steps: Fade-in from top (200ms) as they appear
- Message send: Slide-in from bottom (150ms)
- Phase transitions: Smooth height transitions on stepper
- Button clicks: Subtle scale (0.98) on active state
- NO decorative background animations
- NO distracting scroll effects

---

## Responsive Behavior

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768-1023px
- Desktop: ≥ 1024px

**Critical Adaptations:**
- Chat + Thinking: Side-by-side → Tabbed views
- Phase stepper: Vertical → Horizontal
- Forms: 2-column → 1-column stack
- Tables: Scroll → Cards
- Report: 2-column → Single column with sticky header

---

## Accessibility

- All interactive elements: min-height 44px (touch targets)
- Form labels: Explicit `for` attributes
- ARIA labels on icon-only buttons
- Keyboard navigation: Logical tab order throughout conversation flow
- Focus indicators: Consistent outline treatment
- Skip links: "Skip to chat" for keyboard users

---

## Component States

**Interactive Elements:**
- Default: Subtle border, clear but understated
- Hover: Border emphasis, slight shadow increase
- Focus: Prominent outline (accessibility standard)
- Active/Pressed: Subtle scale reduction
- Disabled: Reduced opacity (0.5), cursor not-allowed

**Data Loading:**
- Skeleton loaders for tables/cards (shimmer effect)
- Spinner for thinking panel updates
- Disabled states during async operations