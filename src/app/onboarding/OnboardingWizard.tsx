"use client";

import { useState } from "react";
import { saveOnboardingPreferences } from "@/lib/actions";

const STEPS = [
  { id: "dietary", title: "Dietary Preferences", subtitle: "Select all that apply to you", icon: "🥗" },
  { id: "allergies", title: "Food Allergies", subtitle: "We'll automatically flag these in recipes", icon: "⚠️" },
  { id: "cooking", title: "Cooking Preferences", subtitle: "How do you like to cook?", icon: "🍳" },
  { id: "goals", title: "Goals & Budget", subtitle: "Help us personalize your experience", icon: "🎯" },
  { id: "macros", title: "Daily Nutrition Goals", subtitle: "We'll track these for you automatically", icon: "📊" },
];

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

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
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

  const toggle = (key: "dietary" | "allergies" | "cookingPrefs", value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((i: string) => i !== value)
        : [...prev[key], value],
    }));
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await saveOnboardingPreferences(formData);
      window.location.href = "/dashboard";
    } catch {
      alert("Failed to save. Please make sure you are logged in.");
    }
    setLoading(false);
  };

  const current = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "var(--background)" }}>
      <div className="w-full max-w-[520px]">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-[40px] mb-4 drop-shadow-sm">{current.icon}</div>
          <h1 className="text-[28px] font-bold text-zinc-900 tracking-tight">{current.title}</h1>
          <p className="text-[15px] mt-1.5 text-zinc-500">{current.subtitle}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-[13px] font-semibold text-zinc-400 mb-2.5">
            <span>Step {step + 1} of {STEPS.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%`, background: "var(--brand-green)" }} />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[24px] border border-zinc-200/80 shadow-sm p-6 sm:p-8">

          {/* Step 0 — Dietary */}
          {step === 0 && (
            <div className="flex flex-col gap-2">
              {DIETARY_OPTIONS.map(({ label, emoji }) => {
                const isSelected = formData.dietary.includes(label);
                return (
                  <button key={label} onClick={() => toggle("dietary", label)}
                    className="flex items-center gap-3 p-3.5 rounded-xl border font-medium transition-all text-left"
                    style={{
                      borderColor: isSelected ? "var(--brand-green)" : "var(--border)",
                      background: isSelected ? "var(--brand-green-pale)" : "var(--surface-raised)",
                      color: isSelected ? "var(--brand-green-dark)" : "var(--foreground)",
                    }}>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-transparent' : 'border-zinc-300'}`}
                         style={{ background: isSelected ? "var(--brand-green)" : "transparent" }}>
                      {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="text-[15px] flex-1">{label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 1 — Allergies */}
          {step === 1 && (
            <div className="flex flex-col gap-2">
              {ALLERGY_OPTIONS.map(({ label, emoji }) => {
                const isSelected = formData.allergies.includes(label);
                return (
                  <button key={label} onClick={() => toggle("allergies", label)}
                    className="flex items-center gap-3 p-3.5 rounded-xl border font-medium transition-all text-left"
                    style={{
                      borderColor: isSelected ? "#ef4444" : "var(--border)",
                      background: isSelected ? "#fef2f2" : "var(--surface-raised)",
                      color: isSelected ? "#b91c1c" : "var(--foreground)",
                    }}>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-transparent bg-red-500' : 'border-zinc-300'}`}>
                      {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="text-[15px] flex-1">{label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 2 — Cooking Preferences */}
          {step === 2 && (
            <div className="flex flex-col gap-2">
              {COOKING_OPTIONS.map(({ label, emoji }) => {
                const isSelected = formData.cookingPrefs.includes(label);
                return (
                  <button key={label} onClick={() => toggle("cookingPrefs", label)}
                    className="flex items-center gap-3 p-3.5 rounded-xl border font-medium transition-all text-left"
                    style={{
                      borderColor: isSelected ? "var(--brand-green)" : "var(--border)",
                      background: isSelected ? "var(--brand-green-pale)" : "var(--surface-raised)",
                      color: isSelected ? "var(--brand-green-dark)" : "var(--foreground)",
                    }}>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-transparent' : 'border-zinc-300'}`}
                         style={{ background: isSelected ? "var(--brand-green)" : "transparent" }}>
                      {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                    </div>
                    <span className="text-[15px] flex-1">{label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 3 — Goals & Budget */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-3 text-zinc-900">Fitness Goal</label>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Weight Loss", emoji: "⬇️" },
                    { label: "Muscle Gain", emoji: "💪" },
                    { label: "Maintenance", emoji: "⚖️" },
                  ].map(({ label, emoji }) => {
                    const isSelected = formData.fitnessGoals === label;
                    return (
                      <button key={label} onClick={() => setFormData(p => ({ ...p, fitnessGoals: label }))}
                        className="flex items-center gap-3 p-3.5 rounded-xl border font-medium transition-all text-left"
                        style={{
                          borderColor: isSelected ? "var(--brand-green)" : "var(--border)",
                          background: isSelected ? "var(--brand-green-pale)" : "var(--surface-raised)",
                          color: isSelected ? "var(--brand-green-dark)" : "var(--foreground)",
                        }}>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-transparent' : 'border-zinc-300'}`}
                             style={{ background: isSelected ? "var(--brand-green)" : "transparent" }}>
                          {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className="text-[15px] flex-1">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-3 text-zinc-900">Weekly Grocery Budget</label>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Budget", value: "$", emoji: "💰" },
                    { label: "Moderate", value: "$$", emoji: "💳" },
                    { label: "Premium", value: "$$$", emoji: "💎" },
                  ].map(({ label, value, emoji }) => {
                    const isSelected = formData.budget === value;
                    return (
                      <button key={value} onClick={() => setFormData(p => ({ ...p, budget: value }))}
                        className="flex items-center gap-3 p-3.5 rounded-xl border font-medium transition-all text-left"
                        style={{
                          borderColor: isSelected ? "var(--brand-green)" : "var(--border)",
                          background: isSelected ? "var(--brand-green-pale)" : "var(--surface-raised)",
                          color: isSelected ? "var(--brand-green-dark)" : "var(--foreground)",
                        }}>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-transparent' : 'border-zinc-300'}`}
                             style={{ background: isSelected ? "var(--brand-green)" : "transparent" }}>
                          {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className="text-[15px] flex-1">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 4 — Macros */}
          {step === 4 && (
            <div className="space-y-5">
              {[
                { key: "dailyCalories", label: "Daily Calories", unit: "kcal", min: 1000, max: 4000, step: 50 },
                { key: "dailyProtein", label: "Protein", unit: "g", min: 50, max: 300, step: 5 },
                { key: "dailyCarbs", label: "Carbohydrates", unit: "g", min: 50, max: 500, step: 5 },
                { key: "dailyFat", label: "Fat", unit: "g", min: 20, max: 200, step: 5 },
              ].map(field => (
                <div key={field.key}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{field.label}</label>
                    <span className="text-sm font-bold px-3 py-1 rounded-lg"
                      style={{ background: "var(--brand-green-pale)", color: "var(--brand-green-dark)" }}>
                      {formData[field.key as keyof typeof formData]} {field.unit}
                    </span>
                  </div>
                  <input type="range"
                    min={field.min} max={field.max} step={field.step}
                    value={formData[field.key as keyof typeof formData] as number}
                    onChange={e => setFormData(p => ({ ...p, [field.key]: parseInt(e.target.value) }))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: "var(--brand-green)" }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
            className="px-6 py-3 rounded-xl text-[15px] font-semibold border border-zinc-200 text-zinc-500 disabled:opacity-40 hover:bg-zinc-50 transition-colors">
            Back
          </button>

          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="px-8 py-3 rounded-xl text-[15px] font-semibold text-white hover:opacity-90 shadow-sm transition-all"
              style={{ background: "var(--brand-green)" }}>
              Continue →
            </button>
          ) : (
            <button onClick={handleComplete} disabled={loading}
              className="px-8 py-3 rounded-xl text-[15px] font-semibold text-white hover:opacity-90 disabled:opacity-60 shadow-sm transition-all"
              style={{ background: "var(--brand-green)" }}>
              {loading ? "Setting up..." : "Complete Setup ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
