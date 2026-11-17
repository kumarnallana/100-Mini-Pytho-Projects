"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { TabsNav, TabKey } from "../components/TabsNav";
import { PalindromeScanner } from "../components/PalindromeScanner";
import { AnagramComparator } from "../components/AnagramComparator";
import { AnagramGrouper } from "../components/AnagramGrouper";
import { checkHealth } from "../lib/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("palindrome");
  const [serverConnected, setServerConnected] = useState<boolean>(false);

  useEffect(() => {
    const pollHealth = async () => {
      const ok = await checkHealth();
      setServerConnected(ok);
    };

    pollHealth();
    const interval = setInterval(pollHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col justify-between">
      <div>
        <Header serverConnected={serverConnected} />

        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
          {/* Navigation Tabs */}
          <TabsNav activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Active Tab View */}
          {activeTab === "palindrome" && <PalindromeScanner />}
          {activeTab === "anagram" && <AnagramComparator />}
          {activeTab === "grouper" && <AnagramGrouper />}
        </main>
      </div>

      <footer className="border-t border-gray-900 py-6 px-4 text-center text-xs text-gray-500">
        100 Mini Python Projects • Tier 1: Project 05 — Palindrome & Anagram Verifier (Two-Pointer Scanning & Frequency Maps)
      </footer>
    </div>
  );
}

