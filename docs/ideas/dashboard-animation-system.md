# Dashboard Micro-Animation System

## Problem Statement
How might we introduce purposeful, tactile micro-motion into RoleFlow's Master–Detail dashboard that feels responsive and high-end (like the Steadwing reference), without introducing sluggish latency or generic "AI slop"?

---

## Why Animation Was Not Used Initially
In the first pass of the Master–Detail redesign, our focus was entirely on **structural architecture and information design**:
1. Eliminating bloated card grids and artificial drop-shadows.
2. Establishing hairline borders (`#eaecf0` / `dark:border-slate-800`), studio canvas backgrounds, and pastel status pills.
3. Guaranteeing data fidelity across 21 PGE employees, primary JDs, duties checklists, and secondary role stacks.

Animation was intentionally deferred rather than forgotten, avoiding the common failure mode of spraying generic bouncy entrance keyframes before the content hierarchy was validated.

---

## Recommended Direction: 4-Layer Tactile Animation Matrix

All four selected animation layers will be implemented using pure, GPU-accelerated Tailwind transitions and CSS transforms (`transform`, `opacity`), keeping bundle size 0 kB additional:

### 1. Master–Detail Content Crossfade & Spring Bar
- **Keyed Content Transition**: When selecting an employee from the left panel, the right panel content smoothly transitions using a subtle 180ms ease-out fade & slight vertical slide (`opacity: 0 -> 1`, `translateY: 6px -> 0`).
- **Dynamic FTE Progress Bar Fill**: Animate the workload allocation bar on selection with a high-performance spring easing (`transition: width 500ms cubic-bezier(0.16, 1, 0.3, 1)`), visually filling the capacity from 0 to current workload.

### 2. Steadwing Card Micro-Interactions
- **Hairline Grid Hover State**: Directory cards and secondary role cards subtly elevate on hover (`translateY(-1px)` with a delicate hairline shadow highlight `shadow-[0_2px_8px_rgba(0,0,0,0.04)]`).
- **Directional Arrow Nudge**: The `Buka Full JD` link arrow (`↗`) nudges 2px top-right on hover (`group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-150`).
- **Pill Hover Pop**: Department and filter pills have a micro-scale response (`active:scale-95 transition-transform duration-100`).

### 3. Overload & Critical Alerts Pulse
- **Ambient Overload Glow**: Overloaded badges (>100% FTE) and critical vacancy alerts pulse gently with an ambient, slow keyframe animation (`2.5s ease-in-out infinite`), giving managers immediate peripheral awareness without harsh flashing.

### 4. Accordion Motion for Secondary Roles & Duties
- **Collapsible Secondary Stack**: Secondary role cards and duty lists expand and collapse smoothly with rotating chevron indicators (`rotate-180 transition-transform duration-200`) and height transitions.

---

## Key Assumptions to Validate
- [ ] **Frame Budget**: Transitions must consistently maintain 60 FPS on lower-power devices.
- [ ] **Accessibility**: All animations automatically respect `prefers-reduced-motion: reduce`.
- [ ] **Zero Latency Perception**: Crossfades must never delay clicks or make switching between employees feel sluggish (kept <= 200ms).

---

## MVP Scope
- CSS keyframe definitions in `src/index.css` for crossfade, ambient pulse, and accordion transition.
- Integration directly into `src/components/dashboard/DashboardBentoView.tsx`.
- Micro-interactions for buttons, filter pills, and directory items.

## Not Doing (and Why)
- **Heavy Lottie or 3D canvas animations**: Adds unnecessary bundle bloat and causes battery drain.
- **Full-page cascading entrance staggers on every scroll**: Distracts users from reading job descriptions and introduces reading fatigue.
- **Sluggish >500ms route transitions**: Fast master-detail switching is paramount for HR audit efficiency.
