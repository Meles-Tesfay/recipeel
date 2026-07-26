import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Sidebar from "./Sidebar";
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

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Sidebar Component */}
      <Sidebar user={{ name: session.user.name, email: session.user.email }} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
