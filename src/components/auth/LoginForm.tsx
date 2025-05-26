import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import ErrorDisplay from "../ui/ErrorDisplay";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

    // Placeholder for future API integration
    setIsLoading(true);
    try {
      // Mock successful login for now
      console.log("Login attempt:", { email, password });
      // Will be replaced with actual API call
    } catch (err) {
      setError("Wystąpił błąd podczas logowania. Spróbuj ponownie.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Zaloguj się</h1>
        <p className="text-sm text-muted-foreground">Wprowadź swoje dane, aby się zalogować</p>
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
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Hasło
            </label>
            <a href="/reset-password" className="text-xs text-primary hover:underline">
              Zapomniałeś hasła?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            aria-invalid={!!error && !password}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Logowanie..." : "Zaloguj się"}
        </Button>
      </form>

      <div className="text-center text-sm">
        Nie masz konta?{" "}
        <a href="/register" className="text-primary hover:underline">
          Zarejestruj się
        </a>
      </div>
    </div>
  );
}
