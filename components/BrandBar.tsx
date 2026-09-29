import LabLogo from "./LabLogo";
import LiveClock from "./LiveClock";

/**
 * Portfolio identity strip. Deliberately quiet: it scrolls away with the page
 * and never competes with the product's own navigation below it.
 */
export default function BrandBar() {
  return (
    <div className="border-b border-linen bg-white">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-3 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <LabLogo className="h-7 w-auto shrink-0 sm:h-8" priority />
          <span className="whitespace-nowrap rounded-full bg-blush px-2.5 py-0.5 text-caption font-semibold text-rose-deep">
            MVP 샘플<span className="hidden sm:inline"> 프로젝트</span>
          </span>
        </div>
        <LiveClock />
      </div>
    </div>
  );
}
