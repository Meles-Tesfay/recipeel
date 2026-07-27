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
          <Link
            href="/login"
            className="text-sm font-semibold px-5 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
            style={{ background: "var(--brand-green)" }}
          >
            Log in
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8"
          style={{ background: "var(--brand-green-pale)", color: "var(--brand-green-dark)" }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          Recipe &amp; Meal Planning, Made Personal
        </div>

        <h1 className="text-5xl md:text-6xl font-black mb-6 max-w-3xl leading-tight"
          style={{ color: "var(--foreground)" }}>
          Smart recipes that{" "}
          <span style={{ color: "var(--brand-green)" }}>work for you</span>
        </h1>

        <p className="text-lg max-w-xl mb-10 leading-relaxed" style={{ color: "var(--muted)" }}>
          Import recipes from TikTok, Instagram &amp; YouTube. ReciPeel automatically adapts them to your dietary needs, plans your week, and generates your grocery list.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <Link href="/register"
            className="px-8 py-3.5 rounded-xl font-bold text-white hover:opacity-90 shadow-lg transition-opacity"
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
            {
              icon: (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              ),
              title: "Import from Social Media",
              desc: "Paste any TikTok, Instagram Reel, or YouTube Shorts link and get a full recipe in seconds."
            },
            {
              icon: (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ),
              title: "Smart Substitutions",
              desc: "Ingredients automatically swapped based on your dietary restrictions and allergies."
            },
            {
              icon: (
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
              title: "Auto Grocery List",
              desc: "Your weekly meal plan instantly becomes an organized shopping list grouped by aisle."
            },
          ].map(f => (
            <div key={f.title} className="p-6 rounded-2xl border" style={{ borderColor: "var(--border)", background: "var(--surface-raised)" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: "var(--brand-green-pale)", color: "var(--brand-green)" }}>
                {f.icon}
              </div>
              <h3 className="font-bold text-lg mb-2" style={{ color: "var(--foreground)" }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
