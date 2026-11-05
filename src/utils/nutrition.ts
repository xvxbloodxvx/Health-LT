/**
 * Pure calculation logic for the Modified Ketogenic Tracker
 * Calibrated for Singapore Health Promotion Board (HPB) Food Composition Standards
 */

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  net_carbs: number;
  fiber?: number;
  fat?: number;
  sodium?: number;
  potassium?: number;
  magnesium?: number;
  calcium?: number;
  source?: string;
  sourceLabel?: string;
  confidence_notes?: string;
}

export interface PantryItem {
  id: string;
  name: string;
  base_grams?: number;
  calories: number;
  protein: number;
  net_carbs: number;
  fiber?: number;
  fat?: number;
  sodium?: number;
  potassium?: number;
  magnesium?: number;
  calcium?: number;
}

export interface NutritionTotals {
  calories: number;
  protein: number;
  net_carbs: number;
  fiber: number;
  fat: number;
  sodium: number;
  potassium: number;
  magnesium: number;
  calcium: number;
}

export function scalePantryItem(pantryItem: PantryItem, grams = 100): FoodItem {
  const base = pantryItem.base_grams || 100;
  const factor = grams / base;
  return {
    id: Date.now().toString(),
    name: `${pantryItem.name} (${grams}g)`,
    calories: Math.round(pantryItem.calories * factor),
    protein: Number((pantryItem.protein * factor).toFixed(1)),
    net_carbs: Number((pantryItem.net_carbs * factor).toFixed(1)),
    fiber: Number(((pantryItem.fiber || 0) * factor).toFixed(1)),
    fat: Number(((pantryItem.fat || 0) * factor).toFixed(1)),
    sodium: Math.round((pantryItem.sodium || 0) * factor),
    potassium: Math.round((pantryItem.potassium || 0) * factor),
    magnesium: Math.round((pantryItem.magnesium || 0) * factor),
    calcium: Math.round((pantryItem.calcium || 0) * factor),
    source: "verified_pantry",
    sourceLabel: "Verified Pantry"
  };
}

export function calculateNutrientTotals(meals: Record<string, FoodItem[]>): NutritionTotals {
  let cal = 0, p = 0, nc = 0, fib = 0, f = 0, na = 0, k = 0, mg = 0, ca = 0;
  
  Object.values(meals).forEach(mealArray => {
    mealArray.forEach(item => {
      cal += item.calories || 0;
      p += item.protein || 0;
      nc += item.net_carbs || 0;
      fib += item.fiber || 0;
      f += item.fat || 0;
      na += item.sodium || 0;
      k += item.potassium || 0;
      mg += item.magnesium || 0;
      ca += item.calcium || 0;
    });
  });

  return {
    calories: Math.round(cal),
    protein: Number(p.toFixed(1)),
    net_carbs: Number(nc.toFixed(1)),
    fiber: Number(fib.toFixed(1)),
    fat: Number(f.toFixed(1)),
    sodium: Math.round(na),
    potassium: Math.round(k),
    magnesium: Math.round(mg),
    calcium: Math.round(ca)
  };
}

export function calculateRemainingSeconds(targetTime: number | null, now: number): number {
  if (!targetTime) return 0;
  return Math.max(0, Math.ceil((targetTime - now) / 1000));
}

