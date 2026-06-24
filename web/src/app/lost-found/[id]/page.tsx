import { PlaceholderScreen } from "@/components/shell/placeholder-screen";

// Lost & Found item detail. Next 16: params is a Promise — must await.
export default async function LostFoundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <PlaceholderScreen
      th={`รายละเอียดของหาย #${id}`}
      en={`Lost item #${id}`}
      phase="PHASE 2"
    />
  );
}
