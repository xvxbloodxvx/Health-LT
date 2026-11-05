# Nutrition Engine Resiliency: Supplements, RTD Shakes & Elimination of Default Rice Fallback

Resolve the issue where items like `10g psyllium husk, 35g chia seeds, 350ml Meiji Green Tea Protein Shake` were mistakenly classified as "Cooked White Jasmine Rice". Extend Gemini timeout to 10 seconds, eliminate silent misclassification defaults, and establish verified benchmarks for fiber supplements, seeds, and local Singapore supermarket RTD protein shakes.

---

## 1. Root Cause Analysis: Why Did It Default to Cooked White Rice?

1. **Hardcoded Fallback Default**: In `src/utils/nutrition.ts`, `parseNaturalMealText` initialized `let selectedKey = "white_jasmine_rice"`. If an item didn't match any specific keyword in the existing if/else chain (which previously only covered standard hawker staples and select meats/veggies), it defaulted directly to `white_jasmine_rice` while scaling by the specified grams (e.g. 10g of rice, 35g of rice, 350ml of rice).
2. **API Timeout Trigger**: In `server.ts`, the Gemini call timed out at 3.5 seconds, triggering the local fallback which hit the default `white_jasmine_rice` fallback.

---

## 2. Rectification & Prevention Strategy

### A. Specific Benchmarks Added to `SINGAPORE_HPB_BENCHMARKS_PER_100G`

1. **Psyllium Husk (`psyllium_husk`)**:
   - Baseline per 100g: ~190 kcal, 1.5g Protein, 7.0g Net Carbs, 78.0g Dietary Fiber, 0.5g Fat, 100mg Sodium, 800mg Potassium, 10mg Magnesium, 200mg Calcium.
   - For **10g**: **19 kcal • 0.2g P • 0.7g NC • 7.8g Fiber • 0.1g Fat • 10mg Na • 80mg K**.
2. **Chia Seeds (`chia_seeds`)**:
   - Baseline per 100g: ~486 kcal, 16.5g Protein, 7.7g Net Carbs, 34.4g Dietary Fiber, 30.7g Fat, 16mg Sodium, 407mg Potassium, 335mg Magnesium, 631mg Calcium.
   - For **35g**: **170 kcal • 5.8g P • 2.7g NC • 12.0g Fiber • 10.7g Fat • 6mg Na • 142mg K • 117mg Mg • 221mg Ca**.
3. **Meiji Green Tea / High Protein Shake (`meiji_protein_shake`)**:
   - Local Singapore RTD high-protein beverage (350ml bottle found in NTUC FairPrice / 7-Eleven).
   - Baseline per 100ml: ~57 kcal, 7.1g Protein, 2.7g Net Carbs, 0.1g Fiber, 1.0g Fat, 74mg Sodium, 180mg Potassium, 20mg Magnesium, 200mg Calcium.
   - For **350ml**: **200 kcal • 25.0g P • 9.5g NC • 0.4g Fiber • 3.5g Fat • 260mg Na • 630mg K • 70mg Mg • 700mg Ca**.

### B. Eliminate "White Jasmine Rice" Fallback
- If an item does not match any keyword, the parser must **never** rename it to "Cooked White Jasmine Rice".
- Instead, retain the user's exact name, inspect for broad category indicators (`shake`, `protein`, `seed`, `fiber`, `drink`), and provide an intelligent, conservative macro estimate or clear uncalibrated indicator rather than an erroneous staple substitution.

### C. Gemini 10-Second Timeout & Error Silence
- Relax the `Promise.race` timeout in `server.ts` to 10 seconds.
- Suppress noisy warning/error logs when fallback is safely executed.

---

## 3. Technical Execution Details

1. **`src/utils/nutrition.ts`**:
   - Add `psyllium_husk`, `chia_seeds`, `meiji_protein_shake`, and generic `protein_shake` to `SINGAPORE_HPB_BENCHMARKS_PER_100G`.
   - Update `parseNaturalMealText` to route seeds, husks, and protein shakes.
   - Remove `white_jasmine_rice` as generic fallback default; use the input text as item name and apply smart heuristic profiles.
2. **`server.ts`**:
   - Increase timeout to 10,000ms.
   - Add psyllium husk, chia seeds, and Meiji protein shake to Gemini's prompt examples.
   - Remove warning spam on timeout.
3. **`src/utils/nutrition.test.ts`**:
   - Add unit test for `"10g psyllium husk, 35g chia seeds, 350ml Meiji Green Tea Protein Shake"`.
   - Verify it produces all 3 items with exact names, authentic macros, and zero "white rice".
