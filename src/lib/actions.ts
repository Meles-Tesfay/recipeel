"use server";

import { db } from "@/db";
import { preferences, recipes, mealPlans, groceryLists, groceryItems, ingredients as ingredientsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getSessionUser() {
    const session = await auth.api.getSession({
        headers: await headers()
    });
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }
    return session.user;
}

export async function saveOnboardingPreferences(data: {
    dietary: string[];
    allergies: string[];
    fitnessGoals: string;
    budget: string;
    dailyCalories: number;
    dailyProtein: number;
    dailyCarbs: number;
    dailyFat: number;
}) {
    const user = await getSessionUser();

    await db.insert(preferences).values({
        userId: user.id,
        ...data
    }).onConflictDoUpdate({
        target: preferences.userId,
        set: data
    });

    return { success: true };
}

export async function getUserPreferences() {
    const user = await getSessionUser();
    const prefs = await db.query.preferences.findFirst({
        where: eq(preferences.userId, user.id)
    });
    return prefs;
}

function getMacroAdjustment(originalName: string, substitutedName: string) {
    const orig = originalName.toLowerCase();
    const sub = substitutedName.toLowerCase();
    
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;
    
    if (orig.includes("cream") && sub.includes("coconut")) {
        calories = -150; protein = -2; carbs = -2; fat = -15;
    } else if (orig.includes("parmesan") && sub.includes("yeast")) {
        calories = -80; protein = -5; carbs = -2; fat = -7;
    } else if (orig.includes("noodles") && sub.includes("rice")) {
        calories = 0; protein = -4; carbs = 5; fat = 0;
    } else if (orig.includes("chicken") && sub.includes("tofu")) {
        calories = -200; protein = -20; carbs = 2; fat = -10;
    } else if (orig.includes("soy") && sub.includes("coconut")) {
        calories = -10; protein = 0; carbs = 2; fat = 0;
    }
    
    return { calories, protein, carbs, fat };
}

// =============================================
// TheMealDB API — Real Recipe Search
// =============================================

const MEALDB_BASE = "https://www.themealdb.com/api/json/v1/1";

// Infer simple ingredient tags from name
function inferIngredientTags(name: string): string[] {
    const lower = name.toLowerCase();
    const tags: string[] = [];
    if (lower.includes("milk") || lower.includes("cream") || lower.includes("cheese") || lower.includes("butter") || lower.includes("yogurt")) tags.push("Dairy");
    if (lower.includes("wheat") || lower.includes("flour") || lower.includes("bread") || lower.includes("pasta") || lower.includes("noodle") || lower.includes("barley")) tags.push("Gluten");
    if (lower.includes("peanut")) tags.push("Peanuts");
    if (lower.includes("almond") || lower.includes("walnut") || lower.includes("cashew") || lower.includes("pecan") || lower.includes("pistachio")) tags.push("Tree Nuts");
    if (lower.includes("soy") || lower.includes("tofu") || lower.includes("edamame")) tags.push("Soy");
    if (lower.includes("shrimp") || lower.includes("crab") || lower.includes("lobster") || lower.includes("prawn")) tags.push("Shellfish");
    if (lower.includes("egg")) tags.push("Eggs");
    if (lower.includes("salmon") || lower.includes("tuna") || lower.includes("cod") || lower.includes("tilapia") || lower.includes("fish")) tags.push("Fish");
    if (lower.includes("chicken") || lower.includes("beef") || lower.includes("pork") || lower.includes("lamb") || lower.includes("turkey") || lower.includes("bacon")) tags.push("Meat");
    return tags;
}

