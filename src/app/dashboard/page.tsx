import { db } from "@/db";
import { preferences, mealPlans } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userPrefs = await db.query.preferences.findFirst({
    where: eq(preferences.userId, session!.user.id)
  });

  const dietary = (userPrefs?.dietary as string[] | null) ?? [];
  const allergies = (userPrefs?.allergies as string[] | null) ?? [];
  const cookingPrefs = (userPrefs?.cookingPrefs as string[] | null) ?? [];

  // Time-appropriate greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Get today's day string
  const todayIndex = new Date().getDay();
  const todayString = DAYS[todayIndex];

  // Fetch all meal plans for user (MVP simplification)
  const allPlans = await db.query.mealPlans.findMany({
      where: eq(mealPlans.userId, session!.user.id),
      with: { recipe: true }
  });

  // Filter for today
  const todaysMeals = allPlans.filter(p => p.mealType.startsWith(todayString));

  // Calculate actual macros
  let currentCals = 0;
  let currentProtein = 0;
  let currentCarbs = 0;
  let currentFat = 0;

  todaysMeals.forEach(meal => {
      if (meal.recipe) {
          currentCals += meal.recipe.calories || 0;
          currentProtein += meal.recipe.protein || 0;
          currentCarbs += meal.recipe.carbs || 0;
          currentFat += meal.recipe.fat || 0;
      }
  });

  const macros = [
    { label: "Calories", current: currentCals, max: userPrefs?.dailyCalories || 2000, unit: "kcal", color: "var(--brand-green)" },
    { label: "Protein", current: currentProtein, max: userPrefs?.dailyProtein || 150, unit: "g", color: "#3b82f6" },
    { label: "Carbs", current: currentCarbs, max: userPrefs?.dailyCarbs || 250, unit: "g", color: "#f59e0b" },
    { label: "Fat", current: currentFat, max: userPrefs?.dailyFat || 70, unit: "g", color: "#ef4444" },
  ];

  const getEmojiForType = (type: string) => {
      if (type.includes("Breakfast")) return "🌅";
      if (type.includes("Lunch")) return "☀️";
      if (type.includes("Dinner")) return "🌙";
      return "🥨";
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <header>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          {greeting}, {session?.user.name.split(" ")[0]}! 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Here&apos;s your nutrition summary for today ({todayString}).
        </p>
      </header>

      {/* Macro Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {macros.map(macro => (
          <div key={macro.label} className="bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow"
            style={{ borderColor: "var(--border)" }}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
                {macro.label}
              </span>
            </div>
            <div className="text-2xl font-black mb-1" style={{ color: macro.color }}>
              {macro.current}
              <span className="text-sm font-semibold ml-1" style={{ color: "var(--muted)" }}>{macro.unit}</span>
            </div>
            <p className="text-xs mb-3 font-medium" style={{ color: "var(--muted-light)" }}>
              of {macro.max} {macro.unit} goal
            </p>
            <div className="h-2 w-full rounded-full" style={{ background: "var(--border)" }}>
              <div className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${Math.min(100, (macro.current / macro.max) * 100)}%`,
                  background: macro.color
                }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Meals */}
        <div className="bg-white rounded-2xl border p-6 shadow-sm" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-bold text-lg mb-4" style={{ color: "var(--foreground)" }}>Today&apos;s Meals</h2>
          <div className="space-y-3">
            {todaysMeals.length === 0 ? (
                <div className="p-4 text-center rounded-xl border border-dashed" style={{ borderColor: "var(--border)", background: "var(--surface-raised)" }}>
                    <p className="text-sm font-medium" style={{ color: "var(--muted)" }}>No meals planned for today.</p>
                </div>
            ) : (
                todaysMeals.map((meal, i) => {
                    const typeOnly = meal.mealType.split("-")[1];
                    return (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-transparent hover:border-gray-200 transition-colors"
                            style={{ background: "var(--surface-raised)" }}>
                            <div className="flex items-center gap-3">
                            <span className="text-xl">{getEmojiForType(typeOnly)}</span>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--brand-green)" }}>
                                {typeOnly}
                                </p>
                                <p className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{meal.recipe?.title}</p>
                            </div>
                            </div>
                            <span className="text-sm font-black" style={{ color: "var(--brand-green-dark)" }}>
                            {meal.recipe?.calories} kcal
                            </span>
                        </div>
                    );
                })
            )}
          </div>
        </div>

        {/* Dietary Profile */}
        <div className="bg-white rounded-2xl border p-6 shadow-sm" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-bold text-lg mb-4" style={{ color: "var(--foreground)" }}>Your Dietary Profile</h2>

          {dietary.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>Preferences</p>
              <div className="flex flex-wrap gap-2">
                {dietary.map(d => (
                  <span key={d} className="px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
                    style={{ background: "var(--brand-green-pale)", color: "var(--brand-green-dark)" }}>
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {allergies.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>Allergies</p>
              <div className="flex flex-wrap gap-2">
                {allergies.map(a => (
                  <span key={a} className="px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm bg-red-50 text-red-700 border border-red-100">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!dietary.length && !allergies.length && (
            <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>No preferences set yet.</p>
          )}

          {cookingPrefs.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>Cooking Style</p>
              <div className="flex flex-wrap gap-2">
                {cookingPrefs.map((c: string) => (
                  <span key={c} className="px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
                    style={{ background: "#e0f2fe", color: "#0369a1" }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl text-sm font-medium flex items-start gap-3 mt-6 border"
            style={{ background: "var(--brand-green-pale)", color: "var(--brand-green-dark)", borderColor: "var(--brand-green-light)" }}>
            <span className="text-xl">✨</span>
            <span className="leading-relaxed font-semibold">Smart Substitution Engine is active. Imported recipes will auto-adapt to your profile.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
