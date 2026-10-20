import { redirect } from "next/navigation";
import { loginAction } from "@/app/actions/auth";
import { LoginForm } from "@/components/AdminPanels";
import { isAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="wrap max-w-md py-16">
      <h1 className="mb-6 text-3xl">Admin sign in</h1>
      <LoginForm action={loginAction} />
    </div>
  );
}
