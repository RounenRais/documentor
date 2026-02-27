import { safeAuth } from "@/lib/safeAuth";
import { redirect } from "next/navigation";
import { getProjects } from "@/app/actions/actions";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const session = await safeAuth();
  if (!session?.user?.id) redirect("/login");

  const projects = await getProjects();

  return <DashboardClient initialProjects={projects} />;
}
