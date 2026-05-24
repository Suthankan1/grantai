export { formatAmount } from "./format-helpers";

export function getCategoryStyle(category: string) {
  switch (category) {
    case "Research Background":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "Motivation":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "Technical":
      return "bg-sky-500/10 text-sky-400 border-sky-500/20";
    case "Impact":
      return "bg-pink-500/10 text-pink-400 border-pink-500/20";
    case "Future Plans":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    default:
      return "bg-gray-500/10 text-gray-400 border-gray-500/20";
  }
}

export function getScoreBadgeStyle(score: number) {
  if (score >= 8) {
    return "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
  } else if (score >= 5) {
    return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
  } else {
    return "bg-rose-500/20 text-rose-400 border border-rose-500/30";
  }
}
