"use client";

import React from "react";
import { Grid3X3, GitFork, ShieldCheck } from "lucide-react";

export type TabKey = "sieve" | "factorize" | "primality";

interface TabsNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const TabsNav: React.FC<TabsNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: "sieve" as TabKey,
      label: "Sieve of Eratosthenes",
      icon: Grid3X3,
      badge: "Animated Grid",
    },
    {
      id: "factorize" as TabKey,
      label: "Prime Factor Tree",
      icon: GitFork,
      badge: "Tree & Totient",
    },
    {
      id: "primality" as TabKey,
      label: "Primality & Neighbors",
      icon: ShieldCheck,
      badge: "6k ± 1 Probe",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 p-1.5 bg-gray-950/80 border border-gray-800/80 rounded-2xl max-w-fit mx-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              isActive
                ? "bg-gradient-to-r from-emerald-600/90 to-teal-600/90 text-white shadow-lg shadow-emerald-500/20"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-900"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            <span
              className={`hidden md:inline text-[10px] px-1.5 py-0.5 rounded-full ${
                isActive ? "bg-white/20 text-white" : "bg-gray-800 text-gray-400"
              }`}
            >
              {tab.badge}
            </span>
          </button>
        );
      })}
    </div>
  );
};
