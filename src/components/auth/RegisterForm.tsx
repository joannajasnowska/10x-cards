import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import ErrorDisplay from "../ui/ErrorDisplay";
import { toast } from "sonner";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Form validation
    if (!email.trim()) {
      setError("Podaj adres email");
      return;
    }

    if (!password) {
      setError("Podaj hasło");
      return;
    }

    if (password.length < 8) {
      setError("Hasło musi zawierać co najmniej 8 znaków");
      return;
    }

    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, passwordConfirm: confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Wystąpił błąd podczas rejestracji");
      }

      // Show success toast
      toast.success("Rejestracja zakończona pomyślnie!");

      // Redirect to the specified page (Generator)
      if (data.redirect) {
        window.location.href = data.redirect;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił błąd podczas rejestracji. Spróbuj ponownie.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Utwórz konto</h1>
        <p className="text-sm text-muted-foreground">Wprowadź swoje dane, aby utworzyć konto</p>
      </div>

      {error && <ErrorDisplay error={error} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="twoj@email.pl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            aria-invalid={!!error && !email}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Hasło
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            aria-invalid={!!error && (!password || password.length < 8)}
          />
          <p className="text-xs text-muted-foreground">Hasło musi zawierać co najmniej 8 znaków</p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Potwierdź hasło
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            aria-invalid={!!error && password !== confirmPassword}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Rejestracja..." : "Zarejestruj się"}
        </Button>
      </form>

      <div className="text-center text-sm">
        Masz już konto?{" "}
        <a href="/login" className="text-primary hover:underline">
          Zaloguj się
        </a>
      </div>
    </div>
  );
}
