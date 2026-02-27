import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const headers = pgTable("headers", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  parentId: uuid("parent_id").references((): any => headers.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  content: text("content").default(""),
  icon: text("icon").default(""),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const navbarItems = pgTable("navbar_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  label: text("label"),
  href: text("href").default(""),
  width: integer("width").default(120),
  styles: text("styles").default("{}"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  headers: many(headers),
  navbarItems: many(navbarItems),
}));

export const headersRelations = relations(headers, ({ one, many }) => ({
  project: one(projects, { fields: [headers.projectId], references: [projects.id] }),
  parent: one(headers, {
    fields: [headers.parentId],
    references: [headers.id],
    relationName: "parent_child",
  }),
  children: many(headers, { relationName: "parent_child" }),
}));

export const navbarItemsRelations = relations(navbarItems, ({ one }) => ({
  project: one(projects, { fields: [navbarItems.projectId], references: [projects.id] }),
}));
