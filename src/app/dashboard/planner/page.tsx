"use client";

import { useState, useEffect } from "react";
import { getUserRecipes, getMealPlan, saveMealPlan, generateGroceryList } from "@/lib/actions";
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

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        const recipes = await getUserRecipes();
        setLibrary(recipes);
        const plans = await getMealPlan(new Date(), new Date());
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
    const goalCals = 2000;
    const calsPct = Math.min((totalCals / goalCals) * 100, 100);

    // SVG circle for calorie ring
    const r = 46;
    const circ = 2 * Math.PI * r;
    const dash = (calsPct / 100) * circ;

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-8">
            {/* Header */}
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-[28px] font-bold text-zinc-900 tracking-tight">Weekly Meal Planner</h1>
                    <p className="text-[14px] text-zinc-500 mt-1">Assign recipes to meal slots — macros and the grocery list update instantly.</p>
                </div>
                <button onClick={handleGenerate} disabled={generating}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-zinc-200 bg-white shadow-sm hover:shadow-md transition-all text-zinc-700 disabled:opacity-50">
                    {generating ? (
                        <span className="inline-block w-4 h-4 border-2 border-zinc-300 border-t-zinc-700 rounded-full animate-spin" />
                    ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    )}
                    {generating ? "Generating..." : "Clear week"}
                </button>
            </header>

            {/* Macro Tracker Card */}
            <div className="bg-white border border-zinc-200/80 rounded-[20px] p-6 shadow-sm flex gap-8 items-center">
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
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">🔥 Weekly Calorie Tracker</p>
                    <p className="text-[22px] font-black text-zinc-900">{totalCals.toLocaleString()} <span className="text-[14px] font-medium text-zinc-500">kcal / day avg</span></p>
                    <p className="text-[13px] text-zinc-400 mt-0.5">{allMeals.length} meals planned this week</p>
                </div>
                {/* Macro bars */}
                <div className="flex gap-8 flex-shrink-0">
                    {[
                        { label: "Protein", val: totalProtein, color: "#ef4444" },
                        { label: "Carbs", val: totalCarbs, color: "#eab308" },
                        { label: "Fat", val: totalFat, color: "#3b82f6" },
                    ].map(m => (
                        <div key={m.label} className="text-center min-w-[80px]">
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
                                                        🔥 {meal.calories} cal · {meal.protein}p
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
                                <p className="text-sm p-4 text-center rounded-xl bg-gray-50 border border-dashed border-zinc-200 text-zinc-400">
                                    Your library is empty. Go import some recipes!
                                </p>
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
