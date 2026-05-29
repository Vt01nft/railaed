import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { SignInButton } from "@/components/sign-in-button";
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
  metadataBase: new URL("https://railaed-uae.vercel.app"),
  title: {
    default: "RailAED · UAE → Anywhere · USDC on Arc",
    template: "%s · RailAED",
  },
  description:
    "Pay in AED, settle in USDC on Arc, deliver to any corridor in seconds. Live honesty score against Al Ansari, Wise, Western Union and Remitly. Built for the Stablecoin Commerce Stack Challenge.",
  keywords: [
    "stablecoin remittance",
    "USDC",
    "Arc blockchain",
    "Circle",
    "UAE",
    "AED",
    "cross-border payments",
    "global payroll",
    "Stablecoin Commerce Stack Challenge",
  ],
  authors: [{ name: "RailAED" }],
  applicationName: "RailAED",
  openGraph: {
    type: "website",
    siteName: "RailAED",
    title: "RailAED · UAE → Anywhere · USDC on Arc",
    description:
      "Pay in AED, settle in USDC on Arc, deliver to any corridor in seconds. Live honesty score on every quote.",
    url: "https://railaed-uae.vercel.app",
    locale: "en_AE",
  },
  twitter: {
    card: "summary_large_image",
    title: "RailAED · UAE → Anywhere · USDC on Arc",
    description:
      "Pay in AED, settle in USDC on Arc, deliver to any corridor in seconds. Built for the Stablecoin Commerce Stack Challenge.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#082822" },
    { media: "(prefers-color-scheme: light)", color: "#082822" },
  ],
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
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
        <header className="absolute top-0 inset-x-0 z-30 safe-pt safe-px">
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-2 px-4 sm:px-6 py-4 sm:py-5">
            {/* Left: logo (30% larger than xs, slow rotation) + tag pill */}
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/" aria-label="RailAED home" className="flex items-center shrink-0">
                <Logo size="sm" variant="mark" spin />
              </Link>
              <Link href="/" className="pill-outline hidden md:inline-flex">
                <span className="text-[color:var(--cream-300)]">Stablecoin Remittance</span>
              </Link>
            </div>

            {/* Right: nav + sign-in */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <NavChip href="/send">Send</NavChip>
              <NavChip href="/payroll">Payroll</NavChip>
              <SignInButton />
            </div>
          </div>
        </header>
        <main className="flex-1 pt-[calc(5rem+env(safe-area-inset-top))]">{children}</main>
        <footer className="border-t border-[color:var(--border)] bg-[color:var(--surface-deep)]/40 safe-pb safe-px">
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
