"use client";

import { useState, useEffect } from "react";
import { getUserRecipes, getMealPlan, saveMealPlan, generateGroceryList, getUserPreferences } from "@/lib/actions";
import { useRouter } from "next/navigation";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"];

const MEAL_COLORS: Record<string, string> = {
    Breakfast: "#f97316",
    Lunch:     "#22c55e",
    Dinner:    "#8b5cf6",
    Snacks:    "#06b6d4",
};

export default function PlannerPage() {
    const router = useRouter();
    const [plannerData, setPlannerData] = useState<Record<string, Record<string, any>>>({});
    const [library, setLibrary] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ day: string, type: string } | null>(null);
    const [generating, setGenerating] = useState(false);
    const [goalCals, setGoalCals] = useState(2000);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const [recipes, plans, prefs] = await Promise.all([
            getUserRecipes(),
            getMealPlan(new Date(), new Date()),
            getUserPreferences(),
        ]);
        setLibrary(recipes);
        if (prefs?.dailyCalories) setGoalCals(prefs.dailyCalories);
        const dataMap: Record<string, Record<string, any>> = {};
        for (const day of DAYS_FULL) dataMap[day] = {};
        plans.forEach((plan: any) => {
            const [day, type] = plan.mealType.split("-");
            if (dataMap[day]) dataMap[day][type] = plan.recipe;
        });
        setPlannerData(dataMap);
    };

    const openModal = (day: string, type: string) => {
        setSelectedSlot({ day, type });
        setIsModalOpen(true);
    };

    const handleAssign = async (recipeId: string) => {
        if (!selectedSlot) return;
        setIsModalOpen(false);
        await saveMealPlan(new Date(), `${selectedSlot.day}-${selectedSlot.type}`, recipeId);
        await loadData();
    };

    const handleGenerate = async () => {
        setGenerating(true);
        await generateGroceryList(new Date(), new Date());
        setGenerating(false);
        router.push("/dashboard/groceries");
    };

    // Compute totals
    const allMeals = Object.values(plannerData).flatMap(day => Object.values(day));
    const totalCals = allMeals.reduce((s, m) => s + (m?.calories || 0), 0);
    const totalProtein = allMeals.reduce((s, m) => s + (m?.protein || 0), 0);
    const totalCarbs = allMeals.reduce((s, m) => s + (m?.carbs || 0), 0);
    const totalFat = allMeals.reduce((s, m) => s + (m?.fat || 0), 0);
    const calsPct = Math.min((totalCals / goalCals) * 100, 100);

    // SVG circle for calorie ring
    const r = 46;
    const circ = 2 * Math.PI * r;
    const dash = (calsPct / 100) * circ;

    return (
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-6 md:space-y-8">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-[28px] font-bold text-zinc-900 tracking-tight">Weekly Meal Planner</h1>
                    <p className="text-[14px] text-zinc-500 mt-1">Assign recipes to meal slots — macros and the grocery list update instantly.</p>
                </div>
                <button onClick={handleGenerate} disabled={generating || Object.keys(plannerData).length === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                    style={{ background: "var(--brand-green)" }}>
                    {generating ? (
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    )}
                    {generating ? "Compiling List..." : "Generate Grocery List"}
                </button>
            </header>

            {/* Macro Tracker Card */}
            <div className="bg-white border border-zinc-200/80 rounded-[20px] p-6 shadow-sm flex flex-col lg:flex-row gap-8 items-center lg:items-center">
                
                <div className="flex items-center gap-6 w-full lg:w-auto lg:flex-1">
                    {/* Calorie Ring */}
                    <div className="relative flex-shrink-0 w-[110px] h-[110px]">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
                            <circle cx="55" cy="55" r={r} fill="none" stroke="#e4e4e7" strokeWidth="10" />
                            <circle cx="55" cy="55" r={r} fill="none" stroke="#1a6b3a" strokeWidth="10"
                                strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-[18px] font-black text-zinc-900 leading-none">{totalCals.toLocaleString()}</span>
                            <span className="text-[10px] text-zinc-400">/{goalCals}</span>
                        </div>
                    </div>
                    {/* Calorie Details */}
                    <div className="flex-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>
                            Weekly Calorie Tracker
                        </p>
                        <p className="text-[22px] font-black text-zinc-900">{totalCals.toLocaleString()} <span className="text-[14px] font-medium text-zinc-500 hidden sm:inline">kcal / day avg</span></p>
                        <p className="text-[13px] text-zinc-400 mt-0.5">{allMeals.length} meals planned</p>
                    </div>
                </div>

                {/* Macro bars */}
                <div className="flex gap-4 sm:gap-8 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-6 lg:pt-0 border-zinc-100">
                    {[
                        { label: "Protein", val: totalProtein, color: "#ef4444" },
                        { label: "Carbs", val: totalCarbs, color: "#eab308" },
                        { label: "Fat", val: totalFat, color: "#3b82f6" },
                    ].map(m => (
                        <div key={m.label} className="text-center flex-1 lg:flex-none lg:min-w-[80px]">
                            <p className="text-[22px] font-black text-zinc-900">{m.val}<span className="text-[13px] font-medium text-zinc-400">g</span></p>
                            <p className="text-[11px] text-zinc-500 mt-1">{m.label}</p>
                            <div className="mt-2 h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full" style={{ background: m.color, width: `${Math.min((m.val / 300) * 100, 100)}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Planner Grid */}
            <div className="overflow-x-auto pb-4">
                <div className="min-w-[900px]">
                    {/* Day headers */}
                    <div className="grid grid-cols-8 mb-4">
                        <div /> {/* row label spacer */}
                        {DAYS.map((day, i) => (
                            <div key={day} className="text-center">
                                <p className="text-[12px] font-semibold text-zinc-500">{day}</p>
                                <div className="w-8 h-8 mx-auto mt-1 rounded-full bg-zinc-100 flex items-center justify-center text-[13px] font-bold text-zinc-700">
                                    {i + 1}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Meal rows */}
                    {MEAL_TYPES.map(type => (
                        <div key={type} className="grid grid-cols-8 mb-4 items-center">
                            {/* Row Label — vertically centered with the card row */}
                            <div className="flex items-center pr-4">
                                <span className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-600">{type}</span>
                            </div>

                            {DAYS_FULL.map(day => {
                                const meal = plannerData[day]?.[type];
                                const color = MEAL_COLORS[type];
                                return (
                                    <div
                                        key={`${day}-${type}`}
                                        onClick={() => openModal(day, type)}
                                        className="mx-1 rounded-xl border cursor-pointer transition-all hover:shadow-md overflow-hidden min-h-[80px] flex flex-col justify-center"
                                        style={{ borderColor: meal ? "transparent" : "#e4e4e7", background: meal ? "white" : "transparent" }}
                                    >
                                        {meal ? (
                                            <div>
                                                <div className="h-1.5 w-full" style={{ background: color }} />
                                                <div className="p-2.5">
                                                    <p className="text-[12px] font-semibold text-zinc-800 leading-tight line-clamp-2">{meal.title}</p>
                                                    <p className="text-[10px] text-zinc-400 mt-1">
                                                        <svg className="w-3 h-3 inline mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg> {meal.calories} cal · {meal.protein}p
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center flex-1 text-zinc-400 hover:text-zinc-600 transition-colors">
                                                <span className="text-xl font-bold">+</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    {/* Daily totals row */}
                    <div className="grid grid-cols-8 mt-2">
                        <div className="pr-4" />
                        {DAYS_FULL.map(day => {
                            const dayMeals = Object.values(plannerData[day] || {});
                            const dayCals = dayMeals.reduce((s: number, m: any) => s + (m?.calories || 0), 0);
                            return (
                                <div key={day} className="mx-1 px-2 pt-2">
                                    {dayCals > 0 && (
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">DAY</span>
                                            <div className="flex-1 h-0.5 rounded-full" style={{ background: "var(--brand-green)" }} />
                                            <span className="text-[10px] font-bold text-zinc-600">{dayCals}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Picker Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] flex flex-col"
                        onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-1 text-zinc-900">Select Recipe</h2>
                        <p className="text-sm mb-4 text-zinc-500">For {selectedSlot?.day} {selectedSlot?.type}</p>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {library.length === 0 ? (
                                <div className="flex flex-col items-center text-center p-6 rounded-xl bg-gray-50 border border-dashed border-zinc-200">
                                    <div className="text-4xl mb-3">📥</div>
                                    <p className="text-sm font-bold text-zinc-700 mb-1">Your recipe library is empty</p>
                                    <p className="text-xs text-zinc-400 mb-4 leading-relaxed">Import recipes from TikTok, Instagram, or YouTube first — then you can assign them to your meal plan.</p>
                                    <a href="/dashboard/recipes"
                                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-all"
                                        style={{ background: "var(--brand-green)" }}>
                                        → Go Import Recipes
                                    </a>
                                </div>

                            ) : (
                                library.map(recipe => (
                                    <div key={recipe.id} onClick={() => handleAssign(recipe.id)}
                                        className="p-4 rounded-xl border border-zinc-200 flex justify-between items-center cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 bg-white">
                                        <div>
                                            <h4 className="font-bold text-sm text-zinc-800">{recipe.title}</h4>
                                            <p className="text-xs font-medium mt-0.5 text-zinc-400">{recipe.calories} kcal • {recipe.cookTime} mins</p>
                                        </div>
                                        <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#eef8f3] text-[#2c7a51]">
                                            Select
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                        <button onClick={() => setIsModalOpen(false)}
                            className="mt-6 w-full py-3 rounded-xl font-bold text-sm border border-zinc-200 hover:bg-gray-50 transition-colors text-zinc-700">
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
