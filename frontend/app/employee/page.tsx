"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type EmployeeData = {
  id: string;
  userId: string;
  branchId: string;

  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };

  branch?: {
    name?: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };


};

export default function EmployeePage() {
  const router = useRouter();

  const [employee, setEmployee] =
    useState<EmployeeData | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    fetch("http://localhost:3000/employees/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(
            "Mitarbeiter konnte nicht geladen werden",
          );
        }

        return response.json();
      })
      .then((data) => {
        setEmployee(data);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [router]);

  function logout() {
    localStorage.removeItem("access_token");
    router.push("/login");
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

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="text-2xl font-black">
            FRESHCUT
          </div>

          <button
            onClick={logout}
            className="rounded-full border border-white/10 px-5 py-2 text-sm text-white/60 transition hover:bg-white hover:text-black"
          >
            ABMELDEN
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/40">
          MITARBEITER
        </p>

        <h1 className="mt-3 text-4xl font-black md:text-6xl">
          Hallo{" "}
          {employee?.user?.firstName ||
            "Mitarbeiter"}
          .
        </h1>

        <p className="mt-3 text-white/50">
          Willkommen im FreshCut Mitarbeiterbereich.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
              DEINE FILIALE
            </p>

            <h2 className="mt-5 text-3xl font-black">
              {employee?.branch?.name ||
                "FreshCut Filiale"}
            </h2>

            <p className="mt-3 text-white/50">
              {employee?.branch?.address}
            </p>

            <p className="text-white/50">
              {employee?.branch?.postalCode}{" "}
              {employee?.branch?.city}
            </p>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
              CHECK-IN
            </p>

            <h2 className="mt-5 text-3xl font-black">
              Kunde einchecken
            </h2>

            <p className="mt-3 text-white/50">
              Scanne den persönlichen QR-Code des
              Kunden.
            </p>

            <button
              onClick={() => router.push("/scan")}
              className="mt-8 w-full rounded-full bg-white px-8 py-4 font-bold text-black transition hover:bg-white/80"
            >
              QR-CODE SCANNEN
            </button>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
            ACCOUNT
          </p>

          <p className="mt-5 text-white/70">
            {employee?.user?.firstName}{" "}
            {employee?.user?.lastName}
          </p>

          <p className="mt-1 text-sm text-white/40">
            {employee?.user?.email}
          </p>
        </section>
      </div>
    </main>
  );
}