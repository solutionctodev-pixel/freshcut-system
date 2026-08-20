


































"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
};

type Dashboard = {
  customers: number;
  employees: number;
  branches: number;
  visits: number;
  subscriptions: {
    active: number;
    expired: number;
  };
  payments: {
    paid: number;
  };
  revenue: number;
  revenueLast7Days: {
    name: string;
    revenue: number;
  }[];
};

export default function AdminPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    async function loadAdmin() {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const meResponse = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!meResponse.ok) {
          localStorage.removeItem("access_token");
          router.replace("/login");
          return;
        }

        const me = await meResponse.json();

        if (me.role !== "SUPER_ADMIN") {
          router.replace("/");
          return;
        }

        setUser(me);

        const dashboardResponse = await fetch(
          `${API_URL}/admin/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!dashboardResponse.ok) {
          throw new Error("Dashboard konnte nicht geladen werden.");
        }

        const dashboardData = await dashboardResponse.json();
        setDashboard(dashboardData);
      } catch (error) {
        console.error("Admin Fehler:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAdmin();
  }, [router, API_URL]);

  function logout() {
    localStorage.removeItem("access_token");
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-sm uppercase tracking-[0.3em] text-white/40">
          FRESHCUT WIRD GELADEN...
        </p>
      </main>
    );
  }

  if (!user || !dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-xl font-bold">
            Dashboard konnte nicht geladen werden.
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-5 rounded-full bg-white px-5 py-3 text-sm font-bold text-black"
          >
            ERNEUT VERSUCHEN
          </button>
        </div>
      </main>
    );
  }

  const maxRevenue = Math.max(
    ...dashboard.revenueLast7Days.map((day) => day.revenue),
    1,
  );

  const totalMemberships =
    dashboard.subscriptions.active +
    dashboard.subscriptions.expired;

  const activePercentage =
    totalMemberships > 0
      ? Math.round(
          (dashboard.subscriptions.active / totalMemberships) * 100,
        )
      : 0;

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <div className="text-2xl font-black">
              FRESHCUT
            </div>

            <div className="mt-1 text-xs uppercase tracking-[0.3em] text-white/30">
              ADMIN DASHBOARD
            </div>
          </div>

          <button
            onClick={logout}
            className="rounded-full border border-white/10 px-5 py-2 text-sm text-white/60 transition hover:bg-white hover:text-black"
          >
            ABMELDEN
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/30">
            ÜBERSICHT
          </p>

          <h1 className="mt-3 text-5xl font-black md:text-7xl">
            Hallo {user.firstName}.
          </h1>

          <p className="mt-4 text-white/40">
            Deine FreshCut Unternehmensübersicht.
          </p>
        </div>

        {/* KPIs */}
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>

        {/* Charts */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
              UMSATZ
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Umsatzentwicklung
            </h2>

            <p className="mt-1 text-sm text-white/30">
              Bezahlter Umsatz der letzten 7 Tage
            </p>

            <div className="mt-8 flex h-64 items-end gap-3">
              {dashboard.revenueLast7Days.map((day) => {
                const height =
                  day.revenue > 0
                    ? Math.max((day.revenue / maxRevenue) * 100, 8)
                    : 3;

                return (
                  <div
                    key={day.name}
                    className="flex flex-1 flex-col items-center justify-end gap-3"
                  >
                    <span className="text-xs text-white/40">
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
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
              MEMBERSHIPS
            </p>

            <h2 className="mt-2 text-2xl font-black">
              Membership-Status
            </h2>

            <div className="mt-10 flex justify-center">
              <div className="relative flex h-56 w-56 items-center justify-center rounded-full border-[28px] border-white/10">
                <div
                  className="absolute inset-0 rounded-full border-[28px] border-white border-r-transparent border-b-transparent"
                  style={{
                    transform: `rotate(${45 + activePercentage * 3.6}deg)`,
                  }}
                />

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

            <div className="mt-8 grid grid-cols-2 gap-4">
              <MiniStat
                title="AKTIV"
                value={dashboard.subscriptions.active}
              />

              <MiniStat
                title="ABGELAUFEN"
                value={dashboard.subscriptions.expired}
              />
            </div>
          </section>
        </div>

        {/* Filialen */}
        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
                FILIALEN
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Filial-Performance
              </h2>
            </div>

            <button
              onClick={() => router.push("/admin/branches")}
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

        {/* Verwaltung */}
        <section className="mt-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
            VERWALTUNG
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminButton
              title="KUNDEN"
              text="Kunden verwalten"
              onClick={() => router.push("/admin/customers")}
            />

            <AdminButton
              title="MITARBEITER"
              text="Mitarbeiter verwalten"
              onClick={() => router.push("/admin/employees")}
            />

            <AdminButton
              title="FILIALEN"
              text="Filialen verwalten"
              onClick={() => router.push("/admin/branches")}
            />

            <AdminButton
              title="BESUCHE"
              text="Check-ins ansehen"
              onClick={() => router.push("/admin/visits")}
            />
          </div>
        </section>

        {/* Admin Account */}
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

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

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
    <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
      <p className="text-xs font-bold tracking-[0.2em] text-white/30">
        {title}
      </p>

      <p className="mt-5 text-4xl font-black">
        {value}
      </p>

      <p className="mt-2 text-sm text-white/30">
        {text}
      </p>
    </div>
  );
}

function MiniStat({
  title,
  value,
}: {
  title: string;
  value: number;
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

function BranchCard({
  name,
  visits,
  employees,
}: {
  name: string;
  visits: number;
  employees: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 p-5">
      <p className="font-bold">{name}</p>

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




