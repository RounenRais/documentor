import { NextResponse } from "next/server";

export function GET() {
  const response = NextResponse.redirect(
    new URL("/", process.env.NEXTAUTH_URL ?? "http://localhost:3000")
  );

  const cookiesToClear = [
    "authjs.session-token",
    "authjs.csrf-token",
    "authjs.callback-url",
    "__Secure-authjs.session-token",
    "__Secure-authjs.csrf-token",
    "__Host-authjs.csrf-token",
  ];

  for (const name of cookiesToClear) {
    response.cookies.set(name, "", { maxAge: 0, path: "/" });
  }

  return response;
}
