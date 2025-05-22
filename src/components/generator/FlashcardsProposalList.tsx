import React, { useMemo, useCallback, memo } from "react";
import FlashcardProposalItem from "./FlashcardProposalItem";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { SaveIcon, CheckCircleIcon } from "lucide-react";

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

interface FlashcardsProposalListProps {
  proposals: FlashcardProposalViewModel[];
  isSaving: boolean;
  onAccept: (proposalId: string) => void;
  onReject: (proposalId: string) => void;
  onEdit: (proposalId: string) => void;
  onSaveApproved: () => void;
  onSaveAll: () => void;
}

function FlashcardsProposalList({
  proposals,
  isSaving,
  onAccept,
  onReject,
  onEdit,
  onSaveApproved,
  onSaveAll,
}: FlashcardsProposalListProps) {
  // Calculate counts
  const counts = useMemo(() => {
    return {
      total: proposals.length,
      accepted: proposals.filter((p) => p.status === "accepted").length,
      rejected: proposals.filter((p) => p.status === "rejected").length,
      edited: proposals.filter((p) => p.status === "edited").length,
      pending: proposals.filter((p) => p.status === "pending").length,
    };
  }, [proposals]);

  // Calculate if save buttons should be enabled
  const hasApprovedOrEdited = useMemo(
    () => proposals.some((p) => p.status === "accepted" || p.status === "edited"),
    [proposals]
  );

  const hasPendingOrApprovedOrEdited = useMemo(() => proposals.some((p) => p.status !== "rejected"), [proposals]);

  // Używamy useCallback dla handlerów, które przekazujemy do komponentów potomnych
  const handleAccept = useCallback((proposalId: string) => onAccept(proposalId), [onAccept]);
  const handleReject = useCallback((proposalId: string) => onReject(proposalId), [onReject]);
  const handleEdit = useCallback((proposalId: string) => onEdit(proposalId), [onEdit]);
  const handleSaveApproved = useCallback(() => onSaveApproved(), [onSaveApproved]);
  const handleSaveAll = useCallback(() => onSaveAll(), [onSaveAll]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 items-center justify-between border-b pb-4">
        <div className="text-lg font-medium">Propozycje fiszek ({counts.total})</div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
            <span className="text-muted-foreground">Oczekujące:</span>{" "}
            <span className="font-semibold ml-1">{counts.pending}</span>
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <span>Zaakceptowane:</span> <span className="font-semibold ml-1">{counts.accepted}</span>
          </Badge>
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
            <span>Edytowane:</span> <span className="font-semibold ml-1">{counts.edited}</span>
          </Badge>
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
            <span>Odrzucone:</span> <span className="font-semibold ml-1">{counts.rejected}</span>
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1">
        {proposals.map((proposal) => (
          <FlashcardProposalItem
            key={proposal.id}
            proposal={proposal}
            onAccept={handleAccept}
            onReject={handleReject}
            onEdit={handleEdit}
          />
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          variant="outline"
          onClick={handleSaveAll}
          disabled={!hasPendingOrApprovedOrEdited || isSaving}
          className="gap-2 h-8"
        >
          <SaveIcon className="w-3.5 h-3.5" />
          Zapisz wszystkie
        </Button>
        <Button onClick={handleSaveApproved} disabled={!hasApprovedOrEdited || isSaving} className="gap-2 h-8">
          <CheckCircleIcon className="w-3.5 h-3.5" />
          {isSaving ? "Zapisywanie..." : "Zapisz zatwierdzone"}
        </Button>
      </div>
    </div>
  );
}

// Używamy memo, aby komponent rerenderował się tylko gdy jego propsy się zmieniają
export default memo(FlashcardsProposalList);
