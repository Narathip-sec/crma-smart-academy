export const dynamic = 'force-dynamic';
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { AppBar } from "@/components/shell/app-bar";
import { NotificationChannel } from "@prisma/client";
import { NotificationRow } from "@/components/notifications/notification-row";

const CHANNEL_ICON: Record<NotificationChannel, string> = {
  in_app:    "🔔",
  line_push: "💬",
};

export default async function NotificationsPage() {
  const user = await getCurrentUser();

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
      <AppBar th="การแจ้งเตือน" en="Notifications" back />
      <div className="flex items-center justify-between px-4 py-2.5"
        style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}>
        <span style={{ font: "500 13px var(--font-sans)", color: "var(--muted)" }}>
          {deliveries.length} รายการ
        </span>
        {hasUnread && (
          <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, background: "var(--brand)", color: "#fff", font: "600 11px var(--font-sans)" }}>
            มีอ่านใหม่
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto pb-6">
        {deliveries.length === 0 ? (
          <div className="flex flex-col items-center py-16">
            <div style={{ font: "700 32px var(--font-sans)", marginBottom: 8 }}>🔔</div>
            <div style={{ font: "600 15px var(--font-sans)", color: "var(--ink)" }}>ยังไม่มีการแจ้งเตือน</div>
            <div style={{ font: "500 11px var(--font-sans)", color: "var(--muted)", marginTop: 4 }}>No notifications</div>
          </div>
        ) : (
          <div className="flex flex-col">
            {deliveries.map(d => (
              <NotificationRow
                key={d.id}
                notificationId={d.notification.id}
                icon={CHANNEL_ICON[d.channel] ?? "🔔"}
                titleTh={d.notification.titleTh}
                bodyTh={d.notification.bodyTh}
                createdAt={d.createdAt.toISOString()}
                deepLink={d.notification.deepLink}
                initialRead={!!d.notification.readAt}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
