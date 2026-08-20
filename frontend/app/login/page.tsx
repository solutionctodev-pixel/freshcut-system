"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type LoginResult = {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
};

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://10.25.247.145:3000";

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const form = new FormData(
      event.currentTarget,
    );

    const email = String(
      form.get("email") || "",
    ).trim();

    const password = String(
      form.get("password") || "",
    );

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        const errorMessage = Array.isArray(
          result.message,
        )
          ? result.message.join(", ")
          : result.message;

        throw new Error(
          errorMessage ||
            "E-Mail oder Passwort falsch",
        );
      }

      const loginResult =
        result as LoginResult;

      localStorage.setItem(
        "access_token",
        loginResult.access_token,
      );

      const role =
        loginResult.user.role;

      console.log(
        "Login erfolgreich:",
        loginResult.user,
      );

      // SUPER ADMIN
      if (role === "SUPER_ADMIN") {
        router.replace("/admin");
        return;
      }

      // BRANCH ADMIN
      if (role === "BRANCH_ADMIN") {
        router.replace("/admin");
        return;
      }

      // MITARBEITER
      if (role === "EMPLOYEE") {
        router.replace("/employee");
        return;
      }

      // KUNDE
      if (role === "CUSTOMER") {
        router.replace("/dashboard");
        return;
      }

      // Unbekannte Rolle
      throw new Error(
        `Unbekannte Benutzerrolle: ${role}`,
      );
    } catch (error) {
      console.error(
        "Login-Fehler:",
        error,
      );

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
          LOGIN
        </h1>

        <p className="mt-4 text-white/50">
          Melde dich bei deinem FreshCut-Konto an.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-5"
        >

          <input
            name="email"
            type="email"
            placeholder="E-Mail"
            required
            autoComplete="email"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 outline-none transition focus:border-white/40"
          />

          <input
            name="password"
            type="password"
            placeholder="Passwort"
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 outline-none transition focus:border-white/40"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white px-8 py-4 font-bold text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "WIRD GELADEN..."
              : "EINLOGGEN"}
          </button>

        </form>

        {message && (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
            {message}
          </div>
        )}

        <p className="mt-8 text-center text-sm text-white/50">
          Noch kein Konto?{" "}

          <Link
            href="/register"
            className="text-white underline"
          >
            Registrieren
          </Link>
        </p>

      </div>
    </main>
  );
}