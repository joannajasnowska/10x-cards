import React from "react";
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

export default function FlashcardProposalItem({ proposal, onAccept, onReject, onEdit }: FlashcardProposalItemProps) {
  const { id, front, back, status } = proposal;

  const handleAccept = () => onAccept(id);
  const handleReject = () => onReject(id);
  const handleEdit = () => onEdit(id);

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

  // Buttons disabled status based on current status
  const isAcceptDisabled = status === "accepted" || status === "rejected";
  const isEditDisabled = status === "rejected";
  const isRejectDisabled = status === "rejected";

  return (
    <Card className={status === "rejected" ? "opacity-60" : ""}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">
          <div className="flex justify-between items-center">
            <span className="truncate">Front</span>
            <Badge variant={getBadgeVariant()}>{getStatusText()}</Badge>
          </div>
        </CardTitle>
        <div className="text-base py-2">{front}</div>
      </CardHeader>
      <CardContent className="pb-2">
        <CardTitle className="text-sm font-medium mb-2">Tył</CardTitle>
        <div className="text-base">{back}</div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex w-full justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAccept}
            disabled={isAcceptDisabled}
            className={status === "accepted" ? "bg-green-50 text-green-600 border-green-200" : ""}
          >
            <CheckIcon className="w-4 h-4 mr-1" />
            Akceptuj
          </Button>
          <Button variant="outline" size="sm" onClick={handleEdit} disabled={isEditDisabled}>
            <PencilIcon className="w-4 h-4 mr-1" />
            Edytuj
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReject}
            disabled={isRejectDisabled}
            className={status === "rejected" ? "bg-red-50 text-red-600 border-red-200" : ""}
          >
            <XIcon className="w-4 h-4 mr-1" />
            Odrzuć
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
