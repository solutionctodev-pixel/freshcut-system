"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const packageId = searchParams.get("packageId");
  const packageName = searchParams.get("name");
  const price = searchParams.get("price");
  const billingInterval = searchParams.get("billingInterval");

  const [submitting, setSubmitting] = useState(false);

  async function handleCheckout() {
    if (!packageId || !packageName || !price) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch("http://localhost:3000/payments/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageId,
          packageName,
          price: Number(price),
          billingInterval: billingInterval || "MONTHLY",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Checkout konnte nicht erstellt werden.");
      }

      if (!data.url) {
        throw new Error("Keine Stripe-Checkout-URL erhalten.");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert("Die Zahlung konnte nicht gestartet werden.");
      setSubmitting(false);
    }
  }

  if (!packageId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="text-white/50">
            Kein Paket ausgewählt.
          </p>

          <button
            type="button"
            onClick={() => router.push("/packages")}
            className="mt-6 rounded-full bg-white px-8 py-3 text-sm font-bold text-black"
          >
            ZURÜCK ZU DEN PAKETEN
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">

        <button
          type="button"
          onClick={() => router.push("/packages")}
          className="text-sm text-white/50 transition hover:text-white"
        >
          ← Zurück zu den Paketen
        </button>

        <div className="mt-10">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/40">
            FRESHCUT
          </p>

          <h1 className="mt-3 text-5xl font-black">
            CHECKOUT
          </h1>

          <p className="mt-4 text-white/50">
            Überprüfe deine Auswahl vor dem Abschluss.
          </p>
        </div>

        <section className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8">

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
            DEIN PAKET
          </p>

          <h2 className="mt-4 text-3xl font-black">
            {packageName || "Paket"}
          </h2>

          <div className="mt-6">
            <span className="text-4xl font-black">
              {price
                ? Number(price).toFixed(2).replace(".", ",")
                : "0,00"}{" "}
              €
            </span>

            <span className="ml-2 text-sm text-white/40">
              / {billingInterval === "YEARLY" ? "Jahr" : "Monat"}
            </span>
          </div>

          <div className="mt-8">
            <p className="mb-4 text-sm font-bold text-white/70">
              ZAHLUNGSART
            </p>

            <div className="rounded-2xl border border-white/20 bg-white/10 p-5">
              <p className="font-bold">
                Karte
              </p>

              <p className="mt-1 text-sm text-white/40">
                Kreditkarte oder Debitkarte
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={submitting}
            className="mt-8 w-full rounded-full bg-white px-8 py-4 text-sm font-bold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "WIRD GELADEN..."
              : "ZAHLUNG EINRICHTEN"}
          </button>

        </section>
      </div>
    </main>
  );
}