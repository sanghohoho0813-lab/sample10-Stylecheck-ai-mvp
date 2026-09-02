import LabLogo from "./LabLogo";
import LiveClock from "./LiveClock";

/**
 * Top utility bar: the 미래에이아이랩 identity plus the live date / weekday /
 * clock. Kept light so the transparent logo shows in its original colours.
 * Sticky from md up (the header offsets itself below it); on mobile it sits at
 * the top of the page so the navigation header keeps the sticky area.
 */
export default function BrandBar() {
  return (
    <div className="z-50 border-b border-linen bg-gradient-to-r from-blush/60 via-white to-blush/50 md:sticky md:top-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:h-14 md:px-8 md:py-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <LabLogo className="h-8 w-auto sm:h-9 md:h-10" priority />
          <span className="hidden h-6 w-px bg-linen sm:block" aria-hidden />
          <span className="whitespace-nowrap rounded-full bg-rose px-2.5 py-1 text-[0.625rem] font-bold tracking-wide text-white sm:text-[0.75rem]">
            MVP 샘플 프로젝트
          </span>
        </div>
        <LiveClock />
      </div>
    </div>
  );
}
