"use client";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snacks"];

// Mock data
const plannerData: Record<string, Record<string, any>> = {
    "Monday": {
        "Breakfast": { title: "Avocado Toast", cals: 350 },
        "Dinner": { title: "Creamy Tuscan Chicken", cals: 550 }
    },
    "Wednesday": {
        "Lunch": { title: "Grilled Chicken Salad", cals: 450 }
    }
};

export default function PlannerPage() {
    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-8">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Weekly Meal Planner</h1>
                    <p className="text-zinc-500 mt-2">Plan your meals and automatically generate a grocery list.</p>
                </div>
                <button className="px-6 py-2 rounded-lg font-medium bg-orange-500 text-white hover:bg-orange-600">
                    Generate Grocery List
                </button>
            </header>

            <div className="overflow-x-auto pb-4">
                <div className="min-w-[1000px] grid grid-cols-8 gap-4">
                    {/* Header Col */}
                    <div className="space-y-4 pt-12">
                        {MEAL_TYPES.map(type => (
                            <div key={type} className="h-28 flex items-center justify-end pr-4 text-sm font-bold text-zinc-400 uppercase tracking-wider">
                                {type}
                            </div>
                        ))}
                    </div>

                    {/* Days Cols */}
                    {DAYS.map(day => (
                        <div key={day} className="space-y-4">
                            <h3 className="text-center font-bold mb-4">{day}</h3>
                            {MEAL_TYPES.map(type => {
                                const meal = plannerData[day]?.[type];
                                return (
                                    <div 
                                        key={`${day}-${type}`} 
                                        className={`h-28 p-3 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col justify-center items-center text-center
                                            ${meal 
                                                ? 'border-solid border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30' 
                                                : 'border-zinc-200 dark:border-zinc-800 hover:border-orange-300 dark:hover:border-orange-700 bg-white dark:bg-zinc-900/50'
                                            }`}
                                    >
                                        {meal ? (
                                            <>
                                                <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{meal.title}</span>
                                                <span className="text-xs text-orange-600 font-medium mt-1">{meal.cals} kcal</span>
                                            </>
                                        ) : (
                                            <span className="text-zinc-400 font-medium text-xl">+</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
