import Image from "next/image";
import LiveClock from "./LiveClock";

/**
 * Top utility bar: 미래에이아이랩 MVP identity plus the live date / weekday /
 * clock. Sticky from md up (where the header offsets itself below it); on
 * mobile it sits at the very top of the page and scrolls away so the
 * navigation header keeps the full sticky area.
 */
export default function BrandBar() {
  return (
    <div className="z-50 border-b border-white/10 bg-ink text-white md:sticky md:top-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-1.5 px-4 py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:h-10 md:px-8 md:py-0">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <span className="flex items-center rounded-md bg-white px-1.5 py-1 shadow-sm">
            <Image
              src="/mirae-ai-lab-logo.jpg"
              alt="미래에이아이랩"
              width={166}
              height={50}
              priority
              className="h-4 w-auto sm:h-[1.15rem]"
            />
          </span>
          <span className="whitespace-nowrap rounded-full bg-rose px-2.5 py-0.5 text-[0.625rem] font-bold tracking-wide text-white sm:text-[0.75rem]">
            MVP 샘플 프로젝트
          </span>
        </div>
        <LiveClock tone="dark" />
      </div>
    </div>
  );
}
