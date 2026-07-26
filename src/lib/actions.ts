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
                    aisle: "Produce", // Mock aisle for now
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

// Recipe Extraction Mock & Dietary Engine
export async function extractRecipeFromUrl(url: string) {
    const user = await getSessionUser();
    const prefs = await db.query.preferences.findFirst({
        where: eq(preferences.userId, user.id)
    });

    const dietary = (prefs?.dietary as string[] | null) ?? [];
    const allergies = (prefs?.allergies as string[] | null) ?? [];

    // Mock different recipes based on URL
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

        // Check allergies
        for (const allergy of allergies) {
            if (tags.includes(allergy) || ing.name.toLowerCase().includes(allergy.toLowerCase())) {
                conflict = allergy;
                break;
            }
        }

        // Check dietary (simplified mapping for MVP)
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

        // Generate mock substitutions
        if (conflict) {
            if (tags.includes("Dairy") || ing.name.toLowerCase().includes("cream")) suggestion = "Coconut Milk";
            if (ing.name.toLowerCase().includes("parmesan")) suggestion = "Nutritional Yeast";
            if (tags.includes("Peanuts")) suggestion = "Sunflower Seed Butter";
            if (tags.includes("Gluten") || ing.name.toLowerCase().includes("wheat")) suggestion = "Rice Noodles";
            if (ing.name.toLowerCase().includes("chicken")) suggestion = "Tofu";
            if (tags.includes("Soy") || ing.name.toLowerCase().includes("soy sauce")) suggestion = "Coconut Aminos";
        }

        return {
            ...ing,
            conflict,
            suggestion
        };
    });

    return {
        ...baseRecipe,
        ingredients: processedIngredients,
        originalUrl: url
    };
}
