import { DEMO_SAMPLES } from "@/lib/demo-samples";
import LookImage from "./LookImage";

/**
 * Three sample looks, the middle one raised — the picture for empty and
 * dead-end screens: what this app collects is outfits, not numbers.
 */
export default function LookTrio({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-end justify-center ${className}`} aria-hidden>
      {DEMO_SAMPLES.slice(1, 4).map((s, i) => (
        <div
          key={s.id}
          className={`overflow-hidden rounded-sm border-2 border-cream shadow-subtle ${
            i === 1 ? "z-10 -mx-3 w-20" : "w-16 opacity-80"
          }`}
        >
          <LookImage src={s.image} alt="" sizes="80px" className="w-full" />
        </div>
      ))}
    </div>
  );
}
