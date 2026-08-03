import DealerSyncDemo from "../../../components/dealersync-demo";

export default async function DemoPage({
  params,
}: {
  params: Promise<{ view?: string[] }>;
}) {
  const { view } = await params;
  return <DealerSyncDemo initialView={view?.[0] ?? "overview"} />;
}
