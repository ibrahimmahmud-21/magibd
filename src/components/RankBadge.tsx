import { cn } from "@/lib/utils";

export function RankBadge({ rank, size = "md" }: { rank: number; size?: "sm" | "md" | "lg" }) {
  const isTop3 = rank <= 3;
  const sizeClasses = {
    sm: "h-7 w-7 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-bold",
        sizeClasses[size],
        isTop3
          ? "bg-gold text-gold-foreground shadow-md"
          : "bg-navy text-navy-foreground"
      )}
    >
      #{rank}
    </div>
  );
}
