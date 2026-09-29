import { Suspense } from "react";
import type { Metadata } from "next";
import CheckFlow from "./CheckFlow";

export const metadata: Metadata = {
  title: "코디 확인",
};

export default function CheckPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-5 pt-12">
          <div className="skeleton h-72 rounded-lg" />
        </div>
      }
    >
      <CheckFlow />
    </Suspense>
  );
}
