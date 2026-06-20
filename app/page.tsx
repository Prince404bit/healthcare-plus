import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ROLE_REDIRECTS } from "@/lib/permissions";

export default async function RootPage() {
  const session = await auth();
  if (!session) redirect("/login");
  redirect(ROLE_REDIRECTS[session.user.role]);
}
