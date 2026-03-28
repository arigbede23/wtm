// CategoryIcon — renders a Lucide icon for a given event category.
// Replaces emoji usage throughout the app for a cleaner, consistent look.

import {
  Music,
  Trophy,
  Palette,
  UtensilsCrossed,
  Monitor,
  Users,
  Laugh,
  Heart,
  TreePine,
  Moon,
  Handshake,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { EventCategory } from "@/types";

export const CATEGORY_ICONS: Record<EventCategory, LucideIcon> = {
  MUSIC: Music,
  SPORTS: Trophy,
  ARTS: Palette,
  FOOD: UtensilsCrossed,
  TECH: Monitor,
  SOCIAL: Users,
  COMEDY: Laugh,
  WELLNESS: Heart,
  OUTDOORS: TreePine,
  NIGHTLIFE: Moon,
  COMMUNITY: Handshake,
  OTHER: Sparkles,
};

export function CategoryIcon({
  category,
  className = "h-4 w-4",
}: {
  category: EventCategory | string;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS[category as EventCategory] ?? Sparkles;
  return <Icon className={className} />;
}
