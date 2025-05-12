import { LibraryBig } from "lucide-react";

interface FlashcardsStatsProps {
  total: number;
}

export default function FlashcardsStats({ total }: FlashcardsStatsProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <LibraryBig className="h-4 w-4" />
      <span>
        {total > 0 ? (
          <>
            Łącznie <span className="font-medium text-foreground">{total}</span>{" "}
            {total === 1 ? "fiszka" : total < 5 ? "fiszki" : "fiszek"}
          </>
        ) : (
          "Brak fiszek"
        )}
      </span>
    </div>
  );
}
