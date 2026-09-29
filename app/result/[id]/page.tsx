import type { Metadata } from "next";
import ResultView from "./ResultView";

export const metadata: Metadata = {
  title: "판정 결과",
};

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ResultView id={id} />;
}
