import { useState } from "react";
import { Search, X, SortDesc, SortAsc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FilterParams } from "@/lib/hooks/useFlashcardsState";

interface FlashcardsFiltersProps {
  filters: FilterParams;
  onChange: (filters: Partial<FilterParams>) => void;
}

export default function FlashcardsFilters({ filters, onChange }: FlashcardsFiltersProps) {
  const [searchValue, setSearchValue] = useState(filters.search || "");

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({ search: searchValue });
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchValue("");
    onChange({ search: "" });
  };

  // Update sort parameter
  const handleSortChange = (sort: "created_at" | "updated_at") => {
    onChange({ sort });
  };

  // Toggle sort direction
  const handleSortDirectionChange = () => {
    onChange({ order: filters.order === "asc" ? "desc" : "asc" });
  };

  // Get sort display text
  const getSortText = () => {
    const fieldText = filters.sort === "created_at" ? "Data utworzenia" : "Data aktualizacji";
    const directionText = filters.order === "asc" ? "(rosnąco)" : "(malejąco)";
    return `${fieldText} ${directionText}`;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search input */}
      <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
        <Input
          type="text"
          placeholder="Szukaj fiszek..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pr-10 w-full"
        />
        {searchValue && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-10 flex items-center pr-1"
          >
            <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
          </button>
        )}
        <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3">
          <Search className="h-4 w-4 text-gray-500 hover:text-gray-700" />
        </button>
      </form>

      {/* Sort dropdown */}
      <div className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <span className="hidden sm:inline">Sortuj:</span>
              <span className="truncate max-w-[120px]">{getSortText()}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Sortowanie</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => handleSortChange("created_at")}
                className={filters.sort === "created_at" ? "bg-accent" : ""}
              >
                Data utworzenia
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleSortChange("updated_at")}
                className={filters.sort === "updated_at" ? "bg-accent" : ""}
              >
                Data aktualizacji
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Sort direction toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleSortDirectionChange}
          title={filters.order === "asc" ? "Sortuj malejąco" : "Sortuj rosnąco"}
        >
          {filters.order === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
