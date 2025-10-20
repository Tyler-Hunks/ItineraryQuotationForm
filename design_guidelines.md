# Travel Booking Form - Design Guidelines

## Design Approach: Utility-Focused System Design

**Selected Framework**: shadcn/ui Design Patterns  
**Rationale**: This is a data-entry utility tool for travel agency staff requiring efficiency, clarity, and professional aesthetics. The focus is on form usability, logical information hierarchy, and reducing cognitive load during data input.

**Core Principles**:
- Information clarity over visual flair
- Logical grouping and progressive disclosure
- Immediate visual feedback for form states
- Professional trustworthiness through clean execution

---

## Color Palette

**Light Mode**:
- Background: 0 0% 100% (white)
- Surface/Cards: 0 0% 98% (subtle off-white)
- Borders: 214 32% 91% (soft blue-gray)
- Primary: 221 83% 53% (professional blue)
- Primary Foreground: 210 40% 98%
- Muted: 210 40% 96%
- Muted Foreground: 215 16% 47%
- Destructive: 0 84% 60% (error red)
- Success: 142 71% 45% (confirmation green)

**Dark Mode**:
- Background: 222 47% 11% (deep navy-blue)
- Surface/Cards: 217 33% 17% (elevated navy)
- Borders: 217 33% 23%
- Primary: 217 91% 60% (bright blue)
- Primary Foreground: 222 47% 11%
- Muted: 217 33% 17%
- Muted Foreground: 215 20% 65%
- Destructive: 0 63% 31%
- Success: 142 71% 45%

---

## Typography

**Font Families**:
- Primary: Inter (Google Fonts) - all UI text
- Monospace: JetBrains Mono - confirmation numbers, IDs

**Scale**:
- Page Title: text-3xl font-semibold (30px)
- Section Headers: text-xl font-semibold (20px)
- Form Labels: text-sm font-medium (14px)
- Input Text: text-base (16px)
- Helper Text: text-sm text-muted-foreground (14px)
- Table Headers: text-xs font-medium uppercase tracking-wide

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16**  
Example: p-6, gap-4, mb-8, space-y-6

**Container Structure**:
- Max-width: max-w-6xl mx-auto
- Outer padding: px-6 py-8 (mobile), px-8 py-12 (desktop)
- Card padding: p-6 (mobile), p-8 (desktop)
- Form field spacing: space-y-6 within sections

**Grid System**:
- Single column on mobile (grid-cols-1)
- Two columns for paired inputs: grid-cols-1 md:grid-cols-2 gap-4
- Three columns for hotel options: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

---

## Component Library

**Form Sections (Cards)**:
- Accordion-style collapsible sections with shadcn Accordion component
- Each section: white/dark card with subtle border, rounded-lg
- Section headers with expand/collapse icons
- Sections: Travel Details, Group Information, Hotel Selection, Meal Preferences, Flight Details, Tour Inclusions/Exclusions, Pricing, Document Uploads, Terms & Conditions

**Input Components**:
- Text inputs: shadcn Input with focus ring, rounded-md
- Date pickers: shadcn Calendar with Popover for date selection
- Dropdowns: shadcn Select with search capability for long lists
- Checkboxes: shadcn Checkbox for meal preferences, tour inclusions
- Radio groups: shadcn RadioGroup for hotel room types
- File uploads: shadcn custom file input with drag-drop zone, file preview cards
- Textareas: shadcn Textarea for terms & conditions editing

**Hotel Selection**:
- Card grid layout showing hotel options
- Each card: image placeholder (200x150), hotel name, star rating, price per night
- Radio button selection or checkbox for multi-hotel itineraries
- Badge components for amenities (WiFi, Pool, Breakfast)

**Pricing Display**:
- Two-column layout: labels (font-medium) on left, amounts (font-semibold tabular-nums) on right
- Separator line before total
- Total: larger text (text-lg) with highlighted background (bg-muted)

**Action Buttons**:
- Primary CTA: "Submit Booking" - full shadcn Button, variant="default", size="lg"
- Secondary: "Save Draft" - variant="outline"
- Destructive: "Clear Form" - variant="ghost" with text-destructive
- Buttons positioned bottom-right with gap-3

**Validation & Feedback**:
- Inline error messages: text-sm text-destructive below inputs
- Success toast: shadcn Toast component (top-right)
- Required field indicator: red asterisk in label
- Field-level validation on blur, form-level on submit attempt

**Document Upload Zone**:
- Dashed border card with upload icon
- "Click to upload or drag and drop" messaging
- File type restrictions displayed (PDF, JPG, PNG - Max 5MB)
- Uploaded files shown as removable chips with file icon, name, size

**Terms & Conditions Editor**:
- Rich text or simple textarea
- Preset templates dropdown
- Character count indicator
- Preview toggle to show formatted output

---

## Navigation & Header

**Sticky Header**:
- Brand/Agency logo (left)
- Form title (center)
- Save status indicator (right) - "All changes saved" with checkmark icon
- Fixed to top, subtle shadow on scroll

**Progress Indicator**:
- Stepper or progress bar showing completion percentage
- Based on required fields filled
- Positioned below header or as side panel

---

## Responsive Behavior

- Mobile: Single column, full-width inputs, stacked buttons
- Tablet (md:): Two-column grids where logical, side-by-side date ranges
- Desktop (lg:): Three-column hotel grid, optimized spacing

---

## Animations

**Minimal Motion**:
- Accordion expand/collapse: 200ms ease
- Focus ring appearance: 150ms
- Toast slide-in: 300ms ease-out
- No page transitions, no decorative animations

---

## Images

**No Hero Image Required** - This is a utility form application.

**Hotel Selection Images**:
- Placeholder images for each hotel option (200x150px)
- Use image placeholders showing hotel exteriors/interiors
- Consider using a service like Unsplash API for real hotel images
- Images have rounded-md corners, object-cover fit

**Upload Preview Icons**:
- Document icons for file types (PDF, image thumbnails)
- shadcn icons or Lucide React icons throughout

---

## Accessibility Notes

- All form inputs have associated labels (htmlFor)
- ARIA labels for icon-only buttons
- Keyboard navigation fully supported (tab order logical)
- Color contrast ratios meet WCAG AA standards
- Error announcements for screen readers
- Focus visible styles maintained in dark mode