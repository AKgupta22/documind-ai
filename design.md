# DESIGN_SYSTEM.md

**Status:** Active architectural reference
**Scope:** All UI work in `apps/web`
**Audience:** Future UI implementation agents and human contributors
**Last inspected:** 2026-11-13

This document describes the DocuMind AI interface system as it actually exists in this repository, then states the conventions that all future UI work must follow. It is the single source of truth for colors, tokens, primitives, component architecture, layout, theming, accessibility, and mock-data handling.

Read this file before implementing any screen or component. Do not infer a design system from screenshots, from other projects, or from generic shadcn/ui examples.

---

## 1. Purpose and design principles

### Purpose

DocuMind AI is a personal AI document intelligence and knowledge assistant. The primary experience is a unified chat interface where a user uploads documents, asks questions, reads answers with citations, inspects sources, and watches agent activity.

The UI must feel like a focused productivity tool: calm, fast, legible, and trustworthy. It must not look like a marketing site, a dashboard template, or a demo.

### Principles

1. **Minimal, premium productivity UI.** Every element earns its place. Prefer whitespace and hierarchy over decoration.
2. **Linear/Notion/ChatGPT-inspired usability.** Familiar navigation, predictable keyboard behavior, and low-friction dense layouts.
3. **Clear visual hierarchy.** One primary action per view. Headings, body text, metadata, and actions must be visually distinct using the existing semantic tokens.
4. **Neutral surfaces and subtle borders.** The canvas, surfaces, and borders stay neutral. The primary accent is restrained and reserved for actionable or active states.
5. **Consistent spacing and typography.** Reuse the same scale everywhere. No arbitrary per-page values.
6. **Functional animation only.** Motion explains state changes (open, close, enter, exit, streaming). It never performs.
7. **No unnecessary gradients.**
8. **No excessive shadows.** Borders and surface contrast carry elevation first.
9. **No redundant cards or containers.** Do not wrap every section in a card. A card is a deliberate grouping, not a default layout.
10. **No arbitrary styling decisions.** New visual values require a token, and new tokens require central definition for both themes.

### Authority and conflict rule

- The CSS custom properties in `apps/web/app/globals.css` are the authoritative design tokens.
- This document is authoritative for usage and architecture, but it must never restate or override token values.
- If a requirement conflicts with the current implementation, inspect the conflict, explain it, and propose the smallest consistent change. Do not silently fork the system.

---

## 2. Technology and UI foundation

### Actual stack in the repository

Task 002 adopted the foundation that earlier revisions of this document listed as a target.

| Area | Current implementation | Notes |
| --- | --- | --- |
| App framework | Next.js 16 App Router | `apps/web/app` with `(auth)` and `(app)` groups |
| UI runtime | React 19 | Client components only where interaction requires them |
| Language | TypeScript, strict mode | `noUncheckedIndexedAccess` enabled |
| Path alias | `@/*` → `apps/web/*` | Defined in `apps/web/tsconfig.json` |
| Styling | Tailwind CSS v4 + `apps/web/app/globals.css` | `@theme inline` maps existing semantic variables; no Tailwind config file |
| Component library | shadcn/ui conventions, locally owned | `apps/web/components/ui` |
| Primitive library | Radix UI packages | Dialog, DropdownMenu, Checkbox, Label, Progress, Switch, Separator, Collapsible, Slot |
| Icon library | Lucide React | Single icon source |
| Utility helper | `cn()` in `apps/web/lib/utils.ts` | `clsx` + `tailwind-merge` |
| Theme provider | `components/shared/theme-provider.tsx` | Light/Dark/System, persisted, pre-paint script |
| Tests | Vitest | API: Node environment; web: jsdom + Testing Library |

### Styling reality

Components use semantic Tailwind utilities such as `bg-surface`, `text-foreground-secondary`,
`border-border`, `bg-primary`, and `text-danger`. These resolve to the CSS variables in
`globals.css`; they are not a second palette. `@theme inline` exposes the variables once, and
`color-scheme` switches native UI with the theme.

- `apps/web/app/globals.css` remains the only token source.
- Typography roles are defined once in `globals.css`: `type-display`, `type-title`,
  `type-heading`, `type-body`, `type-label`, `type-caption`, `type-code`.
- Radius, shadow, font, duration, and easing values are defined once in the `@theme inline`
  block.
- The existing `health-status.tsx` classes (`card`, `muted`, `status`, `dot`) are baseline debt
  and are not rendered by the product routes.

### Foundation guardrails

- Do not add a second component library, icon library, or color palette.
- Do not use palette utilities (`bg-slate-100`, `text-gray-500`) or arbitrary color values.
- Do not use `dark:` color overrides; semantic tokens switch automatically.
- Do not duplicate a primitive in a feature folder.
- New primitives belong in `components/ui`, shared compositions in `components/shared`, and
  feature-specific components in `components/<feature>`.

### Framework boundaries

- UI code lives in `apps/web`.
- `packages/shared` contains plain TypeScript contracts only. Never add React, styling, or browser code there.
- `apps/api` is not a UI package.
- Server Components are the default. Add `'use client'` only for state, effects, browser APIs, event handlers, or third-party client primitives.

---

## 3. Existing design-token architecture

### Source of truth

All design tokens are CSS custom properties in `apps/web/app/globals.css`.

- Light theme: `:root`
- Dark theme: `.dark`
- `color-scheme` is set per theme.
- `body` consumes `--background` and `--foreground`.
- No other token file, Tailwind theme, or JS token module exists.

### Token model

Tokens are semantic, not component-specific. Use the token that describes the role, not the color.

| Token | Semantic role | Typical consumers |
| --- | --- | --- |
| `--background` | Application canvas | Page background, app shell behind surfaces |
| `--surface` | Primary raised surface | Cards, panels, dialogs, menus, popovers, inputs, table containers |
| `--surface-secondary` | Secondary or nested surface | Nested sections, hover fills, code blocks, table headers, skeletons, subdued wells |
| `--foreground` | Primary text and icons | Headings, body copy, active labels |
| `--foreground-secondary` | Supporting text | Descriptions, secondary labels, table secondary cells |
| `--foreground-muted` | Tertiary or inactive text | Placeholders, timestamps, disabled labels, helper metadata |
| `--primary` | Primary accent | Primary buttons, active navigation, links, selected states, focus accents |
| `--primary-hover` | Primary accent hover | Hover state for primary actions and interactive accents |
| `--primary-subtle` | Low-emphasis primary fill | Selected rows, active nav backgrounds, subtle badges, highlighted citations |
| `--border` | Default boundary | Card borders, dividers, input borders, table rules |
| `--border-strong` | Emphasized boundary | Hover borders, high-contrast separators, focused input borders where appropriate |
| `--success` | Success semantic | Success text, icons, status dots, positive deltas |
| `--warning` | Warning semantic | Warning text, icons, degraded status |
| `--danger` | Error/destructive semantic | Error text, destructive actions, failed status |
| `--info` | Informational semantic | Informational callouts, neutral notices |

### Theme mechanics

- Light values are declared on `:root`.
- Dark values are declared on `.dark`.
- Tokens are named identically across themes. Components never branch on theme.
- `color-scheme` ensures native controls, scrollbars, and form UI follow the active theme.

### Token additions (Task 002)

