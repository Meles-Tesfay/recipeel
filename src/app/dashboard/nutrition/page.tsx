"use client";

import { useState, useEffect } from "react";
import { getWeeklyNutrition } from "@/lib/actions";

const DAY_ABBR: Record<string, string> = {
    Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu",
    Friday: "Fri", Saturday: "Sat", Sunday: "Sun"
};

const MACRO_COLORS = {
    calories: "#2d6a4f",
    protein: "#ef4444",
    carbs: "#f59e0b",
    fat: "#3b82f6",
};

// ─── SVG Weekly Bar Chart ────────────────────────────────────────────────────
function WeeklyBarChart({ days, goal }: { days: { day: string; calories: number }[]; goal: number }) {
    const maxVal = Math.max(goal, ...days.map(d => d.calories), 1);
    const BAR_H = 160;
    const BAR_W = 32;
    const GAP = 12;
    const WIDTH = days.length * (BAR_W + GAP) - GAP;

    return (
        <div className="w-full overflow-x-auto">
            <svg
                width={WIDTH + 48}
                height={BAR_H + 48}
                viewBox={`0 0 ${WIDTH + 48} ${BAR_H + 48}`}
                style={{ display: "block", margin: "0 auto" }}
            >
                {/* Goal line */}
                <line
                    x1={24}
                    y1={BAR_H - (goal / maxVal) * BAR_H}
                    x2={WIDTH + 24}
                    y2={BAR_H - (goal / maxVal) * BAR_H}
                    stroke="#2d6a4f"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    opacity={0.5}
                />
                <text
                    x={WIDTH + 28}
                    y={BAR_H - (goal / maxVal) * BAR_H + 4}
                    fontSize={9}
                    fill="#2d6a4f"
                    opacity={0.7}
                >
                    Goal
                </text>

                {days.map((d, i) => {
                    const h = (d.calories / maxVal) * BAR_H;
                    const x = 24 + i * (BAR_W + GAP);
                    const isOver = d.calories > goal;
                    const hasData = d.calories > 0;
                    return (
                        <g key={d.day}>
                            {/* Background track */}
                            <rect x={x} y={0} width={BAR_W} height={BAR_H} rx={8} fill="#f4f1ec" />
                            {/* Bar */}
                            {hasData && (
                                <rect
                                    x={x}
                                    y={BAR_H - h}
                                    width={BAR_W}
                                    height={h}
                                    rx={8}
                                    fill={isOver ? "#ef4444" : "#2d6a4f"}
                                    opacity={0.85}
                                />
                            )}
                            {/* Value label */}
                            {hasData && (
                                <text x={x + BAR_W / 2} y={BAR_H - h - 6} textAnchor="middle" fontSize={9} fontWeight="700" fill={isOver ? "#ef4444" : "#2d6a4f"}>
                                    {d.calories >= 1000 ? `${(d.calories / 1000).toFixed(1)}k` : d.calories}
                                </text>
                            )}
                            {/* Day label */}
                            <text x={x + BAR_W / 2} y={BAR_H + 16} textAnchor="middle" fontSize={10} fontWeight="600" fill="#71717a">
                                {DAY_ABBR[d.day] || d.day}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

// ─── Macro Doughnut Ring ────────────────────────────────────────────────────
function MacroRing({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
    const total = protein + carbs + fat || 1;
    const cx = 80, cy = 80, r = 60, strokeW = 18;
    const circ = 2 * Math.PI * r;

    const segments = [
        { value: protein, color: "#ef4444", label: "Protein" },
        { value: carbs, color: "#f59e0b", label: "Carbs" },
        { value: fat, color: "#3b82f6", label: "Fat" },
    ];

    let offset = 0;
    const arcs = segments.map(seg => {
        const pct = seg.value / total;
        const dash = pct * circ;
        const arc = { ...seg, dash, offset, pct };
        offset += dash;
        return arc;
    });

    return (
        <div className="flex flex-col sm:flex-row items-center gap-6">
            <svg width={160} height={160} viewBox="0 0 160 160" className="flex-shrink-0">
                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f4f1ec" strokeWidth={strokeW} />
                {arcs.map((arc, i) => (
                    <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="none"
                        stroke={arc.color}
                        strokeWidth={strokeW}
                        strokeDasharray={`${arc.dash} ${circ - arc.dash}`}
                        strokeDashoffset={-arc.offset + circ / 4}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dasharray 0.6s ease" }}
                    />
                ))}
                {/* Center text */}
                <text x={cx} y={cy - 6} textAnchor="middle" fontSize={14} fontWeight="800" fill="#18181b">
                    {total}
                </text>
                <text x={cx} y={cy + 12} textAnchor="middle" fontSize={9} fill="#71717a" fontWeight="600">
                    grams
                </text>
            </svg>

            <div className="space-y-3 flex-1 w-full">
                {arcs.map(arc => (
                    <div key={arc.label}>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                            <span style={{ color: arc.color }}>{arc.label}</span>
                            <span className="text-zinc-700">{arc.value}g <span className="text-zinc-400 font-normal">({Math.round(arc.pct * 100)}%)</span></span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-700"
                                style={{ width: `${arc.pct * 100}%`, background: arc.color }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Macro Progress Bar Card ────────────────────────────────────────────────
function MacroCard({ label, current, goal, unit, color }: { label: string; current: number; goal: number; unit: string; color: string }) {
    const pct = Math.min((current / Math.max(goal, 1)) * 100, 100);
    const isOver = current > goal;
    return (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">{label}</span>
                {isOver && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">Over</span>}
            </div>
            <div className="text-2xl font-black mb-0.5" style={{ color }}>
                {current}
                <span className="text-sm font-semibold ml-1 text-zinc-400">{unit}</span>
            </div>
            <p className="text-xs text-zinc-400 mb-3">of {goal} {unit} goal</p>
            <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: isOver ? "#ef4444" : color }}
                />
            </div>
        </div>
    );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function NutritionPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeDay, setActiveDay] = useState<string | null>(null);

    useEffect(() => {
        getWeeklyNutrition().then(d => {
            setData(d);
            // Default active day to today
            const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
            setActiveDay(today);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <span className="inline-block w-8 h-8 border-4 border-[var(--brand-green-pale)] border-t-[var(--brand-green)] rounded-full animate-spin" />
            </div>
        );
    }

    const { days, goals } = data;

    // Selected day stats
    const todayData = days.find((d: any) => d.day === activeDay) || days[0];
    const weeklyTotals = days.reduce((acc: any, d: any) => ({
        calories: acc.calories + d.calories,
        protein: acc.protein + d.protein,
        carbs: acc.carbs + d.carbs,
        fat: acc.fat + d.fat,
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const daysWithData = days.filter((d: any) => d.calories > 0).length;
    const avgCalories = daysWithData > 0 ? Math.round(weeklyTotals.calories / daysWithData) : 0;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">
            {/* Header */}
            <header>
                <h1 className="text-2xl md:text-[28px] font-bold text-zinc-900 tracking-tight">Nutrition Dashboard</h1>
                <p className="text-sm text-zinc-500 mt-1">Track your weekly macros and calorie intake against your goals.</p>
            </header>

            {/* Summary KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Weekly Calories", val: weeklyTotals.calories.toLocaleString(), unit: "kcal", color: MACRO_COLORS.calories },
                    { label: "Daily Average", val: avgCalories.toLocaleString(), unit: "kcal / day", color: "#6366f1" },
                    { label: "Days Planned", val: daysWithData, unit: "/ 7 days", color: "#06b6d4" },
                    { label: "Weekly Protein", val: weeklyTotals.protein, unit: "g", color: MACRO_COLORS.protein },
                ].map(kpi => (
                    <div key={kpi.label} className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-sm">
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">{kpi.label}</p>
                        <p className="text-2xl font-black" style={{ color: kpi.color }}>{kpi.val}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{kpi.unit}</p>
                    </div>
                ))}
            </div>

            {/* Weekly Bar Chart */}
            <div className="bg-white rounded-[20px] border border-zinc-200/80 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="font-bold text-zinc-900 text-lg">Weekly Calorie Intake</h2>
                        <p className="text-xs text-zinc-400 mt-0.5">Dashed line shows your daily goal of {goals.calories.toLocaleString()} kcal</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "#2d6a4f" }} />On track</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full inline-block bg-red-400" />Over goal</span>
                    </div>
                </div>
                <WeeklyBarChart days={days} goal={goals.calories} />

                {/* Day selector */}
                <div className="flex gap-2 flex-wrap mt-6 pt-4 border-t border-zinc-100">
                    {days.map((d: any) => (
                        <button
                            key={d.day}
                            onClick={() => setActiveDay(d.day)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${activeDay === d.day ? "text-white shadow-sm" : "text-zinc-500 bg-zinc-50 hover:bg-zinc-100"}`}
                            style={{ background: activeDay === d.day ? "var(--brand-green)" : "" }}
                        >
                            {DAY_ABBR[d.day]}
                            {d.calories > 0 && <span className="ml-1 opacity-70">{d.calories}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* Selected Day Detail + Macro Ring */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daily Macro Progress */}
                <div className="bg-white rounded-[20px] border border-zinc-200/80 p-6 shadow-sm">
                    <h2 className="font-bold text-zinc-900 text-lg mb-1">
                        {activeDay || "Today"}&apos;s Macros
                    </h2>
                    <p className="text-xs text-zinc-400 mb-5">Progress toward your daily goals</p>
                    <div className="space-y-4">
                        {[
                            { label: "Calories", current: todayData.calories, goal: goals.calories, unit: "kcal", color: MACRO_COLORS.calories },
                            { label: "Protein", current: todayData.protein, goal: goals.protein, unit: "g", color: MACRO_COLORS.protein },
                            { label: "Carbs", current: todayData.carbs, goal: goals.carbs, unit: "g", color: MACRO_COLORS.carbs },
                            { label: "Fat", current: todayData.fat, goal: goals.fat, unit: "g", color: MACRO_COLORS.fat },
                        ].map(m => {
                            const pct = Math.min((m.current / Math.max(m.goal, 1)) * 100, 100);
                            const isOver = m.current > m.goal;
                            return (
                                <div key={m.label}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <span className="text-sm font-semibold text-zinc-700">{m.label}</span>
                                        <span className="text-sm font-bold" style={{ color: isOver ? "#ef4444" : m.color }}>
                                            {m.current} <span className="text-zinc-400 font-normal text-xs">/ {m.goal} {m.unit}</span>
                                        </span>
                                    </div>
                                    <div className="h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${pct}%`, background: isOver ? "#ef4444" : m.color }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Macro Breakdown Donut */}
                <div className="bg-white rounded-[20px] border border-zinc-200/80 p-6 shadow-sm">
                    <h2 className="font-bold text-zinc-900 text-lg mb-1">Macro Breakdown</h2>
                    <p className="text-xs text-zinc-400 mb-5">
                        {activeDay || "Today"} — how your macros are distributed
                    </p>
                    {(todayData.protein + todayData.carbs + todayData.fat) === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="text-4xl mb-3">📊</div>
                            <p className="text-sm font-semibold text-zinc-700">No meals planned for {activeDay}</p>
                            <p className="text-xs text-zinc-400 mt-1">Assign recipes in the Meal Planner to see macro breakdowns here.</p>
                        </div>
                    ) : (
                        <MacroRing
                            protein={todayData.protein}
                            carbs={todayData.carbs}
                            fat={todayData.fat}
                        />
                    )}
                </div>
            </div>

            {/* Weekly Summary Cards */}
            <div>
                <h2 className="font-bold text-zinc-900 text-lg mb-4">Weekly Macro Summary</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MacroCard label="Calories" current={Math.round(weeklyTotals.calories / Math.max(daysWithData, 1))} goal={goals.calories} unit="kcal" color={MACRO_COLORS.calories} />
                    <MacroCard label="Protein" current={Math.round(weeklyTotals.protein / Math.max(daysWithData, 1))} goal={goals.protein} unit="g" color={MACRO_COLORS.protein} />
                    <MacroCard label="Carbs" current={Math.round(weeklyTotals.carbs / Math.max(daysWithData, 1))} goal={goals.carbs} unit="g" color={MACRO_COLORS.carbs} />
                    <MacroCard label="Fat" current={Math.round(weeklyTotals.fat / Math.max(daysWithData, 1))} goal={goals.fat} unit="g" color={MACRO_COLORS.fat} />
                </div>
                <p className="text-xs text-zinc-400 mt-2 text-center">Cards show daily averages across {daysWithData} planned day{daysWithData !== 1 ? "s" : ""}.</p>
            </div>

            {/* Tip Banner */}
            <div className="p-4 rounded-2xl border flex items-start gap-3"
                style={{ background: "var(--brand-green-pale)", borderColor: "var(--brand-green-light)", color: "var(--brand-green-dark)" }}>
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium leading-relaxed">
                    Nutrition data is pulled directly from your <strong>Meal Planner</strong>. The more days you plan, the more accurate your weekly tracking will be.
                </p>
            </div>
        </div>
    );
}
