"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      toast.error("Invalid email or password");
    } else {
      toast.success("Logged in successfully");
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F9F8F6" }}>
      <div
        className="w-full max-w-md p-8 rounded-xl border"
        style={{ borderColor: "#D9CFC7", backgroundColor: "#EFE9E3" }}
      >
        <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
        <p className="text-sm mb-8" style={{ color: "#888" }}>
          Sign in to your Documentor account
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-2"
              style={{
                borderColor: "#D9CFC7",
                backgroundColor: "#F9F8F6",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md border text-sm outline-none focus:ring-2"
              style={{ borderColor: "#D9CFC7", backgroundColor: "#F9F8F6" }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md font-medium text-white text-sm transition-opacity disabled:opacity-60 mt-2"
            style={{ backgroundColor: "#C9B59C" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-center mt-6" style={{ color: "#888" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
