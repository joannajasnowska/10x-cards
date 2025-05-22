import React, { useCallback, memo } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { CheckIcon, XIcon, PencilIcon } from "lucide-react";

interface FlashcardProposalViewModel {
  id: string;
  front: string;
  back: string;
  status: "pending" | "accepted" | "rejected" | "edited";
  originalFront: string;
  originalBack: string;
  source: "ai-complete" | "ai-with-updates";
  model: string;
  generation_id: number;
}

interface FlashcardProposalItemProps {
  proposal: FlashcardProposalViewModel;
  onAccept: (proposalId: string) => void;
  onReject: (proposalId: string) => void;
  onEdit: (proposalId: string) => void;
}

function FlashcardProposalItem({ proposal, onAccept, onReject, onEdit }: FlashcardProposalItemProps) {
  const { id, front, back, status } = proposal;

  // Używamy useCallback, aby zapobiec niepotrzebnym rerenderom
  const handleAccept = useCallback(() => onAccept(id), [id, onAccept]);
  const handleReject = useCallback(() => onReject(id), [id, onReject]);
  const handleEdit = useCallback(() => onEdit(id), [id, onEdit]);

  // Status badge color
  const getBadgeVariant = () => {
    switch (status) {
      case "accepted":
        return "success";
      case "rejected":
        return "destructive";
      case "edited":
        return "warning";
      default:
        return "secondary";
    }
  };

  // Status badge text
  const getStatusText = () => {
    switch (status) {
      case "accepted":
        return "Zaakceptowane";
      case "rejected":
        return "Odrzucone";
      case "edited":
        return "Edytowane";
      default:
        return "Oczekujące";
    }
  };

  // Dodatkowe klasy CSS dla badge'a
  const getBadgeClasses = () => {
    switch (status) {
      case "accepted":
        return "bg-green-50 text-green-700 border-green-300";
      case "rejected":
        return "bg-red-50 text-red-700 border-red-300";
      case "edited":
        return "bg-amber-50 text-amber-700 border-amber-300";
      default:
        return "bg-gray-50 text-gray-700 border-gray-300";
    }
  };

  // Buttons disabled status based on current status
  const isAcceptDisabled = status === "accepted" || status === "rejected";
  const isEditDisabled = status === "rejected";
  const isRejectDisabled = status === "rejected";

  return (
    <Card className={`${status === "rejected" ? "opacity-60" : ""} flex flex-col h-full`}>
      <CardHeader className="py-4 cursor-pointer">
        <div className="flex items-start justify-between w-full">
          <div className="flex-1 mr-4 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={getBadgeVariant()} className={getBadgeClasses()}>
                {getStatusText()}
              </Badge>
            </div>
            <CardTitle className="text-sm font-medium mt-6 mb-2">Przód fiszki</CardTitle>
            <div className="font-semibold text-lg overflow-auto max-h-24">{front}</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3 px-6 flex-grow overflow-auto">
        <CardTitle className="text-sm font-medium mb-2">Tył fiszki</CardTitle>
        <div className="text-base overflow-auto max-h-32">{back}</div>
      </CardContent>

      <CardFooter className="py-3 px-6 flex justify-end gap-2 border-t mt-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAccept}
          disabled={isAcceptDisabled}
          className={`gap-2 h-8 ${
            status === "accepted"
              ? "bg-green-50 text-green-700 border-green-300 hover:bg-green-100 hover:text-green-800"
              : ""
          }`}
        >
          <CheckIcon className="w-3.5 h-3.5" />
          Akceptuj
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleEdit}
          disabled={isEditDisabled}
          className={`gap-2 h-8 ${
            status === "edited"
              ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 hover:text-amber-800"
              : ""
          }`}
        >
          <PencilIcon className="w-3.5 h-3.5" />
          Edytuj
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReject}
          disabled={isRejectDisabled}
          className={`gap-2 h-8 ${
            status === "rejected" ? "bg-red-50 text-red-700 border-red-300 hover:bg-red-100 hover:text-red-800" : ""
          }`}
        >
          <XIcon className="w-3.5 h-3.5" />
          Odrzuć
        </Button>
      </CardFooter>
    </Card>
  );
}

// Używamy memo, aby komponent rerenderował się tylko gdy jego propsy się zmieniają
export default memo(FlashcardProposalItem);
