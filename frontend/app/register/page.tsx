"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    const data = {
      firstName: form.get("firstName"),
      lastName: form.get("lastName"),
      email: form.get("email"),
      phone: form.get("phone"),
      password: form.get("password"),
    };

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:3000/auth/register",
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
        throw new Error(
          result.message || "Registrierung fehlgeschlagen",
        );
      }

      setMessage(
        "Registrierung erfolgreich! Du kannst dich jetzt einloggen.",
      );
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
          className="text-sm text-white/50 hover:text-white"
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
            className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 outline-none focus:border-white/40"
          />

          <input
            name="lastName"
            placeholder="Nachname"
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 outline-none focus:border-white/40"
          />

          <input
            name="email"
            type="email"
            placeholder="E-Mail"
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 outline-none focus:border-white/40"
          />

          <input
            name="phone"
            placeholder="Telefon"
            required
            className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 outline-none focus:border-white/40"
          />

          <input
            name="password"
            type="password"
            placeholder="Passwort"
            required
            minLength={8}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 outline-none focus:border-white/40"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white px-8 py-4 font-bold text-black hover:bg-white/80 disabled:opacity-50"
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