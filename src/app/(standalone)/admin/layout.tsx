import Link from "next/link";
import { s } from "@/components/admin/ui";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb mb-root" style={{ minHeight: "100vh" }}>
      <div style={s.wrap}>
        <nav style={{ ...s.row, gap: 16, marginBottom: 8 }}>
          <b style={{ fontSize: 20 }}>LOOP Admin</b>
          <Link href="/admin">Library</Link>
          <Link href="/admin/editions">Editions</Link>
        </nav>
        {children}
      </div>
    </div>
  );
}