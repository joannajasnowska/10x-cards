import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  flashcard: { id: number; front: string } | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: number) => Promise<void>;
  isDeleting: boolean;
}

export default function DeleteConfirmationDialog({
  flashcard,
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteConfirmationDialogProps) {
  // Don't render anything if no flashcard is provided
  if (!flashcard) return null;

  // Handle confirm action
  const handleConfirm = async () => {
    await onConfirm(flashcard.id);
  };

  // Truncate title if too long
  const truncatedTitle = flashcard.front.length > 50 ? `${flashcard.front.substring(0, 50)}...` : flashcard.front;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Czy na pewno chcesz usunąć tę fiszkę?</AlertDialogTitle>
          <AlertDialogDescription>
            <span className="font-medium text-foreground">{truncatedTitle}</span>
            <br />
            <span className="text-muted-foreground">
              Ta operacja jest nieodwracalna. Fiszka zostanie trwale usunięta z systemu.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Anuluj</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Usuwanie...
              </span>
            ) : (
              "Usuń"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
