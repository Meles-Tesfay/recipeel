import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import { db } from "@/db";
import { preferences } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  // Onboarding Guard
  const userPrefs = await db.query.preferences.findFirst({
      where: eq(preferences.userId, session.user.id)
  });

  if (!userPrefs) {
      redirect("/onboarding");
  }

  const userData = { name: session.user.name, email: session.user.email, image: session.user.image };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      {/* Desktop Sidebar — hidden on mobile */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar user={userData} />
      </div>

      {/* Mobile Navigation (top bar + bottom tabs + drawer) */}
      <MobileNav user={userData} />

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto
        pt-14 pb-20
        md:pt-0 md:pb-0">
        {children}
      </main>
    </div>
  );
}
