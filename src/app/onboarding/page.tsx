import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { preferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { OnboardingWizard } from "./OnboardingWizard";

export default async function OnboardingPage() {
  // Must be logged in
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  // Already onboarded → go to dashboard
  const userPrefs = await db.query.preferences.findFirst({
    where: eq(preferences.userId, session.user.id),
  });
  if (userPrefs) redirect("/dashboard");

  return <OnboardingWizard />;
}
