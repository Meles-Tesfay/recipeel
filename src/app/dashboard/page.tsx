import { db } from "@/db";
import { preferences } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const userPrefs = await db.query.preferences.findFirst({
    where: eq(preferences.userId, session!.user.id)
  });

  const dietary = (userPrefs?.dietary as string[] | null) ?? [];
  const allergies = (userPrefs?.allergies as string[] | null) ?? [];

  const macros = [
    { label: "Calories", current: 1450, max: userPrefs?.dailyCalories || 2000, unit: "kcal", color: "var(--brand-green)" },
    { label: "Protein", current: 95, max: userPrefs?.dailyProtein || 150, unit: "g", color: "#3b82f6" },
    { label: "Carbs", current: 180, max: userPrefs?.dailyCarbs || 250, unit: "g", color: "#f59e0b" },
    { label: "Fat", current: 45, max: userPrefs?.dailyFat || 70, unit: "g", color: "#ef4444" },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      {/* Welcome */}
      <header>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Good morning, {session?.user.name.split(" ")[0]}! 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          Here&apos;s your nutrition summary for today.
        </p>
      </header>

      {/* Macro Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {macros.map(macro => (
          <div key={macro.label} className="bg-white rounded-2xl border p-5"
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
            <p className="text-xs mb-3" style={{ color: "var(--muted)" }}>
              of {macro.max} {macro.unit} goal
            </p>
            <div className="h-2 w-full rounded-full" style={{ background: "var(--border)" }}>
              <div className="h-full rounded-full transition-all"
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
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-bold text-lg mb-4" style={{ color: "var(--foreground)" }}>Today&apos;s Meals</h2>
          <div className="space-y-3">
            {[
              { type: "Breakfast", title: "Avocado Toast with Egg", cals: 350, emoji: "🌅" },
              { type: "Lunch", title: "Grilled Chicken Salad", cals: 450, emoji: "☀️" },
              { type: "Dinner", title: "Salmon and Quinoa", cals: 650, emoji: "🌙" },
            ].map((meal, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "var(--surface-raised)" }}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{meal.emoji}</span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--brand-green)" }}>
                      {meal.type}
                    </p>
                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{meal.title}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold" style={{ color: "var(--muted)" }}>
                  {meal.cals} kcal
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dietary Profile */}
        <div className="bg-white rounded-2xl border p-6" style={{ borderColor: "var(--border)" }}>
          <h2 className="font-bold text-lg mb-4" style={{ color: "var(--foreground)" }}>Your Dietary Profile</h2>

          {dietary.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--muted)" }}>Preferences</p>
              <div className="flex flex-wrap gap-2">
                {dietary.map(d => (
                  <span key={d} className="px-3 py-1 rounded-full text-xs font-semibold"
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
                  <span key={a} className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {!dietary.length && !allergies.length && (
            <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>No preferences set yet.</p>
          )}

          <div className="p-3 rounded-xl text-sm font-medium flex items-start gap-2"
            style={{ background: "var(--brand-green-pale)", color: "var(--brand-green-dark)" }}>
            <span>✨</span>
            <span>Smart Substitution Engine is active. Imported recipes will auto-adapt to your profile.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
