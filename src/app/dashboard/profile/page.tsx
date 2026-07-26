"use client";

import { useState, useEffect } from "react";
import { getUserPreferences, saveOnboardingPreferences } from "@/lib/actions";
import { authClient } from "@/lib/auth-client";

const DIETARY_OPTIONS = [
  { label: "Vegan", emoji: "🌿" },
  { label: "Vegetarian", emoji: "🥦" },
  { label: "Pescatarian", emoji: "🐟" },
  { label: "Keto", emoji: "🥑" },
  { label: "Paleo", emoji: "🍖" },
  { label: "Halal", emoji: "☪️" },
  { label: "Kosher", emoji: "✡️" },
  { label: "Gluten-Free", emoji: "🌾" },
  { label: "Dairy-Free", emoji: "🥛" },
];

const ALLERGY_OPTIONS = [
  { label: "Dairy", emoji: "🧀" },
  { label: "Gluten", emoji: "🌾" },
  { label: "Peanuts", emoji: "🥜" },
  { label: "Tree Nuts", emoji: "🌰" },
  { label: "Soy", emoji: "🫘" },
  { label: "Shellfish", emoji: "🦐" },
  { label: "Eggs", emoji: "🥚" },
  { label: "Fish", emoji: "🐠" },
];

const COOKING_OPTIONS = [
  { label: "Quick & Easy", emoji: "⏱️" },
  { label: "Meal Prep", emoji: "🍱" },
  { label: "Slow Cooker", emoji: "🍲" },
  { label: "Air Fryer", emoji: "💨" },
  { label: "Baking", emoji: "🥐" },
  { label: "Grilling", emoji: "🔥" },
];

