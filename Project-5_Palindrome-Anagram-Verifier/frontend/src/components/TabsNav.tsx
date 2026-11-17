"use client";

import React from "react";
import { ArrowLeftRight, BarChart3, Boxes } from "lucide-react";

export type TabKey = "palindrome" | "anagram" | "grouper";

interface TabsNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const TabsNav: React.FC<TabsNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: "palindrome" as TabKey,
      label: "Two-Pointer Palindrome Scanner",
      icon: ArrowLeftRight,
      badge: "O(n) Inward Scan",
    },
    {
      id: "anagram" as TabKey,
      label: "Frequency Map Anagram Comparator",
      icon: BarChart3,
      badge: "Δ Frequency Maps",
    },
    {
      id: "grouper" as TabKey,
      label: "Multi-Word Anagram Clusterer",
      icon: Boxes,
      badge: "Signature Hashing",
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
                ? "bg-gradient-to-r from-cyan-600/90 to-blue-600/90 text-white shadow-lg shadow-cyan-500/20"
                : "text-gray-400 hover:text-gray-200 hover:bg-gray-900"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{tab.label}</span>
            <span
              className={`hidden md:inline text-[10px] px-1.5 py-0.5 rounded-full ${
                isActive
                  ? "bg-white/20 text-white"
                  : "bg-gray-800 text-gray-400"
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