// Parse TheMealDB meal into our recipe format
function parseMealDbMeal(meal: any) {
    const ingredients: { name: string; amount: string; unit: string; tags: string[] }[] = [];
    for (let i = 1; i <= 20; i++) {
        const name = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (!name || name.trim() === "") break;
        const tags = inferIngredientTags(name);
        ingredients.push({
            name: name.trim(),
            amount: measure?.trim() || "",
            unit: "",
            tags,
        });
    }

    const instructions = (meal.strInstructions || "")
        .split(/\r?\n/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 5 && !s.match(/^step\s*\d+$/i))
        .slice(0, 10);

    // Rough macro estimation (TheMealDB has no nutrition data)
    const proteinIngredients = ingredients.filter(i => i.tags.includes("Meat") || i.name.toLowerCase().includes("chicken") || i.name.toLowerCase().includes("beef") || i.name.toLowerCase().includes("fish")).length;
    const estimatedCalories = 350 + (proteinIngredients * 120) + (Math.random() * 100 | 0);
    const estimatedProtein = 15 + (proteinIngredients * 20);

    return {
        id: meal.idMeal,
        title: meal.strMeal,
        thumbnail: meal.strMealThumb,
        category: meal.strCategory,
        area: meal.strArea,
        cookTime: 25 + (Math.floor(Math.random() * 4) * 5),
        servings: 2 + (Math.floor(Math.random() * 3)),
        calories: Math.round(estimatedCalories),
        protein: Math.round(estimatedProtein),
        carbs: Math.round(30 + Math.random() * 30),
        fat: Math.round(10 + Math.random() * 15),
        ingredients,
        instructions,
        originalUrl: `https://www.themealdb.com/meal/${meal.idMeal}`,
        source: "TheMealDB",
    };
}

// Apply the dietary substitution engine on top of a recipe
function applyDietaryEngine(recipe: any, dietary: string[], allergies: string[]) {
    const processedIngredients = recipe.ingredients.map((ing: any) => {
        let conflict = null;
        let suggestion = null;
        const tags = ing.tags || [];

        // Check allergies
        for (const allergy of allergies) {
            if (tags.includes(allergy) || ing.name.toLowerCase().includes(allergy.toLowerCase())) {
                conflict = allergy;
                break;
            }
        }

        // Check dietary restrictions
        if (!conflict) {
            if (dietary.includes("Vegan") && (tags.includes("Dairy") || tags.includes("Meat") || tags.includes("Eggs") || tags.includes("Fish"))) {
                conflict = "Vegan";
            } else if (dietary.includes("Vegetarian") && (tags.includes("Meat") || tags.includes("Fish"))) {
                conflict = "Vegetarian";
            } else if (dietary.includes("Dairy-Free") && tags.includes("Dairy")) {
                conflict = "Dairy-Free";
            } else if (dietary.includes("Gluten-Free") && tags.includes("Gluten")) {
                conflict = "Gluten-Free";
            }
        }

        // Generate substitutions
        if (conflict) {
            if (tags.includes("Dairy") || ing.name.toLowerCase().includes("cream")) suggestion = "Coconut Milk";
            if (ing.name.toLowerCase().includes("parmesan")) suggestion = "Nutritional Yeast";
            if (tags.includes("Peanuts")) suggestion = "Sunflower Seed Butter";
            if (tags.includes("Gluten") || ing.name.toLowerCase().includes("wheat")) suggestion = "Rice Noodles";
            if (tags.includes("Meat") || ing.name.toLowerCase().includes("chicken")) suggestion = "Tofu";
            if (tags.includes("Soy") || ing.name.toLowerCase().includes("soy sauce")) suggestion = "Coconut Aminos";
            if (tags.includes("Fish")) suggestion = "Hearts of Palm";
            if (tags.includes("Eggs")) suggestion = "Flax Egg (1 tbsp ground flax + 3 tbsp water)";
        }

        return { ...ing, conflict, suggestion };
    });

    return { ...recipe, ingredients: processedIngredients };
}

/**
 * Search real recipes by name using TheMealDB API
 * Returns up to 10 results with dietary engine applied
 */
export async function searchRecipesByName(query: string) {
    const user = await getSessionUser();
    const prefs = await db.query.preferences.findFirst({
        where: eq(preferences.userId, user.id)
    });

    const dietary = (prefs?.dietary as string[] | null) ?? [];
    const allergies = (prefs?.allergies as string[] | null) ?? [];

    const res = await fetch(`${MEALDB_BASE}/search.php?s=${encodeURIComponent(query)}`, {
        next: { revalidate: 3600 }
    });
    const data = await res.json();

    if (!data.meals) return [];

    const results = data.meals.slice(0, 10).map((meal: any) => {
        const parsed = parseMealDbMeal(meal);
        return applyDietaryEngine(parsed, dietary, allergies);
    });

    return results;
}

