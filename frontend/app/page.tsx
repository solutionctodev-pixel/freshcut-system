"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const password = String(form.get("password") || "");

    if (password.length < 8) {
      setMessage("Das Passwort muss mindestens 8 Zeichen haben.");
      return;
    }

    const data = {
      firstName: String(form.get("firstName") || ""),
      lastName: String(form.get("lastName") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      password,
    };

    setLoading(true);
    setMessage("");

    try {
     const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

const response = await fetch(
  `${API_URL}/auth/register`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  },
);

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message;

        throw new Error(
          errorMessage || "Registrierung fehlgeschlagen",
        );
      }

      setMessage(
        "Registrierung erfolgreich! Du wirst zum Login weitergeleitet...",
      );

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Ein Fehler ist aufgetreten.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-md">

        <Link
          href="/"
          className="text-sm text-white/50 transition hover:text-white"
        >
          ← Zurück
        </Link>

        <h1 className="mt-10 text-5xl font-black">
          REGISTRIEREN
        </h1>

        <p className="mt-4 text-white/50">
          Erstelle dein kostenloses FreshCut-Konto.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-5"
        >
          <input
            name="firstName"
            placeholder="Vorname"
            required
            autoComplete="given-name"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 outline-none transition focus:border-white/40"
          />

          <input
            name="lastName"
            placeholder="Nachname"
            required
            autoComplete="family-name"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 outline-none transition focus:border-white/40"
          />

          <input
            name="email"
            type="email"
            placeholder="E-Mail"
            required
            autoComplete="email"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 outline-none transition focus:border-white/40"
          />

          <input
            name="phone"
            type="tel"
            placeholder="Telefon"
            required
            autoComplete="tel"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 outline-none transition focus:border-white/40"
          />

          <input
            name="password"
            type="password"
            placeholder="Passwort"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 outline-none transition focus:border-white/40"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white px-8 py-4 font-bold text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "WIRD ERSTELLT..."
              : "KONTO ERSTELLEN"}
          </button>
        </form>

        {message && (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
            {message}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-white/50">
          Bereits registriert?{" "}
          <Link
            href="/login"
            className="text-white underline"
          >
            Einloggen
          </Link>
        </p>

      </div>
    </main>
  );
}