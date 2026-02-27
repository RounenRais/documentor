import { auth } from "@/app/auth";

export async function safeAuth() {
  try {
    return await auth();
  } catch {
    return null;
  }
}