/**
 * Get full meal details from TheMealDB by meal ID
 */
export async function getRecipeDetailsFromApi(mealId: string) {
    const user = await getSessionUser();
    const prefs = await db.query.preferences.findFirst({
        where: eq(preferences.userId, user.id)
    });

    const dietary = (prefs?.dietary as string[] | null) ?? [];
    const allergies = (prefs?.allergies as string[] | null) ?? [];

    const res = await fetch(`${MEALDB_BASE}/lookup.php?i=${mealId}`, {
        next: { revalidate: 3600 }
    });
    const data = await res.json();

    if (!data.meals || !data.meals[0]) return null;

    const parsed = parseMealDbMeal(data.meals[0]);
    return applyDietaryEngine(parsed, dietary, allergies);
}

// Recipes
export async function saveRecipe(recipeData: any) {
    const user = await getSessionUser();
    
    let finalCalories = recipeData.calories || 0;
    let finalProtein = recipeData.protein || 0;
    let finalCarbs = recipeData.carbs || 0;
    let finalFat = recipeData.fat || 0;

    if (recipeData.ingredients) {
        recipeData.ingredients.forEach((ing: any) => {
            if (ing.isSubstituted) {
                const adj = getMacroAdjustment(ing.originalName || ing.name, ing.name);
                finalCalories += adj.calories;
                finalProtein += adj.protein;
                finalCarbs += adj.carbs;
                finalFat += adj.fat;
            }
        });
    }

    // Insert recipe
    const [recipe] = await db.insert(recipes).values({
        userId: user.id,
        title: recipeData.title,
        originalUrl: recipeData.originalUrl,
        cookTime: recipeData.cookTime,
        instructions: JSON.stringify(recipeData.instructions),
        calories: Math.max(0, finalCalories),
        protein: Math.max(0, finalProtein),
        carbs: Math.max(0, finalCarbs),
        fat: Math.max(0, finalFat),
        tags: recipeData.tags || [],
    }).returning();

    // Insert ingredients
    if (recipeData.ingredients && recipeData.ingredients.length > 0) {
        await db.insert(ingredientsTable).values(
            recipeData.ingredients.map((ing: any) => ({
                recipeId: recipe.id,
                name: ing.name,
                amount: typeof ing.amount === 'string' ? parseFloat(ing.amount) || 0 : (ing.amount || 0),
                unit: ing.unit || "unit",
                originalName: ing.originalName || ing.name,
                isSubstituted: ing.isSubstituted ? true : false,
                substituteFor: ing.isSubstituted ? (ing.substituteFor || ing.originalName) : null,
                substitutedWith: ing.isSubstituted ? ing.name : null,
            }))
        );
    }

    return recipe;
}

export async function getUserRecipes() {
    const user = await getSessionUser();
    const userRecipes = await db.query.recipes.findMany({
        where: eq(recipes.userId, user.id),
        with: {
            ingredients: true
        },
        orderBy: (recipes, { desc }) => [desc(recipes.createdAt)]
    });
    return userRecipes;
}

export async function deleteRecipe(id: string) {
    const user = await getSessionUser();
    // Verify ownership
    const recipe = await db.query.recipes.findFirst({
        where: and(eq(recipes.id, id), eq(recipes.userId, user.id))
    });
    if (!recipe) throw new Error("Not found");

    await db.delete(recipes).where(eq(recipes.id, id));
    return { success: true };
}

export async function toggleFavorite(id: string, isFavorite: boolean) {
    const user = await getSessionUser();
    await db.update(recipes).set({ isFavorite }).where(and(eq(recipes.id, id), eq(recipes.userId, user.id)));
    return { success: true };
}

