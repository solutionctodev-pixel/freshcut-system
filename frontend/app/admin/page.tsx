"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

type RevenueDay = {
  name: string;
  revenue: number;
};

type Dashboard = {
  customers: number;
  employees: number;
  branches: number;
  visits: number;

  subscriptions: {
    active: number;
    expired: number;
    cancelled?: number;
  };

  payments: {
    paid: number;
    pending?: number;
    failed?: number;
  };

  revenue: number;

  revenueLast7Days: RevenueDay[];

  /*
   * Diese Felder sind optional, damit die Seite auch dann
   * funktioniert, wenn dein aktueller Backend-/dashboard-
   * Endpoint diese zusätzlichen Daten noch nicht liefert.
   */
  revenueByPackage?: {
    name: string;
    revenue: number;
  }[];

  revenueByBranch?: {
    name: string;
    revenue: number;
  }[];

  activities?: {
    customer: string;
    event: string;
    amount: string;
    status: string;
  }[];

  activeQrCodes?: number;
};

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3000";

  useEffect(() => {
    let cancelled = false;

    async function loadAdmin() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        setError(null);

        /*
         * 1. Eingeloggten Benutzer prüfen
         */
        const meResponse = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!meResponse.ok) {
          localStorage.removeItem("access_token");
          router.replace("/login");
          return;
        }

        const me: User = await meResponse.json();

        /*
         * Nur SUPER_ADMIN darf in diesen Bereich.
         */
        if (me.role !== "SUPER_ADMIN") {
          router.replace("/");
          return;
        }

        if (cancelled) return;

        setUser(me);

        /*
         * 2. Echtes Dashboard vom Backend laden
         */
        const dashboardResponse = await fetch(
          `${API_URL}/admin/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          },
        );

        if (!dashboardResponse.ok) {
          throw new Error(
            "Dashboard konnte nicht vom Backend geladen werden.",
          );
        }

        const dashboardData: Dashboard =
          await dashboardResponse.json();

        if (cancelled) return;

        setDashboard(dashboardData);
      } catch (err) {
        console.error("Admin Fehler:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Dashboard konnte nicht geladen werden.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAdmin();

    return () => {
      cancelled = true;
    };
  }, [router, API_URL]);

  function logout() {
    localStorage.removeItem("access_token");
    router.replace("/login");
  }

  function reloadDashboard() {
    window.location.reload();
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-white/40">
            FRESHCUT WIRD GELADEN...
          </p>

          <div className="mx-auto mt-6 h-1 w-32 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-white" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !user || !dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <div className="text-2xl font-black">
            FRESHCUT
          </div>

          <p className="mt-6 text-xl font-bold">
            Dashboard konnte nicht geladen werden.
          </p>

          <p className="mt-3 text-sm text-white/40">
            {error ||
              "Es konnten keine Dashboard-Daten geladen werden."}
          </p>

          <button
            onClick={reloadDashboard}
            className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition hover:bg-white/80"
          >
            ERNEUT VERSUCHEN
          </button>

          <button
            onClick={logout}
            className="mt-3 block w-full rounded-full border border-white/10 px-6 py-3 text-sm text-white/50 transition hover:bg-white hover:text-black"
          >
            ABMELDEN
          </button>
        </div>
      </main>
    );
  }

  const totalMemberships =
    dashboard.subscriptions.active +
    dashboard.subscriptions.expired;

  const activePercentage =
    totalMemberships > 0
      ? Math.round(
          (dashboard.subscriptions.active /
            totalMemberships) *
            100,
        )
      : 0;

  const maxRevenue = Math.max(
    ...dashboard.revenueLast7Days.map(
      (day) => day.revenue,
    ),
    1,
  );

  /*
   * Zusätzliche Daten aus dem ersten Dashboard.
   *
   * Wenn das Backend sie bereits liefert, werden sie benutzt.
   * Wenn dein aktueller Endpoint sie noch nicht liefert,
   * bleiben die Bereiche sichtbar und zeigen "–".
   *
   * Dadurch wird nichts erfunden.
   */
  const packageData =
    dashboard.revenueByPackage ?? [];

  const branchRevenueData =
    dashboard.revenueByBranch ?? [];

  const activities =
    dashboard.activities ?? [];

  const qrCodes =
    dashboard.activeQrCodes ?? null;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* ====================================================== */}
      {/* HEADER                                                 */}
      {/* ====================================================== */}

      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-2xl font-black">
              FRESHCUT
            </div>

            <div className="mt-1 text-xs uppercase tracking-[0.3em] text-white/30">
              ADMIN DASHBOARD
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-white/10 px-4 py-2 text-xs text-white/40 sm:block">
              {user.role}
            </div>

            <button
              onClick={logout}
              className="rounded-full border border-white/10 px-5 py-2 text-sm text-white/60 transition hover:bg-white hover:text-black"
            >
              ABMELDEN
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* ====================================================== */}
        {/* WELCOME                                                 */}
        {/* ====================================================== */}

        <section>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/30">
            ÜBERSICHT
          </p>

          <h1 className="mt-3 text-5xl font-black md:text-7xl">
            Hallo {user.firstName}.
          </h1>

          <p className="mt-4 text-white/40">
            Deine FreshCut Unternehmensübersicht.
          </p>
        </section>

        {/* ====================================================== */}
        {/* KPI CARDS                                               */}
        {/* ====================================================== */}

        <section className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="KUNDEN"
            value={dashboard.customers}
            text="Kunden insgesamt"
          />

          <StatCard
            title="MITARBEITER"
            value={dashboard.employees}
            text="Aktive Mitarbeiter"
          />

          <StatCard
            title="FILIALEN"
            value={dashboard.branches}
            text="Aktive Filialen"
          />

          <StatCard
            title="BESUCHE"
            value={dashboard.visits}
            text="Check-ins insgesamt"
          />

          <StatCard
            title="UMSATZ"
            value={formatEuro(dashboard.revenue)}
            text="Gesamt bezahlter Umsatz"
          />

          <StatCard
            title="ZAHLUNGEN"
            value={dashboard.payments.paid}
            text="Erfolgreich bezahlt"
          />

          <StatCard
            title="AKTIVE ABOS"
            value={dashboard.subscriptions.active}
            text="Aktive Memberships"
          />

          <StatCard
            title="ABGELAUFEN"
            value={dashboard.subscriptions.expired}
            text="Abgelaufene Memberships"
          />

          <StatCard
            title="QR-CODES"
            value={
              qrCodes !== null
                ? qrCodes
                : "–"
            }
            text="Aktive QR-Codes"
          />
        </section>

        {/* ====================================================== */}
        {/* UMSATZ + MEMBERSHIP                                     */}
        {/* ====================================================== */}

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Umsatz */}
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
                  UMSATZ
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Umsatzentwicklung
                </h2>

                <p className="mt-1 text-sm text-white/30">
                  Bezahlter Umsatz der letzten 7 Tage
                </p>
              </div>

              <div className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/40">
                LETZTE 7 TAGE
              </div>
            </div>

            <div className="mt-8 flex h-64 items-end gap-3">
              {dashboard.revenueLast7Days.map(
                (day) => {
                  const height =
                    day.revenue > 0
                      ? Math.max(
                          (day.revenue /
                            maxRevenue) *
                            100,
                          8,
                        )
                      : 3;

                  return (
                    <div
                      key={day.name}
                      className="flex flex-1 flex-col items-center justify-end gap-3"
                    >
                      <span className="text-center text-[10px] text-white/40 sm:text-xs">
                        {formatEuro(day.revenue)}
                      </span>

                      <div
                        className="w-full rounded-t-xl bg-white/80 transition hover:bg-white"
                        style={{
                          height: `${height}%`,
                        }}
                      />

                      <span className="text-xs text-white/30">
                        {day.name}
                      </span>
                    </div>
                  );
                },
              )}
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/30">
                  Gesamtumsatz
                </span>

                <span className="font-black">
                  {formatEuro(
                    dashboard.revenue,
                  )}
                </span>
              </div>
            </div>
          </section>

          {/* Membership */}
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
              MEMBERSHIPS
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Membership-Status
            </h2>

            <p className="mt-1 text-sm text-white/30">
              Aktive und abgelaufene Abonnements
            </p>

            <div className="mt-10 flex justify-center">
              <div
                className="relative flex h-56 w-56 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(
                    white ${activePercentage}%,
                    rgba(255,255,255,0.10) ${activePercentage}% 100%
                  )`,
                }}
              >
                <div className="absolute inset-[28px] flex items-center justify-center rounded-full bg-black">
                  <div className="text-center">
                    <p className="text-5xl font-black">
                      {activePercentage}%
                    </p>

                    <p className="mt-1 text-xs uppercase tracking-widest text-white/30">
                      AKTIV
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <MiniStat
                title="AKTIV"
                value={
                  dashboard.subscriptions
                    .active
                }
              />

              <MiniStat
                title="ABGELAUFEN"
                value={
                  dashboard.subscriptions
                    .expired
                }
              />

              {dashboard.subscriptions
                .cancelled !== undefined && (
                <MiniStat
                  title="STORNIERT"
                  value={
                    dashboard
                      .subscriptions
                      .cancelled
                  }
                />
              )}
            </div>
          </section>
        </section>

        {/* ====================================================== */}
        {/* UMSATZ NACH PAKET                                       */}
        {/* ====================================================== */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
              PAKETE
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Umsatz nach Paket
            </h2>

            <p className="mt-1 text-sm text-white/30">
              Aktueller Umsatz pro Paket
            </p>
          </div>

          {packageData.length > 0 ? (
            <PackageRevenueChart
              data={packageData}
            />
          ) : (
            <EmptyData
              text="Noch keine Paket-Umsatzdaten vom Backend vorhanden."
            />
          )}
        </section>

        {/* ====================================================== */}
        {/* FILIALEN                                                */}
        {/* ====================================================== */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
                FILIALEN
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Filial-Performance
              </h2>

              <p className="mt-1 text-sm text-white/30">
                Übersicht über deine Filialen
              </p>
            </div>

            <button
              onClick={() =>
                router.push(
                  "/admin/branches",
                )
              }
              className="rounded-full border border-white/10 px-5 py-3 text-sm font-bold transition hover:bg-white hover:text-black"
            >
              FILIALEN VERWALTEN
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <BranchCard
              name="Gesamte Filialen"
              visits={dashboard.visits}
              employees={dashboard.employees}
            />

            <BranchCard
              name="Aktive Filialen"
              visits={dashboard.visits}
              employees={dashboard.employees}
            />

            <BranchCard
              name="Kundenbasis"
              visits={dashboard.visits}
              employees={dashboard.customers}
            />
          </div>
        </section>

        {/* ====================================================== */}
        {/* FILIAL UMSATZ                                           */}
        {/* ====================================================== */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
              FILIALUMSATZ
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Umsatz nach Filiale
            </h2>

            <p className="mt-1 text-sm text-white/30">
              Vergleich der Filialumsätze
            </p>
          </div>

          {branchRevenueData.length > 0 ? (
            <BranchRevenueChart
              data={branchRevenueData}
            />
          ) : (
            <EmptyData
              text="Noch keine Filial-Umsatzdaten vom Backend vorhanden."
            />
          )}
        </section>

        {/* ====================================================== */}
        {/* ZAHLUNGEN                                              */}
        {/* ====================================================== */}

        <section className="mt-6 grid gap-6 sm:grid-cols-3">
          <MiniStatLarge
            title="ERFOLGREICH BEZAHLT"
            value={dashboard.payments.paid}
          />

          <MiniStatLarge
            title="AUSSTEHEND"
            value={
              dashboard.payments.pending ??
              "–"
            }
          />

          <MiniStatLarge
            title="FEHLGESCHLAGEN"
            value={
              dashboard.payments.failed ??
              "–"
            }
          />
        </section>

        {/* ====================================================== */}
        {/* LETZTE AKTIVITÄTEN                                      */}
        {/* ====================================================== */}

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5">
          <div className="border-b border-white/10 px-6 py-5 md:px-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
              AKTIVITÄTEN
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Letzte Aktivitäten
            </h2>

            <p className="mt-1 text-sm text-white/30">
              Aktuelle Vorgänge im System
            </p>
          </div>

          {activities.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-white/40">
                  <tr>
                    <th className="px-6 py-4 font-medium md:px-8">
                      Kunde
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Ereignis
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Betrag
                    </th>

                    <th className="px-6 py-4 font-medium">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {activities.map(
                    (activity, index) => (
                      <tr
                        key={`${activity.customer}-${activity.event}-${index}`}
                        className="border-t border-white/10"
                      >
                        <td className="px-6 py-4 font-medium md:px-8">
                          {activity.customer}
                        </td>

                        <td className="px-6 py-4 text-white/50">
                          {activity.event}
                        </td>

                        <td className="px-6 py-4">
                          {activity.amount}
                        </td>

                        <td className="px-6 py-4">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium">
                            {activity.status}
                          </span>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyData
              text="Noch keine Aktivitätsdaten vom Backend vorhanden."
            />
          )}
        </section>

        {/* ====================================================== */}
        {/* VERWALTUNG                                              */}
        {/* ====================================================== */}

        <section className="mt-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
            VERWALTUNG
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminButton
              title="KUNDEN"
              text="Kunden verwalten"
              onClick={() =>
                router.push(
                  "/admin/customers",
                )
              }
            />

            <AdminButton
              title="MITARBEITER"
              text="Mitarbeiter verwalten"
              onClick={() =>
                router.push(
                  "/admin/employees",
                )
              }
            />

            <AdminButton
              title="FILIALEN"
              text="Filialen verwalten"
              onClick={() =>
                router.push(
                  "/admin/branches",
                )
              }
            />

            <AdminButton
              title="BESUCHE"
              text="Check-ins ansehen"
              onClick={() =>
                router.push(
                  "/admin/visits",
                )
              }
            />

            <AdminButton
              title="PAKETE"
              text="Pakete und Preise verwalten"
              onClick={() =>
                router.push(
                  "/admin/packages",
                )
              }
            />

            <AdminButton
              title="ABOS"
              text="Abonnements verwalten"
              onClick={() =>
                router.push(
                  "/admin/subscriptions",
                )
              }
            />

            <AdminButton
              title="ZAHLUNGEN"
              text="Zahlungen ansehen"
              onClick={() =>
                router.push(
                  "/admin/payments",
                )
              }
            />

            <AdminButton
              title="QR-CODES"
              text="QR-Codes verwalten"
              onClick={() =>
                router.push(
                  "/admin/qrcodes",
                )
              }
            />
          </div>
        </section>

        {/* ====================================================== */}
        {/* ADMIN ACCOUNT                                           */}
        {/* ====================================================== */}

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
            ADMIN ACCOUNT
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Info
              title="NAME"
              value={`${user.firstName} ${user.lastName}`}
            />

            <Info
              title="E-MAIL"
              value={user.email}
            />

            <Info
              title="ROLLE"
              value={user.role}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

/* ============================================================= */
/* HELPERS                                                       */
/* ============================================================= */

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

/* ============================================================= */
/* STAT CARD                                                      */
/* ============================================================= */

function StatCard({
  title,
  value,
  text,
}: {
  title: string;
  value: string | number;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-7 transition hover:border-white/20">
      <p className="text-xs font-bold tracking-[0.2em] text-white/30">
        {title}
      </p>

      <p className="mt-5 text-4xl font-black md:text-5xl">
        {value}
      </p>

      <p className="mt-2 text-sm text-white/30">
        {text}
      </p>
    </div>
  );
}

/* ============================================================= */
/* MINI STAT                                                       */
/* ============================================================= */

function MiniStat({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs text-white/30">
        {title}
      </p>

      <p className="mt-2 text-2xl font-black">
        {value}
      </p>
    </div>
  );
}

/* ============================================================= */
/* LARGE MINI STAT                                                */
/* ============================================================= */

function MiniStatLarge({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <p className="text-xs font-bold tracking-[0.2em] text-white/30">
        {title}
      </p>

      <p className="mt-4 text-4xl font-black">
        {value}
      </p>
    </div>
  );
}

/* ============================================================= */
/* BRANCH CARD                                                    */
/* ============================================================= */

function BranchCard({
  name,
  visits,
  employees,
}: {
  name: string;
  visits: number | string;
  employees: number | string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 p-5 transition hover:border-white/20">
      <p className="font-bold">
        {name}
      </p>

      <div className="mt-5 flex justify-between text-sm">
        <span className="text-white/30">
          Besuche
        </span>

        <span className="font-bold">
          {visits}
        </span>
      </div>

      <div className="mt-3 flex justify-between text-sm">
        <span className="text-white/30">
          Mitarbeiter
        </span>

        <span className="font-bold">
          {employees}
        </span>
      </div>
    </div>
  );
}

/* ============================================================= */
/* PACKAGE REVENUE CHART                                          */
/* ============================================================= */

function PackageRevenueChart({
  data,
}: {
  data: {
    name: string;
    revenue: number;
  }[];
}) {
  const max = Math.max(
    ...data.map((item) => item.revenue),
    1,
  );

  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      {data.map((item) => {
        const percentage =
          (item.revenue / max) * 100;

        return (
          <div
            key={item.name}
            className="rounded-2xl border border-white/10 bg-black/20 p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="font-bold">
                {item.name}
              </span>

              <span className="text-sm text-white/50">
                {formatEuro(item.revenue)}
              </span>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================= */
/* BRANCH REVENUE CHART                                           */
/* ============================================================= */

function BranchRevenueChart({
  data,
}: {
  data: {
    name: string;
    revenue: number;
  }[];
}) {
  const max = Math.max(
    ...data.map((item) => item.revenue),
    1,
  );

  return (
    <div className="mt-8 space-y-5">
      {data.map((item) => {
        const percentage =
          (item.revenue / max) * 100;

        return (
          <div key={item.name}>
            <div className="mb-2 flex items-center justify-between gap-4">
              <span className="font-bold">
                {item.name}
              </span>

              <span className="text-sm text-white/50">
                {formatEuro(item.revenue)}
              </span>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================= */
/* EMPTY DATA                                                     */
/* ============================================================= */

function EmptyData({
  text,
}: {
  text: string;
}) {
  return (
    <div className="mt-8 rounded-2xl border border-dashed border-white/10 bg-black/20 p-10 text-center">
      <p className="text-sm text-white/30">
        {text}
      </p>
    </div>
  );
}

/* ============================================================= */
/* ADMIN BUTTON                                                   */
/* ============================================================= */

function AdminButton({
  title,
  text,
  onClick,
}: {
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-3xl border border-white/10 bg-white/5 p-6 text-left transition hover:bg-white hover:text-black"
    >
      <p className="font-black">
        {title}
      </p>

      <p className="mt-2 text-sm text-white/40">
        {text}
      </p>
    </button>
  );
}

/* ============================================================= */
/* INFO                                                            */
/* ============================================================= */

function Info({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <p className="text-xs tracking-[0.2em] text-white/30">
        {title}
      </p>

      <p className="mt-2 break-all font-semibold">
        {value}
      </p>
    </div>
  );
}