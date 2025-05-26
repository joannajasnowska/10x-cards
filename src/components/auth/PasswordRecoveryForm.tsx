import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import ErrorDisplay from "../ui/ErrorDisplay";

export default function PasswordRecoveryForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Form validation
    if (!email.trim()) {
      setError("Podaj adres email");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Podaj poprawny adres email");
      return;
    }

    // Placeholder for future API integration
    setIsLoading(true);
    try {
      // Mock successful password reset request for now
      console.log("Password reset requested for:", email);
      // Will be replaced with actual API call

      // Simulate success response
      setTimeout(() => {
        setIsSuccess(true);
      }, 1000);
    } catch (err) {
      setError("Wystąpił błąd podczas wysyłania linku resetującego. Spróbuj ponownie.");
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
        <h2 className="text-xl font-semibold">Sprawdź swoją pocztę</h2>
        <p className="text-muted-foreground">
          Jeśli konto o adresie {email} istnieje w naszej bazie, wysłaliśmy na nie link do resetowania hasła.
        </p>
        <div className="pt-4">
          <a href="/login" className="text-primary hover:underline">
            Powrót do strony logowania
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Resetowanie hasła</h1>
        <p className="text-sm text-muted-foreground">Podaj swój adres email, a wyślemy Ci link do zresetowania hasła</p>
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
            aria-invalid={!!error}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Wysyłanie..." : "Wyślij link resetujący"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <a href="/login" className="text-primary hover:underline">
          Powrót do strony logowania
        </a>
      </div>
    </div>
  );
}