export async function updateIngredient(id: string, substitution: string) {
    const ing = await db.query.ingredients.findFirst({
        where: eq(ingredientsTable.id, id)
    });
    if (!ing) throw new Error("Ingredient not found");
    
    const recipe = await db.query.recipes.findFirst({
        where: eq(recipes.id, ing.recipeId)
    });
    if (!recipe) throw new Error("Recipe not found");

    // 1. Determine old adjustment (if it was already substituted)
    let oldAdj = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    if (ing.isSubstituted) {
        oldAdj = getMacroAdjustment(ing.originalName || ing.name, ing.name);
    }

    // 2. Determine new adjustment
    let newAdj = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    const isReverting = substitution === (ing.originalName || ing.name) || !substitution || substitution.startsWith("Original:");
    const cleanSubName = substitution.replace("🔄 ", "").replace(/Original:\s*/, "");

    if (!isReverting) {
        newAdj = getMacroAdjustment(ing.originalName || ing.name, cleanSubName);
    }

    // 3. Calculate new recipe macros
    const newCalories = Math.max(0, (recipe.calories || 0) - oldAdj.calories + newAdj.calories);
    const newProtein = Math.max(0, (recipe.protein || 0) - oldAdj.protein + newAdj.protein);
    const newCarbs = Math.max(0, (recipe.carbs || 0) - oldAdj.carbs + newAdj.carbs);
    const newFat = Math.max(0, (recipe.fat || 0) - oldAdj.fat + newAdj.fat);

    // 4. Update ingredient
    await db.update(ingredientsTable).set({
        name: isReverting ? (ing.originalName || ing.name) : cleanSubName,
        isSubstituted: !isReverting,
        substitutedWith: isReverting ? null : cleanSubName,
        substituteFor: isReverting ? null : (ing.originalName || ing.name)
    }).where(eq(ingredientsTable.id, id));

    // 5. Update recipe
    await db.update(recipes).set({
        calories: newCalories,
        protein: newProtein,
        carbs: newCarbs,
        fat: newFat
    }).where(eq(recipes.id, recipe.id));
    
    return { success: true };
}

// Meal Plans
export async function saveMealPlan(date: Date, mealType: string, recipeId: string) {
    const user = await getSessionUser();
    await db.insert(mealPlans).values({
        userId: user.id,
        date,
        mealType,
        recipeId
    });
    return { success: true };
}

export async function getMealPlan(startDate: Date, endDate: Date) {
    const user = await getSessionUser();
    
    // For MVP, get all meal plans for user (could filter by date in real app)
    const plans = await db.query.mealPlans.findMany({
        where: eq(mealPlans.userId, user.id),
        with: {
            recipe: true
        }
    });
    return plans;
}

// Groceries
export async function generateGroceryList(startDate: Date, endDate: Date) {
    const user = await getSessionUser();
    
    // 1. Get meal plans for the period
    const plans = await db.query.mealPlans.findMany({
        where: eq(mealPlans.userId, user.id),
        with: {
            recipe: {
                with: {
                    ingredients: true
                }
            }
        }
    });

    // 2. Aggregate ingredients
    const itemsMap = new Map<string, any>();
    
    for (const plan of plans) {
        if (!plan.recipe || !plan.recipe.ingredients) continue;
        
        for (const ing of plan.recipe.ingredients) {
            const key = `${ing.name.toLowerCase()}-${ing.unit?.toLowerCase()}`;
            if (itemsMap.has(key)) {
                const existing = itemsMap.get(key);
                existing.amount += (ing.amount || 0);
            } else {
                itemsMap.set(key, {
                    name: ing.name,
                    amount: (ing.amount || 0),
                    unit: ing.unit,
                    aisle: detectAisle(ing.name),
                    isSubstituted: ing.isSubstituted,
                    substituteFor: ing.substituteFor
                });
            }
        }
    }

    // 3. Save to DB
    const [list] = await db.insert(groceryLists).values({
        userId: user.id,
        startDate,
        endDate
    }).returning();

    const itemsToInsert = Array.from(itemsMap.values()).map(item => ({
        listId: list.id,
        ...item
    }));

    if (itemsToInsert.length > 0) {
        await db.insert(groceryItems).values(itemsToInsert);
    }

    return list.id;
}

export async function getLatestGroceryList() {
    const user = await getSessionUser();
    const list = await db.query.groceryLists.findFirst({
        where: eq(groceryLists.userId, user.id),
        orderBy: (groceryLists, { desc }) => [desc(groceryLists.createdAt)],
        with: {
            items: true
        }
    });
    return list;
}