The formerly missing roles are now defined in `:root` and `.dark` in `globals.css`. They were
added centrally; no component hardcodes them.

| Role | Token | Consumers |
| --- | --- | --- |
| Text/icon color on primary fills | `--primary-foreground` | Primary buttons, selected controls |
| Focus indicator | `--ring` | All focusable controls, dialogs, menus |
| Modal backdrop | `--overlay` | Dialog and sidebar scrims |
| Destructive hover and foreground | `--danger-hover`, `--danger-foreground` | Destructive buttons |
| Subtle success background | `--success-subtle` | Success banners and badges |
| Subtle warning background | `--warning-subtle` | Warning banners and badges |
| Subtle danger background | `--danger-subtle` | Error banners and destructive confirmation |
| Subtle info background | `--info-subtle` | Informational callouts |
| Radius scale | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl` | Cards, inputs, dialogs, badges |
| Typography roles | `type-display`, `type-title`, `type-heading`, `type-body`, `type-label`, `type-caption`, `type-code` | Headings, body, labels, code |
| Shadow scale | `--shadow-sm`, `--shadow-md` | Dialogs, menus, raised surfaces only |
| Motion tokens | `--duration-fast`, `--duration-normal`, `--ease-standard` | Transitions and reduced-motion variants |

Spacing follows the single Tailwind 4px scale; do not introduce per-component spacing values.
Add future tokens to `:root` and `.dark`, map them once in `@theme inline`, and document them here.

---

## 4. CSS variable usage guidelines

### How components consume tokens today

Until Tailwind is adopted, components consume tokens through semantic CSS that references variables:

```css
.panel {
  background: var(--surface);
  color: var(--foreground);
  border: 1px solid var(--border);
}
```

Rules:

- Use `var(--token)` for every color, border, and theme-dependent surface.
- Do not write raw hex, `rgb()`, `hsl()`, named colors, or alpha-modified color literals in component styles.
- Do not redefine a global token inside a component, page, or module.
- Do not create alias variables that point at the same token. For example, do not add `--card: var(--surface)` in a component.
- Use inline `style` only for values that must be computed at runtime. Never use inline styles for theme colors, spacing, or typography.
- Prefer class-based styling over inline styles. The existing inline margin in `health-status.tsx` is baseline debt, not a pattern to copy.

### How components consume tokens with Tailwind

Tailwind v4 is installed and the existing variables are mapped once in `globals.css` through
`@theme inline`. Utilities resolve to `var(--background)`, `var(--surface)`,
`var(--foreground)`, `var(--border)`, and the rest; the mapping does not restate color values.

Rules:

- Use semantic utilities such as `bg-background`, `bg-surface`, `text-foreground`, `text-foreground-secondary`, `border-border`, `bg-primary`, `text-primary`, and the status equivalents.
- Never use palette utilities such as `bg-slate-100`, `text-gray-500`, `border-zinc-200`, or arbitrary color values.
- Never use arbitrary values like `bg-[#...]` or `text-[...]`.
- Never maintain a second Tailwind color palette that duplicates the CSS variables.
- Do not use `dark:` overrides for colors. Semantic tokens switch automatically.
- Use the centralized `type-*` classes for typography roles instead of inventing per-component sizes.

### Surface selection

- Page canvas: `--background`.
- Primary containers and overlays: `--surface`.
- Nested containers, table headers, hover fills, code blocks: `--surface-secondary`.
- Do not stack more than two surface levels. If a third level is needed, use a border or spacing instead.

### Text hierarchy

- Primary content: `--foreground`.
- Supporting descriptions and labels: `--foreground-secondary`.
- Placeholders, metadata, disabled text: `--foreground-muted`.
- Never use opacity to fake a text hierarchy when a semantic token exists.
- Never use muted text for essential instructions or error messages.

### Borders and focus

- Default separation: `--border`.
- Emphasized or hover boundary: `--border-strong`.
- Focus indication should use a dedicated focus token once added. Until then, use `--primary` as the visible focus color consistently. Never remove outlines without an equally visible replacement.
- Do not use borders as the only signal for an error. Pair with text, icon, and `--danger`.

### Primary and status usage

- Primary accent is for the main action, active navigation, current selection, and links. Do not paint large areas with it.
- Hover states for primary actions use `--primary-hover`.
- Low-emphasis selected backgrounds use `--primary-subtle`.
- Success, warning, danger, and info tokens are for meaning, not decoration.
- Status indicators must include a text label or accessible name. Color alone is insufficient.

### Adding a new token

Only add a token when no existing semantic token expresses the role.

1. Confirm the role cannot be expressed with `--background`, `--surface`, `--surface-secondary`, `--foreground`, `--foreground-secondary`, `--foreground-muted`, `--primary`, `--primary-hover`, `--primary-subtle`, `--border`, `--border-strong`, `--success`, `--warning`, `--danger`, or `--info`.
2. Choose a semantic name in the existing vocabulary. Do not name tokens after a component (`--chat-bubble`) or a literal color (`--purple-500`).
3. Define it in `:root` and `.dark`.
4. Verify contrast in both themes.
5. Map it into the styling layer if Tailwind is installed.
6. Update this document's token table and gap list.
7. Use it consistently; remove any temporary local workaround.

Never add a token that only serves a single page. Never add light-only or dark-only tokens.

---

## 5. Typography and spacing references

### Current typography

- No custom font is loaded. The app does not use `next/font`.
- No typography tokens exist.
- Global CSS sets only the body background and text color.
- Headings and paragraphs currently rely on browser defaults.

This is a documented gap. Future UI work must not introduce arbitrary font sizes, weights, line heights, or letter spacing per component. A central typography scale must be defined once before screen implementation, using semantic names such as display, title, heading, subheading, body, label, caption, and code.

### Current spacing and radius

- No spacing tokens, radius tokens, shadow tokens, or motion tokens exist.
- Some one-off values exist in the current stylesheet and inline styles. They are not a scale.
- Do not copy those one-off values into new components.

### Required approach

1. Define a single spacing scale centrally.
2. Define a single radius scale centrally.
3. Define typography roles centrally.
4. Consume those scales through the styling layer.
5. Do not use arbitrary spacing utilities or arbitrary values in components.
6. Use the same spacing rhythm for page padding, section gaps, card padding, and control padding.
7. Prefer a small set of type roles. Do not create a new size for each screen.

### Typography usage rules

- Use one `h1` per page.
- Keep heading levels sequential. Do not choose a heading level for its size.
- Body copy uses the body role. Metadata uses the caption or label role, not a smaller body with opacity.
- Numeric tables and metrics should use tabular numerals.
- Code, citations, and source excerpts use the monospace role.
- Long-form answers must remain readable at the body size; do not shrink chat text to fit more content.
- Do not use uppercase tracking-heavy labels for primary content. Uppercase is acceptable only for short metadata labels.

---

## 6. Layout and responsive standards

### Application shell

The target shell is:

- Persistent left sidebar for primary navigation: Dashboard, Documents, Chat, History, Settings.
- Main content region with a page header and a scrollable content area.
- Chat uses a content column plus an optional source panel.
- Mobile collapses navigation into a drawer and reduces the content shell to a single column.

There is no separate Agent Workspace navigation item. Agent activity belongs inside the chat experience.

### Breakpoints

No breakpoint configuration exists in the repository. Do not invent per-component media queries.

- If Tailwind is adopted, use its configured breakpoints as the single source and do not duplicate them in component CSS.
- If a custom approach is chosen, define breakpoints once in a central location and document them.
- Components must respond to layout constraints, not to page-specific assumptions.

### Responsive behavior matrix

| Area | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| Sidebar | Persistent, resizable or fixed width | Persistent or collapsible | Hidden; opens as a modal drawer with a scrim |
| Page header | Title, actions inline | Title, actions inline or wrapped | Title and actions stack; overflow actions move into a menu |
| Document list | Table or grid with metadata columns | Reduced columns or compact rows | Stacked cards or list rows; primary action remains visible |
| Chat | Conversation column with optional source panel | Conversation column; source panel overlays or collapses | Single column; source panel becomes a full-screen sheet |
| Source panel | Side-by-side with chat | Overlay or collapsible | Full-screen sheet; easy dismiss and return to chat |
| Dialogs | Centered modal | Centered modal | Full-width sheet or near-full-screen dialog |
| Tables | Full columns, sticky header where useful | Horizontal scroll or reduced columns | Card-style rows; never rely on horizontal scrolling alone |
| Forms | Multi-column only when labels remain clear | One or two columns | Single column |
| Touch targets | Pointer-sized is acceptable | Touch-friendly | Minimum comfortable touch target, with spacing between actions |

These are behavioral requirements, not permission to hardcode breakpoint values.

### Layout rules

- Use a single content maximum width for reading-heavy views. Do not let chat text span the full desktop width.
- Keep page padding consistent across views.
- Avoid nested scroll containers unless the inner region is independently navigable, such as a source panel.
- The sidebar must not trap focus when hidden.
- Mobile drawers must close on scrim click, Escape, and navigation.
- Use sticky headers only when they do not obscure focused content.
- Never use horizontal scrolling as the primary responsive strategy for content.

---

## 7. Light, Dark and System theme behaviour

### Current implementation

- Light tokens live in `:root`; dark tokens live in `.dark`.
- `color-scheme` is set for each theme.
- `components/shared/theme-provider.tsx` centralizes Light/Dark/System behavior.
- The choice persists in `localStorage` under `documind-theme`.
- The root layout runs a pre-paint script and sets `suppressHydrationWarning` on `html`.
- `components/shared/theme-toggle.tsx` exposes the toggle in the app header and auth screens;
  Settings also provides an appearance selector.
- System mode listens to `prefers-color-scheme` changes.

### Required behavior

1. **Light theme** is the default resolved theme when no preference exists.
2. **Dark theme** applies when the user selects dark or when system resolves to dark under the system setting.
3. **System theme** follows `prefers-color-scheme` and updates when the operating system changes.
4. The user's explicit choice persists across reloads.
5. Theme switching applies to the document root before first paint, preventing a flash of the wrong theme.
6. After hydration, the resolved theme must match the pre-paint theme with no visible flicker.
7. Native controls, scrollbars, selection colors, and form controls respect the active theme through `color-scheme`.

### Implementation constraints

- Apply the theme class to the root `html` element.
- Use a single centrally documented storage key. Do not let components invent their own.
- Initialize the theme with an inline pre-hydration script or an equivalent mechanism that runs before paint.
- Suppress the expected root hydration warning caused by the pre-paint class.
- Centralize the provider and the toggle. Pages must not implement their own theme logic.
- The theme toggle must be keyboard accessible, expose its current state, and announce changes.
- Avoid a flash caused by a client-only effect that applies the class after paint.

### Theming coverage

All of the following must use semantic tokens and therefore switch automatically:

- Dialogs, drawers, sheets, popovers, menus, and tooltips
- Tables, cards, lists, and dividers
- Inputs, textareas, selects, checkboxes, radios, switches, and sliders
- Code blocks and inline code
- Source panels, citation highlights, and document previews
- Toasts, banners, skeletons, and empty states
- Scrollbars, focus rings, selection colors, and overlays
- Charts or progress indicators, if introduced

### Prohibited theme practices

- No per-component light/dark color branches.
- No `dark:` color overrides when a semantic token exists.
- No hardcoded light or dark values in components.
- No theme-specific component duplication.
- No forced theme on a page unless it is a documented product requirement.

### Contrast and focus

- Test text, icons, borders, focus indicators, and disabled states in both themes.
- Focus indicators must remain visible on every surface token.
- Status colors must meet contrast requirements on `--surface` and `--surface-secondary`.
- Do not rely on subtle background differences alone to convey state.

---

## 8. shadcn/ui usage conventions

### Current state

shadcn/ui conventions are installed and locally owned under `apps/web/components/ui`.
`components.json` uses the existing `@/*` alias and `app/globals.css`. Radix packages provide the
accessible primitive behavior, and `lib/utils.ts` provides `cn()`.

Installed primitives: Button, Input, Textarea, Label, Checkbox, Dialog, Sheet, DropdownMenu,
Progress, Switch, Separator, Collapsible, Badge, Card, Skeleton, and a styled native Select.

### Adoption rule

shadcn/ui is the standard primitive foundation for this project. New primitives are added once in
`components/ui`; never create ad hoc equivalents in feature folders.

When adding or extending a primitive:

- Keep it recognizable and locally owned.
- Map classes to the existing semantic tokens. Do not import an upstream palette.
- Keep `globals.css` as the authoritative token source.
- Add semantic variants rather than copying the component.
- Preserve Radix roles, ARIA attributes, focus management, and keyboard handlers.

### How shared components compose primitives

- Shared product components live in `components/shared` and compose primitives from `components/ui`.
- Feature components live in feature folders and compose both shared components and primitives.
- Pages compose feature and shared components. Pages do not implement control-level behavior.
- Variants belong in the primitive or shared component using a variant API. Do not scatter conditional class strings across pages.
- Use the shared `cn()` helper for conditional classes once it exists. Do not hand-roll class merging.

### Extending a component

1. Check whether an existing variant covers the need.
2. If not, add a named variant to the central component.
3. Keep the variant semantic, such as `destructive`, `ghost`, `subtle`, or `compact`.
4. Ensure every variant uses semantic tokens.
5. Ensure every variant passes the accessibility checklist.
6. Document new variants in this file if they become project-wide conventions.

### Prohibited

- Introducing another component library.
- Copying a shadcn primitive into a feature folder and modifying it there.
- Using unstyled native controls for complex widgets when an accessible primitive exists.
- Removing focus outlines without a replacement.
- Building a new dialog, menu, select, tabs, or tooltip implementation from scratch.
- Using multiple icon libraries.

---

## 9. Shared component architecture

### The single-implementation principle

Every reusable primitive and shared component must have exactly one centralized implementation.

Before creating a component:

1. Search `components/ui`, `components/shared`, and the relevant feature folder.
2. Search for the user-facing label or behavior, not only the proposed file name.
3. If an equivalent exists, extend it.
4. If a similar component exists in a feature folder and is needed elsewhere, promote it to `components/shared`.
5. If it is a raw control, use or add the primitive in `components/ui`.
6. Never create a page-specific duplicate of a shared component.

### Tier 1: UI primitives

Location: `apps/web/components/ui`

Purpose: accessible, unstyled-by-default building blocks with project styling. These are generic and contain no DocuMind product logic.

Examples: Button, Input, Textarea, Label, Checkbox, RadioGroup, Switch, Select, Dialog, Drawer or Sheet, DropdownMenu, Popover, Tooltip, Tabs, Badge, Card, Table, Skeleton, Toast, ScrollArea, Separator, Command.

Rules:

- No data fetching, routing decisions, or product copy.
- No document, chat, or agent concepts.
- Variants are generic and semantic.
- Accessibility behavior is preserved.
- One implementation only.

### Tier 2: Shared product components

Location: `apps/web/components/shared`

Purpose: reusable product-wide compositions that encode DocuMind layout and behavior.

Examples: `AppSidebar`, `AppHeader`, `PageContainer`, `PageHeader`, `EmptyState`, `ErrorState`, `ConfirmDialog`, `SearchInput`, `ThemeToggle`, `UserMenu`, `StatusBadge`, `LoadingState`, `DataTable` wrapper.

Rules:

- May use routing, product copy, and shared hooks.
- May compose primitives and other shared components.
- Must remain generic across features. A component used by only one feature belongs in that feature folder until reuse is real.
- Must not embed mock data. Accept data through props.
- Must expose typed props and predictable slots such as `title`, `description`, `actions`, `children`, `footer`.

### Tier 3: Feature-specific components

Location: `apps/web/components/<feature>`, such as `documents`, `chat`, `history`, `settings`

Purpose: components that express one product area.

Examples: `DocumentCard`, `DocumentUploadDialog`, `DocumentList`, `ChatMessage`, `ChatComposer`, `SourceCitation`, `AgentActivity`, `ToolExecution`, `ConversationListItem`, `SourcePanel`.

Rules:

- May compose primitives, shared components, and feature hooks.
- Must not reimplement primitives or shared layout.
- Keep feature state close to the feature. Promote only when a second feature genuinely needs it.
- Use shared contracts from `packages/shared` for API-shaped data.
- Do not hardcode mock content. Import from `apps/web/mocks` with a removal comment.

### Promotion rule

Move a component up a tier only when there is a real second consumer. Do not pre-abstract for hypothetical reuse. When promoting, update all imports in the same change and leave no duplicate implementation behind.

### Component ownership registry

Record new components here when they are created. Do not add a second implementation of an
existing tier.

| Tier | Components | Path | Status |
| --- | --- | --- | --- |
| UI primitives | Button, Input, Textarea, Label, Checkbox, Dialog, Sheet, DropdownMenu, Progress, Switch, Separator, Collapsible, Badge, Card, Skeleton, Select | `apps/web/components/ui` | Installed |
| Shared product | AppShell, AppSidebar, AppHeader, PageContainer, PageHeading, EmptyState, ErrorState, LoadingState, ConfirmDialog, SearchInput, StatusMessage, StatusBadge, ThemeProvider, ThemeToggle, UserMenu, Brand, navigation config | `apps/web/components/shared` | Implemented |
| Shared (legacy) | `HealthStatus` | `apps/web/components/health-status.tsx` | Kept for the API health demo; not rendered by product routes |
| Auth feature | AuthLayout, AuthCard, FormField, PasswordInput, LoginForm, RegisterForm, ForgotPasswordForm, ResetPasswordForm, VerificationMessage, AuthProvider | `apps/web/components/auth` | Implemented |
| Dashboard feature | DashboardView | `apps/web/components/dashboard` | Implemented |
| Documents feature | DocumentsView, DocumentList, DocumentDetailSheet, UploadDialog | `apps/web/components/documents` | Implemented |
| Chat feature | ChatView, ChatMessageItem, ChatComposer, ChatEmptyState, MessageBlocks, AgentActivity, SourceCitation, SourcePanel | `apps/web/components/chat` | Implemented |
| History feature | HistoryView | `apps/web/components/history` | Implemented |
| Settings feature | SettingsView, SettingsSection, ProfileSection, AppearanceSection, PreferencesSection, MemorySection, PrivacySection, AccountSection | `apps/web/components/settings` | Implemented |

---

## 10. Recommended folder structure

The task template uses `src/`. This repository has no `src` directory in the web app. The path alias `@/*` points at `apps/web/*`, so the adapted convention is below.

```text
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── verify-email/
│   ├── (app)/
│   │   ├── dashboard/
│   │   ├── documents/
│   │   ├── chat/
│   │   │   └── [conversationId]/
│   │   ├── history/
│   │   ├── settings/
│   │   ├── error.tsx
│   │   └── loading.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/                  # shadcn/ui primitives
│   ├── shared/              # Reusable product-wide components
│   ├── auth/                # Auth forms, layout, provider
│   ├── dashboard/           # Overview
│   ├── documents/           # Knowledge base
│   ├── chat/                # Chat, citations, and agent activity
│   ├── history/             # Conversation history
│   └── settings/            # Settings sections
│
├── hooks/
├── lib/
│   ├── auth/                # mock service, session cookie, validation, types
│   ├── format.ts
│   ├── theme.ts
│   ├── types.ts
│   └── utils.ts
├── mocks/
│   ├── auth.ts
│   ├── dashboard.ts
│   ├── documents.ts
│   ├── conversations.ts
│   └── agent.ts
└── test/                    # Vitest jsdom setup
```

### Responsibilities

- `app/`: routing, layouts, page composition, metadata. Pages should stay thin.
- `app/(auth)/`: public authentication routes with an authenticated-user redirect.
- `app/(app)/`: the authenticated product shell and its routes, guarded by the mock session cookie.
- `components/ui/`: primitives only.
- `components/shared/`: cross-feature product components.
- `components/<feature>/`: feature compositions and feature-local state.
- `hooks/`: reusable client hooks. A hook used by one component stays beside that component until reuse is real.
- `lib/`: framework-agnostic helpers, formatters, API clients, and configuration. Do not put React components here.
- `mocks/`: centralized mock datasets and mock adapters.
- `app/globals.css`: the only global token and base-style entry point.

### Adaptation rules

- This structure is a convention, not a reason to move working code.
- Do not reorganize the repository merely to match the tree above.
- Create directories only when they receive real files.
- When a new feature needs a folder, follow the singular feature naming used by the route (`documents`, `chat`, `history`, `settings`).
- Keep existing working files in place until a dedicated refactor task moves them.

---

## 11. Component implementation standards

These standards apply once the primitive foundation exists. Until then, do not implement these components ad hoc.

### General conventions

- File names: kebab-case, for example `empty-state.tsx`, `page-container.tsx`.
- Component exports: PascalCase named exports. Pages and required Next.js files may use default exports.
- Props: `ComponentNameProps` interfaces with explicit types. No `any`.
- Prefer composition over configuration. Use `children` and named slots before adding many boolean props.
- Boolean props must be positive and readable. Avoid double negatives.
- Forward refs where a primitive or consumer needs DOM access, following the adopted primitive convention.
- Spread supported native attributes onto the underlying element.
- Accept and merge `className` through the shared `cn()` helper once it exists.
- Do not use `style` for theme or scale values.
- Keep components focused. A component that renders a whole page is a page.
- No comments unless the task requires them. Mock comments are the documented exception.

### Buttons

- Use the shared Button primitive.
- Variants: primary/default, secondary, ghost, outline, destructive, link. Add only variants the product uses.
- Sizes: a small set such as small, default, large, icon. Keep touch targets adequate on mobile.
- One primary action per view region.
- Loading buttons disable interaction and expose busy state. Preserve width to avoid layout shift.
- Icon-only buttons require an accessible label.
- Destructive actions use the destructive variant and confirmation when irreversible.
- Never use a button for navigation; use a link.

### Inputs and forms

- Use shared Input, Textarea, Label, Select, Checkbox, RadioGroup, and Switch primitives.
- Every control has a visible label. Placeholder text is not a label.
- Associate labels with controls. Use help text and error text with `aria-describedby`.
- Mark invalid fields with `aria-invalid` and an error message. Do not rely on border color alone.
- Keep validation messages adjacent to the field.
- Group related controls with `fieldset` and `legend` where appropriate.
- Enter submits a single-line form when appropriate. Do not hijack Enter in textareas.
- Search inputs use a search role or labeled input and expose a clear action.
- Never use disabled controls to hide required information. Explain why an action is unavailable.

### Dialogs and drawers

- Use one shared Dialog primitive and one shared drawer or sheet primitive.
- Dialogs require a title and description, or an explicit accessible name.
- Focus moves into the dialog on open and returns to the trigger on close.
- Escape closes the dialog unless the action is destructive and mid-flight.
- Background content is inert while open.
- Destructive confirmation uses `ConfirmDialog` or the shared dialog composition, not a one-off.
- On mobile, dialogs become sheets where the content is long or the context is navigational.
- Drawers used for navigation must not trap focus after closing.
- Avoid dialogs for simple inline actions.

### Cards and tables

- Cards are for deliberate grouping. Do not wrap every section.
- A card uses `--surface` with `--border`. Do not add a shadow by default.
- Table headers use `--surface-secondary` and secondary text; rows use `--surface`.
- Row hover uses `--surface-secondary`, not an arbitrary alpha color.
- Numeric columns align consistently and use tabular numerals.
- Tables need a caption or an accessible name.
- On mobile, switch to a card or list representation rather than forcing a wide table.

### Badges and status indicators

- Use Badge for short categorical labels, not for actions.
- Status badges combine a semantic token, a label, and optionally an icon or dot.
- Do not convey status through color alone.
- Do not use a badge as a button.
- Status text must remain readable in both themes.
- Use `--success`, `--warning`, `--danger`, and `--info` for meaning. Use `--primary-subtle` only for selection or neutral emphasis.

### Dropdowns and tooltips

- Use the shared DropdownMenu and Tooltip primitives.
- Menus contain actions or navigation, not arbitrary content.
- Tooltips supplement a visible label. They never replace the only label.
- Tooltips open on hover and keyboard focus, dismiss on Escape, and remain available long enough to read.
- Menus close on Escape and return focus to the trigger.
- Do not attach a tooltip to a disabled control without a focusable wrapper.
- Avoid tooltips on mobile-only interactions.

### Empty states

- Use the shared `EmptyState` component.
- Include an icon when it clarifies the object, a short title, a one-sentence explanation, and one primary action.
- Do not use an empty state for loading or errors.
- Copy must tell the user what to do next.
- Empty states must not fabricate sample documents as if they were real.

### Loading and skeleton states

- Use the shared Skeleton primitive and `LoadingState` composition.
- Skeletons mirror the final layout and avoid layout shift.
- Use skeletons for content areas, spinners for short indeterminate actions, and progress for known durations.
- Announce long-running loading with an appropriate live region.
- Do not show a full-page spinner when a local skeleton is enough.
- Do not render mock content as a loading placeholder.

### Error states

- Use the shared `ErrorState` component.
- Explain what failed in plain language, offer retry when safe, and preserve user input.
- Do not expose stack traces, database errors, or internal identifiers.
- Errors are announced to assistive technology.
- Destructive or data-loss errors require a clear next step.
- Provide an error boundary at the route segment level once the app has routes.

### Toast notifications

- Use one shared toast system.
- Toasts are transient confirmations, not the only place an error appears.
- Success toasts use `role="status"`; errors use `role="alert"` or assertive announcement.
- Toasts must not steal focus.
- Provide a dismiss control and pause on hover or focus where supported.
- Keep messages short. Do not put required actions only inside a toast.
- Never use a toast to represent simulated AI completion.

### Navigation

- Use the shared `AppSidebar`, `AppHeader`, and navigation primitives.
- Active route indication uses `--primary-subtle` and `--foreground`, not a heavy filled block.
- Links are links; buttons are actions.
- The sidebar is a navigation landmark with an accessible name.
- Mobile navigation is a modal drawer with focus management.
- Do not add an Agent Workspace item. Agent activity is inside chat.
- Keep an accessible skip link to the main content.

### Chat messages and composer

- Chat messages use semantic structure: an ordered list or log where appropriate, with each message labeled by author and time.
- User and assistant messages must be distinguishable without relying on color alone.
- Assistant content supports headings, lists, links, inline code, and code blocks using shared typography and code styles.
- Streaming content uses a polite live region or an equivalent non-interruptive announcement. Do not announce every token.
- The composer uses a textarea with a visible or screen-reader label. Enter sends; Shift+Enter inserts a newline.
- Provide a visible stop control while a response is streaming.
- Disable send only when there is no content or the request is invalid, and explain why.
- Preserve draft text on failure.
- Attachments and document references are explicit, removable, and accessible.
- Do not represent simulated responses as real model output.

### Document citations

- Use a shared `SourceCitation` component.
- A citation identifies the document and the location precisely enough to verify the claim.
- Citation controls are buttons or links with accessible names that include the document and location.
- Do not fabricate citations or page numbers in mock data without the mock marker.
- Highlighted source excerpts use `--primary-subtle` plus a text label or marker.
- Opening a source must return focus to the citation when the source panel closes.
- Citations must remain usable on mobile.

### Agent tool execution displays

- Use a shared `AgentActivity` and tool execution composition inside assistant messages.
- Show tool name, status, a short human summary, and expandable input and output.
- Status uses success, danger, warning, and info tokens with a text label.
- Collapsed by default unless there is an error or the detail is essential.
- Errors show a safe message and keep technical details behind an explicit disclosure.
- Do not expose secrets, tokens, raw filesystem paths, or internal prompts.
- Execution panels must be keyboard operable and announced when status changes.
- Do not create a separate agent workspace for the current MVP.

---

## 12. Iconography guidelines

### Current state

No icon library is installed. Do not import icons today.

### Target

Lucide React is the intended icon library once the foundation task installs it.

### Rules

- Use one icon library only.
- Use icons to support labels, not replace them, except in icon-only controls with an accessible name.
- Decorative icons use `aria-hidden` and are not focusable.
- Icon-only buttons require `aria-label` or a visually hidden label.
- Icons inherit `currentColor` and size from the component context. Do not hardcode colors.
- Use a consistent size scale defined centrally. Do not mix arbitrary sizes in the same control group.
- Do not use emoji as interface icons.
- Do not use filled and outline styles inconsistently in the same context.
- Status icons pair with text and semantic status color.
- Common metaphor mapping: search, upload, document, message, history, settings, chevron, close, copy, external link, alert, check, spinner or loader.
- Avoid decorative icons that add noise without meaning.

---

## 13. Forms and interaction patterns

### General interaction

- All interactive elements must be reachable and operable by keyboard.
- Focus order follows the visual order.
- Focus is always visible.
- Hover-only affordances must also appear on focus.
- Disabled states must be visibly and programmatically disabled.
- Loading states prevent duplicate submission.
- Destructive actions require confirmation when they remove documents, conversations, or account data.

### Tabs

Tabs are a common source of keyboard bugs. Implement them through the shared Tabs primitive with roving tabindex.

Required behavior:

- `role="tablist"` on the container, `role="tab"` on each tab, `role="tabpanel"` on each panel.
- Only the active tab is in the tab order.
- `ArrowLeft` and `ArrowRight` move between tabs.
- `Home` moves to the first tab; `End` moves to the last tab.
- Activation follows the selected interaction model consistently. Prefer automatic activation for simple, instantly rendered panels.
- The active tab exposes `aria-selected="true"`.
- Each tab controls its panel with `aria-controls`; each panel is labeled by its tab with `aria-labelledby`.
- Inactive panels are hidden from assistive technology and removed from the tab order.
- Do not use tabs as navigation between routes. Use links for routing.
- Tab labels must be concise and remain visible on mobile, with horizontal scrolling only when necessary.

### Dropdown menus

Implement through the shared DropdownMenu primitive.

Required behavior:

- The trigger exposes `aria-haspopup="menu"` and the expanded state.
- `Enter`, `Space`, and `ArrowDown` open the menu and move focus into it.
- `ArrowUp` and `ArrowDown` move between items.
- `Home` and `End` move to the first and last item.
- Typeahead may move to an item by its leading characters.
- `Escape` closes the menu and returns focus to the trigger.
- Selecting an item closes the menu and performs the action.
- Items use `role="menuitem"` where appropriate. Do not put interactive form controls inside a menu.
- Disabled items remain discoverable but are not activatable.
- Menus do not trap focus; they close on outside interaction and return focus correctly.
- Submenus are keyboard operable and open with `ArrowRight`.

### Selects and comboboxes

- Use the shared Select primitive or an accessible combobox primitive.
- `ArrowUp` and `ArrowDown` move through options; `Home` and `End` jump to boundaries.
- Enter selects; Escape closes and restores the previous value.
- Typeahead is supported for long lists.
- The selected value is programmatically exposed.
- Do not build a custom select from a styled div without full keyboard and screen-reader behavior.
- Multi-select requires explicit removal controls and accessible announcements.

### Dialogs, drawers, and focus management

- On open, focus moves to the first meaningful control or the dialog container.
- Focus is trapped inside modal surfaces.
- `Escape` closes when safe.
- On close, focus returns to the element that opened the surface.
- Background scroll is locked while a modal is open.
- The accessible name comes from a visible title where possible.
- Confirm dialogs focus the least destructive action by default.

### Tooltips and popovers

- Tooltips appear on hover and focus, dismiss on Escape, and do not contain interactive content.
- Popovers may contain interactive content and must manage focus predictably.
- Do not rely on hover for essential information on touch devices.

### Search and filtering

- Search inputs are labeled and expose a clear button.
- Filtering updates results without losing focus.
- Result counts are announced when they change.
- Empty results use the shared empty state, not an error state.
- Do not debounce in a way that makes the interface feel unresponsive; document the chosen behavior.

### File upload interaction

- Provide a visible upload control and a drag-and-drop region that is also keyboard operable.
- Announce accepted file types, size limits, and progress.
- Upload progress and completion must be distinguishable.
- Failed uploads preserve the selected file and offer retry where possible.
- Uploaded mock documents must never be presented as processed real documents.

---

## 14. Loading, empty and error states

Every data-driven view must define all three states before implementation is considered complete.

### Loading

- Use skeletons that match the final composition.
- Keep navigation and page chrome stable while content loads.
- Use a local spinner only for a small, short action.
- Expose busy state with `aria-busy` and announce long waits.
- Avoid full-page loading flashes for fast requests.
- Do not use fake content as a loading state.

### Empty

- Distinguish first-use emptiness from no-results emptiness.
- First use explains the feature and offers the primary next step.
- No results offers a clear reset or adjusted query.
- Empty states use the shared component and consistent spacing.
- Do not show mock documents to fill an empty state.

### Error

- Use the shared error composition.
- Explain what happened and what the user can do.
- Offer retry only when retry is meaningful.
- Preserve user input and draft content.
- Log technical details server-side; never expose them in the UI.
- Use `--danger` with text and icon, not color alone.
- Provide route-level error boundaries once routes exist.

---

## 15. Mock data and removal policy

### Strict requirement

Every dummy value, mock response, sample dataset, and simulated interaction must carry an explicit removal comment.

Exact comment conventions:

```ts
// TODO: REMOVE MOCK — Replace with actual API response.
```

```ts
// TODO: REMOVE MOCK — Replace simulated behaviour with backend integration.
```

```tsx
{/* TODO: REMOVE MOCK — Replace with actual user data. */}
```

Use the same wording and the em dash exactly. Do not paraphrase, translate, or abbreviate the marker. The marker must be searchable repository-wide with `TODO: REMOVE MOCK`.

### Rules

- Centralize mock datasets in `apps/web/mocks`.
- Do not scatter dummy values across UI components.
- Keep mock adapters separate from production API clients.
- Mock modules must be clearly named and must export typed data or typed adapter functions.
- Every mock module starts with the removal comment and identifies the future API source.
- Components that consume mocks must import from `apps/web/mocks`; they must not inline the data.
- Mock data must use the same TypeScript contracts as the future API where those contracts exist in `packages/shared`.
- Keep mock delays and failures behind a clearly marked simulation helper.
- Do not use realistic secrets, personal data, or real document contents.
- Do not present mock content as if it were live.

### Prohibited representations

- Never represent simulated AI responses as real AI responses.
- Never represent simulated uploads as actual processed documents.
- Never fabricate real document citations.
- Never show fake agent tool output as if a real tool executed.
- Never ship a mock fallback silently when the API is unavailable.

### Current mock modules (Task 002)

- `mocks/auth.ts` — demo credentials, mock user, reset token.
- `mocks/documents.ts` — 8 sample documents.
- `mocks/conversations.ts` — 5 conversations plus the simulated reply factory.
- `mocks/agent.ts` — 3 tool executions.
- `mocks/dashboard.ts` — derived stats and selectors.

Unit tests under `apps/web` cover validation, the API signup service and axios client, the
remaining mock auth service, cookie serialization, formatting, theme behavior, document filtering,
chat simulation, and agent disclosures.
Backend tests under `apps/api/tests` cover environment validation, signup validation, the signup
service and route responses, the health service, and health route responses with a stubbed Prisma
client.

### Lifecycle

1. Create the mock in `apps/web/mocks` with the exact marker.
2. Use the mock only in the feature that needs it.
3. When the backend contract exists, add the real client in `lib`.
4. Replace the mock import with the real data path.
5. Delete the mock export and its file if no longer used.
6. Search for `TODO: REMOVE MOCK` and confirm no production path remains.
7. Verify loading, empty, error, and success states with the real integration.
8. Remove any simulated delays or fallback behavior.

### Pre-production gate

Production-bound work is not complete while:

- Any `TODO: REMOVE MOCK` remains in a user-facing path.
- Mock data is reachable through a silent fallback.
- A simulated agent response is indistinguishable from a real one.
- A citation cannot be traced to a real document and location.
- A mock adapter is imported by a production data layer.

---

## 16. Accessibility standards

Target: WCAG 2.2 AA for all product UI.

### Fundamentals

- Use semantic HTML first: `main`, `nav`, `header`, `footer`, `aside`, `section`, `article`, `button`, `a`, `form`, `label`, `table`, headings, and lists.
- Do not use a `div` or `span` as a button, link, checkbox, or menu item.
- Every page has one `h1` and a logical heading order.
- Every landmark has an accessible name where more than one of the same type exists.
- Provide a skip link to the main content.
- Set the document language correctly.
- Interactive elements have a minimum comfortable touch target on mobile.
- Never remove focus outlines without an equally visible replacement.
- Use sufficient contrast for text, icons, borders, focus rings, and status indicators in both themes.
- Do not use color as the only means to convey meaning.
- Text must remain usable when the browser zoom is increased and when text spacing is adjusted.
- Content must reflow without loss of information at narrow widths.

### Keyboard support matrix

| Pattern | Required keys and behavior |
| --- | --- |
| Buttons | `Enter` and `Space` activate |
| Links | `Enter` activates; visible focus; no fake links |
| Tabs | `ArrowLeft`/`ArrowRight`, `Home`/`End`, roving tabindex, `aria-selected`, panel labeling |
| Dropdown menu | `Enter`/`Space`/`ArrowDown` open; arrows navigate; `Home`/`End`; Escape closes and restores focus |
| Select / listbox | Arrows navigate; `Home`/`End`; Enter selects; Escape cancels; typeahead for long lists |
| Dialog / modal drawer | Focus moves in; trapped; Escape closes; focus returns to trigger; background inert |
| Tooltip | Opens on hover and focus; Escape dismisses; not the only label |
| Accordion / disclosure | `Enter`/`Space` toggles; `ArrowUp`/`ArrowDown` move between headers where implemented |
| Sidebar | Landmark; keyboard reachable; mobile drawer closes on Escape and navigation |
| Chat composer | `Enter` sends, `Shift+Enter` newline, labeled textarea, visible stop control while streaming |
| Tables | Header associations; keyboard reachable interactive cells; caption or accessible name |
| Toasts | Do not steal focus; announced status; dismiss control reachable |
| File upload | Keyboard-operable picker; drag-and-drop is an enhancement, not the only path |

### Focus management

- Modal surfaces trap focus and restore it.
- Non-modal popovers return focus predictably.
- Route changes move focus to the page heading or main region in a way that is announced.
- Error summaries receive focus when a form submission fails.
- Do not move focus on every async update.

### Screen readers

- Announce meaningful status changes, upload progress, agent tool status, and streaming completion.
- Use polite live regions for non-urgent updates and assertive announcements for errors.
- Do not announce every streamed token.
- Icon-only controls have accessible names.
- Decorative icons are hidden from assistive technology.
- Provide text alternatives for document thumbnails and previews.
- Do not rely on `title` attributes as the only label.

### Reduced motion

- Respect `prefers-reduced-motion`.
- Remove or shorten non-essential transitions and animations.
- Keep state changes understandable without motion.
- Do not autoplay decorative animation.
- Streaming indicators may pulse or shimmer only when reduced motion is not requested.

### Forms accessibility

- Labels are always visible.
- Required fields are indicated in text, not only with an asterisk.
- Errors are associated with fields and summarized.
- Help text is associated with the control.
- Custom controls preserve native semantics or fully implement the expected role and keyboard behavior.
- Do not disable paste in password or search fields.

### Testing before completion

- Keyboard-only pass through the entire flow.
- Screen-reader smoke test for labels, roles, and announcements.
- Zoom and narrow-width pass.
- Both themes.
- Reduced-motion pass.
- Focus-visible pass on every interactive element.
- Contrast check for text, icons, borders, and status indicators.

---

## 17. DocuMind AI product-specific patterns

### Product model

DocuMind AI is a personal AI document intelligence and knowledge assistant. The main experience is a unified chat interface.

Users must be able to:

- Upload and manage documents.
- Ask questions about documents.
- Receive answers with citations.
- Inspect source documents.
- See expandable agent activity and tool execution inside assistant messages.
- Inspect tool inputs, outputs, execution status, and errors.
- Continue conversations and access history.

### Primary navigation

Target items: Dashboard, Documents, Chat, History, Settings.

Do not create a separate Agent Workspace in the primary navigation for the current MVP. Agent functionality belongs inside the chat experience.

### Dashboard

- Summarize recent documents and recent conversations.
- Provide a direct path into chat and upload.
- Use restrained metrics, not a wall of cards.
- Distinguish real data from mock data explicitly.
- Every panel defines loading, empty, and error states.

### Documents

- Show document name, type, status, size, and upload time.
- Processing and failure states are explicit and use status tokens with labels.
- Row or card actions include open, cite in chat, and delete.
- Deletion uses confirmation.
- Upload progress is visible and announced.
- Responsive lists become cards or stacked rows on mobile.
- Document previews and source excerpts must be traceable to the real file.

### Chat

- The conversation is the primary surface.
- Messages distinguish user and assistant roles.
- Assistant answers support rich text and citations.
- The composer remains reachable and does not jump while streaming.
- A source panel can open beside or over the conversation depending on viewport.
- Conversation history is accessible without leaving chat.
- Agent activity is collapsible inside assistant messages.
- Errors preserve the draft and offer retry.

### Citations and source inspection

- Citations appear inline with the answer and identify the source precisely.
- Selecting a citation opens the source panel at the relevant location and moves focus appropriately.
- The source panel supports closing and returning focus to the citation.
- On mobile, the source panel is a full-screen sheet with a clear close action.
- Do not fabricate page numbers or excerpts.
- Citation styling uses `--primary-subtle` and remains legible in both themes.

### Agent activity and tool execution

- Display a compact summary line inside the assistant message.
- Expand to show tool name, input summary, output summary, status, and duration.
- Status: pending, running, succeeded, failed, cancelled. Use text labels and semantic tokens.
- Errors are safe and actionable; raw details sit behind a disclosure.
- Do not show internal prompts, secrets, or raw filesystem paths.
- Announce status changes to assistive technology.
- Do not create a separate agent console.

### History

- List conversations with title, updated time, and a short preview.
- Support search and deletion with confirmation.
- Empty state offers a path back to chat.
- Do not use mock history as if it were real.

### Settings

- Group settings by topic with clear labels and descriptions.
- Use the shared form primitives and validation patterns.
- Destructive account or data actions require confirmation.
- Theme selection lives here and in a globally reachable toggle.

### Upload

- Accept PDF and TXT only unless the product scope expands.
- State limits and errors clearly.
- Show progress and completion.
- Never present a simulated upload as a processed document.
- Keep upload available from Documents and from the chat composer where appropriate.

---

## 18. Rules for future AI coding agents

This section is mandatory and takes precedence over local convenience.

### Before implementing any UI

1. Read `DESIGN_SYSTEM.md`.
2. Inspect the existing CSS variables in `apps/web/app/globals.css`.
3. Inspect existing shared components and primitives.
4. Reuse existing shadcn/ui primitives once they exist.
5. Reuse shared product components.
6. Follow existing folder conventions.
7. Use centralized mock data when backend APIs are unavailable.
8. Add `TODO: REMOVE MOCK` comments to all temporary content and simulated behavior.
9. Ensure Light and Dark theme compatibility.
10. Verify responsive behavior and accessibility, including keyboard navigation.

### Prohibited

- Inventing new tokens, token values, or a parallel color system.
- Hardcoding colors, shadows, radii, or spacing in components.
- Creating a second component library or icon library.
- Creating page-specific duplicates of shared components.
- Adding a separate Agent Workspace to primary navigation for the current MVP.
- Implementing screens that were not requested.
- Modifying `globals.css` or the styling configuration outside a task that explicitly owns that change.
- Adding dependencies without a concrete need and explicit approval.
- Presenting mock data, simulated AI output, or fabricated citations as real.
- Removing focus indicators or keyboard behavior from primitives.
- Using `dark:` color overrides when semantic tokens exist.

### Conflict protocol

If a requirement conflicts with the existing implementation:

1. Stop before changing shared configuration.
2. Read the relevant source files and identify the exact conflict.
3. Explain the conflict, including which file and which behavior disagree.
4. Propose the smallest change that preserves the existing system.
5. If the conflict requires a new token or primitive, state the gap and recommend the semantic name.
6. Do not silently fork the design system to satisfy a local screen.

### Scope discipline

- Implement only the requested UI.
- Keep pages thin and components focused.
- Do not reorganize the repository to match a template.
- Do not refactor working code unless the task requires it.
- Do not invent backend APIs. Use centralized mocks with removal markers until contracts exist.
- Run the repository's typecheck and build commands before reporting completion.

---

## 19. Pre-implementation checklist

Complete this before writing UI code.

- [ ] I read `DESIGN_SYSTEM.md`.
- [ ] I inspected `apps/web/app/globals.css` and did not assume token values.
- [ ] I confirmed whether the primitive foundation exists.
- [ ] I searched for an existing primitive, shared component, or feature component.
- [ ] I identified the correct tier and folder for any new component.
- [ ] I identified which semantic tokens the component will use.
- [ ] I did not introduce a new token unless the role is genuinely missing.
- [ ] If a token is missing, I documented the gap and proposed a semantic name.
- [ ] I identified the loading, empty, error, and success states.
- [ ] I defined the keyboard interaction model, including tabs and menus.
- [ ] I defined focus behavior for modals, popovers, and route changes.
- [ ] I confirmed Light, Dark, and System theme behavior.
- [ ] I confirmed responsive behavior for desktop, tablet, and mobile.
- [ ] I identified all mock data and where it will live.
- [ ] I planned the exact `TODO: REMOVE MOCK` markers.
- [ ] I confirmed no real documents, citations, or AI responses are fabricated.
- [ ] I confirmed no new dependency is required, or I have explicit approval.
- [ ] I confirmed the change does not reorganize unrelated code.

---

## 20. UI review and quality checklist

Use this before reporting UI work complete.

### Visual system

- [ ] All colors come from semantic CSS variables.
- [ ] No hex, `rgb()`, `hsl()`, palette utilities, or arbitrary color values in components.
- [ ] Surfaces use `--background`, `--surface`, and `--surface-secondary` correctly.
- [ ] Text hierarchy uses `--foreground`, `--foreground-secondary`, and `--foreground-muted`.
- [ ] Primary accent is restrained and purposeful.
- [ ] Borders use `--border` and `--border-strong` appropriately.
- [ ] No unnecessary gradients, shadows, cards, or containers.
- [ ] Spacing and typography come from the central scale.
- [ ] Both themes were inspected visually.

### Themes

- [ ] Light theme is correct.
- [ ] Dark theme is correct.
- [ ] System theme follows the operating system.
- [ ] Theme choice persists.
- [ ] No flash of the wrong theme on load.
- [ ] Dialogs, menus, tooltips, tables, cards, code blocks, and source panels are themed.

### Components

- [ ] Existing primitives and shared components were reused.
- [ ] No duplicate implementation exists.
- [ ] Variants are defined centrally.
- [ ] Props are typed and `any` is not used.
- [ ] Naming and file placement follow the conventions.
- [ ] Pages remain thin and composition-focused.
- [ ] No component-specific fork of the design system exists.

### Interaction and accessibility

- [ ] Every interactive element is keyboard reachable.
- [ ] Focus is always visible.
- [ ] Tabs support arrows, Home, and End with roving tabindex.
- [ ] Dropdowns support arrows, Home, End, Escape, and focus return.
- [ ] Selects and comboboxes support arrows, typeahead, and Escape.
- [ ] Dialogs trap focus, close on Escape, and restore focus.
- [ ] Tooltips open on focus and hover and dismiss on Escape.
- [ ] Labels are visible and associated with controls.
- [ ] Errors are announced and associated with fields.
- [ ] Status is not conveyed by color alone.
- [ ] Touch targets are adequate on mobile.
- [ ] Reduced motion is respected.
- [ ] Heading order and landmarks are correct.
- [ ] Screen-reader labels exist for icon-only controls.
- [ ] Chat streaming and agent status changes are announced appropriately.

### Responsive

- [ ] Desktop layout is verified.
- [ ] Tablet layout is verified.
- [ ] Mobile layout is verified.
- [ ] Sidebar or drawer behavior is correct.
- [ ] Document lists adapt without broken columns.
- [ ] Chat and source panel adapt correctly.
- [ ] Dialogs and sheets are usable on small screens.
- [ ] No essential content requires horizontal scrolling.

### Data and mocks

- [ ] All mock data lives in `apps/web/mocks`.
- [ ] Every mock has the exact `TODO: REMOVE MOCK` marker.
- [ ] Simulated behavior is marked.
- [ ] No mock is imported by a production data path.
- [ ] No simulated AI response, upload, or citation is presented as real.
- [ ] Loading, empty, and error states were tested.
- [ ] The removal process is documented for the next agent.

### Verification

- [ ] `pnpm typecheck` passes.
- [ ] `pnpm build` passes.
- [ ] The changed flow was exercised in the browser.
- [ ] Both themes and a narrow viewport were checked.
- [ ] The completion report lists inspected files, gaps found, and next steps.

---

## Appendix A: Foundation status after Task 002

Resolved:

1. Tailwind v4, shadcn/ui conventions, Radix, Lucide, and `cn()` are installed.
2. `components/ui` and `components/shared` exist with the registered components above.
3. `globals.css` defines the previously missing semantic tokens, type roles, radius, shadow, and motion values.
4. Light/Dark/System theme behavior is centralized with persistence and pre-paint initialization.
5. The `.dark` class is applied by the theme provider.
6. Product routes no longer render the legacy `card`, `muted`, `status`, and `dot` classes.
7. Vitest unit tests are configured for both apps.

Remaining limitations (not implementation requests):

1. `health-status.tsx` still contains legacy classes and an inline margin; do not copy it as a pattern.
2. No visual-regression, end-to-end, or automated accessibility tooling is configured.
3. All product behavior is simulated and must be replaced through the `TODO: REMOVE MOCK` lifecycle.
4. Client-side route protection is not a security boundary; real authorization belongs in the API.
