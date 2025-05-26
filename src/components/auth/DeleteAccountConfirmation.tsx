import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import ErrorDisplay from "../ui/ErrorDisplay";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

export default function DeleteAccountConfirmation() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleConfirmDelete = async () => {
    setError("");

    if (!password) {
      setError("Podaj hasło, aby potwierdzić");
      return;
    }

    setIsLoading(true);
    try {
      // Mock successful account deletion for now
      console.log("Account deletion confirmed with password:", password);
      // Will be replaced with actual API call

      // Redirect to home page would happen after successful deletion
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (err) {
      setError("Wystąpił błąd podczas usuwania konta. Spróbuj ponownie.");
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Usuń konto</h1>
        <p className="text-sm text-muted-foreground">
          Usunięcie konta jest nieodwracalne i spowoduje usunięcie wszystkich Twoich danych.
        </p>
      </div>

      <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
        <h3 className="font-medium text-destructive mb-2">Ważne informacje</h3>
        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
          <li>Wszystkie Twoje fiszki zostaną usunięte</li>
          <li>Utracisz dostęp do historii nauki</li>
          <li>Nie będziesz mógł odzyskać swojego konta</li>
        </ul>
      </div>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="w-full">
            Usuń konto
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć swoje konto?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja jest nieodwracalna. Twoje konto i wszystkie dane zostaną trwale usunięte.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {error && <ErrorDisplay error={error} />}

          <div className="space-y-2 mt-2">
            <label htmlFor="password" className="text-sm font-medium leading-none">
              Potwierdź swoim hasłem
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Wprowadź swoje hasło"
              aria-invalid={!!error}
            />
          </div>

          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isLoading}>Anuluj</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? "Usuwanie..." : "Tak, usuń moje konto"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="text-center text-sm">
        <a href="/" className="text-primary hover:underline">
          Powrót do strony głównej
        </a>
      </div>
    </div>
  );
}
