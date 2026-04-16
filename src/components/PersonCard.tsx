import { Link } from "@tanstack/react-router";
import { RankBadge } from "./RankBadge";
import { User } from "lucide-react";

interface PersonCardProps {
  slug: string;
  fullName: string;
  photoUrl?: string | null;
  shortBio?: string | null;
  rank?: number;
  score?: number | null;
  country?: string | null;
}

export function PersonCard({ slug, fullName, photoUrl, shortBio, rank, score, country }: PersonCardProps) {
  return (
    <Link
      to="/person/$slug"
      params={{ slug }}
      className="group flex gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-gold/40 hover:shadow-md"
    >
      {rank && (
        <div className="flex-shrink-0 self-center">
          <RankBadge rank={rank} />
        </div>
      )}
      <div className="flex-shrink-0">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={fullName}
            className="h-16 w-16 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
            <User className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-base font-semibold text-foreground group-hover:text-gold transition-colors">
          {fullName}
        </h3>
        {country && (
          <p className="text-xs text-muted-foreground">{country}</p>
        )}
        {shortBio && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{shortBio}</p>
        )}
        {score !== undefined && score !== null && (
          <p className="mt-1 text-xs font-medium text-gold">Score: {score}</p>
        )}
      </div>
    </Link>
  );
}
