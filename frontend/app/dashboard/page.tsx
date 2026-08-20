"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

type CustomerDashboardData = {
  customer?: {
    firstName?: string;
    lastName?: string;
    user?: {
      firstName?: string;
      lastName?: string;
      email?: string;
    };
  };

  membership?: {
    status?: string;
    expiresAt?: string;
    package?: {
      name?: string;
      price?: string | number;
    };
  };

  visits?: Array<{
    id: string;
    checkInAt?: string;
    createdAt?: string;
    branch?: {
      name?: string;
    };
  }>;
};

type QRCodeData = {
  id: string;
  customerId: string;
  token: string;
  active: boolean;
  expiresAt: string | null;
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [data, setData] =
    useState<CustomerDashboardData | null>(null);

  const [qrCode, setQrCode] =
    useState<QRCodeData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3000";

  useEffect(() => {
    const token =
      localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    async function loadDashboard() {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const dashboardResponse =
          await fetch(
            `${API_URL}/customers/me/dashboard`,
            {
              headers,
            },
          );

        if (!dashboardResponse.ok) {
          const text =
            await dashboardResponse.text();

          console.error(
            "Dashboard API Fehler:",
            dashboardResponse.status,
            text,
          );

          throw new Error(
            "Dashboard konnte nicht geladen werden",
          );
        }

        const dashboard =
          await dashboardResponse.json();

        setData(dashboard);

        const qrResponse =
          await fetch(
            `${API_URL}/qrcodes/me`,
            {
              headers,
            },
          );

        if (qrResponse.ok) {
          const qrText =
            await qrResponse.text();

          if (qrText.trim()) {
            try {
              const qr =
                JSON.parse(qrText);

              setQrCode(qr);
            } catch (error) {
              console.error(
                "QR-Code Antwort ist kein gültiges JSON:",
                error,
              );
            }
          }
        } else {
          const text =
            await qrResponse.text();

          console.error(
            "QR-Code konnte nicht geladen werden:",
            qrResponse.status,
            text,
          );
        }
      } catch (error) {
        console.error(
          "Dashboard Fehler:",
          error,
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router, API_URL]);

  function logout() {
    localStorage.removeItem(
      "access_token",
    );

    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-sm uppercase tracking-widest text-white/40">
          FRESHCUT WIRD GELADEN...
        </p>
      </main>
    );
  }

  const customerName =
    data?.customer?.user?.firstName ||
    data?.customer?.firstName ||
    "Kunde";

  const membership =
    data?.membership;

  const visits =
    data?.visits || [];

  return (
    <main className="min-h-screen bg-black text-white">

      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="text-2xl font-black tracking-tight">
            FRESHCUT
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                router.push("/profile")
              }
              className="rounded-full border border-white/10 px-5 py-2 text-sm text-white/70 transition hover:bg-white hover:text-black"
            >
              MEIN PROFIL
            </button>

            <button
              onClick={logout}
              className="rounded-full border border-white/10 px-5 py-2 text-sm text-white/70 transition hover:bg-white hover:text-black"
            >
              ABMELDEN
            </button>
          </div>

        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">

        <p className="text-sm uppercase tracking-[0.25em] text-white/40">
          DEIN ACCOUNT
        </p>

        <h1 className="mt-3 text-4xl font-black md:text-6xl">
          Hallo {customerName}.
        </h1>

        <p className="mt-3 text-white/50">
          Willkommen bei FreshCut.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">

          {/* MEMBERSHIP */}

          <section className="rounded-3xl border border-white/10 bg-white/5 p-8">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
              MEMBERSHIP
            </p>

            {membership ? (
              <>
                <h2 className="mt-5 text-3xl font-black">
                  {membership.package?.name ||
                    "Membership"}
                </h2>

                {membership.package?.price !==
                  undefined && (
                  <p className="mt-2 text-white/50">
                    {membership.package.price} €
                  </p>
                )}

                <div className="mt-6 inline-flex rounded-full bg-white px-4 py-2 text-xs font-bold text-black">
                  {membership.status ||
                    "ACTIVE"}
                </div>

                {membership.expiresAt && (
                  <p className="mt-5 text-sm text-white/40">
                    Gültig bis{" "}
                    {new Date(
                      membership.expiresAt,
                    ).toLocaleDateString(
                      "de-DE",
                    )}
                  </p>
                )}
              </>
            ) : (
              <div className="mt-6">
                <h2 className="text-2xl font-black">
                  Kein aktiver Plan
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-white/50">
                  Du hast aktuell kein aktives
                  FreshCut-Paket. Wähle jetzt
                  den passenden Plan für dich.
                </p>

                <button
                  onClick={() =>
                    router.push("/packages")
                  }
                  className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-white/80"
                >
                  PAKETE ANSEHEN
                </button>
              </div>
            )}

          </section>

          {/* QR CODE */}

          <section className="rounded-3xl border border-white/10 bg-white/5 p-8">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
              DEIN QR-CODE
            </p>

            {qrCode?.token ? (
              <>
                <div className="mt-6 inline-flex rounded-3xl bg-white p-6">

                  <QRCodeSVG
                    value={qrCode.token}
                    size={220}
                    level="H"
                  />

                </div>

                <p className="mt-5 text-xs text-white/30">
                  QR-Code ist{" "}
                  {qrCode.active
                    ? "aktiv"
                    : "inaktiv"}
                </p>
              </>
            ) : (
              <div className="mt-6 rounded-2xl border border-white/10 p-5">
                <p className="text-white/40">
                  Kein QR-Code vorhanden.
                </p>
              </div>
            )}

          </section>

        </div>

        {/* BESUCHE */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-8">

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                DEINE BESUCHE
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Besuchshistorie
              </h2>
            </div>

            <span className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/40">
              {visits.length} BESUCHE
            </span>
          </div>

          <div className="mt-8">

            {visits.length === 0 ? (
              <p className="text-white/40">
                Noch keine Besuche.
              </p>
            ) : (
              <div className="space-y-4">

                {visits.map((visit) => {
                  const visitDate =
                    visit.checkInAt ||
                    visit.createdAt;

                  return (
                    <div
                      key={visit.id}
                      className="flex items-center justify-between border-b border-white/10 pb-4"
                    >

                      <div>
                        <p className="font-bold">
                          {visit.branch?.name ||
                            "FreshCut Filiale"}
                        </p>

                        {visitDate && (
                          <p className="mt-1 text-sm text-white/40">
                            {new Date(
                              visitDate,
                            ).toLocaleDateString(
                              "de-DE",
                            )}

                            {" · "}

                            {new Date(
                              visitDate,
                            ).toLocaleTimeString(
                              "de-DE",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        )}
                      </div>

                      <span className="text-xs font-bold uppercase tracking-widest text-white/40">
                        CHECK-IN
                      </span>

                    </div>
                  );
                })}

              </div>
            )}

          </div>

        </section>

      </div>
    </main>
  );
}