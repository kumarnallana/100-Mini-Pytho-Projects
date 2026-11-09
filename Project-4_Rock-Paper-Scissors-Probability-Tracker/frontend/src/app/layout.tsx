import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rock-Paper-Scissors AI | Probability Tracker & Markov Pattern Detector",
  description: "Next-generation Rock-Paper-Scissors with first-principles Markov chain pattern detection and win-streak evaluation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-gray-100 min-h-screen antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

