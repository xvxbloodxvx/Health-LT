import test from 'node:test';
import assert from 'node:assert/strict';
import {
  scalePantryItem,
  calculateNutrientTotals,
  calculateRemainingSeconds,
  shiftDateString,
  getNetCarbStatus,
  formatDateDDMM,
  formatDateFullDDMMYYYY,
  getCalorieStatus,
  parseNaturalMealText,
  parseMultiComponentMealText,
  calculateAtwaterCalories
} from './nutrition';

test('scalePantryItem scales nutrients proportionally to grams', () => {
  const pantryItem = {
    id: 'p1',
    name: 'Almonds',
    base_grams: 100,
    calories: 579,
    protein: 21.2,
    net_carbs: 9.9,
    fiber: 12.5,
    fat: 49.9,
    sodium: 1,
    potassium: 733,
    magnesium: 270,
    calcium: 269
  };

  const scaled = scalePantryItem(pantryItem, 50);
  assert.equal(scaled.calories, 290);
  assert.equal(scaled.protein, 10.6);
  assert.equal(scaled.net_carbs, 5.0);
  assert.equal(scaled.fiber, 6.3);
  assert.equal(scaled.magnesium, 135);
  assert.equal(scaled.source, 'verified_pantry');
});

test('calculateNutrientTotals sums all meals correctly', () => {
  const meals = {
    meal_1: [
      { id: '1', name: 'Eggs', calories: 210, protein: 18, net_carbs: 1.5, fiber: 0, fat: 15, sodium: 180, potassium: 200, magnesium: 20, calcium: 50 },
      { id: '2', name: 'Spinach', calories: 30, protein: 3, net_carbs: 1.0, fiber: 2.2, fat: 0.5, sodium: 50, potassium: 450, magnesium: 80, calcium: 100 }
    ],
    meal_2: [
      { id: '3', name: 'Salmon', calories: 350, protein: 34, net_carbs: 0, fiber: 0, fat: 22, sodium: 120, potassium: 600, magnesium: 45, calcium: 15 }
    ]
  };

  const totals = calculateNutrientTotals(meals);
  assert.equal(totals.calories, 590);
  assert.equal(totals.protein, 55);
  assert.equal(totals.net_carbs, 2.5);
  assert.equal(totals.fiber, 2.2);
  assert.equal(totals.sodium, 350);
  assert.equal(totals.potassium, 1250);
  assert.equal(totals.magnesium, 145);
  assert.equal(totals.calcium, 165);
});

test('calculateRemainingSeconds handles active and expired timestamps', () => {
  const now = 1000000;
  assert.equal(calculateRemainingSeconds(now + 90000, now), 90);
  assert.equal(calculateRemainingSeconds(now + 500, now), 1);
  assert.equal(calculateRemainingSeconds(now - 1000, now), 0);
  assert.equal(calculateRemainingSeconds(null, now), 0);
});

test('shiftDateString advances and regresses calendar dates ISO string', () => {
  assert.equal(shiftDateString('2026-11-02', 1), '2026-11-03');
  assert.equal(shiftDateString('2026-11-02', -1), '2026-11-01');
});

test('formatDateDDMM and formatDateFullDDMMYYYY format dates accurately', () => {
  assert.equal(formatDateDDMM('2026-11-02'), '02-11');
  assert.equal(formatDateDDMM('2026-10-31'), '31-10');
  assert.equal(formatDateFullDDMMYYYY('2026-11-02'), '02-11-2026');
});

test('getNetCarbStatus flags threshold violations according to keto blueprint', () => {
  assert.equal(getNetCarbStatus(25), 'normal');
  assert.equal(getNetCarbStatus(30), 'normal');
  assert.equal(getNetCarbStatus(30.1), 'soft_warning');
  assert.equal(getNetCarbStatus(45), 'soft_warning');
  assert.equal(getNetCarbStatus(50.1), 'hard_alert');
});

test('getCalorieStatus flags when exceeding 1500 kcal', () => {
  assert.equal(getCalorieStatus(1200), 'normal');
  assert.equal(getCalorieStatus(1500), 'normal');
  assert.equal(getCalorieStatus(1501), 'exceeded');
  assert.equal(getCalorieStatus(2098), 'exceeded');
});

