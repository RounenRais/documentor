"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { signOut } from "next-auth/react";
import { createProject, deleteProject } from "@/app/actions/actions";

type Project = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
};

type Props = {
  initialProjects: Project[];
};

export default function DashboardClient({ initialProjects }: Props) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [isPending, startTransition] = useTransition();
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  function handleCreate() {
    if (!newName.trim()) return;
    startTransition(async () => {
      try {
        const project = await createProject({ name: newName.trim(), description: newDesc.trim() });
        setProjects((prev) => [...prev, project]);
        setNewName("");
        setNewDesc("");
        setShowCreateModal(false);
        toast.success("Project created");
      } catch {
        toast.error("Failed to create project");
      }
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    startTransition(async () => {
      try {
        await deleteProject(target.id);
        setProjects((prev) => prev.filter((p) => p.id !== target.id));
        setDeleteTarget(null);
        toast.success("Project deleted");
      } catch {
        toast.error("Failed to delete project");
      }
    });
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F9F8F6" }}>
      <header
        className="border-b px-8 py-4 flex items-center justify-between"
        style={{ borderColor: "#D9CFC7", backgroundColor: "#EFE9E3" }}
      >
        <Link href="/" className="text-xl font-bold tracking-tight">
          Documentor
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="px-4 py-2 rounded-md text-sm font-medium border"
          style={{ borderColor: "#D9CFC7" }}
        >
          Sign Out
        </button>
      </header>

      <main className="px-8 py-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">My Projects</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-md text-sm font-medium text-white"
            style={{ backgroundColor: "#C9B59C" }}
          >
            + Add Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div
            className="text-center py-20 rounded-xl border"
            style={{ borderColor: "#D9CFC7", backgroundColor: "#EFE9E3" }}
          >
            <p className="text-lg font-medium mb-2">No projects yet</p>
            <p className="text-sm mb-6" style={{ color: "#888" }}>
              Create your first documentation project to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-md text-sm font-medium text-white"
              style={{ backgroundColor: "#C9B59C" }}
            >
              + Add Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-6 rounded-xl border flex flex-col gap-3"
                style={{ borderColor: "#D9CFC7", backgroundColor: "#EFE9E3" }}
              >
                <h2 className="font-semibold text-lg leading-tight">{project.name}</h2>
                {project.description && (
                  <p className="text-sm" style={{ color: "#666" }}>
                    {project.description}
                  </p>
                )}
                <p className="text-xs mt-auto" style={{ color: "#aaa" }}>
                  {new Date(project.createdAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2 pt-2 border-t" style={{ borderColor: "#D9CFC7" }}>
                  <Link
                    href={`/dashboard/${project.id}`}
                    className="flex-1 text-center py-1.5 rounded-md text-xs font-medium text-white"
                    style={{ backgroundColor: "#C9B59C" }}
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/docs/${project.id}`;
                      navigator.clipboard.writeText(url).then(() => {
                        toast.success("Public link copied");
                      }).catch(() => {
                        toast.error("Failed to copy link");
                      });
                    }}
                    className="flex-1 py-1.5 rounded-md text-xs font-medium border"
                    style={{ borderColor: "#D9CFC7" }}
                  >
                    Copy Link
                  </button>
                  <button
                    onClick={() => setDeleteTarget(project)}
                    className="flex-1 py-1.5 rounded-md text-xs font-medium border text-red-600"
                    style={{ borderColor: "#D9CFC7" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div
            className="w-full max-w-md p-6 rounded-xl border"
            style={{ borderColor: "#D9CFC7", backgroundColor: "#F9F8F6" }}
          >
            <h2 className="text-lg font-semibold mb-4">New Project</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border text-sm outline-none"
                  style={{ borderColor: "#D9CFC7", backgroundColor: "#EFE9E3" }}
                  placeholder="My Documentation"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border text-sm outline-none resize-none"
                  style={{ borderColor: "#D9CFC7", backgroundColor: "#EFE9E3" }}
                  placeholder="Brief description..."
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCreate}
                  disabled={isPending || !newName.trim()}
                  className="flex-1 py-2 rounded-md text-sm font-medium text-white disabled:opacity-60"
                  style={{ backgroundColor: "#C9B59C" }}
                >
                  {isPending ? "Creating..." : "Create Project"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewName("");
                    setNewDesc("");
                  }}
                  className="flex-1 py-2 rounded-md text-sm font-medium border"
                  style={{ borderColor: "#D9CFC7" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div
            className="w-full max-w-sm p-6 rounded-xl border"
            style={{ borderColor: "#D9CFC7", backgroundColor: "#F9F8F6" }}
          >
            <h2 className="text-lg font-semibold mb-2">Delete Project</h2>
            <p className="text-sm mb-6" style={{ color: "#666" }}>
              Are you sure you want to delete{" "}
              <strong>&ldquo;{deleteTarget.name}&rdquo;</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="flex-1 py-2 rounded-md text-sm font-medium text-white bg-red-500 disabled:opacity-60"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 rounded-md text-sm font-medium border"
                style={{ borderColor: "#D9CFC7" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
