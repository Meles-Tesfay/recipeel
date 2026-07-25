import { db } from "@/db";
import { preferences } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    const userPrefs = await db.query.preferences.findFirst({
        where: eq(preferences.userId, session!.user.id)
    });

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    Welcome back, {session?.user.name.split(" ")[0]}!
                </h1>
                <p className="text-zinc-500 mt-2">Here is your nutrition overview and daily progress.</p>
            </header>

            {/* Macros Summary Cards */}
            <div className="grid grid-cols-4 gap-6">
                {[
                    { label: "Calories", current: 1450, max: userPrefs?.dailyCalories || 2000, unit: "kcal", color: "bg-orange-500" },
                    { label: "Protein", current: 95, max: userPrefs?.dailyProtein || 150, unit: "g", color: "bg-blue-500" },
                    { label: "Carbs", current: 180, max: userPrefs?.dailyCarbs || 250, unit: "g", color: "bg-green-500" },
                    { label: "Fat", current: 45, max: userPrefs?.dailyFat || 70, unit: "g", color: "bg-yellow-500" },
                ].map(macro => (
                    <div key={macro.label} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
                        <div className="flex justify-between items-baseline mb-4">
                            <h3 className="font-medium text-zinc-600 dark:text-zinc-400">{macro.label}</h3>
                            <span className="text-xs font-semibold text-zinc-500">{macro.current} / {macro.max}{macro.unit}</span>
                        </div>
                        <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${macro.color}`} 
                                style={{ width: `${Math.min(100, (macro.current / macro.max) * 100)}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-8 mt-8">
                {/* Upcoming Meals */}
                <section className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
                    <h2 className="text-xl font-bold mb-6">Today's Meals</h2>
                    <div className="space-y-4">
                        {[
                            { type: "Breakfast", title: "Avocado Toast with Egg", cals: 350 },
                            { type: "Lunch", title: "Grilled Chicken Salad", cals: 450 },
                            { type: "Dinner", title: "Salmon and Quinoa", cals: 650 },
                        ].map((meal, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
                                <div>
                                    <p className="text-sm font-semibold text-orange-500">{meal.type}</p>
                                    <p className="font-medium">{meal.title}</p>
                                </div>
                                <div className="text-zinc-500 font-medium">
                                    {meal.cals} kcal
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Dietary Restrictions Active */}
                <section className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 p-6">
                    <h2 className="text-xl font-bold mb-6">Active Dietary Rules</h2>
                    <div className="flex flex-wrap gap-2">
                        {(userPrefs?.dietary as string[] | null)?.map((diet: string) => (
                            <span key={diet} className="px-4 py-2 bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 font-medium rounded-full text-sm">
                                {diet}
                            </span>
                        ))}
                        {(userPrefs?.allergies as string[] | null)?.map((allergy: string) => (
                            <span key={allergy} className="px-4 py-2 bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 font-medium rounded-full text-sm">
                                {allergy} Free
                            </span>
                        ))}
                        {(!(userPrefs?.dietary as string[] | null)?.length && !(userPrefs?.allergies as string[] | null)?.length) && (
                            <p className="text-zinc-500">No active restrictions.</p>
                        )}
                    </div>
                    
                    <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 rounded-xl">
                        <p className="text-sm font-medium">✨ Smart Substitution Engine is active. Any imported recipes will automatically adapt to your rules.</p>
                    </div>
                </section>
            </div>
        </div>
    );
}
