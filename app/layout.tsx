import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import Link from "next/link";
import { Logo } from "@/components/logo";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RailAED — UAE → Anywhere · USDC on Arc",
  description:
    "Pay in AED, settle in USDC on Arc, deliver to any corridor in seconds. Built for the Stablecoin Commerce Stack Challenge.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col brand-grad relative">
        <header className="absolute top-0 inset-x-0 z-30">
          <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-5">
            {/* Left: project tag chip */}
            <Link href="/" className="pill-outline">
              <span className="text-[color:var(--cream-300)]">Stablecoin Remittance</span>
            </Link>

            {/* Right: meta chips + logo lockup, like the reference */}
            <div className="flex items-center gap-3">
              <NavChip href="/send">Send</NavChip>
              <NavChip href="/payroll">Payroll</NavChip>
              <span className="pill-outline text-[color:var(--cream-400)] hidden sm:inline-flex">2026</span>
              <Link href="/" className="ml-1">
                <Logo size="xs" variant="mark" />
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 pt-20">{children}</main>
        <footer className="border-t border-[color:var(--border)] bg-[color:var(--surface-deep)]/40">
          <div className="mx-auto max-w-7xl px-6 py-5 text-xs text-[color:var(--cream-500)] flex flex-wrap items-center justify-between gap-2">
            <div>
              For the <span className="text-[color:var(--cream-300)]">Stablecoin Commerce Stack Challenge</span> · Track 1 · Testnet demo only.
            </div>
            <div className="font-mono">Arc · chain 5042002</div>
          </div>
        </footer>
      </body>
    </html>
  );
}

function NavChip({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="pill-outline">
      {children}
    </Link>
  );
}
