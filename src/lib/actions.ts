"use server";

import { db } from "@/db";
import { preferences, recipes, mealPlans, groceryLists, groceryItems } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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
    const session = await auth.api.getSession({
        headers: await headers()
    });
    
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    await db.insert(preferences).values({
        userId: session.user.id,
        ...data
    }).onConflictDoUpdate({
        target: preferences.userId,
        set: data
    });

    return { success: true };
}
