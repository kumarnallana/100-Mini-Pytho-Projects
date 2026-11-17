import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Palindrome & Anagram Verifier | Two-Pointer & Frequency Map Suite",
  description: "Interactive Two-Pointer Palindrome Visualizer and Frequency Map Anagram Comparator built with Next.js, Tailwind CSS, and FastAPI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-gray-100 min-h-screen antialiased selection:bg-cyan-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}

