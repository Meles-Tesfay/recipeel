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

  const SaveButton = ({ bottom = false }) => (
    <button
      onClick={handleSave}
      disabled={saving}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-all shadow-sm"
      style={{ background: saved ? "#16a34a" : "var(--brand-green)" }}
    >
      {saving ? (
        <><span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Saving...</>
      ) : saved ? "✓ Saved!" : bottom ? "Save All Changes" : "Save Changes"}
    </button>
  );

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold text-zinc-900 tracking-tight">My Profile</h1>
          <p className="text-[14px] text-zinc-500 mt-1">Update your dietary preferences, allergies, and nutrition goals.</p>
        </div>
        <SaveButton />
      </div>

      {/* Account Info */}
      {sessionUser && (
        <div className="bg-white rounded-[20px] border border-zinc-200/80 p-6 shadow-sm">
          <h2 className="font-bold text-zinc-900 mb-4">Account</h2>
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

      {/* Dietary Preferences */}
      <div className="bg-white rounded-[20px] border border-zinc-200/80 p-6 shadow-sm">
        <h2 className="font-bold text-zinc-900 mb-1">Dietary Preferences</h2>
        <p className="text-sm text-zinc-500 mb-5">Used to detect conflicts in imported recipes and suggest substitutions.</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {DIETARY_OPTIONS.map(({ label, emoji }) => (
            <button key={label} onClick={() => toggle("dietary", label)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all"
              style={{
                borderColor: formData.dietary.includes(label) ? "var(--brand-green)" : "var(--border)",
                background: formData.dietary.includes(label) ? "var(--brand-green-pale)" : "var(--surface-raised)",
                color: formData.dietary.includes(label) ? "var(--brand-green-dark)" : "var(--foreground)",
              }}>
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs leading-tight text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Food Allergies */}
      <div className="bg-white rounded-[20px] border border-zinc-200/80 p-6 shadow-sm">
        <h2 className="font-bold text-zinc-900 mb-1">Food Allergies</h2>
        <p className="text-sm text-zinc-500 mb-5">Ingredients matching these will be automatically flagged as dangerous.</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {ALLERGY_OPTIONS.map(({ label, emoji }) => (
            <button key={label} onClick={() => toggle("allergies", label)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all"
              style={{
                borderColor: formData.allergies.includes(label) ? "#dc2626" : "var(--border)",
                background: formData.allergies.includes(label) ? "#fef2f2" : "var(--surface-raised)",
                color: formData.allergies.includes(label) ? "#dc2626" : "var(--foreground)",
              }}>
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs leading-tight text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cooking Preferences */}
      <div className="bg-white rounded-[20px] border border-zinc-200/80 p-6 shadow-sm">
        <h2 className="font-bold text-zinc-900 mb-1">Cooking Style</h2>
        <p className="text-sm text-zinc-500 mb-5">How do you prefer to cook?</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {COOKING_OPTIONS.map(({ label, emoji }) => (
            <button key={label} onClick={() => toggle("cookingPrefs", label)}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all"
              style={{
                borderColor: formData.cookingPrefs.includes(label) ? "var(--brand-green)" : "var(--border)",
                background: formData.cookingPrefs.includes(label) ? "var(--brand-green-pale)" : "var(--surface-raised)",
                color: formData.cookingPrefs.includes(label) ? "var(--brand-green-dark)" : "var(--foreground)",
              }}>
              <span className="text-2xl">{emoji}</span>
              <span className="text-xs leading-tight text-center">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Goals & Budget */}
      <div className="bg-white rounded-[20px] border border-zinc-200/80 p-6 shadow-sm">
        <h2 className="font-bold text-zinc-900 mb-5">Goals & Budget</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-semibold mb-3 text-zinc-700">Fitness Goal</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Weight Loss", emoji: "⬇️" },
                { label: "Muscle Gain", emoji: "💪" },
                { label: "Maintenance", emoji: "⚖️" },
              ].map(({ label, emoji }) => (
                <button key={label} onClick={() => { setFormData(p => ({ ...p, fitnessGoals: label })); setSaved(false); }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all"
                  style={{
                    borderColor: formData.fitnessGoals === label ? "var(--brand-green)" : "var(--border)",
                    background: formData.fitnessGoals === label ? "var(--brand-green-pale)" : "var(--surface-raised)",
                    color: formData.fitnessGoals === label ? "var(--brand-green-dark)" : "var(--foreground)",
                  }}>
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-xs text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-3 text-zinc-700">Weekly Grocery Budget</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Budget", value: "$", emoji: "💰" },
                { label: "Moderate", value: "$$", emoji: "💳" },
                { label: "Premium", value: "$$$", emoji: "💎" },
              ].map(({ label, value, emoji }) => (
                <button key={value} onClick={() => { setFormData(p => ({ ...p, budget: value })); setSaved(false); }}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all"
                  style={{
                    borderColor: formData.budget === value ? "var(--brand-green)" : "var(--border)",
                    background: formData.budget === value ? "var(--brand-green-pale)" : "var(--surface-raised)",
                    color: formData.budget === value ? "var(--brand-green-dark)" : "var(--foreground)",
                  }}>
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-xs text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Nutrition Goals */}
      <div className="bg-white rounded-[20px] border border-zinc-200/80 p-6 shadow-sm">
        <h2 className="font-bold text-zinc-900 mb-5">Daily Nutrition Goals</h2>
        <div className="space-y-6">
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
        <SaveButton bottom />
      </div>
    </div>
  );
}
