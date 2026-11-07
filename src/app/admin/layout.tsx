"use client";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FolderTree, LayoutDashboard, Loader2, MessageSquareQuote, Package, ReceiptText, Store, Users } from "lucide-react";
import { useSession } from "@/lib/auth-client";

const NAV = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/orders", label: "Orders", icon: ReceiptText },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareQuote },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session?.user) router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [isPending, session?.user, router, pathname]);

  if (isPending || !session?.user) {
    return <div className="grid min-h-dvh place-items-center"><Loader2 className="animate-spin text-secondary" /></div>;
  }
  if (session.user.role !== "admin") {
    return (
      <div className="grid min-h-dvh place-items-center px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold">Admin access only</h1>
          <p className="mt-2 text-base-content/65">Your account is not an admin. Add its email to <code>ADMIN_EMAILS</code> and sign up again, or promote it from the database.</p>
          <Link href="/" className="btn btn-primary btn-sm mt-4">Back to the shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[230px_1fr]">
      <aside className="bg-neutral text-neutral-content lg:sticky lg:top-0 lg:h-dvh">
        <div className="flex items-center gap-2.5 px-5 py-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="h-9 w-auto" />
          <div className="font-brand text-xs font-extrabold leading-tight tracking-[0.15em]"><span className="text-primary">BROTHERS</span><br />ADMIN</div>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:pb-0">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? "bg-primary text-primary-content" : "hover:bg-white/10"}`}>
                <Icon size={18} /> {label}
              </Link>
            );
          })}
          <Link href="/" className="mt-2 flex items-center gap-2.5 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm text-neutral-content/70 hover:bg-white/10 lg:mt-6"><Store size={18} /> View store</Link>
        </nav>
      </aside>
      <div className="min-w-0 bg-base-200 p-4 sm:p-6">{children}</div>
    </div>
  );
}