test('parseNaturalMealText gives realistic net carbs and strictly verified Atwater calories', () => {
  // Rice
  const rice = parseNaturalMealText('1 bowl white rice');
  assert.ok(rice.net_carbs >= 40, `Expected white rice net carbs >= 40g, got ${rice.net_carbs}`);
  assert.equal(rice.calories, Math.round(rice.protein * 4 + rice.net_carbs * 4 + (rice.fat || 0) * 9));
  assert.equal(rice.source, 'singapore_hpb');

  // Noodles
  const noodles = parseNaturalMealText('Spaghetti pasta noodles');
  assert.ok(noodles.net_carbs >= 45, `Expected noodles net carbs >= 45g, got ${noodles.net_carbs}`);
  assert.equal(noodles.calories, Math.round(noodles.protein * 4 + noodles.net_carbs * 4 + (noodles.fat || 0) * 9));

  // Chicken breast (should remain 0g)
  const chicken = parseNaturalMealText('Grilled chicken breast');
  assert.equal(chicken.net_carbs, 0);
  assert.ok(chicken.protein >= 40);
  assert.equal(chicken.calories, Math.round(chicken.protein * 4 + chicken.net_carbs * 4 + (chicken.fat || 0) * 9));
});

test('parseNaturalMealText accurately calculates 386g of black pepper rotisserie chicken skin with full micros', () => {
  const skin = parseNaturalMealText('386g of black pepper rotisserie chicken skin');
  // Chicken skin is predominantly fat (41g/100g) and protein (20g/100g)
  // For 386g:
  // Calories ~1740-1750 kcal, NOT 250 kcal!
  // Protein ~75-80g, NOT 15g!
  // Fat ~155-165g!
  assert.ok(skin.calories >= 1650 && skin.calories <= 1800, `Expected ~1746 kcal, got ${skin.calories}`);
  assert.ok(skin.protein >= 70 && skin.protein <= 85, `Expected ~77.2g protein, got ${skin.protein}`);
  assert.ok((skin.fat || 0) >= 150 && (skin.fat || 0) <= 170, `Expected ~158.3g fat, got ${skin.fat}`);
  assert.ok(skin.net_carbs >= 0 && skin.net_carbs <= 10, `Expected low net carbs for skin, got ${skin.net_carbs}`);
  
  // Verify all 4 electrolytes
  assert.ok((skin.sodium || 0) >= 1500 && (skin.sodium || 0) <= 2000, `Expected ~1776mg Na, got ${skin.sodium}`);
  assert.ok((skin.potassium || 0) >= 500 && (skin.potassium || 0) <= 800, `Expected ~676mg K, got ${skin.potassium}`);
  assert.ok((skin.magnesium || 0) >= 50 && (skin.magnesium || 0) <= 90, `Expected ~69mg Mg, got ${skin.magnesium}`);
  assert.ok((skin.calcium || 0) >= 50 && (skin.calcium || 0) <= 100, `Expected ~77mg Ca, got ${skin.calcium}`);

  // Provenance verification
  assert.equal(skin.source, 'singapore_hpb');
  assert.equal(skin.sourceLabel, 'Singapore HPB');
  assert.equal(skin.calories, Math.round(skin.protein * 4 + skin.net_carbs * 4 + (skin.fat || 0) * 9));
});

test('parseNaturalMealText accurately calculates Singapore hawker items', () => {
  // Sliced Fish Soup
  const fishSoup = parseNaturalMealText('1 bowl sliced fish soup');
  assert.ok(fishSoup.protein >= 35, `Expected high protein fish soup, got ${fishSoup.protein}`);
  assert.ok(fishSoup.net_carbs <= 10, `Expected keto-safe fish soup carbs, got ${fishSoup.net_carbs}`);
  assert.ok((fishSoup.sodium || 0) >= 1000, `Expected hawker broth sodium, got ${fishSoup.sodium}`);
  assert.equal(fishSoup.source, 'singapore_hpb');

  // Soft boiled kopitiam eggs
  const eggs = parseNaturalMealText('2 soft boiled eggs');
  assert.ok(eggs.protein >= 12 && eggs.protein <= 14);
  assert.ok(eggs.net_carbs <= 1.5);
  assert.ok((eggs.fat || 0) >= 9 && (eggs.fat || 0) <= 11);
  assert.equal(eggs.source, 'singapore_hpb');
});

test('calculateAtwaterCalories calculates P*4 + NC*4 + F*9 accurately', () => {
  // 20g protein, 35g net carbs, 14g fat
  // 20*4 (80) + 35*4 (140) + 14*9 (126) = 346 kcal
  assert.equal(calculateAtwaterCalories(20, 35, 14), 346);
  // Pure fat: 10g fat = 90 kcal
  assert.equal(calculateAtwaterCalories(0, 0, 10), 90);
  // Pure carbs: 50g carbs = 200 kcal
  assert.equal(calculateAtwaterCalories(0, 50, 0), 200);
  // Pure protein: 30g protein = 120 kcal
  assert.equal(calculateAtwaterCalories(30, 0, 0), 120);
});

