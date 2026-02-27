import { notFound } from "next/navigation";
import { getPublicProjectDetails } from "@/app/actions/actions";
import DocsClient from "./DocsClient";

type Props = { params: Promise<{ projectId: string }> };

export default async function DocsPage({ params }: Props) {
  const { projectId } = await params;
  const data = await getPublicProjectDetails(projectId);
  if (!data) notFound();
  return (
    <DocsClient
      project={data.project}
      headers={data.headers}
      navbarItems={data.navbarItems}
    />
  );
}
