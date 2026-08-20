"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type ScanResult = {
  success?: boolean;
  message?: string;
  visit?: {
    id?: string;
    checkInAt?: string;

    branch?: {
      name?: string;
    };

    customer?: {
      user?: {
        firstName?: string;
        lastName?: string;
        email?: string;
      };
    };

    employee?: {
      user?: {
        firstName?: string;
        lastName?: string;
      };
    };
  };
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

export default function ScanPage() {
  const router = useRouter();

  const scannerRef = useRef<any>(null);
  const processingRef = useRef(false);

  const [message, setMessage] = useState("");
  const [scanning, setScanning] = useState(true);
  const [result, setResult] =
    useState<ScanResult | null>(null);

  useEffect(() => {
    let mounted = true;

    async function startScanner() {
      const token =
        localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const { Html5Qrcode } =
        await import("html5-qrcode");

      if (!mounted) return;

      const scanner =
        new Html5Qrcode("qr-reader");

      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 250,
            },
          },

          async (decodedText: string) => {
            if (
              !mounted ||
              processingRef.current
            ) {
              return;
            }

            processingRef.current = true;

            setScanning(false);
            setMessage(
              "QR-Code erkannt. Prüfe Kunde...",
            );
            setResult(null);

            try {
              await scanner.stop();
            } catch {
              // Scanner war eventuell bereits gestoppt
            }

            try {
              const response =
                await fetch(
                  `${API_URL}/visits/scan`,
                  {
                    method: "POST",

                    headers: {
                      "Content-Type":
                        "application/json",
                      Authorization:
                        `Bearer ${token}`,
                    },

                    body: JSON.stringify({
                      token: decodedText,
                    }),
                  },
                );

              const data =
                (await response.json()) as ScanResult;

              if (!response.ok) {
                const errorMessage =
                  Array.isArray(data.message)
                    ? data.message.join(", ")
                    : data.message ||
                      "Check-in fehlgeschlagen";

                throw new Error(
                  errorMessage,
                );
              }

              setResult(data);

              setMessage(
                data.message ||
                  "Kunde erfolgreich eingecheckt.",
              );
            } catch (error) {
              console.error(
                "QR-Scan Fehler:",
                error,
              );

              setMessage(
                error instanceof Error
                  ? error.message
                  : "Check-in fehlgeschlagen",
              );

              setScanning(true);
              processingRef.current = false;

              // Scanner nach Fehler erneut starten
              try {
                await scanner.start(
                  {
                    facingMode:
                      "environment",
                  },
                  {
                    fps: 10,
                    qrbox: {
                      width: 250,
                      height: 250,
                    },
                  },
                  async (
                    text: string,
                  ) => {
                    if (
                      processingRef.current
                    ) {
                      return;
                    }

                    processingRef.current =
                      true;

                    setScanning(false);

                    try {
                      const retryResponse =
                        await fetch(
                          `${API_URL}/visits/scan`,
                          {
                            method: "POST",

                            headers: {
                              "Content-Type":
                                "application/json",
                              Authorization:
                                `Bearer ${token}`,
                            },

                            body: JSON.stringify({
                              token: text,
                            }),
                          },
                        );

                      const retryData =
                        (await retryResponse.json()) as ScanResult;

                      if (
                        !retryResponse.ok
                      ) {
                        throw new Error(
                          Array.isArray(
                            retryData.message,
                          )
                            ? retryData.message.join(
                                ", ",
                              )
                            : retryData.message ||
                                "Check-in fehlgeschlagen",
                        );
                      }

                      setResult(
                        retryData,
                      );

                      setMessage(
                        retryData.message ||
                          "Kunde erfolgreich eingecheckt.",
                      );
                    } catch (retryError) {
                      console.error(
                        retryError,
                      );

                      setMessage(
                        retryError instanceof
                          Error
                          ? retryError.message
                          : "Check-in fehlgeschlagen",
                      );

                      setScanning(true);
                      processingRef.current =
                        false;
                    }
                  },
                  () => {},
                );
              } catch (restartError) {
                console.error(
                  "Scanner konnte nicht neu gestartet werden:",
                  restartError,
                );
              }
            }
          },

          () => {
            // QR-Code noch nicht erkannt
          },
        );
      } catch (error) {
        console.error(
          "Kamera Fehler:",
          error,
        );

        if (mounted) {
          setMessage(
            "Kamera konnte nicht gestartet werden. Bitte erlaube den Kamera-Zugriff.",
          );

          setScanning(false);
        }
      }
    }

    startScanner();

    return () => {
      mounted = false;

      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .catch(() => {});
      }
    };
  }, [router]);

  const customer =
    result?.visit?.customer?.user;

  const branch =
    result?.visit?.branch;

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <button
            onClick={() =>
              router.push("/employee")
            }
            className="text-sm text-white/50 transition hover:text-white"
          >
            ← Zurück
          </button>

          <div className="text-xl font-black tracking-tight">
            FRESHCUT
          </div>

          <div className="w-12" />
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/40">
          CHECK-IN
        </p>

        <h1 className="mt-3 text-4xl font-black md:text-5xl">
          QR-CODE SCANNEN
        </h1>

        <p className="mt-3 text-white/50">
          Richte die Kamera auf den QR-Code
          des Kunden.
        </p>

        <div
          className={`mt-8 overflow-hidden rounded-3xl border p-4 ${
            result
              ? "border-white/20 bg-white/10"
              : "border-white/10 bg-white/5"
          }`}
        >
          <div id="qr-reader" />
        </div>

        {message && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm font-bold">
              {message}
            </p>

            {result?.visit && (
              <div className="mt-6 space-y-5">
                <div>
                  <p className="text-xs uppercase tracking-widest text-white/30">
                    KUNDE
                  </p>

                  <p className="mt-1 text-2xl font-black">
                    {customer?.firstName}{" "}
                    {customer?.lastName}
                  </p>

                  {customer?.email && (
                    <p className="mt-1 text-sm text-white/40">
                      {customer.email}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-white/30">
                    FILIALE
                  </p>

                  <p className="mt-1 font-bold">
                    {branch?.name ||
                      "FreshCut Filiale"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-white/30">
                    STATUS
                  </p>

                  <p className="mt-1 font-bold">
                    CHECK-IN ERFOLGREICH
                  </p>
                </div>

                {result.visit
                  .checkInAt && (
                  <div>
                    <p className="text-xs uppercase tracking-widest text-white/30">
                      ZEIT
                    </p>

                    <p className="mt-1 font-bold">
                      {new Date(
                        result.visit.checkInAt,
                      ).toLocaleString(
                        "de-DE",
                      )}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => {
                    setResult(null);
                    setMessage("");
                    processingRef.current =
                      false;
                    setScanning(true);

                    window.location.reload();
                  }}
                  className="mt-4 w-full rounded-full bg-white px-8 py-4 font-bold text-black transition hover:bg-white/80"
                >
                  NÄCHSTEN KUNDEN SCANNEN
                </button>
              </div>
            )}
          </div>
        )}

        {scanning && (
          <p className="mt-5 text-center text-xs uppercase tracking-widest text-white/30">
            Kamera aktiv – QR-Code suchen...
          </p>
        )}

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
          <p className="text-xs uppercase tracking-widest text-white/30">
            API
          </p>

          <p className="mt-2 break-all text-sm text-white/50">
            {API_URL}
          </p>
        </div>
      </div>
    </main>
  );
}