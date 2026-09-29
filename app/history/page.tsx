import { Suspense } from "react";
import type { Metadata } from "next";
import HistoryView from "./HistoryView";

export const metadata: Metadata = {
  title: "스타일 기록",
};

export default function HistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-5 pt-10 md:px-8">
          <div className="skeleton h-10 w-40 rounded-sm" />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="skeleton h-36 rounded-md" />
            <div className="skeleton h-36 rounded-md" />
          </div>
        </div>
      }
    >
      <HistoryView />
    </Suspense>
  );
}
