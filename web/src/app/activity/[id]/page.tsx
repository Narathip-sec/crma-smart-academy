import { PlaceholderScreen } from "@/components/shell/placeholder-screen";

// Activity event detail. Next 16: params is a Promise — must await.
export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PlaceholderScreen
      th={`รายละเอียดกิจกรรม #${id}`}
      en={`Activity #${id}`}
      phase="PHASE 2"
    />
  );
}
