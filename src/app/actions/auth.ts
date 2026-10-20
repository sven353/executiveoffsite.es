"use server";

import { redirect } from "next/navigation";
import { checkAdminPassword, createAdminSession, destroyAdminSession } from "@/lib/session";
import type { ActionState } from "@/lib/action-state";

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
    return { error: "Admin login is not configured. Set ADMIN_PASSWORD and SESSION_SECRET." };
  }
  const password = String(formData.get("password") ?? "");
  if (!checkAdminPassword(password)) {
    await new Promise((r) => setTimeout(r, 900));
    return { error: "Incorrect password" };
  }
  await createAdminSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}