// Reusable checklist-style row component
function CheckRow({
  label,
  emoji,
  checked,
  onToggle,
  activeColor = "var(--brand-green)",
  activeBg = "var(--brand-green-pale)",
  activeText = "var(--brand-green-dark)",
  checkColor = "var(--brand-green)",
}: {
  label: string;
  emoji: string;
  checked: boolean;
  onToggle: () => void;
  activeColor?: string;
  activeBg?: string;
  activeText?: string;
  checkColor?: string;
}) {
  return (
    <li
      onClick={onToggle}
      className="flex items-center p-3 cursor-pointer hover:bg-zinc-50/60 transition-colors rounded-xl group"
      style={checked ? { background: activeBg } : {}}
    >
      {/* Custom circle checkbox on the left */}
      <div className="relative flex items-center justify-center w-6 h-6 mr-4 flex-shrink-0">
        <div
          className="w-5 h-5 rounded-full border-[1.5px] transition-all flex items-center justify-center"
          style={{
            borderColor: checked ? checkColor : "#d4d4d8",
            background: checked ? checkColor : "white",
          }}
        >
          {checked && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      </div>

      {/* Label */}
      <span
        className="text-[14px] font-medium flex-1 transition-colors"
        style={{ color: checked ? activeText : "#3f3f46" }}
      >
        {label}
      </span>
    </li>
  );
}

// Card wrapper for preference sections
function PrefCard({
  title,
  subtitle,
  icon,
  count,
  children,
}: {
  title: string;
  subtitle: string;
  icon: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-zinc-200/80 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-4" style={{ background: "#f8faf9" }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-[#e6f0eb] border border-[#d3e4dc]">
          {icon}
        </div>
        <div>
          <h2 className="font-semibold text-zinc-900 text-[15px] leading-tight">{title}</h2>
          <span className="text-[12px] text-zinc-500">{subtitle}</span>
        </div>
        {count > 0 && (
          <span className="ml-auto text-[12px] font-bold px-3 py-1 rounded-full"
            style={{ background: "var(--brand-green-pale)", color: "var(--brand-green-dark)" }}>
            {count} selected
          </span>
        )}
      </div>
      <ul className="divide-y divide-zinc-100/80 px-2 py-1">
        {children}
      </ul>
    </div>
  );
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sessionUser, setSessionUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    dietary: [] as string[],
    allergies: [] as string[],
    cookingPrefs: [] as string[],
    fitnessGoals: "",
    budget: "",
    dailyCalories: 2000,
    dailyProtein: 150,
    dailyCarbs: 200,
    dailyFat: 65,
  });

  useEffect(() => {
    async function load() {
      const [prefs, sessionData] = await Promise.all([
        getUserPreferences(),
        authClient.getSession(),
      ]);
      if (prefs) {
        setFormData({
          dietary: (prefs.dietary as string[]) || [],
          allergies: (prefs.allergies as string[]) || [],
          cookingPrefs: (prefs.cookingPrefs as string[]) || [],
          fitnessGoals: prefs.fitnessGoals || "",
          budget: prefs.budget || "",
          dailyCalories: prefs.dailyCalories || 2000,
          dailyProtein: prefs.dailyProtein || 150,
          dailyCarbs: prefs.dailyCarbs || 200,
          dailyFat: prefs.dailyFat || 65,
        });
      }
      setSessionUser(sessionData?.data?.user);
      setLoading(false);
    }
    load();
  }, []);

  const toggle = (key: "dietary" | "allergies" | "cookingPrefs", value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((i: string) => i !== value)
        : [...prev[key], value],
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await saveOnboardingPreferences(formData);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <span className="inline-block w-8 h-8 border-4 border-[var(--brand-green-pale)] border-t-[var(--brand-green)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-zinc-900 tracking-tight">My Profile</h1>
          <p className="text-[14px] text-zinc-500 mt-1">Update your dietary preferences, allergies, and nutrition goals.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-all shadow-sm"
          style={{ background: saved ? "#16a34a" : "var(--brand-green)" }}
        >
          {saving ? (
            <><span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving...</>
          ) : saved ? "✓ Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Account Info */}
      {sessionUser && (
        <div className="bg-white rounded-[20px] border border-zinc-200/80 p-6 shadow-sm">
          <h2 className="font-semibold text-zinc-900 mb-4 text-[15px]">Account</h2>
          <div className="flex items-center gap-4">
            {sessionUser.image ? (
              <img src={sessionUser.image} alt={sessionUser.name} className="w-14 h-14 rounded-2xl object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black flex-shrink-0"
                style={{ background: "var(--brand-green)" }}>
                {sessionUser.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
            )}
            <div>
              <p className="font-bold text-zinc-900 text-lg">{sessionUser.name}</p>
              <p className="text-sm text-zinc-500">{sessionUser.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Two-column layout for dietary + allergies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Dietary Preferences */}
        <PrefCard
          title="Dietary Preferences"
          subtitle="Used to detect conflicts in imported recipes"
          icon="🥗"
          count={formData.dietary.length}
        >
          {DIETARY_OPTIONS.map(({ label, emoji }) => (
            <CheckRow
              key={label}
              label={label}
              emoji={emoji}
              checked={formData.dietary.includes(label)}
              onToggle={() => toggle("dietary", label)}
            />
          ))}
        </PrefCard>

        {/* Food Allergies */}
        <PrefCard
          title="Food Allergies"
          subtitle="Flagged as dangerous in all imported recipes"
          icon="⚠️"
          count={formData.allergies.length}
        >
          {ALLERGY_OPTIONS.map(({ label, emoji }) => (
            <CheckRow
              key={label}
              label={label}
              emoji={emoji}
              checked={formData.allergies.includes(label)}
              onToggle={() => toggle("allergies", label)}
              activeColor="#dc2626"
              activeBg="#fef2f2"
              activeText="#dc2626"
              checkColor="#dc2626"
            />
          ))}
        </PrefCard>
      </div>

      {/* Cooking Style */}
      <PrefCard
        title="Cooking Style"
        subtitle="How do you prefer to cook?"
        icon="🍳"
        count={formData.cookingPrefs.length}
      >
        <div className="grid grid-cols-2">
          {COOKING_OPTIONS.map(({ label, emoji }) => (
            <CheckRow
              key={label}
              label={label}
              emoji={emoji}
              checked={formData.cookingPrefs.includes(label)}
              onToggle={() => toggle("cookingPrefs", label)}
            />
          ))}
        </div>
      </PrefCard>

      {/* Goals & Budget */}
      <div className="bg-white rounded-[20px] border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-4" style={{ background: "#f8faf9" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-[#e6f0eb] border border-[#d3e4dc]">🎯</div>
          <div>
            <h2 className="font-semibold text-zinc-900 text-[15px] leading-tight">Goals & Budget</h2>
            <span className="text-[12px] text-zinc-500">Personalize your meal recommendations</span>
          </div>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold mb-3 text-zinc-600 uppercase tracking-wider text-[11px]">Fitness Goal</label>
            <ul className="space-y-1">
              {[
                { label: "Weight Loss", emoji: "⬇️" },
                { label: "Muscle Gain", emoji: "💪" },
                { label: "Maintenance", emoji: "⚖️" },
              ].map(({ label, emoji }) => (
                <li
                  key={label}
                  onClick={() => { setFormData(p => ({ ...p, fitnessGoals: label })); setSaved(false); }}
                  className="flex items-center p-3 cursor-pointer rounded-xl transition-colors hover:bg-zinc-50/60"
                  style={formData.fitnessGoals === label ? { background: "var(--brand-green-pale)" } : {}}
                >
                  <div className="relative flex items-center justify-center w-6 h-6 mr-4 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all"
                      style={{
                        borderColor: formData.fitnessGoals === label ? "var(--brand-green)" : "#d4d4d8",
                        background: formData.fitnessGoals === label ? "var(--brand-green)" : "white",
                      }}>
                      {formData.fitnessGoals === label && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </div>
                  </div>
                  <span className="text-[14px] font-medium flex-1" style={{ color: formData.fitnessGoals === label ? "var(--brand-green-dark)" : "#3f3f46" }}>{label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-3 text-zinc-600 uppercase tracking-wider text-[11px]">Weekly Grocery Budget</label>
            <ul className="space-y-1">
              {[
                { label: "Budget", value: "$", emoji: "💰" },
                { label: "Moderate", value: "$$", emoji: "💳" },
                { label: "Premium", value: "$$$", emoji: "💎" },
              ].map(({ label, value, emoji }) => (
                <li
                  key={value}
                  onClick={() => { setFormData(p => ({ ...p, budget: value })); setSaved(false); }}
                  className="flex items-center p-3 cursor-pointer rounded-xl transition-colors hover:bg-zinc-50/60"
                  style={formData.budget === value ? { background: "var(--brand-green-pale)" } : {}}
                >
                  <div className="relative flex items-center justify-center w-6 h-6 mr-4 flex-shrink-0">
                    <div className="w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-all"
                      style={{
                        borderColor: formData.budget === value ? "var(--brand-green)" : "#d4d4d8",
                        background: formData.budget === value ? "var(--brand-green)" : "white",
                      }}>
                      {formData.budget === value && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      )}
                    </div>
                  </div>
                  <span className="text-[14px] font-medium" style={{ color: formData.budget === value ? "var(--brand-green-dark)" : "#3f3f46" }}>{label}</span>
                  <span className="ml-auto text-[12px] font-bold text-zinc-400">{value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Daily Nutrition Goals */}
      <div className="bg-white rounded-[20px] border border-zinc-200/80 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center gap-4" style={{ background: "#f8faf9" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-[#e6f0eb] border border-[#d3e4dc]">📊</div>
          <div>
            <h2 className="font-semibold text-zinc-900 text-[15px] leading-tight">Daily Nutrition Goals</h2>
            <span className="text-[12px] text-zinc-500">Tracked automatically from your meal plan</span>
          </div>
        </div>
        <div className="p-5 space-y-6">
          {[
            { key: "dailyCalories", label: "Daily Calories", unit: "kcal", min: 1000, max: 4000, step: 50, color: "var(--brand-green)" },
            { key: "dailyProtein", label: "Protein", unit: "g", min: 50, max: 300, step: 5, color: "#ef4444" },
            { key: "dailyCarbs", label: "Carbohydrates", unit: "g", min: 50, max: 500, step: 5, color: "#eab308" },
            { key: "dailyFat", label: "Fat", unit: "g", min: 20, max: 200, step: 5, color: "#3b82f6" },
          ].map(field => (
            <div key={field.key}>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-zinc-700">{field.label}</label>
                <span className="text-sm font-bold px-3 py-1 rounded-lg"
                  style={{ background: "var(--brand-green-pale)", color: "var(--brand-green-dark)" }}>
                  {formData[field.key as keyof typeof formData]} {field.unit}
                </span>
              </div>
              <input type="range"
                min={field.min} max={field.max} step={field.step}
                value={formData[field.key as keyof typeof formData] as number}
                onChange={e => { setFormData(p => ({ ...p, [field.key]: parseInt(e.target.value) })); setSaved(false); }}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: field.color }}
              />
              <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                <span>{field.min} {field.unit}</span>
                <span>{field.max} {field.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Save */}
      <div className="flex justify-end pb-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-all shadow-sm"
          style={{ background: saved ? "#16a34a" : "var(--brand-green)" }}
        >
          {saving ? "Saving..." : saved ? "✓ Preferences Saved!" : "Save All Changes"}
        </button>
      </div>
    </div>
  );
}