export async function toggleGroceryItem(id: string, isChecked: boolean) {
    await db.update(groceryItems).set({ isChecked }).where(eq(groceryItems.id, id));
    return { success: true };
}

export async function deleteMealPlan(id: string) {
    const user = await getSessionUser();
    await db.delete(mealPlans).where(and(eq(mealPlans.id, id), eq(mealPlans.userId, user.id)));
    return { success: true };
}

// Smart aisle detection by ingredient name
function detectAisle(name: string): string {
    const lower = name.toLowerCase();
    if (lower.match(/milk|cheese|butter|cream|yogurt|sour cream|cheddar|mozzarella|parmesan|brie|feta|ricotta|cottage cheese/)) return "Dairy";
    if (lower.match(/chicken|beef|pork|lamb|turkey|bacon|sausage|ham|steak|ground|mince|veal|duck|venison/)) return "Meat & Poultry";
    if (lower.match(/salmon|tuna|cod|tilapia|shrimp|crab|lobster|prawn|fish|clam|oyster|mussel|halibut|trout/)) return "Seafood";
    if (lower.match(/apple|banana|orange|lemon|lime|grape|strawberr|blueberr|raspberr|avocado|mango|peach|pear|plum|cherry|watermelon/)) return "Fruits";
    if (lower.match(/lettuce|spinach|kale|onion|garlic|tomato|carrot|celery|broccoli|cauliflower|zucchini|cucumber|pepper|mushroom|potato|sweet potato|asparagus|leek|ginger|shallot|scallion|green bean|pea|corn|squash/)) return "Produce";
    if (lower.match(/bread|bagel|bun|muffin|roll|tortilla|pita|naan|sourdough|baguette/)) return "Bakery";
    if (lower.match(/pasta|noodle|rice|quinoa|couscous|barley|oat|cereal|flour|bread crumb/)) return "Grains & Pasta";
    if (lower.match(/almond|walnut|cashew|peanut|pecan|pistachio|hazelnut|sunflower seed|pumpkin seed|sesame/)) return "Nuts & Seeds";
    if (lower.match(/soy sauce|olive oil|vinegar|ketchup|mustard|mayo|salsa|hot sauce|worcestershire|sriracha|fish sauce|oyster sauce|hoisin|teriyaki|tahini/)) return "Condiments & Sauces";
    if (lower.match(/cumin|paprika|oregano|basil|thyme|rosemary|turmeric|cinnamon|pepper|salt|chili|cayenne|curry|bay leaf|clove|nutmeg|coriander|cardamom/)) return "Spices & Herbs";
    if (lower.match(/sugar|honey|maple syrup|agave|stevia|molasses|brown sugar|powdered sugar|vanilla/)) return "Baking & Sweeteners";
    if (lower.match(/tofu|tempeh|seitan|edamame|miso|lentil|chickpea|black bean|kidney bean|cannellini|navy bean/)) return "Plant-Based & Legumes";
    if (lower.match(/beer|wine|rum|vodka|whiskey|gin|juice|soda|kombucha|coconut water|broth|stock/)) return "Beverages";
    if (lower.match(/frozen|ice cream/)) return "Frozen Foods";
    return "Other";
}

export async function addGroceryItem(listId: string, name: string, amount: number, unit: string) {
    await db.insert(groceryItems).values({
        listId,
        name,
        amount,
        unit,
        aisle: detectAisle(name),
        isChecked: false,
    });
    return { success: true };
}

export async function updateRecipeTags(recipeId: string, tags: string[], folder: string) {
    const user = await getSessionUser();
    await db.update(recipes).set({ tags, folder }).where(and(eq(recipes.id, recipeId), eq(recipes.userId, user.id)));
    return { success: true };
}

