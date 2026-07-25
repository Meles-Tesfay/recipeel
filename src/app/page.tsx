import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)" }}>
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white border-b" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-green)" }}>
            <span className="text-white font-black text-sm">R</span>
          </div>
          <span className="font-bold text-lg" style={{ color: "var(--foreground)" }}>ReciPeel</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50"
            style={{ color: "var(--muted)" }}>
            Log in
          </Link>
          <Link href="/register"
            className="text-sm font-semibold px-5 py-2 rounded-lg text-white hover:opacity-90"
            style={{ background: "var(--brand-green)" }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8"
          style={{ background: "var(--brand-green-pale)", color: "var(--brand-green-dark)" }}>
          <span>✨</span> AI-Powered Recipe & Meal Planning
        </div>

        <h1 className="text-5xl md:text-6xl font-black mb-6 max-w-3xl leading-tight"
          style={{ color: "var(--foreground)" }}>
          Smart recipes that{" "}
          <span style={{ color: "var(--brand-green)" }}>work for you</span>
        </h1>

        <p className="text-lg max-w-xl mb-10 leading-relaxed" style={{ color: "var(--muted)" }}>
          Import recipes from TikTok, Instagram & YouTube. ReciPeel automatically adapts them to your dietary needs, plans your week, and generates your grocery list.
        </p>

        <div className="flex gap-4">
          <Link href="/register"
            className="px-8 py-3.5 rounded-xl font-bold text-white hover:opacity-90 shadow-lg"
            style={{ background: "var(--brand-green)" }}>
            Start for free
          </Link>
          <Link href="/login"
            className="px-8 py-3.5 rounded-xl font-bold border hover:bg-white transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}>
            Sign in
          </Link>
        </div>
      </main>

      {/* Feature Strip */}
      <section className="border-t py-16 px-8" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { emoji: "📱", title: "Import from Social Media", desc: "Paste any TikTok, Instagram Reel, or YouTube Shorts link and get a full recipe in seconds." },
            { emoji: "🔄", title: "Smart Substitutions", desc: "Ingredients automatically swapped based on your dietary restrictions and allergies." },
            { emoji: "🛒", title: "Auto Grocery List", desc: "Your weekly meal plan instantly becomes an organized shopping list grouped by aisle." },
          ].map(f => (
            <div key={f.title} className="p-6 rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--surface-raised)" }}>
              <div className="text-3xl mb-4">{f.emoji}</div>
              <h3 className="font-bold text-lg mb-2" style={{ color: "var(--foreground)" }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
