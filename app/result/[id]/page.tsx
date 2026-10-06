import type { Metadata } from "next";
import ResultView from "./ResultView";

export const metadata: Metadata = {
  title: "판정 결과",
};

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ share?: string | string[] }>;
}) {
  const { id } = await params;
  const { share } = await searchParams;
  return <ResultView id={id} share={typeof share === "string" ? share : undefined} />;
}
