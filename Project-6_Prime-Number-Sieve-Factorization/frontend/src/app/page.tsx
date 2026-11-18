"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { TabsNav, TabKey } from "../components/TabsNav";
import { SieveVisualizer } from "../components/SieveVisualizer";
import { FactorTreeVisualizer } from "../components/FactorTreeVisualizer";
import { PrimalityExplorer } from "../components/PrimalityExplorer";
import { checkHealth } from "../lib/api";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("sieve");
  const [serverConnected, setServerConnected] = useState<boolean>(false);

  useEffect(() => {
    const poll = async () => {
      const ok = await checkHealth();
      setServerConnected(ok);
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#080c14] flex flex-col justify-between">
      <div>
        <Header serverConnected={serverConnected} />

        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
          <TabsNav activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "sieve" && <SieveVisualizer />}
          {activeTab === "factorize" && <FactorTreeVisualizer />}
          {activeTab === "primality" && <PrimalityExplorer />}
        </main>
      </div>

      <footer className="border-t border-gray-900 py-6 px-4 text-center text-xs text-gray-500">
        100 Mini Python Projects • Tier 1: Project 06 — Prime Number Sieve & Factorization (Sieve of Eratosthenes & Prime Factor Trees)
      </footer>
    </div>
  );
}
