export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/db";
import { AppBar } from "@/components/shell/app-bar";
import { NotificationChannel } from "@prisma/client";

const THAI_MONTHS_SHORT = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];

function fmtDate(d: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 1) return "เพิ่งนี้";
  if (diff < 60) return `${diff} นาทีที่แล้ว`;
  const hours = Math.floor(diff / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  return `${d.getDate()} ${THAI_MONTHS_SHORT[d.getMonth()]}`;
}

const CHANNEL_ICON: Record<NotificationChannel, string> = {
  in_app:    "🔔",
  line_push: "💬",
};

const DEV_EMAIL = process.env.DEV_USER_EMAIL ?? "dev.cadet@crma.ac.th";

export default async function NotificationsPage() {
  const user = await prisma.user.findUnique({ where: { email: DEV_EMAIL } });

  const deliveries = user
    ? await prisma.notificationDelivery.findMany({
        where: { userId: user.id },
        include: { notification: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    : [];

  const hasUnread = deliveries.some(d => !d.notification.readAt);

  return (
    <div className="flex flex-1 flex-col" style={{ background: "var(--bg)" }}>
      <AppBar th="การแจ้งเตือน" en="Notifications" />
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
        <span style={{ font: "500 12px var(--font-sans)", color: "var(--muted)" }}>
          {deliveries.length} รายการ
        </span>
        {hasUnread && (
          <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, background: "var(--brand)", color: "#fff", font: "600 10px var(--font-sans)" }}>
            มีอ่านใหม่
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto pb-6">
        {deliveries.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <div style={{ font: "700 32px var(--font-sans)", marginBottom: 8 }}>🔔</div>
            <div style={{ font: "600 14px var(--font-sans)", color: "var(--ink)" }}>ยังไม่มีการแจ้งเตือน</div>
            <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginTop: 4 }}>No notifications</div>
          </div>
        ) : (
          <div className="flex flex-col">
            {deliveries.map(d => {
              const n = d.notification;
              const read = !!d.notification.readAt;
              return (
                <div key={d.id}
                  className="flex items-start gap-3 px-4 py-3.5"
                  style={{ borderBottom: "1px solid var(--line)", background: read ? "var(--bg)" : "var(--tint)" }}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                    style={{ background: read ? "var(--stage)" : "var(--brand)", fontSize: 16 }}>
                    {CHANNEL_ICON[d.channel] ?? "🔔"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div style={{ font: `${read ? "500" : "700"} 13px var(--font-sans)`, color: "var(--ink)", lineHeight: 1.3 }}>
                      {n.titleTh}
                    </div>
                    {n.bodyTh && (
                      <div style={{ font: "400 11px var(--font-sans)", color: "var(--muted)", marginTop: 2, lineHeight: 1.4 }}>{n.bodyTh}</div>
                    )}
                    <div style={{ font: "500 10px var(--font-sans)", color: "var(--muted)", marginTop: 4 }}>
                      {fmtDate(new Date(d.createdAt))}
                    </div>
                  </div>
                  {!read && (
                    <div style={{ width: 8, height: 8, borderRadius: 999, background: "var(--brand)", flexShrink: 0, marginTop: 5 }} />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