test('parseNaturalMealText accurately calculates 386g of black pepper rotisserie chicken without skin from NTUC FairPrice', () => {
  const chicken = parseNaturalMealText('386g of black pepper rotisserie chicken without skin from NTUC FairPrice');
  
  // 386g cooked edible meat without skin:
  // Baseline per 100g: 27g P, 0.6g NC, 6.5g F, 520mg Na, 310mg K, 25mg Mg, 15mg Ca -> 169 kcal
  // For 386g (factor 3.86):
  // Protein: ~104.2g
  // Fat: ~25.1g
  // Net Carbs: ~2.3g
  // Calories: (104.2*4) + (2.3*4) + (25.1*9) = 652 kcal
  // Sodium: ~2,007mg
  // Potassium: ~1,197mg
  // Magnesium: ~97mg
  // Calcium: ~58mg
  assert.ok(chicken.calories >= 640 && chicken.calories <= 665, `Expected ~652 kcal, got ${chicken.calories}`);
  assert.ok(chicken.protein >= 100 && chicken.protein <= 110, `Expected ~104.2g protein, got ${chicken.protein}`);
  assert.ok((chicken.fat || 0) >= 23 && (chicken.fat || 0) <= 28, `Expected ~25.1g fat, got ${chicken.fat}`);
  assert.ok(chicken.net_carbs >= 1.5 && chicken.net_carbs <= 3.5, `Expected ~2.3g net carbs, got ${chicken.net_carbs}`);
  
  // Electrolytes
  assert.ok((chicken.sodium || 0) >= 1950 && (chicken.sodium || 0) <= 2080, `Expected ~2007mg Na, got ${chicken.sodium}`);
  assert.ok((chicken.potassium || 0) >= 1150 && (chicken.potassium || 0) <= 1250, `Expected ~1197mg K, got ${chicken.potassium}`);
  assert.ok((chicken.magnesium || 0) >= 90 && (chicken.magnesium || 0) <= 105, `Expected ~97mg Mg, got ${chicken.magnesium}`);
  assert.ok((chicken.calcium || 0) >= 50 && (chicken.calcium || 0) <= 65, `Expected ~58mg Ca, got ${chicken.calcium}`);

  // Provenance
  assert.equal(chicken.source, 'singapore_hpb');
  assert.equal(chicken.sourceLabel, 'Singapore HPB');
  assert.equal(chicken.calories, Math.round(chicken.protein * 4 + chicken.net_carbs * 4 + (chicken.fat || 0) * 9));
});

test('parseNaturalMealText disambiguates without skin vs skin only', () => {
  const withoutSkin = parseNaturalMealText('rotisserie chicken without skin');
  const skinOnly = parseNaturalMealText('rotisserie chicken skin');

  // without skin must be high protein, moderate fat
  assert.ok(withoutSkin.protein > (withoutSkin.fat || 0), 'Skinless chicken must have higher protein than fat');
  // skin only must be very high fat
  assert.ok((skinOnly.fat || 0) > skinOnly.protein, 'Chicken skin must have higher fat than protein');
});

test('parseMultiComponentMealText parses 5-vegetable meal into 5 separate items with exact gram scaling', () => {
  const input = '147g of cooked white radish, 37.2g of cooked carrot, 112.3g of cooked mix cabbage, 172.6g of cooked broccoli, 149.3g of cooked cauliflower';
  const items = parseMultiComponentMealText(input);

  // Must yield all 5 distinct items, never collapsing into only broccoli!
  assert.equal(items.length, 5, `Expected 5 items, got ${items.length}`);

  // Item 0: White Radish
  const radish = items[0];
  assert.ok(radish.name.toLowerCase().includes('radish'), `Item 0 should be radish, got ${radish.name}`);
  assert.ok(radish.calories >= 18 && radish.calories <= 30);
  assert.ok(radish.net_carbs >= 3.5 && radish.net_carbs <= 4.8);
  assert.ok(radish.protein >= 0.8 && radish.protein <= 1.4);
  assert.ok((radish.potassium || 0) >= 300);

  // Item 1: Carrot
  const carrot = items[1];
  assert.ok(carrot.name.toLowerCase().includes('carrot'), `Item 1 should be carrot, got ${carrot.name}`);
  assert.ok(carrot.net_carbs >= 1.5 && carrot.net_carbs <= 2.5);

  // Item 2: Cabbage
  const cabbage = items[2];
  assert.ok(cabbage.name.toLowerCase().includes('cabbage'), `Item 2 should be cabbage, got ${cabbage.name}`);
  assert.ok(cabbage.net_carbs >= 3.0 && cabbage.net_carbs <= 4.5);

  // Item 3: Broccoli
  const broccoli = items[3];
  assert.ok(broccoli.name.toLowerCase().includes('broccoli'), `Item 3 should be broccoli, got ${broccoli.name}`);
  assert.ok(broccoli.protein >= 4.0 && broccoli.protein <= 5.5);
  assert.ok((broccoli.potassium || 0) >= 450);

  // Item 4: Cauliflower
  const cauliflower = items[4];
  assert.ok(cauliflower.name.toLowerCase().includes('cauliflower'), `Item 4 should be cauliflower, got ${cauliflower.name}`);
  assert.ok(cauliflower.protein >= 2.2 && cauliflower.protein <= 3.2);

  // All 5 items must strictly follow Atwater formula: Calories = (P*4) + (NC*4) + (F*9)
  items.forEach((item, index) => {
    const atwater = Math.round(item.protein * 4 + item.net_carbs * 4 + (item.fat || 0) * 9);
    assert.equal(item.calories, atwater, `Item ${index} (${item.name}) calories ${item.calories} != Atwater ${atwater}`);
  });
});

