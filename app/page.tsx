import Link from "next/link";
import { safeAuth } from "@/lib/safeAuth";

export default async function HomePage() {
  const session = await safeAuth();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F9F8F6" }}>
      <header
        className="border-b px-8 py-4 flex items-center justify-between"
        style={{ borderColor: "#D9CFC7", backgroundColor: "#EFE9E3" }}
      >
        <span className="text-xl font-bold tracking-tight">Documentor</span>
        <div className="flex gap-3">
          {session ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-md text-sm font-medium text-white"
              style={{ backgroundColor: "#C9B59C" }}
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-md text-sm font-medium border"
                style={{ borderColor: "#D9CFC7" }}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-md text-sm font-medium text-white"
                style={{ backgroundColor: "#C9B59C" }}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold mb-6 leading-tight">
            Build beautiful
            <br />
            <span style={{ color: "#C9B59C" }}>documentation</span> with ease
          </h1>
          <p className="text-lg mb-10" style={{ color: "#666" }}>
            Documentor gives developers a clean, structured editor to create and export
            professional documentation — with markdown support, code highlighting, and
            one-click HTML export.
          </p>
          <div className="flex gap-4 justify-center">
            {session ? (
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-md font-medium text-white text-base"
                style={{ backgroundColor: "#C9B59C" }}
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="px-6 py-3 rounded-md font-medium text-white text-base"
                  style={{ backgroundColor: "#C9B59C" }}
                >
                  Get Started — Free
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 rounded-md font-medium text-base border"
                  style={{ borderColor: "#D9CFC7" }}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </main>

      <section className="px-8 py-16" style={{ backgroundColor: "#EFE9E3" }}>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8">
          {[
            {
              title: "Structured Editor",
              description:
                "Organize your docs with headers, sections, and a drag-and-drop navbar.",
            },
            {
              title: "Markdown + Code Blocks",
              description:
                "Write in markdown with live preview and syntax-highlighted code blocks.",
            },
            {
              title: "One-Click Export",
              description:
                "Download your entire documentation as a self-contained HTML file.",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-lg border"
              style={{ borderColor: "#D9CFC7", backgroundColor: "#F9F8F6" }}
            >
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm" style={{ color: "#666" }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer
        className="px-8 py-6 text-center text-sm border-t"
        style={{ borderColor: "#D9CFC7", color: "#999" }}
      >
        © {new Date().getFullYear()} Documentor
      </footer>
    </div>
  );
}
