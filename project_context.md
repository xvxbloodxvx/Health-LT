# Health LT — Project Architecture & Ground Truth Rules

## 1. User Profile & Protocols
- User: Wei Guo (Singapore).
- Protocol: Strict Modified Ketogenic Diet (High Protein prioritized over Fats).
- Food Database Standard: Primary source is Singapore Health Promotion Board (HPB) Food Composition Database. Western packaged items use USDA.

## 2. Blueprint Nutritional & Caloric Targets
- Net Carbs: <= 30.0g (Safe / Minimalist). 30g–50g (Soft warning amber). > 50.0g (Hard breach red flag).
- Calories: 1,300 – 1,500 kcal baseline. Strict alert flag if > 1,500 kcal. Never display "/ 1400" as a target limit.
- Protein: 90g – 110g daily floor (regularly tracks up to 140g–160g).
- Dietary Fiber: Strict 35g – 40g daily target (tracked for gut motility alongside Psyllium husk).
- Electrolytes: Sodium >= 2,500mg, Potassium >= 3,500mg, Magnesium >= 420mg, Calcium >= 800mg.
- Atwater Verification Rule: Calories must strictly equal (Protein * 4) + (Net Carbs * 4) + (Fat * 9).
- Logging Modes: Dual-mode support in Log Food tab — 'Direct Day Total' (Option 1: aggregate daily inputs with live Atwater verification without meal separation) and 'Per-Meal (Meal 1–3)'.

## 3. Shift Work Dynamics (Singapore 12.5h Rotating Roster)
- Schedule rotates monthly:
  * Odd Months (Sep, Nov, Jan): AM Shift (08:30 - 21:00). Pattern: AM Work -> AM Work -> Standby -> Rest.
  * Even Months (Oct, Dec): PM Shift (20:30 - 09:00). Pattern: PM Work -> PM Work -> Rest -> Standby.
  * Nov 14 2026: Official taken-over swap to AM Work.
- Date Navigation: Uses "Active Shift Cycle" (DD-MM format) so overnight night shifts compound into one logical day.
- Biometrics: Tracks split sleep / naps, waking count interruptions (0, 1, 2, 3+), and Bowel Movement (BM) count.

## 4. Workout Routines & Equipment Constraints
- Repeating 4-Day Cycle linked to shift rhythm:
  * Day 1 (Work): Calisthenics Circuit (3 rounds: 50s Plank -> 90s rest -> 4 Pull-ups -> 90s rest -> 1-2 Chin-ups) followed by Parallel Bar Inclined Chin-ups (3x5).
  * Day 2 (Work): Strength (Slow bodyweight squats 3x20, Bench incline push-ups 3x10, Bench dips 3x8, Decline bench sit-ups 3x12).
  * Day 3 (Home): 2x 5kg Dumbbells available (5kg Goblet Bed Squats 3x12, Alt Knee Raises w/ hold 3x12-15, Clamshell + Side Leg Raise superset 3x12, Deadbugs 3x12).
  * Day 4 (Home): Rest & Rehydration Day. Day 3 and Day 4 can swap flexibly.
- Logging: Set-by-set autofocus, granular per-set [Autofill] button, and Web Audio synthesizer rest countdown beep.

## 5. UI/UX Rules & Mobile Ergonomics
- Theme: Slate/Zinc OLED Dark Mode (`#09090b`), clean monochrome-first typography.
- Mobile Layout Guardrail: Header (Date + Shift Selector) must stack vertically on mobile (flex-col sm:flex-row) with an opaque background to NEVER overlap content below.
- Core Vital HUD: Shows Calories (no /1400 max), Net Carbs, Protein, Fiber, Sodium, and K/Mg. Pinned on Dashboard, Log Food, and Workout tabs.
- Storage: LocalStorage offline-first persistence with unlinked Firebase fallback until final deployment.