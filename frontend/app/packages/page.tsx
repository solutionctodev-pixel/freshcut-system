"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type PackageItem = {
  id: string;
  name: string;
  description?: string | null;
  price: string;
  type: "SUBSCRIPTION" | "CREDIT" | "HYBRID";
  creditsPerPeriod?: number | null;
  visitsPerPeriod?: number | null;
  durationDays?: number | null;
  billingInterval: "MONTHLY" | "YEARLY";
  active: boolean;
};

export default function PackagesPage() {
  const router = useRouter();

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [selectedPackage, setSelectedPackage] =
    useState<PackageItem | null>(null);

const [loading, setLoading] = useState(true);
const [message, setMessage] = useState("");
const [submitting, setSubmitting] = useState(false);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://10.25.247.145:3000";

  useEffect(() => {
    async function loadPackages() {
      const token =
        localStorage.getItem("access_token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/packages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            Array.isArray(result.message)
              ? result.message.join(", ")
              : result.message ||
                  "Pakete konnten nicht geladen werden.",
          );
        }

        setPackages(
          Array.isArray(result) ? result : [],
        );
      } catch (error) {
        console.error(error);

        setMessage(
          error instanceof Error
            ? error.message
            : "Pakete konnten nicht geladen werden.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadPackages();
  }, [API_URL, router]);

  function selectPackage(item: PackageItem) {
    setSelectedPackage(item);
    setMessage("");
  }
 async function createSubscription() {

if (!selectedPackage) {
  console.log("KEIN PAKET AUSGEWÄHLT");
  return;
}

  setSubmitting(true);
  setMessage("");

  try {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const response = await fetch(
      
      `${API_URL}/subscriptions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          packageId: selectedPackage.id,
        }),
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        Array.isArray(result.message)
          ? result.message.join(", ")
          : result.message ||
              "Abo konnte nicht erstellt werden.",
      );
    }

   setMessage("Abo erfolgreich erstellt.");
    
  } catch (error) {
    console.error(error);

    setMessage(
      error instanceof Error
        ? error.message
        : "Abo konnte nicht erstellt werden.",
    );
  } finally {
    setSubmitting(false);
  }
}

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-sm tracking-widest text-white/40">
          PAKETE WERDEN GELADEN...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">



        <div className="mt-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/40">
            FRESHCUT
          </p>

          <h1 className="mt-3 text-5xl font-black">
            PAKETE
          </h1>

          <p className="mt-4 max-w-xl text-white/50">
            Wähle das FreshCut-Paket, das zu dir passt.
          </p>
        </div>

        {message && (
          <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5 text-sm">
            {message}
          </div>
        )}

        {!message && packages.length === 0 && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-white/50">
              Aktuell sind keine Pakete verfügbar.
            </p>
          </div>
        )}

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

          {packages
            .filter((item) => item.active)
            .map((item) => {
              const isSelected =
                selectedPackage?.id === item.id;

              return (
                <article
                  key={item.id}
                  className={`rounded-3xl border p-7 transition ${
                    isSelected
                      ? "border-white bg-white/10"
                      : "border-white/10 bg-white/5 hover:border-white/25"
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                    {item.type}
                  </p>

                  <h2 className="mt-4 text-2xl font-black">
                    {item.name}
                  </h2>

                  {item.description && (
                    <p className="mt-3 text-sm leading-6 text-white/50">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-8">
                    <span className="text-4xl font-black">
                      {Number(item.price)
                        .toFixed(2)
                        .replace(".", ",")}{" "}
                      €
                    </span>
<span className="ml-2 text-sm text-white/40">
  / {item.billingInterval === "MONTHLY" ? "Monat" : "Jahr"}
</span>
                  </div>

                  {item.creditsPerPeriod !== null &&
                    item.creditsPerPeriod !==
                      undefined && (
                      <div className="mt-6 border-t border-white/10 pt-5 text-sm text-white/60">
                        Guthaben:{" "}
                        <span className="font-bold text-white">
                          {item.creditsPerPeriod}
                        </span>
                      </div>
                    )}

                  {item.visitsPerPeriod !== null &&
                    item.visitsPerPeriod !==
                      undefined && (
                      <div className="mt-3 text-sm text-white/60">
                        Besuche:{" "}
                        <span className="font-bold text-white">
                          {item.visitsPerPeriod}
                        </span>
                      </div>
                    )}

                  <button
                    type="button"
                    onClick={() =>
                      selectPackage(item)
                    }
                    className={`mt-8 w-full rounded-full px-6 py-3 text-sm font-bold transition ${
                      isSelected
                        ? "bg-white text-black"
                        : "bg-white/10 text-white hover:bg-white hover:text-black"
                    }`}
                  >
                    {isSelected
                      ? "AUSGEWÄHLT"
                      : "PAKET AUSWÄHLEN"}
                  </button>
                </article>
              );
            })}

        </div>

        {selectedPackage && (
          <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
              DEINE AUSWAHL
            </p>

            <h2 className="mt-4 text-3xl font-black">
              {selectedPackage.name}
            </h2>

            <p className="mt-2 text-white/50">
              {Number(selectedPackage.price)
                .toFixed(2)
                .replace(".", ",")}{" "}
              €
            </p>

   <p className="mt-2 text-sm text-white/50">
  Abrechnung:{" "}
  {selectedPackage.billingInterval === "MONTHLY"
    ? "monatlich"
    : "jährlich"}
</p>

{message === "Abo erfolgreich erstellt." && (
  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white">
    Abo erfolgreich erstellt.
  </div>
)}
            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5">
              <p className="text-sm text-white/60">
                Du hast dieses Paket ausgewählt.
              </p>

              <p className="mt-2 text-sm text-white/40">
                Der Abschluss und die Zahlung werden
                im nächsten Schritt eingerichtet.
              </p>
            </div>

<button
  type="button"
  onClick={() => {
    if (!selectedPackage) return;

    const params = new URLSearchParams({
      packageId: selectedPackage.id,
      name: selectedPackage.name,
      price: selectedPackage.price,
      billingInterval: selectedPackage.billingInterval,
    });

    window.location.href = `/checkout?${params.toString()}`;
  }}
  className="mt-6 rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition hover:bg-white/90"
>
  WEITER ZUM ABSCHLUSS
</button>

            <button
              type="button"
              onClick={() =>
                setSelectedPackage(null)
              }
              className="ml-3 rounded-full border border-white/10 px-8 py-4 text-sm font-bold text-white/60 transition hover:bg-white hover:text-black"
            >
              AUSWAHL AUFHEBEN
            </button>

          </section>
        )}

      </div>
    </main>
  );
}