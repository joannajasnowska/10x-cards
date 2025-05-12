import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface FlashcardsHeaderProps {
  onAddNewClick: () => void;
}

export default function FlashcardsHeader({ onAddNewClick }: FlashcardsHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold tracking-tight">Moje Fiszki</h1>
      <Button onClick={onAddNewClick} className="gap-2">
        <PlusCircle className="h-4 w-4" />
        <span>Dodaj fiszkę ręcznie</span>
      </Button>
    </div>
  );
}
