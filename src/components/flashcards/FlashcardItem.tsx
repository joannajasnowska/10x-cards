import { useState } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import "./flashcard-item.css";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronDown, Brain, User, Bot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { FlashcardDTO } from "@/types";

interface FlashcardItemProps {
  flashcard: FlashcardDTO;
  onEdit: (flashcard: FlashcardDTO) => void;
  onDelete: (flashcard: { id: number; front: string }) => void;
}

export default function FlashcardItem({ flashcard, onEdit, onDelete }: FlashcardItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format dates
  const createdAt = format(new Date(flashcard.created_at), "d MMMM yyyy", { locale: pl });
  const updatedAt =
    flashcard.updated_at && flashcard.updated_at !== flashcard.created_at
      ? format(new Date(flashcard.updated_at), "d MMMM yyyy", { locale: pl })
      : null;

  // Get source icon
  const getSourceIcon = () => {
    switch (flashcard.source) {
      case "manual":
        return <User className="h-3 w-3" />;
      case "ai-complete":
        return <Bot className="h-3 w-3" />;
      case "ai-with-updates":
        return <Brain className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Get source text
  const getSourceText = () => {
    switch (flashcard.source) {
      case "manual":
        return "Utworzono ręcznie";
      case "ai-complete":
        return "Wygenerowano przez AI";
      case "ai-with-updates":
        return "Wygenerowano przez AI z poprawkami";
      default:
        return "Nieznane źródło";
    }
  };

  // Handle edit click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(flashcard);
  };

  // Handle delete click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete({ id: flashcard.id, front: flashcard.front });
  };

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className="py-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-start justify-between w-full">
            <div className="flex-1 mr-4 card-header-content min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="flex items-center gap-1 px-2 py-0 h-5">
                  {getSourceIcon()}
                  <span className="text-xs">{getSourceText()}</span>
                </Badge>
              </div>
              <div className="mt-2 font-semibold text-lg flashcard-front">{flashcard.front}</div>
            </div>
            <CollapsibleTrigger asChild className="flex-shrink-0">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                />
                <span className="sr-only">Toggle content</span>
              </Button>
            </CollapsibleTrigger>
          </div>
          <CardDescription className="mt-2 flex items-center text-xs flex-wrap">
            <span>Utworzono: {createdAt}</span>
            {updatedAt && <span className="ml-2 pl-2 border-l border-muted">Zaktualizowano: {updatedAt}</span>}
          </CardDescription>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-3 px-6">
            <p className="flashcard-back">{flashcard.back}</p>
          </CardContent>
          <CardFooter className="py-3 px-6 flex justify-end gap-2 border-t">
            <Button onClick={handleEditClick} variant="outline" size="sm" className="gap-2 h-8">
              <Edit className="h-3.5 w-3.5" />
              <span>Edytuj</span>
            </Button>
            <Button onClick={handleDeleteClick} variant="destructive" size="sm" className="gap-2 h-8">
              <Trash2 className="h-3.5 w-3.5" />
              <span>Usuń</span>
            </Button>
          </CardFooter>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