test('parseMultiComponentMealText parses psyllium husk, chia seeds, and Meiji protein drink without defaulting to white rice', () => {
  const input = '10g psyllium husk, 35g chia seeds, 350ml Meiji Green Tea Protein Shake';
  const items = parseMultiComponentMealText(input);

  assert.equal(items.length, 3, `Expected 3 items, got ${items.length}`);

  // Item 0: Psyllium Husk (10g)
  const psyllium = items[0];
  assert.ok(psyllium.name.toLowerCase().includes('psyllium') || psyllium.name.toLowerCase().includes('husk'), `Should be psyllium, got ${psyllium.name}`);
  assert.ok(!psyllium.name.toLowerCase().includes('rice'), `Psyllium husk should NEVER be labeled as rice! Got ${psyllium.name}`);
  assert.ok((psyllium.fiber || 0) >= 7.0, `Expected high fiber for 10g psyllium, got ${psyllium.fiber}`);
  assert.ok(psyllium.net_carbs <= 1.5, `Expected low net carbs for psyllium, got ${psyllium.net_carbs}`);

  // Item 1: Chia Seeds (35g)
  const chia = items[1];
  assert.ok(chia.name.toLowerCase().includes('chia'), `Should be chia seeds, got ${chia.name}`);
  assert.ok(!chia.name.toLowerCase().includes('rice'), `Chia seeds should NEVER be labeled as rice! Got ${chia.name}`);
  assert.ok((chia.fat || 0) >= 9.0, `Expected healthy fats in chia seeds, got ${chia.fat}`);
  assert.ok((chia.fiber || 0) >= 10.0, `Expected high fiber in chia seeds, got ${chia.fiber}`);

  // Item 2: Meiji Green Tea Protein Shake (350ml)
  const meiji = items[2];
  assert.ok(meiji.name.toLowerCase().includes('meiji') || meiji.name.toLowerCase().includes('protein'), `Should be Meiji protein, got ${meiji.name}`);
  assert.ok(!meiji.name.toLowerCase().includes('rice'), `Meiji protein shake should NEVER be labeled as rice! Got ${meiji.name}`);
  assert.ok(meiji.name.includes('350ml'), `Meiji should be formatted in ml, got ${meiji.name}`);
  assert.ok(meiji.protein >= 20.0 && meiji.protein <= 28.0, `Expected ~25g protein in 350ml Meiji shake, got ${meiji.protein}`);
  assert.ok(meiji.net_carbs >= 8.0 && meiji.net_carbs <= 12.0, `Expected ~9.5g net carbs in Meiji shake, got ${meiji.net_carbs}`);

  // Atwater verification for all 3 items
  items.forEach((item, index) => {
    const atwater = Math.round(item.protein * 4 + item.net_carbs * 4 + (item.fat || 0) * 9);
    assert.equal(item.calories, atwater, `Item ${index} (${item.name}) calories ${item.calories} != Atwater ${atwater}`);
  });
});

test('parseNaturalMealText never defaults unrecognized food to white rice', () => {
  const custom = parseNaturalMealText('50g dragon fruit');
  assert.ok(!custom.name.toLowerCase().includes('rice'), `Unrecognized item should NOT be named rice! Got ${custom.name}`);
  assert.ok(custom.name.toLowerCase().includes('dragon fruit'), `Should retain original food name! Got ${custom.name}`);
});



