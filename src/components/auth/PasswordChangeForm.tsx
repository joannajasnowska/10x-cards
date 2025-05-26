import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import ErrorDisplay from "../ui/ErrorDisplay";

export default function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Form validation
    if (!currentPassword) {
      setError("Podaj aktualne hasło");
      return;
    }

    if (!newPassword) {
      setError("Podaj nowe hasło");
      return;
    }

    if (newPassword.length < 8) {
      setError("Nowe hasło musi zawierać co najmniej 8 znaków");
      return;
    }

    if (newPassword === currentPassword) {
      setError("Nowe hasło musi być inne niż obecne");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Hasła nie są identyczne");
      return;
    }

    // Placeholder for future API integration
    setIsLoading(true);
    try {
      // Mock successful password change for now
      console.log("Password change attempt:", { currentPassword, newPassword });
      // Will be replaced with actual API call

      // Simulate success response
      setTimeout(() => {
        setIsSuccess(true);
      }, 1000);
    } catch (err) {
      setError("Wystąpił błąd podczas zmiany hasła. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show success message after form submission
  if (isSuccess) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green-600"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
        </div>
        <h2 className="text-xl font-semibold">Hasło zmienione</h2>
        <p className="text-muted-foreground">Twoje hasło zostało pomyślnie zmienione.</p>
        <div className="pt-4">
          <a href="/" className="text-primary hover:underline">
            Powrót do strony głównej
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Zmień hasło</h1>
        <p className="text-sm text-muted-foreground">Wprowadź obecne hasło oraz nowe hasło</p>
      </div>

      {error && <ErrorDisplay error={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="currentPassword"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Obecne hasło
          </label>
          <Input
            id="currentPassword"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            aria-invalid={!!error && !currentPassword}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="newPassword"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Nowe hasło
          </label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            aria-invalid={!!error && (!newPassword || newPassword.length < 8)}
          />
          <p className="text-xs text-muted-foreground">Hasło musi zawierać co najmniej 8 znaków</p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Potwierdź nowe hasło
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            aria-invalid={!!error && newPassword !== confirmPassword}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Zapisywanie..." : "Zmień hasło"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <a href="/" className="text-primary hover:underline">
          Anuluj
        </a>
      </div>
    </div>
  );
}
