import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { Nav } from "@/components/Nav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JanSetu AI — Smart Bharat Civic Companion",
  description:
    "AI civic companion: find government schemes, decode document requirements, report and track public issues — in your own language.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LanguageProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <footer className="mt-16 border-t border-border">
            <div className="tricolor-bar h-1 w-full" />
            <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted">
              <p>
                <span className="font-semibold text-foreground">JanSetu AI</span> — Smart Bharat
                Civic Companion. Action-first access to government services, in your language.
              </p>
              <p className="mt-1 text-xs">
                Prototype for the Devengers × PromptWars “Build with AI” challenge. Complaint
                submission is simulated; designed to integrate with CPGRAMS, DigiLocker and UMANG.
              </p>
            </div>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}
