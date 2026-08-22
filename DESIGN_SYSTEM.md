# DAYFLOW — DESIGN SYSTEM

Version: 1.0
Product: Dayflow HR Management System

---

## 1. DESIGN DIRECTION

Dayflow is a modern HR management platform designed to feel:

- Professional
- Calm
- Human
- Premium
- Trustworthy
- Clean
- Slightly editorial rather than overly corporate

The visual identity is based on:

> Olive + Sand + Warm Cream + Terracotta

The interface should feel spacious and refined rather than dense.

Avoid:
- Bright startup gradients
- Neon colors
- Excessive shadows
- Excessive rounded elements
- Heavy glassmorphism
- Pure black backgrounds
- Generic blue SaaS styling
- Excessive use of accent colors

The reference interface uses:
- Dark olive navigation
- Warm cream/sand workspace
- Ivory content cards
- Olive as the primary interactive color
- Terracotta as a secondary accent
- Muted gold for warnings/highlights
- Restrained semantic colors

---

# 2. COLOR SYSTEM

## Primary Brand Colors

### Deep Olive
`#41472F`

Use for:
- Sidebar background
- Dark navigation elements
- Strong brand elements
- Selected/active navigation backgrounds where appropriate

### Primary Olive
`#626B45`

Use for:
- Primary buttons
- Active navigation
- Selected states
- Important interactive elements
- Links where appropriate
- Primary icons

### Secondary Olive
`#7A835F`

Use sparingly for:
- Secondary accents
- Charts
- Decorative indicators
- Hover states

---

# 3. BACKGROUND COLORS

### Main Background — Warm Cream
`#FAF7F0`

Use as the main application workspace background.

This should be the dominant background color.

### Secondary Background — Sand
`#EDE4D3`

Use for:
- Secondary sections
- Subtle panels
- Selected filters
- Highlighted areas
- Empty states where appropriate

Do NOT use sand as the primary page background.

### Card Background — Ivory
`#FFFDF8`

Use for:
- Cards
- Tables
- Modals
- Forms
- Dashboard widgets

Cards should remain visually distinct from the cream background without looking heavily bordered.

---

# 4. TEXT COLORS

### Primary Text
`#302D27`

Use for:
- Page headings
- Card headings
- Important information
- Table text

### Secondary Text
`#777168`

Use for:
- Descriptions
- Supporting text
- Metadata
- Table secondary information
- Helper text

### Muted Text
`#9A9389`

Use for:
- Captions
- Disabled text
- Very low-priority information

### Text on Dark Background
`#FFFDF8`

Use on:
- Deep olive sidebar
- Dark buttons
- Dark navigation elements

---

# 5. ACCENT COLORS

## Terracotta
`#B66A55`

Terracotta is the secondary brand accent.

Use for:
- Important secondary actions
- Small visual accents
- Notifications
- Selected highlights
- Certain icons
- Important callouts

Do NOT use terracotta for every button.

Primary actions should remain olive.

---

## Soft Olive
`#E2E6D6`

Use for:
- Light olive backgrounds
- Selected cards
- Icon containers
- Hover backgrounds
- Soft highlights

---

## Gold
`#C19A55`

Use for:
- Warnings
- Pending states
- Important attention indicators
- Calendar-related highlights
- Secondary data visualization

Gold should be used sparingly.

---

# 6. SEMANTIC COLORS

Semantic colors must remain consistent throughout the entire application.

## Success

Primary:
`#557A5D`

Background:
`#E7EFE5`

Used for:
- Present
- Approved
- Successful actions
- Active/healthy states
- Successful employee creation

Example:

`Present`

with a soft green background and dark green text.

---

## Warning / Pending

Primary:
`#C19A55`

Background:
`#F6EEDB`

Used for:
- Pending
- On Leave
- Awaiting approval
- Attention required

Example:

`Pending`

---

## Danger / Error

Primary:
`#B96666`

Background:
`#F5E3DF`

Used for:
- Absent
- Rejected
- Failed actions
- Validation errors
- Destructive actions

---

## Neutral / Informational

Primary:
`#667085`

Background:
`#EEF0ED`

Used for:
- Neutral states
- Informational badges
- Unspecified states

---

# 7. STATUS BADGES

All status badges must follow the same visual structure.

Recommended:

- Font size: 12px
- Font weight: 500
- Padding: 4px 10px
- Border radius: 6px
- No heavy border
- Use a light semantic background

### Attendance

| Status | Text | Background |
|---|---|---|
| Present | `#557A5D` | `#E7EFE5` |
| Absent | `#B96666` | `#F5E3DF` |
| Half-day | `#C19A55` | `#F6EEDB` |
| Leave | `#667085` | `#EEF0ED` |

### Leave

| Status | Text | Background |
|---|---|---|
| Pending | `#C19A55` | `#F6EEDB` |
| Approved | `#557A5D` | `#E7EFE5` |
| Rejected | `#B96666` | `#F5E3DF` |

Never invent new colors for these statuses.

---

# 8. TYPOGRAPHY

## Font

