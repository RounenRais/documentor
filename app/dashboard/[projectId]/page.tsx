import { safeAuth } from "@/lib/safeAuth";
import { redirect, notFound } from "next/navigation";
import { getProjectWithDetails } from "@/app/actions/actions";
import EditorClient from "@/components/editor/EditorClient";

type Props = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectEditorPage({ params }: Props) {
  const session = await safeAuth();
  if (!session?.user?.id) redirect("/login");

  const { projectId } = await params;
  const data = await getProjectWithDetails(projectId);

  if (!data) notFound();

  return (
    <EditorClient
      project={data.project}
      initialHeaders={data.headers}
      initialNavbarItems={data.navbarItems}
    />
  );
}
