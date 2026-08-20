"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Visit = {
  id: string;
  status: string;
  checkInAt: string;
  checkOutAt: string | null;
  usageAmount: number;
  branch?: {
    name: string;
  };
  employee?: {
    user?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
  };
  customer?: {
    user?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
  };
};

export default function AdminVisitsPage() {
  const router = useRouter();

  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3000";

  useEffect(() => {
    async function loadVisits() {
      try {
        const token =
          localStorage.getItem("access_token");

        if (!token) {
          router.replace("/login");
          return;
        }

        const response = await fetch(
          `${API_URL}/admin/visits`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            `Fehler ${response.status}`,
          );
        }

        const result = await response.json();

        setVisits(
          Array.isArray(result)
            ? result
            : result.value || [],
        );
      } catch (err) {
        console.error(
          "Visits Fehler:",
          err,
        );

        setError(
          "Besuche konnten nicht geladen werden.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadVisits();
  }, [router, API_URL]);

  function formatDate(date: string) {
    return new Date(date).toLocaleString(
      "de-DE",
      {
        dateStyle: "short",
        timeStyle: "short",
      },
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-sm uppercase tracking-[0.25em] text-white/40">
          BESUCHE WERDEN GELADEN...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">

      {/* HEADER */}

      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <button
            onClick={() =>
              router.push("/admin")
            }
            className="text-2xl font-black tracking-tight"
          >
            FRESHCUT
          </button>

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                router.push("/admin")
              }
              className="rounded-full border border-white/10 px-5 py-2 text-sm text-white/60 transition hover:border-red-500 hover:bg-red-500 hover:text-white"
            >
              DASHBOARD
            </button>

            <button
              onClick={() => {
                localStorage.removeItem(
                  "access_token",
                );

                router.replace("/login");
              }}
              className="rounded-full border border-white/10 px-5 py-2 text-sm text-white/60 transition hover:bg-white hover:text-black"
            >
              ABMELDEN
            </button>

          </div>

        </div>
      </header>

      {/* CONTENT */}

      <div className="mx-auto max-w-7xl px-6 py-12">

        <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
          ADMIN
        </p>

        <div className="mt-3 flex items-end justify-between">

          <div>
            <h1 className="text-4xl font-black md:text-6xl">
              Besuche
            </h1>

            <p className="mt-3 text-white/40">
              Alle Check-ins bei FreshCut.
            </p>
          </div>

          <div className="hidden rounded-2xl border border-red-500/20 bg-red-500/10 px-6 py-4 md:block">
            <p className="text-xs uppercase tracking-widest text-red-400">
              Gesamt
            </p>

            <p className="mt-1 text-3xl font-black">
              {visits.length}
            </p>
          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-400">
            {error}
          </div>
        )}

        {/* TABLE */}

        <section className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">

          <div className="border-b border-white/10 bg-white/[0.03] px-6 py-5">

            <h2 className="text-sm font-bold uppercase tracking-[0.2em]">
              Besuchshistorie
            </h2>

          </div>

          {visits.length === 0 ? (

            <div className="p-12 text-center">
              <p className="text-white/40">
                Noch keine Besuche vorhanden.
              </p>
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-widest text-white/30">

                    <th className="px-6 py-5">
                      Kunde
                    </th>

                    <th className="px-6 py-5">
                      Filiale
                    </th>

                    <th className="px-6 py-5">
                      Mitarbeiter
                    </th>

                    <th className="px-6 py-5">
                      Check-in
                    </th>

                    <th className="px-6 py-5">
                      Nutzung
                    </th>

                    <th className="px-6 py-5">
                      Status
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {visits.map((visit) => {

                    const customerName =
                      [
                        visit.customer?.user
                          ?.firstName,
                        visit.customer?.user
                          ?.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ") ||
                      "Unbekannter Kunde";

                    const employeeName =
                      [
                        visit.employee?.user
                          ?.firstName,
                        visit.employee?.user
                          ?.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ") ||
                      "Unbekannt";

                    return (
                      <tr
                        key={visit.id}
                        className="border-b border-white/5 transition hover:bg-red-500/[0.04]"
                      >

                        <td className="px-6 py-5">

                          <p className="font-bold">
                            {customerName}
                          </p>

                          <p className="mt-1 text-xs text-white/30">
                            {
                              visit.customer?.user
                                ?.email
                            }
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <p className="text-sm font-semibold">
                            {visit.branch?.name ||
                              "FreshCut"}
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <p className="text-sm">
                            {employeeName}
                          </p>

                          <p className="mt-1 text-xs text-white/30">
                            {
                              visit.employee?.user
                                ?.email
                            }
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <p className="text-sm text-white/70">
                            {formatDate(
                              visit.checkInAt,
                            )}
                          </p>

                        </td>

                        <td className="px-6 py-5">

                          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                            {visit.usageAmount}x
                          </span>

                        </td>

                        <td className="px-6 py-5">

                          <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-400">
                            {visit.status}
                          </span>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </div>
    </main>
  );
}