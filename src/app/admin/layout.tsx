import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "@/app/actions/auth";
import { isAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const signedIn = await isAdmin();
  return (
    <div>
      <div className="border-b border-line bg-surface">
        <div className="wrap flex items-center justify-between py-3 text-sm">
          <Link href="/admin" className="font-medium no-underline">Admin</Link>
          {signedIn && (
            <form action={logoutAction}>
              <button type="submit" className="underline">Sign out</button>
            </form>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