Primary font:

`Inter`

Use Inter throughout the application.

Do not introduce another font unless explicitly approved.

---

## Headings

### H1
- 28px
- Weight: 700
- Line height: 1.2
- Color: `#302D27`

Used for:
- Main page titles
- Dashboard greeting

Example:

> Good morning, Priya!

### H2
- 22px
- Weight: 600
- Line height: 1.3
- Color: `#302D27`

Used for:
- Major sections
- Dashboard panels

### H3
- 18px
- Weight: 600
- Line height: 1.35
- Color: `#302D27`

Used for:
- Card titles
- Subsections

### Body
- 14–16px
- Weight: 400
- Color: `#302D27`

### Secondary Body
- 14px
- Weight: 400
- Color: `#777168`

### Caption
- 12px
- Weight: 400–500
- Color: `#9A9389`

---

# 9. TYPOGRAPHIC STYLE

Headings should feel slightly editorial and refined.

Do not:
- Use all caps for major headings
- Use extremely bold text everywhere
- Use oversized typography
- Use multiple font families

Use hierarchy through:
- Size
- Weight
- Color
- Spacing

rather than decoration.

---

# 10. SPACING SYSTEM

Use a consistent 8px-based spacing system.

Available spacing values:

`4px`
`8px`
`12px`
`16px`
`20px`
`24px`
`32px`
`40px`
`48px`

### Common usage

4px:
- Icon/text spacing
- Tiny internal gaps

8px:
- Label/input relationships
- Badge spacing

12px:
- Card internal elements
- Button content

16px:
- Standard component padding
- Table cell padding

20px:
- Card content

24px:
- Card padding
- Section spacing

32px:
- Major section spacing

40–48px:
- Page-level spacing

Avoid arbitrary values such as 13px, 17px, 27px unless absolutely necessary.

---

# 11. BORDER RADIUS

Dayflow should use moderate rounding.

### Cards
`12px`

### Buttons
`8px`

### Inputs
`8px`

### Selects
`8px`

### Modals
`12px`

### Status Badges
`6px`

### Avatars
`50%`

Avoid extremely rounded "pill" UI except for status badges where appropriate.

---

# 12. BORDERS

Primary border:

`#E6E0D6`

Secondary border:

`#EEE9E1`

Borders should be subtle.

Default:

`1px solid #E6E0D6`

Avoid dark borders.

Avoid putting borders around every individual element.

---

# 13. SHADOWS

Dayflow uses very subtle shadows.

Default card shadow:

`0 2px 10px rgba(48, 45, 39, 0.04)`

Elevated component:

`0 6px 20px rgba(48, 45, 39, 0.08)`

Do not use:
- Large dramatic shadows
- Colored shadows
- Glow effects

Most cards should rely primarily on:
- Background contrast
- Spacing
- Subtle borders

---

# 14. BUTTON SYSTEM

There are four main button types.

## Primary Button

Background:
`#626B45`

Text:
`#FFFDF8`

Hover:
`#41472F`

Use for:
- Add Employee
- Create
- Submit
- Save
- Approve when primary

Shape:
- Radius: 8px
- Height: approximately 40px
- Horizontal padding: 16px

---

## Secondary Button

Background:
`#E2E6D6`

Text:
`#41472F`

Border:
`none`

Use for:
- Secondary actions
- Filters
- Alternative actions

---

## Ghost Button

Background:
`transparent`

Text:
`#626B45`

Use for:
- View All
- Low-priority actions
- Navigation actions

---

## Danger Button

Background:
`#B96666`

Text:
`#FFFDF8`

Use only for destructive actions:

- Delete
- Reject
- Remove

Do not use danger styling simply because an action is important.

---

# 15. BUTTON RULES

Buttons should:

- Have clear action labels
- Use icons only when they improve recognition
- Never rely on color alone to communicate meaning
- Have visible hover states
- Have visible focus states
- Remain readable at all screen sizes

Examples:

Good:

`+ Add Employee`

Good:

`Approve`

Good:

`Reject`

Avoid:

`Click Here`

Avoid:

`Submit`

when a more descriptive label exists.

---

# 16. ICONOGRAPHY

Use one consistent icon library throughout the application.

Recommended:

`Lucide`

Icons should generally be:

- 16px for compact controls
- 18px for standard actions
- 20px for navigation
- 24px for dashboard/stat icons

Use outline icons rather than mixed filled/outline styles.

Do not mix multiple icon libraries.

---

# 17. SIDEBAR

The sidebar is one of Dayflow's strongest visual elements.

### Background

`#41472F`

### Text

`#FFFDF8`

### Secondary text

`#D9DDCA`

### Active navigation

Use:

`#626B45`

with light text.

### Hover

Use a slightly lighter olive overlay.

The sidebar should feel substantial but not overpowering.

---

## Sidebar structure

Recommended:

```text
DAYFLOW
HR Management System

Dashboard

Employees

Attendance

Leave Management

Payroll

Reports & Analytics

Settings


[User Profile]
Priya Sharma
HR Admin

Logout
