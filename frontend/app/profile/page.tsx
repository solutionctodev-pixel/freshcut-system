"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Profile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  profileImage?: string | null;
  role: string;
  customer?: {
    id: string;
    dateOfBirth?: string | null;
  } | null;
};

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://10.25.247.145:3000";

  useEffect(() => {
    async function loadProfile() {
      const token =
        localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/customers/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            "Profil konnte nicht geladen werden.",
          );
        }

        const data = await response.json();

        setProfile(data);
      } catch (error) {
        console.error(error);

        setMessage(
          "Profil konnte nicht geladen werden.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [API_URL, router]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!profile) return;

    const token =
      localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const form = new FormData(
      event.currentTarget,
    );

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/customers/me`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: String(
              form.get("firstName") || "",
            ),
            lastName: String(
              form.get("lastName") || "",
            ),
            phone: String(
              form.get("phone") || "",
            ),
            dateOfBirth:
              String(
                form.get("dateOfBirth") || "",
              ) || undefined,
            profileImage:
              String(
                form.get("profileImage") || "",
              ) || undefined,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Profil konnte nicht gespeichert werden.",
        );
      }

      setProfile(data);
      setMessage("Profil erfolgreich gespeichert.");
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "Fehler beim Speichern.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-sm tracking-widest text-white/40">
          PROFIL WIRD GELADEN...
        </p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-white/50">
          Profil nicht verfügbar.
        </p>
      </main>
    );
  }

  const dateOfBirth =
    profile.customer?.dateOfBirth
      ? new Date(
          profile.customer.dateOfBirth,
        )
            .toISOString()
            .split("T")[0]
      : "";

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-2xl">

        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-white/50 transition hover:text-white"
        >
          ← Zurück zum Dashboard
        </button>

        <div className="mt-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/40">
            DEIN PROFIL
          </p>

          <h1 className="mt-3 text-5xl font-black">
            {profile.firstName}
          </h1>

          <p className="mt-3 text-white/50">
            Verwalte hier deine persönlichen Daten.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6"
        >

          <div className="flex justify-center">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5">

              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt="Profilbild"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-4xl font-black text-white/30">
                  {profile.firstName?.[0]}
                  {profile.lastName?.[0]}
                </span>
              )}

            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/50">
              Profilbild URL
            </label>

            <input
              name="profileImage"
              defaultValue={
                profile.profileImage || ""
              }
              placeholder="https://..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 outline-none focus:border-white/40"
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm text-white/50">
                Vorname
              </label>

              <input
                name="firstName"
                defaultValue={
                  profile.firstName
                }
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 outline-none focus:border-white/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/50">
                Nachname
              </label>

              <input
                name="lastName"
                defaultValue={
                  profile.lastName
                }
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 outline-none focus:border-white/40"
              />
            </div>

          </div>

          <div>
            <label className="mb-2 block text-sm text-white/50">
              E-Mail
            </label>

            <input
              value={profile.email}
              disabled
              className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-white/40"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/50">
              Telefonnummer
            </label>

            <input
              name="phone"
              type="tel"
              defaultValue={
                profile.phone || ""
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 outline-none focus:border-white/40"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/50">
              Geburtsdatum
            </label>

            <input
              name="dateOfBirth"
              type="date"
              defaultValue={dateOfBirth}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-4 outline-none focus:border-white/40"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-full bg-white px-8 py-4 font-bold text-black transition hover:bg-white/80 disabled:opacity-50"
          >
            {saving
              ? "WIRD GESPEICHERT..."
              : "PROFIL SPEICHERN"}
          </button>

        </form>

        {message && (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm">
            {message}
          </div>
        )}

      </div>
    </main>
  );
}