export function shiftDateString(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function formatDateDDMM(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}`;
  }
  return dateStr;
}

export function formatDateFullDDMMYYYY(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr;
}

export function getNetCarbStatus(netCarbs: number): 'normal' | 'soft_warning' | 'hard_alert' {
  if (netCarbs > 50) return 'hard_alert';
  if (netCarbs > 30) return 'soft_warning';
  return 'normal';
}

export function getCalorieStatus(calories: number): 'normal' | 'exceeded' {
  if (calories > 1500) return 'exceeded';
  return 'normal';
}

/**
 * Calculates exact Atwater macronutrient calories: (Protein * 4) + (Net Carbs * 4) + (Fat * 9)
 */
export function calculateAtwaterCalories(protein: number, netCarbs: number, fat: number): number {
  return Math.round((Number(protein) || 0) * 4 + (Number(netCarbs) || 0) * 4 + (Number(fat) || 0) * 9);
}

/**
 * Standard nutrient profile per 100g edible portion
 */
export interface FoodNutrientProfile100g {
  name: string;
  protein: number;
  net_carbs: number;
  fiber: number;
  fat: number;
  sodium: number;
  potassium: number;
  magnesium: number;
  calcium: number;
  defaultPortionGrams: number;
  isRegionalHPB?: boolean;
}

/**
 * Singapore Health Promotion Board (HPB) Food Composition Database & Regional Benchmarks
 */
export const SINGAPORE_HPB_BENCHMARKS_PER_100G: Record<string, FoodNutrientProfile100g> = {
  // POULTRY & SUPERMARKET / HAWKER ROTISSERIE (SINGAPORE HPB STANDARDS)
  ntuc_roast_chicken_skinless: {
    name: "NTUC FairPrice Black Pepper Roast Chicken (Meat Without Skin)",
    protein: 27.0,
    net_carbs: 0.6,
    fiber: 0.1,
    fat: 6.5,
    sodium: 520,
    potassium: 310,
    magnesium: 25,
    calcium: 15,
    defaultPortionGrams: 200,
    isRegionalHPB: true
  },
  ntuc_roast_chicken_with_skin: {
    name: "NTUC FairPrice Black Pepper Roast Chicken (With Skin)",
    protein: 24.5,
    net_carbs: 0.7,
    fiber: 0.1,
    fat: 13.8,
    sodium: 510,
    potassium: 280,
    magnesium: 23,
    calcium: 17,
    defaultPortionGrams: 200,
    isRegionalHPB: true
  },
  chicken_skin_seasoned: {
    name: "Black Pepper Rotisserie Chicken Skin",
    protein: 20.0,
    net_carbs: 0.8,
    fiber: 0.3,
    fat: 41.0,
    sodium: 460,
    potassium: 175,
    magnesium: 18,
    calcium: 20,
    defaultPortionGrams: 100,
    isRegionalHPB: true
  },
  chicken_skin_plain: {
    name: "Roasted Chicken Skin",
    protein: 20.0,
    net_carbs: 0.5,
    fiber: 0.0,
    fat: 41.0,
    sodium: 350,
    potassium: 160,
    magnesium: 15,
    calcium: 15,
    defaultPortionGrams: 100,
    isRegionalHPB: true
  },
  hainanese_chicken_breast: {
    name: "Steamed / Roasted Chicken Breast (Skinless)",
    protein: 31.0,
    net_carbs: 0.0,
    fiber: 0.0,
    fat: 3.6,
    sodium: 84,
    potassium: 334,
    magnesium: 29,
    calcium: 15,
    defaultPortionGrams: 150,
    isRegionalHPB: true
  },
  hainanese_chicken_thigh: {
    name: "Roasted Chicken Thigh (Meat only)",
    protein: 24.2,
    net_carbs: 0.0,
    fiber: 0.0,
    fat: 8.5,
    sodium: 96,
    potassium: 265,
    magnesium: 23,
    calcium: 12,
    defaultPortionGrams: 150,
    isRegionalHPB: true
  },
  hainanese_chicken_with_skin: {
    name: "Hainanese Steamed Chicken (Meat & Skin)",
    protein: 25.0,
    net_carbs: 0.5,
    fiber: 0.0,
    fat: 13.0,
    sodium: 135,
    potassium: 240,
    magnesium: 22,
    calcium: 14,
    defaultPortionGrams: 160,
    isRegionalHPB: true
  },
  chicken_wings_roasted: {
    name: "Roasted Chicken Wings (with skin)",
    protein: 22.0,
    net_carbs: 0.0,
    fiber: 0.0,
    fat: 16.0,
    sodium: 92,
    potassium: 220,
    magnesium: 20,
    calcium: 15,
    defaultPortionGrams: 140,
    isRegionalHPB: true
  },

  // HAWKER SEAFOOD & SOUPS (SINGAPORE HPB)
  sliced_fish_soup: {
    name: "Sliced Batang / Fish Soup (Soup + Fish)",
    protein: 11.5,
    net_carbs: 1.2,
    fiber: 0.4,
    fat: 1.5,
    sodium: 480,
    potassium: 280,
    magnesium: 25,
    calcium: 40,
    defaultPortionGrams: 350,
    isRegionalHPB: true
  },
  salmon_mackerel_cooked: {
    name: "Pan-seared Salmon / Mackerel Cutlet",
    protein: 24.6,
    net_carbs: 0.0,
    fiber: 0.0,
    fat: 12.3,
    sodium: 75,
    potassium: 490,
    magnesium: 30,
    calcium: 14,
    defaultPortionGrams: 180,
    isRegionalHPB: true
  },
  yong_tau_foo_soup: {
    name: "Yong Tau Foo (Soup Base, Tofu & Fish Paste)",
    protein: 8.5,
    net_carbs: 3.5,
    fiber: 1.2,
    fat: 4.0,
    sodium: 420,
    potassium: 190,
    magnesium: 28,
    calcium: 65,
    defaultPortionGrams: 300,
    isRegionalHPB: true
  },

  // KOPITIAM & BREAKFAST (SINGAPORE HPB)
  soft_boiled_eggs: {
    name: "Kopitiam Soft-Boiled Eggs (2 eggs)",
    protein: 12.6,
    net_carbs: 0.8,
    fiber: 0.0,
    fat: 10.0,
    sodium: 160, // includes dash of light/dark soy sauce
    potassium: 138,
    magnesium: 12,
    calcium: 56,
    defaultPortionGrams: 100,
    isRegionalHPB: true
  },
  kaya_butter_toast: {
    name: "Kaya Butter Toast",
    protein: 6.0,
    net_carbs: 38.0,
    fiber: 1.5,
    fat: 16.0,
    sodium: 290,
    potassium: 130,
    magnesium: 26,
    calcium: 45,
    defaultPortionGrams: 100,
    isRegionalHPB: true
  },
  kopi_o_kosong: {
    name: "Kopi O Kosong (Black Coffee, No Sugar)",
    protein: 0.3,
    net_carbs: 0.6,
    fiber: 0.0,
    fat: 0.0,
    sodium: 10,
    potassium: 115,
    magnesium: 14,
    calcium: 8,
    defaultPortionGrams: 240,
    isRegionalHPB: true
  },
  teh_o_kosong: {
    name: "Teh O Kosong (Black Tea, No Sugar)",
    protein: 0.1,
    net_carbs: 0.3,
    fiber: 0.0,
    fat: 0.0,
    sodium: 5,
    potassium: 55,
    magnesium: 6,
    calcium: 4,
    defaultPortionGrams: 240,
    isRegionalHPB: true
  },

  // ASIAN GREENS & VEGETABLES (SINGAPORE HPB & REGIONAL STANDARDS)
  cooked_white_radish: {
    name: "Cooked White Radish (Daikon)",
    protein: 0.7,
    net_carbs: 2.8,
    fiber: 1.6,
    fat: 0.1,
    sodium: 15,
    potassium: 227,
    magnesium: 16,
    calcium: 27,
    defaultPortionGrams: 150,
    isRegionalHPB: true
  },
  cooked_carrot: {
    name: "Cooked Carrot",
    protein: 0.8,
    net_carbs: 5.4,
    fiber: 2.8,
    fat: 0.2,
    sodium: 58,
    potassium: 235,
    magnesium: 10,
    calcium: 30,
    defaultPortionGrams: 100,
    isRegionalHPB: true
  },
  cooked_cabbage: {
    name: "Cooked Mix Cabbage",
    protein: 1.3,
    net_carbs: 3.4,
    fiber: 1.9,
    fat: 0.1,
    sodium: 15,
    potassium: 170,
    magnesium: 12,
    calcium: 40,
    defaultPortionGrams: 120,
    isRegionalHPB: true
  },
  cooked_cauliflower: {
    name: "Cooked Cauliflower",
    protein: 1.8,
    net_carbs: 2.3,
    fiber: 2.3,
    fat: 0.5,
    sodium: 15,
    potassium: 142,
    magnesium: 15,
    calcium: 16,
    defaultPortionGrams: 150,
    isRegionalHPB: true
  },
  asian_greens_stirfry: {
    name: "Stir-fry Chye Sim / Kailan / Kang Kong",
    protein: 2.4,
    net_carbs: 1.8,
    fiber: 2.8,
    fat: 2.5,
    sodium: 260,
    potassium: 380,
    magnesium: 45,
    calcium: 85,
    defaultPortionGrams: 150,
    isRegionalHPB: true
  },
  steamed_broccoli: {
    name: "Steamed Broccoli",
    protein: 2.8,
    net_carbs: 4.0,
    fiber: 2.6,
    fat: 0.4,
    sodium: 33,
    potassium: 316,
    magnesium: 21,
    calcium: 47,
    defaultPortionGrams: 150,
    isRegionalHPB: true
  },
  fresh_avocado: {
    name: "Fresh Hass Avocado",
    protein: 2.0,
    net_carbs: 1.8,
    fiber: 6.7,
    fat: 14.7,
    sodium: 7,
    potassium: 485,
    magnesium: 29,
    calcium: 12,
    defaultPortionGrams: 150,
    isRegionalHPB: true
  },

  // MEATS & CUTS
  beef_ribeye_steak: {
    name: "Cooked Ribeye / Beef Steak",
    protein: 24.0,
    net_carbs: 0.0,
    fiber: 0.0,
    fat: 22.0,
    sodium: 68,
    potassium: 318,
    magnesium: 21,
    calcium: 18,
    defaultPortionGrams: 200,
    isRegionalHPB: true
  },
  roasted_pork_siew_yoke: {
    name: "Crispy Roasted Pork Belly (Siew Yoke)",
    protein: 16.5,
    net_carbs: 1.2,
    fiber: 0.0,
    fat: 34.0,
    sodium: 580,
    potassium: 260,
    magnesium: 18,
    calcium: 15,
    defaultPortionGrams: 120,
    isRegionalHPB: true
  },

  // RICE & STAPLES (SINGAPORE HPB)
  white_jasmine_rice: {
    name: "Cooked White Jasmine Rice",
    protein: 2.7,
    net_carbs: 28.2,
    fiber: 0.4,
    fat: 0.3,
    sodium: 2,
    potassium: 35,
    magnesium: 12,
    calcium: 10,
    defaultPortionGrams: 180, // 1 bowl ~50.8g Net Carbs
    isRegionalHPB: true
  },
  chicken_rice_oily: {
    name: "Hainanese Chicken Rice Oily Rice",
    protein: 3.2,
    net_carbs: 27.5,
    fiber: 0.5,
    fat: 5.0,
    sodium: 280,
    potassium: 45,
    magnesium: 14,
    calcium: 12,
    defaultPortionGrams: 190,
    isRegionalHPB: true
  },
  noodles_pasta: {
    name: "Cooked Yellow Noodles / Pasta / Mee",
    protein: 5.8,
    net_carbs: 29.5,
    fiber: 1.8,
    fat: 0.9,
    sodium: 140,
    potassium: 44,
    magnesium: 18,
    calcium: 7,
    defaultPortionGrams: 200,
    isRegionalHPB: true
  },
  laksa_noodle_soup: {
    name: "Katong Laksa Noodle Soup (Coconut Gravy)",
    protein: 5.5,
    net_carbs: 16.5,
    fiber: 1.1,
    fat: 8.5,
    sodium: 520,
    potassium: 120,
    magnesium: 16,
    calcium: 30,
    defaultPortionGrams: 350,
    isRegionalHPB: true
  },

  // WESTERN IMPORT DEFAULTS (USDA FOODDATA CENTRAL)
  butter_oil: {
    name: "Butter / Pure Cooking Oil",
    protein: 0.9,
    net_carbs: 0.1,
    fiber: 0.0,
    fat: 81.1,
    sodium: 643,
    potassium: 24,
    magnesium: 2,
    calcium: 24,
    defaultPortionGrams: 14,
    isRegionalHPB: false
  },
  cheddar_cheese: {
    name: "Cheddar Cheese",
    protein: 25.0,
    net_carbs: 1.3,
    fiber: 0.0,
    fat: 33.1,
    sodium: 653,
    potassium: 98,
    magnesium: 28,
    calcium: 721,
    defaultPortionGrams: 30,
    isRegionalHPB: false
  },
  greek_yogurt: {
    name: "Plain Whole Milk Greek Yogurt",
    protein: 9.0,
    net_carbs: 3.6,
    fiber: 0.0,
    fat: 5.0,
    sodium: 36,
    potassium: 141,
    magnesium: 11,
    calcium: 110,
    defaultPortionGrams: 170,
    isRegionalHPB: false
  },

  // SEEDS, FIBER & FUNCTIONAL SUPPLEMENTS
  psyllium_husk: {
    name: "Psyllium Husk (Pure Soluble Fiber)",
    protein: 1.5,
    net_carbs: 7.0,
    fiber: 78.0,
    fat: 0.5,
    sodium: 100,
    potassium: 800,
    magnesium: 10,
    calcium: 200,
    defaultPortionGrams: 10,
    isRegionalHPB: true
  },
  chia_seeds: {
    name: "Chia Seeds",
    protein: 16.5,
    net_carbs: 7.7,
    fiber: 34.4,
    fat: 30.7,
    sodium: 16,
    potassium: 407,
    magnesium: 335,
    calcium: 631,
    defaultPortionGrams: 30,
    isRegionalHPB: true
  },
  flax_seeds: {
    name: "Ground Flaxseed / Linseed",
    protein: 18.3,
    net_carbs: 1.6,
    fiber: 27.3,
    fat: 42.2,
    sodium: 30,
    potassium: 813,
    magnesium: 392,
    calcium: 255,
    defaultPortionGrams: 20,
    isRegionalHPB: true
  },

  // PROTEIN SHAKES & LOCAL RTD BEVERAGES (SINGAPORE SUPERMARKETS)
  meiji_protein_shake: {
    name: "Meiji High Protein Drink (Green Tea / Matcha)",
    protein: 7.1,
    net_carbs: 2.7,
    fiber: 0.1,
    fat: 1.0,
    sodium: 74,
    potassium: 180,
    magnesium: 20,
    calcium: 200,
    defaultPortionGrams: 350,
    isRegionalHPB: true
  },
  whey_protein_isolate: {
    name: "Whey Protein Isolate Shake",
    protein: 80.0,
    net_carbs: 3.0,
    fiber: 0.5,
    fat: 1.5,
    sodium: 180,
    potassium: 420,
    magnesium: 60,
    calcium: 450,
    defaultPortionGrams: 30,
    isRegionalHPB: false
  },
  uncalibrated_generic_item: {
    name: "Custom Food Item",
    protein: 5.0,
    net_carbs: 5.0,
    fiber: 1.0,
    fat: 2.0,
    sodium: 50,
    potassium: 100,
    magnesium: 15,
    calcium: 20,
    defaultPortionGrams: 100,
    isRegionalHPB: false
  }
};

/**
 * Intelligent natural language food parser calibrated to Singapore HPB benchmarks.
 * Handles exact gram weights (e.g. 386g, 150g, 200ml) with proportional macro and micro scaling.
 * Strictly enforces Atwater mathematical verification: Calories = (P * 4) + (NC * 4) + (F * 9).
 */
export function parseNaturalMealText(rawText: string): FoodItem {
  const text = rawText.trim();
  const textLower = text.toLowerCase();

  // 1. Detect explicit gram weight or volume
  const weightGramMatch = textLower.match(/(\d+(?:\.\d+)?)\s*(?:g|grams?)\b/);
  const weightKgMatch = textLower.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos?|kilograms?)\b/);
  const weightOzMatch = textLower.match(/(\d+(?:\.\d+)?)\s*(?:oz|ounces?)\b/);
  const weightMlMatch = textLower.match(/(\d+(?:\.\d+)?)\s*(?:ml|milliliters?)\b/);

  let specifiedGrams: number | null = null;
  if (weightGramMatch) {
    specifiedGrams = parseFloat(weightGramMatch[1]);
  } else if (weightKgMatch) {
    specifiedGrams = parseFloat(weightKgMatch[1]) * 1000;
  } else if (weightOzMatch) {
    specifiedGrams = parseFloat(weightOzMatch[1]) * 28.3495;
  } else if (weightMlMatch) {
    specifiedGrams = parseFloat(weightMlMatch[1]);
  }

  // Extract explicit counts (e.g., "2 eggs", "3 slices bread", "2 bananas")
  const countMatch = textLower.match(/(\d+)\s*(?:slices?|bowls?|plates?|pieces?|cups?|eggs?|bananas?|apples?|servings?)?/);
  const count = countMatch ? Math.max(1, parseInt(countMatch[1], 10)) : 1;

  // 2. Select benchmark profile from Singapore HPB primary catalogue
  let selectedKey: string | null = null;
  let customFoodName: string | null = null;

  // Detect skinless vs skin-only vs with-skin
  const isSkinless = textLower.includes('without skin') || 
                     textLower.includes('skinless') || 
                     textLower.includes('no skin') || 
                     textLower.includes('skin removed') || 
                     textLower.includes('meat only') || 
                     textLower.includes('deboned meat') ||
                     textLower.includes('remove skin');

  const isSkinOnly = !isSkinless && (
    textLower.includes('chicken skin') || 
    textLower.includes('roast skin') || 
    textLower.includes('rotisserie skin') || 
    textLower.includes('skin only') || 
    textLower.includes('crispy skin') ||
    Boolean(textLower.match(/\b(?:only|just)\s+the\s+skin\b/)) ||
    Boolean(textLower.match(/\bchicken\s+skin\b/))
  );

  // Seeds, Fiber & Functional Supplements
  if (textLower.includes('psyllium') || textLower.includes('husk')) {
    selectedKey = "psyllium_husk";
  } else if (textLower.includes('chia')) {
    selectedKey = "chia_seeds";
  } else if (textLower.includes('flax') || textLower.includes('linseed')) {
    selectedKey = "flax_seeds";
  } else if (textLower.includes('seed')) {
    selectedKey = "chia_seeds";
  }
  // Protein Shakes & Local RTD Beverages (Meiji, Whey, etc.)
  else if ((textLower.includes('meiji') && (textLower.includes('protein') || textLower.includes('shake') || textLower.includes('tea'))) || (textLower.includes('green tea') && textLower.includes('protein'))) {
    selectedKey = "meiji_protein_shake";
  } else if (textLower.includes('protein shake') || textLower.includes('protein drink') || textLower.includes('whey')) {
    selectedKey = "whey_protein_isolate";
  } else if (textLower.includes('shake') || textLower.includes('smoothie')) {
    selectedKey = "meiji_protein_shake";
  }
  // Poultry & Supermarket / Hawker Rotisserie routing
  else if (isSkinless) {
    if (textLower.includes('ntuc') || textLower.includes('fairprice') || textLower.includes('rotisserie') || textLower.includes('pepper') || textLower.includes('black pepper') || textLower.includes('roast')) {
      selectedKey = "ntuc_roast_chicken_skinless";
    } else if (textLower.includes('breast')) {
      selectedKey = "hainanese_chicken_breast";
    } else if (textLower.includes('thigh') || textLower.includes('drumstick') || textLower.includes('leg')) {
      selectedKey = "hainanese_chicken_thigh";
    } else {
      selectedKey = "ntuc_roast_chicken_skinless";
    }
  } else if (isSkinOnly) {
    if (textLower.includes('rotisserie') || textLower.includes('pepper') || textLower.includes('black pepper') || textLower.includes('roasted') || textLower.includes('ntuc') || textLower.includes('fairprice')) {
      selectedKey = "chicken_skin_seasoned";
    } else {
      selectedKey = "chicken_skin_plain";
    }
  } else if (textLower.includes('ntuc') || textLower.includes('fairprice') || (textLower.includes('rotisserie') && textLower.includes('chicken'))) {
    selectedKey = "ntuc_roast_chicken_with_skin";
  } else if (textLower.includes('chicken breast') || (textLower.includes('breast') && textLower.includes('chicken'))) {
    selectedKey = "hainanese_chicken_breast";
  } else if (textLower.includes('chicken wing') || textLower.includes('wings')) {
    selectedKey = "chicken_wings_roasted";
  } else if (textLower.includes('chicken thigh') || (textLower.includes('thigh') && textLower.includes('chicken')) || textLower.includes('drumstick') || textLower.includes('chicken leg')) {
    selectedKey = "hainanese_chicken_thigh";
  } else if (textLower.includes('chicken rice') && (textLower.includes('chicken') || textLower.includes('steamed') || textLower.includes('roasted'))) {
    selectedKey = "hainanese_chicken_with_skin";
  }
  // Seafood & Fish Soup
  else if (textLower.includes('fish soup') || textLower.includes('batang') || textLower.includes('sliced fish')) {
    selectedKey = "sliced_fish_soup";
  } else if (textLower.includes('yong tau foo') || textLower.includes('ytf')) {
    selectedKey = "yong_tau_foo_soup";
  } else if (textLower.includes('salmon') || textLower.includes('fish') || textLower.includes('tuna') || textLower.includes('mackerel')) {
    selectedKey = "salmon_mackerel_cooked";
  }
  // Kopitiam / Breakfast
  else if (textLower.includes('egg') || textLower.includes('half boiled') || textLower.includes('soft boiled')) {
    selectedKey = "soft_boiled_eggs";
  } else if (textLower.includes('kaya toast') || textLower.includes('kaya')) {
    selectedKey = "kaya_butter_toast";
  } else if (textLower.includes('kopi o') || textLower.includes('kopi-o') || (textLower.includes('kopi') && textLower.includes('kosong'))) {
    selectedKey = "kopi_o_kosong";
  } else if (textLower.includes('teh o') || textLower.includes('teh-o') || (textLower.includes('teh') && textLower.includes('kosong'))) {
    selectedKey = "teh_o_kosong";
  }
  // Asian Greens & Vegetables
  else if (textLower.includes('radish') || textLower.includes('daikon') || textLower.includes('luobo')) {
    selectedKey = "cooked_white_radish";
  } else if (textLower.includes('carrot')) {
    selectedKey = "cooked_carrot";
  } else if (textLower.includes('cauliflower')) {
    selectedKey = "cooked_cauliflower";
  } else if (textLower.includes('cabbage')) {
    selectedKey = "cooked_cabbage";
  } else if (textLower.includes('broccoli')) {
    selectedKey = "steamed_broccoli";
  } else if (textLower.includes('chye sim') || textLower.includes('kailan') || textLower.includes('kang kong') || textLower.includes('spinach') || textLower.includes('vegetables') || textLower.includes('vege')) {
    selectedKey = "asian_greens_stirfry";
  } else if (textLower.includes('avocado')) {
    selectedKey = "fresh_avocado";
  }
  // Meats
  else if (textLower.includes('siew yoke') || textLower.includes('pork belly') || textLower.includes('roast pork') || textLower.includes('char siew')) {
    selectedKey = "roasted_pork_siew_yoke";
  } else if (textLower.includes('steak') || textLower.includes('ribeye') || textLower.includes('beef')) {
    selectedKey = "beef_ribeye_steak";
  }
  // Rice & Noodles (ONLY when rice or noodles is explicitly mentioned)
  else if (textLower.includes('oily rice') || textLower.includes('fragrant rice')) {
    selectedKey = "chicken_rice_oily";
  } else if (textLower.includes('rice')) {
    selectedKey = "white_jasmine_rice";
  } else if (textLower.includes('laksa')) {
    selectedKey = "laksa_noodle_soup";
  } else if (textLower.includes('noodle') || textLower.includes('pasta') || textLower.includes('spaghetti') || textLower.includes('mee') || textLower.includes('kway teow')) {
    selectedKey = "noodles_pasta";
  }
  // Western imports / Dairy
  else if (textLower.includes('butter') || textLower.includes('oil')) {
    selectedKey = "butter_oil";
  } else if (textLower.includes('cheese') || textLower.includes('cheddar')) {
    selectedKey = "cheddar_cheese";
  } else if (textLower.includes('yogurt')) {
    selectedKey = "greek_yogurt";
  } else if (textLower.includes('chicken')) {
    selectedKey = "hainanese_chicken_thigh";
  } else {
    // UNRECOGNIZED FOOD ITEM: Do NOT default to white rice! Retain user's actual entered item name.
    selectedKey = "uncalibrated_generic_item";
    const cleaned = text
      .replace(/^\d+(?:\.\d+)?\s*(?:g|grams?|kg|oz|ml|milliliters?)\s*(?:of\s+)?/i, '')
      .trim();
    customFoodName = cleaned ? (cleaned.charAt(0).toUpperCase() + cleaned.slice(1)) : text;
  }

  const profile = (selectedKey && SINGAPORE_HPB_BENCHMARKS_PER_100G[selectedKey]) || SINGAPORE_HPB_BENCHMARKS_PER_100G.uncalibrated_generic_item;
  const baseItemName = customFoodName || profile.name;
  const isLiquid = Boolean(weightMlMatch && !weightGramMatch) || selectedKey === 'meiji_protein_shake' || selectedKey === 'kopi_o_kosong' || selectedKey === 'teh_o_kosong';
  const unitSuffix = isLiquid ? 'ml' : 'g';

  let displayName = text;

  // Calculate actual grams / ml
  let totalGrams: number;
  if (specifiedGrams !== null && specifiedGrams > 0) {
    totalGrams = specifiedGrams;
    displayName = `${baseItemName} (${Math.round(totalGrams)}${unitSuffix})`;
  } else if (selectedKey === 'soft_boiled_eggs') {
    const eggCount = count > 1 ? count : 2;
    totalGrams = eggCount * 50;
    displayName = `${eggCount} Kopitiam Soft-Boiled Eggs (~${totalGrams}g)`;
  } else if (selectedKey === 'kopi_o_kosong' || selectedKey === 'teh_o_kosong') {
    totalGrams = 240 * count;
    displayName = `${count > 1 ? `${count} Cups ` : ''}${profile.name} (~${totalGrams}ml)`;
  } else {
    totalGrams = profile.defaultPortionGrams * count;
    displayName = `${baseItemName} (~${Math.round(totalGrams)}${unitSuffix})`;
  }

  const factor = totalGrams / 100;
  const protein = Number((profile.protein * factor).toFixed(1));
  const net_carbs = Number((profile.net_carbs * factor).toFixed(1));
  const fiber = Number((profile.fiber * factor).toFixed(1));
  const fat = Number((profile.fat * factor).toFixed(1));
  const sodium = Math.round(profile.sodium * factor);
  const potassium = Math.round(profile.potassium * factor);
  const magnesium = Math.round(profile.magnesium * factor);
  const calcium = Math.round(profile.calcium * factor);

  const calories = calculateAtwaterCalories(protein, net_carbs, fat);
  const isHPB = profile.isRegionalHPB !== false;

  return {
    id: Date.now().toString(),
    name: displayName,
    calories,
    protein,
    net_carbs,
    fiber,
    fat,
    sodium,
    potassium,
    magnesium,
    calcium,
    source: isHPB ? "singapore_hpb" : "usda_import",
    sourceLabel: isHPB ? "Singapore HPB" : "USDA Import",
    confidence_notes: `Scaled from ${isHPB ? "Singapore HPB" : "USDA"} standard for ${profile.name} (${Math.round(totalGrams)}g). Atwater verified: (${protein}*4) + (${net_carbs}*4) + (${fat}*9) = ${calories} kcal.`
  };
}

/**
 * Splits and parses multi-component meal entries (e.g. separated by commas, newlines, plus signs, semicolons, or "and").
 * Returns an array of discrete FoodItem objects for each component.
 */
export function parseMultiComponentMealText(rawText: string): FoodItem[] {
  const text = rawText.trim();
  if (!text) return [];

  // Split on commas, plus signs, semicolons, newlines,
  // or "and" when preceded/followed by weights/quantities
  const delimiterRegex = /[,\n;\+]|\s+and\s+(?=(?:cooked\s+)?(?:\d+(?:\.\d+)?\s*(?:g|grams?|kg|oz|ml|bowls?|plates?|cups?|eggs?|slices?|servings?)|[a-z]+)\b)/i;

  const rawSegments = text
    .split(delimiterRegex)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (rawSegments.length <= 1) {
    return [parseNaturalMealText(text)];
  }

  const items: FoodItem[] = [];
  const baseTime = Date.now();
  for (let i = 0; i < rawSegments.length; i++) {
    const segment = rawSegments[i];
    if (!segment) continue;
    const parsed = parseNaturalMealText(segment);
    parsed.id = `${baseTime}-${i}-${Math.random().toString(36).substring(2, 6)}`;
    items.push(parsed);
  }

  return items.length > 0 ? items : [parseNaturalMealText(text)];
}

