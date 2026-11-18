import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prime Number Sieve & Factorization | Eratosthenes & Factor Tree Studio",
  description:
    "Interactive Sieve of Eratosthenes animator, recursive Prime Factor Tree builder, Euler's Totient, and Goldbach explorer built with Next.js, Tailwind CSS, and FastAPI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080c14] text-gray-100 min-h-screen antialiased selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
