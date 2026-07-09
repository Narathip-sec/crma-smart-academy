import Link from "next/link";

// Styled 404 inside the LIFF shell.
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-8 text-center">
      <div
        className="flex h-14 w-14 items-center justify-center rounded-full"
        style={{
          background: "var(--tint)",
          color: "var(--brand-dark)",
          font: "700 20px var(--font-sans)",
        }}
      >
        404
      </div>
      <div style={{ font: "600 15px var(--font-sans)", color: "var(--ink)" }}>
        ไม่พบหน้าที่ต้องการ
      </div>
      <div style={{ font: "500 13px var(--font-sans)", color: "var(--muted)" }}>
        Page not found.
      </div>
      <Link
        href="/"
        className="mt-2 inline-flex items-center justify-center rounded-xl px-5 py-2.5 active:opacity-70"
        style={{
          background: "var(--brand)",
          color: "#fff",
          font: "600 13px var(--font-sans)",
          textDecoration: "none",
        }}
      >
        กลับหน้าหลัก · Home
      </Link>
    </div>
  );
}
