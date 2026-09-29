import {
  Briefcase,
  Building2,
  Coffee,
  Flower,
  Gem,
  Handshake,
  Heart,
  PartyPopper,
  Plane,
  Presentation,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { Fragment } from "react";
import type { OccasionId } from "@/lib/types";

const ICONS: Record<OccasionId, LucideIcon> = {
  wedding: Gem,
  interview: Briefcase,
  "first-day": Building2,
  "blind-date": Coffee,
  "family-meeting": Handshake,
  business: Presentation,
  date: Heart,
  friends: Users,
  restaurant: UtensilsCrossed,
  travel: Plane,
  party: PartyPopper,
  funeral: Flower,
};

export function OccasionIcon({ id, className = "h-5 w-5" }: { id: OccasionId; className?: string }) {
  const Icon = ICONS[id];
  return <Icon className={className} strokeWidth={1.6} aria-hidden />;
}

/** Occasion label that may wrap after "·" (e.g. 호텔·레스토랑) instead of mid-word. */
export function OccasionLabel({ label }: { label: string }) {
  const parts = label.split("·");
  return (
    <>
      {parts.map((part, i) => (
        <Fragment key={part}>
          {part}
          {i < parts.length - 1 && (
            <>
              ·<wbr />
            </>
          )}
        </Fragment>
      ))}
    </>
  );
}