export async function getWeeklyNutrition() {
    const user = await getSessionUser();
    const prefs = await db.query.preferences.findFirst({
        where: eq(preferences.userId, user.id)
    });

    // Get all meal plans for this user
    const plans = await db.query.mealPlans.findMany({
        where: eq(mealPlans.userId, user.id),
        with: { recipe: true }
    });

    // Build last-7-days data keyed by mealType day prefix
    const DAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const dayTotals: Record<string, { calories: number; protein: number; carbs: number; fat: number }> = {};
    for (const day of DAYS_FULL) {
        dayTotals[day] = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }

    for (const plan of plans) {
        const dayKey = plan.mealType.split("-")[0];
        if (dayTotals[dayKey] && plan.recipe) {
            dayTotals[dayKey].calories += plan.recipe.calories || 0;
            dayTotals[dayKey].protein += plan.recipe.protein || 0;
            dayTotals[dayKey].carbs += plan.recipe.carbs || 0;
            dayTotals[dayKey].fat += plan.recipe.fat || 0;
        }
    }

    return {
        days: DAYS_FULL.map(day => ({ day, ...dayTotals[day] })),
        goals: {
            calories: prefs?.dailyCalories || 2000,
            protein: prefs?.dailyProtein || 150,
            carbs: prefs?.dailyCarbs || 250,
            fat: prefs?.dailyFat || 70,
        },
        mealPlanIds: plans.map(p => ({ id: p.id, mealType: p.mealType })),
    };
}

