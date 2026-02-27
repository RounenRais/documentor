"use server";

import { db } from "@/db";
import { users, projects, headers, navbarItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/app/auth";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

async function getSession() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session;
}

export async function registerUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}): Promise<{ error?: string }> {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) return { error: "Email already in use" };

  const hashed = await bcrypt.hash(password, 10);
  await db.insert(users).values({ name, email, password: hashed });
  return {};
}

export async function createProject(data: { name: string; description?: string }) {
  const session = await getSession();
  const [project] = await db
    .insert(projects)
    .values({ userId: session.user.id, name: data.name, description: data.description ?? "" })
    .returning();
  revalidatePath("/dashboard");
  return project;
}

export async function updateProject(id: string, data: { name?: string; description?: string }) {
  const session = await getSession();
  await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(projects.id, id), eq(projects.userId, session.user.id)));
  revalidatePath("/dashboard");
}

export async function deleteProject(id: string) {
  const session = await getSession();
  await db
    .delete(projects)
    .where(and(eq(projects.id, id), eq(projects.userId, session.user.id)));
  revalidatePath("/dashboard");
}

export async function getProjects() {
  const session = await getSession();
  return db
    .select()
    .from(projects)
    .where(eq(projects.userId, session.user.id))
    .orderBy(projects.createdAt);
}

export async function getProjectWithDetails(projectId: string) {
  const session = await getSession();
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, session.user.id)))
    .limit(1);

  if (!project) return null;

  const projectHeaders = await db
    .select()
    .from(headers)
    .where(eq(headers.projectId, projectId))
    .orderBy(headers.order);

  const navbar = await db
    .select()
    .from(navbarItems)
    .where(eq(navbarItems.projectId, projectId))
    .orderBy(navbarItems.order);

  return { project, headers: projectHeaders, navbarItems: navbar };
}

export async function createHeader(
  projectId: string,
  title: string,
  parentId?: string
) {
  const session = await getSession();
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, session.user.id)))
    .limit(1);

  if (!project) throw new Error("Project not found");

  const existing = await db
    .select({ order: headers.order })
    .from(headers)
    .where(eq(headers.projectId, projectId))
    .orderBy(headers.order);

  const nextOrder = existing.length > 0 ? existing[existing.length - 1].order + 1 : 0;

  const [header] = await db
    .insert(headers)
    .values({
      projectId,
      title,
      content: "",
      order: nextOrder,
      parentId: parentId ?? null,
    })
    .returning();

  revalidatePath(`/dashboard/${projectId}`);
  return header;
}

export async function updateHeader(headerId: string, data: { title?: string; content?: string; icon?: string }) {
  const session = await getSession();
  const [header] = await db
    .select({ projectId: headers.projectId })
    .from(headers)
    .where(eq(headers.id, headerId))
    .limit(1);

  if (!header) throw new Error("Header not found");

  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, header.projectId), eq(projects.userId, session.user.id)))
    .limit(1);

  if (!project) throw new Error("Unauthorized");

  await db
    .update(headers)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(headers.id, headerId));

  revalidatePath(`/dashboard/${header.projectId}`);
}

export async function deleteHeader(headerId: string) {
  const session = await getSession();
  const [header] = await db
    .select({ projectId: headers.projectId })
    .from(headers)
    .where(eq(headers.id, headerId))
    .limit(1);

  if (!header) throw new Error("Header not found");

  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, header.projectId), eq(projects.userId, session.user.id)))
    .limit(1);

  if (!project) throw new Error("Unauthorized");

  await db.delete(headers).where(eq(headers.id, headerId));
  revalidatePath(`/dashboard/${header.projectId}`);
}

export async function reorderHeaders(projectId: string, orderedIds: string[]) {
  const session = await getSession();
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, session.user.id)))
    .limit(1);

  if (!project) throw new Error("Unauthorized");

  await Promise.all(
    orderedIds.map((id, index) =>
      db.update(headers).set({ order: index }).where(eq(headers.id, id))
    )
  );

  revalidatePath(`/dashboard/${projectId}`);
}

export async function createNavbarItem(
  projectId: string,
  type: string,
  label?: string,
  href?: string
) {
  const session = await getSession();
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, session.user.id)))
    .limit(1);

  if (!project) throw new Error("Unauthorized");

  const existing = await db
    .select({ order: navbarItems.order })
    .from(navbarItems)
    .where(eq(navbarItems.projectId, projectId))
    .orderBy(navbarItems.order);

  const nextOrder = existing.length > 0 ? existing[existing.length - 1].order + 1 : 0;

  const [item] = await db
    .insert(navbarItems)
    .values({
      projectId,
      type,
      label: label ?? "",
      href: href ?? "",
      order: nextOrder,
      width: 120,
    })
    .returning();

  revalidatePath(`/dashboard/${projectId}`);
  return item;
}

export async function deleteNavbarItem(itemId: string) {
  const session = await getSession();
  const [item] = await db
    .select({ projectId: navbarItems.projectId })
    .from(navbarItems)
    .where(eq(navbarItems.id, itemId))
    .limit(1);

  if (!item) throw new Error("Item not found");

  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, item.projectId), eq(projects.userId, session.user.id)))
    .limit(1);

  if (!project) throw new Error("Unauthorized");

  await db.delete(navbarItems).where(eq(navbarItems.id, itemId));
  revalidatePath(`/dashboard/${item.projectId}`);
}

export async function reorderNavbarItems(projectId: string, orderedIds: string[]) {
  const session = await getSession();
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, session.user.id)))
    .limit(1);

  if (!project) throw new Error("Unauthorized");

  await Promise.all(
    orderedIds.map((id, index) =>
      db.update(navbarItems).set({ order: index }).where(eq(navbarItems.id, id))
    )
  );

  revalidatePath(`/dashboard/${projectId}`);
}

export async function updateNavbarItem(
  itemId: string,
  data: { label?: string; href?: string; width?: number; styles?: string }
) {
  const session = await getSession();
  const [item] = await db
    .select({ projectId: navbarItems.projectId })
    .from(navbarItems)
    .where(eq(navbarItems.id, itemId))
    .limit(1);

  if (!item) throw new Error("Item not found");

  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(and(eq(projects.id, item.projectId), eq(projects.userId, session.user.id)))
    .limit(1);

  if (!project) throw new Error("Unauthorized");

  await db.update(navbarItems).set(data).where(eq(navbarItems.id, itemId));
  revalidatePath(`/dashboard/${item.projectId}`);
}

export async function getPublicProjectDetails(projectId: string) {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) return null;

  const projectHeaders = await db
    .select()
    .from(headers)
    .where(eq(headers.projectId, projectId))
    .orderBy(headers.order);

  const navbar = await db
    .select()
    .from(navbarItems)
    .where(eq(navbarItems.projectId, projectId))
    .orderBy(navbarItems.order);

  return { project, headers: projectHeaders, navbarItems: navbar };
}