// Recipe Extraction Mock & Dietary Engine (URL-based import — kept as fallback/demo)
export async function extractRecipeFromUrl(url: string) {
    const user = await getSessionUser();
    const prefs = await db.query.preferences.findFirst({
        where: eq(preferences.userId, user.id)
    });

    const dietary = (prefs?.dietary as string[] | null) ?? [];
    const allergies = (prefs?.allergies as string[] | null) ?? [];

    // Try to extract a keyword from the URL for TheMealDB search
    const urlLower = url.toLowerCase();
    let searchQuery = "pasta"; // default

    if (urlLower.includes("chicken")) searchQuery = "chicken";
    else if (urlLower.includes("pasta") || urlLower.includes("noodle")) searchQuery = "pasta";
    else if (urlLower.includes("salad")) searchQuery = "salad";
    else if (urlLower.includes("soup")) searchQuery = "soup";
    else if (urlLower.includes("burger")) searchQuery = "burger";
    else if (urlLower.includes("pizza")) searchQuery = "pizza";
    else if (urlLower.includes("sushi")) searchQuery = "sushi";
    else if (urlLower.includes("taco")) searchQuery = "taco";
    else if (urlLower.includes("smoothie")) searchQuery = "smoothie";
    else if (urlLower.includes("steak")) searchQuery = "beef";
    else if (urlLower.includes("fish") || urlLower.includes("salmon")) searchQuery = "fish";

    // Try real API first
    try {
        const res = await fetch(`${MEALDB_BASE}/search.php?s=${encodeURIComponent(searchQuery)}`, {
            next: { revalidate: 3600 }
        });
        const data = await res.json();
        if (data.meals && data.meals.length > 0) {
            // Pick a random one from results for variety
            const randomMeal = data.meals[Math.floor(Math.random() * Math.min(data.meals.length, 5))];
            const parsed = parseMealDbMeal(randomMeal);
            parsed.originalUrl = url; // keep original URL reference
            return applyDietaryEngine(parsed, dietary, allergies);
        }
    } catch {
        // Fall through to mock
    }

    // Fallback mock data (if API is unreachable)
    let baseRecipe: any;
    
    if (url.includes("tiktok")) {
        baseRecipe = {
            title: "Viral Chili Oil Noodles",
            cookTime: 15,
            servings: 2,
            calories: 480,
            protein: 12,
            carbs: 65,
            fat: 22,
            ingredients: [
                { name: "Wheat Noodles", amount: 200, unit: "g", tags: ["Gluten"] },
                { name: "Soy Sauce", amount: 2, unit: "tbsp", tags: ["Gluten", "Soy"] },
                { name: "Chili Flakes", amount: 1, unit: "tbsp" },
                { name: "Garlic", amount: 3, unit: "cloves" },
                { name: "Peanut Oil", amount: 3, unit: "tbsp", tags: ["Peanuts"] },
            ],
            instructions: [
                "Boil noodles according to package instructions.",
                "Mince garlic and place in a heat-proof bowl with chili flakes and soy sauce.",
                "Heat peanut oil until smoking, then pour over the aromatics.",
                "Toss cooked noodles in the chili oil sauce."
            ]
        };
    } else if (url.includes("instagram")) {
         baseRecipe = {
            title: "Healthy Protein Smoothie",
            cookTime: 5,
            servings: 1,
            calories: 320,
            protein: 30,
            carbs: 40,
            fat: 8,
            ingredients: [
                { name: "Banana", amount: 1, unit: "whole" },
                { name: "Whey Protein", amount: 1, unit: "scoop", tags: ["Dairy"] },
                { name: "Almond Milk", amount: 1, unit: "cup", tags: ["Tree Nuts"] },
                { name: "Peanut Butter", amount: 1, unit: "tbsp", tags: ["Peanuts"] },
            ],
            instructions: [
                "Add all ingredients to a blender.",
                "Blend until smooth.",
                "Serve immediately."
            ]
        };
    } else {
        baseRecipe = {
            title: "Creamy Tuscan Chicken",
            cookTime: 30,
            servings: 4,
            calories: 550,
            protein: 42,
            carbs: 12,
            fat: 35,
            ingredients: [
                { name: "Chicken Breast", amount: 2, unit: "lbs" },
                { name: "Heavy Cream", amount: 1, unit: "cup", tags: ["Dairy"] },
                { name: "Parmesan", amount: 0.5, unit: "cup", tags: ["Dairy"] },
                { name: "Spinach", amount: 2, unit: "cups" },
                { name: "Sun-dried Tomatoes", amount: 0.5, unit: "cup" },
                { name: "Garlic Cloves", amount: 4, unit: "cloves" },
            ],
            instructions: [
                "Season chicken breast with salt, pepper, and Italian seasoning.",
                "Sear chicken in olive oil over medium-high heat until golden, about 4 minutes per side. Remove and set aside.",
                "In the same pan, sauté garlic until fragrant. Add heavy cream and parmesan to form the sauce.",
                "Stir in spinach and sun-dried tomatoes until spinach wilts.",
                "Return chicken to the pan. Simmer on low for 5 minutes until cooked through.",
            ]
        };
    }

    // Apply Dietary Engine
    const processedIngredients = baseRecipe.ingredients.map((ing: any) => {
        let conflict = null;
        let suggestion = null;
        const tags = ing.tags || [];

        for (const allergy of allergies) {
            if (tags.includes(allergy) || ing.name.toLowerCase().includes(allergy.toLowerCase())) {
                conflict = allergy;
                break;
            }
        }

        if (!conflict) {
            if (dietary.includes("Vegan") && (tags.includes("Dairy") || ing.name.toLowerCase().includes("chicken") || tags.includes("Eggs") || tags.includes("Fish") || tags.includes("Meat"))) {
                conflict = "Vegan";
            } else if (dietary.includes("Vegetarian") && (ing.name.toLowerCase().includes("chicken") || tags.includes("Fish") || tags.includes("Meat"))) {
                conflict = "Vegetarian";
            } else if (dietary.includes("Dairy-Free") && tags.includes("Dairy")) {
                conflict = "Dairy-Free";
            } else if (dietary.includes("Gluten-Free") && (tags.includes("Gluten") || ing.name.toLowerCase().includes("wheat") || ing.name.toLowerCase().includes("flour"))) {
                conflict = "Gluten-Free";
            }
        }

        if (conflict) {
            if (tags.includes("Dairy") || ing.name.toLowerCase().includes("cream")) suggestion = "Coconut Milk";
            if (ing.name.toLowerCase().includes("parmesan")) suggestion = "Nutritional Yeast";
            if (tags.includes("Peanuts")) suggestion = "Sunflower Seed Butter";
            if (tags.includes("Gluten") || ing.name.toLowerCase().includes("wheat")) suggestion = "Rice Noodles";
            if (ing.name.toLowerCase().includes("chicken")) suggestion = "Tofu";
            if (tags.includes("Soy") || ing.name.toLowerCase().includes("soy sauce")) suggestion = "Coconut Aminos";
        }

        return { ...ing, conflict, suggestion };
    });

    return {
        ...baseRecipe,
        ingredients: processedIngredients,
        originalUrl: url
    };
}

