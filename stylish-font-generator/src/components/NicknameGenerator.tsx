import React, { useState } from "react";
import { Gamepad2, Copy, CheckSquare, Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface NicknameGeneratorProps {
  onSelectSuggestion: (text: string) => void;
  themeMode: "light" | "dark";
  inputText?: string;
}

export default function NicknameGenerator({ onSelectSuggestion, themeMode, inputText = "" }: NicknameGeneratorProps) {
  const [activeTab, setActiveTab] = useState<"games" | "social">("games");
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [copiedPreset, setCopiedPreset] = useState<string | null>(null);

  // Extract clean text
  const cleanInputText = inputText.trim();
  const isDefaultOrEmpty = !cleanInputText || cleanInputText === "Type standard keys here...";
  const baseName = isDefaultOrEmpty ? "" : cleanInputText;

  // Let's model dynamic names depending on active user input
  const getDynamicNames = (category: "games" | "social") => {
    const hasName = !!baseName;
    
    if (category === "games") {
      return [
        {
          platform: "PUBG Mobile 🔫",
          items: [
            { name: `꧁༺☠️ ${hasName ? baseName.split("").join(" ").toUpperCase() : "P U B G _ K I N G"} ☠️༻꧂`, label: "King Badge" },
            { name: `꧁༒👑 ${hasName ? baseName.toUpperCase() : "S N I P E R"} 👑༒꧂`, label: "Royal Sniper" },
            { name: `☠️︻┳デ═— [M416_${hasName ? baseName : "Beast"}]`, label: "M416 Weapon" },
            { name: `亗『 ${hasName ? baseName.toUpperCase() : "D E A T H"} 』亗`, label: "Death Lord" },
          ]
        },
        {
          platform: "Free Fire 🔥",
          items: [
            { name: `꧁ঔৣ☬✞ ${hasName ? baseName.toUpperCase() : "FF_GOD"} ✞☬ঔৣ꧂`, label: "Sovereign" },
            { name: `꧁★☠︎︎𝕯𝖆𝖗𝖐_${hasName ? baseName : "𝕾𝖔𝖚𝖑"}☠︎︎★꧂`, label: "Dark Soul" },
            { name: `${hasName ? baseName : "ᶠᶠ-Slayers"}࿐𓆩♡𓆪`, label: "Slayer Vibe" },
            { name: `〖⚡〗${hasName ? baseName.toUpperCase() : "A_L_E_X"}〖☠️〗`, label: "Thunder" },
          ]
        },
        {
          platform: "Call of Duty 🪖",
          items: [
            { name: `🪓_${hasName ? baseName.toUpperCase() : "COD_GHOST"}_🪓`, label: "Axe Crew" },
            { name: `▄︻┻┳═一 ${hasName ? baseName.toUpperCase() : "VIPER"}`, label: "Sniper Scope" },
            { name: `⚓ ${hasName ? baseName : "Ghost_Warrior"} ⚓`, label: "Ghost Warrior" },
            { name: `戦• ${hasName ? baseName.toUpperCase() : "STRIKE"} •戦`, label: "Strike Force" },
          ]
        }
      ];
    } else {
      return [
        {
          platform: "Facebook Profile 👥",
          items: [
            { name: `𓆩♡𓆪 ${hasName ? baseName : "Princess_Angle"} 𓆩♡𓆪`, label: "Princess Heart" },
            { name: `♛_The_${hasName ? baseName : "Gentleman"}_♛`, label: "Gentleman Spec" },
            { name: `⚡ ${hasName ? baseName.split("").join(" ") : "S t y l y"} ⚡`, label: "Stylish Bold" },
            { name: `★ ${hasName ? baseName : "Single_Boy"} ★`, label: "Single" },
          ]
        },
        {
          platform: "TikTok Bio 🎵",
          items: [
            { name: `🎶 ${hasName ? baseName : "Creative_Vibes"} 🎶`, label: "Musical" },
            { name: `🌸 ${hasName ? baseName : "Cute_Vibe_Only"} 🌸`, label: "Aesthetic Blossom" },
            { name: `✨ ${hasName ? baseName : "Trend_Setter"} ✨`, label: "Trend Maker" },
            { name: `🪐 ${hasName ? baseName : "Space_Explorer"} 🪐`, label: "Explorer" },
          ]
        },
        {
          platform: "Insta & WhatsApp 📸",
          items: [
            { name: `☕ ${hasName ? baseName : "Coffee_And_Code"} 💻`, label: "Developer Vibe" },
            { name: `✨ Simply_${hasName ? baseName : "Me"}_✨`, label: "Minimal Bio" },
            { name: `🦁 Wild_${hasName ? baseName : "Heart"}_🦁`, label: "Wild Brand" },
            { name: `⚡ ${hasName ? baseName : "Infinite_Minds"} ⚡`, label: "Thinker" },
          ]
        }
      ];
    }
  };

  const currentGroups = getDynamicNames(activeTab);

  const handleCopyPreset = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPreset(id);
      setTimeout(() => setCopiedPreset(null), 1500);
    } catch (err) {
      console.error("Preset copy error:", err);
    }
  };

  const isDark = themeMode === "dark";

  return (
    <div
      className={`rounded-2xl border relative overflow-hidden transition-all ${
        isMinimized ? "p-3 sm:p-4" : "p-4 sm:p-5"
      } ${
        isDark
          ? "bg-[#111625] border-slate-800 text-slate-100 shadow-xl"
          : "bg-white border-zinc-200/90 text-stone-800 shadow-sm"
      }`}
    >
      {/* Decorative backdrop spotlight for dark mode only */}
      {isDark && (
        <div className="absolute top-0 right-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
      )}

      {/* Title block with Minimize/Toggle Button */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-left flex items-center gap-2">
          <Gamepad2 className={`w-5 h-5 ${isDark ? "text-indigo-400" : "text-indigo-600"}`} />
          <div>
            <h3 className={`text-sm font-black tracking-tight flex items-center gap-1 uppercase ${isDark ? "text-slate-100" : "text-stone-900"}`}>
              Gaming & Social Name Builder
            </h3>
            {!isMinimized && (
              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase block">
                {isDefaultOrEmpty ? "Showing default templates" : `Generated for: "${baseName}"`}
              </span>
            )}
          </div>
        </div>

        {/* Tab switcher + Minimize Buttons Block */}
        <div className="flex items-center gap-2 shrink-0">
          {!isMinimized && (
            <div className={`p-0.5 rounded-xl flex items-center gap-0.5 ${isDark ? "bg-slate-950" : "bg-zinc-100"}`}>
              <button
                onClick={() => setActiveTab("games")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  activeTab === "games"
                    ? isDark
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-indigo-50 text-indigo-700 shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Games
              </button>
              <button
                onClick={() => setActiveTab("social")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  activeTab === "social"
                    ? isDark
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-indigo-50 text-indigo-700 shadow-sm font-bold"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Socials
              </button>
            </div>
          )}

          {/* Minimize toggle */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className={`p-1.5 rounded-lg border hover:scale-102 transition-all cursor-pointer ${
              isDark 
                ? "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white" 
                : "bg-zinc-50 border-zinc-200 text-stone-500 hover:text-black"
            }`}
            title={isMinimized ? "Expand Suggestion Board" : "Minimize Suggestion Board"}
          >
            {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Suggestion Body, rendered only if NOT minimized */}
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 space-y-4 pt-4 border-t border-zinc-200/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {currentGroups.map((group) => (
                <div key={group.platform} className="space-y-2">
                  <div className={`text-[11px] font-bold tracking-wider uppercase border-b pb-1 ${
                    isDark ? "text-indigo-400 border-slate-800" : "text-indigo-600 border-zinc-100"
                  }`}>
                    {group.platform}
                  </div>

                  <div className="space-y-1.5">
                    {group.items.map((item, idx) => {
                      const id = `${group.platform}-${idx}`;
                      return (
                        <div
                          key={id}
                          className={`p-2 rounded-lg border flex items-center justify-between gap-1.5 transition-all text-xs ${
                            isDark
                              ? "bg-slate-900/40 border-slate-850 hover:bg-slate-900/80 text-slate-200"
                              : "bg-zinc-50/50 border-zinc-200 hover:bg-zinc-100 text-stone-800"
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <span className="text-[8px] font-mono text-slate-500 uppercase block leading-none mb-0.5">
                              {item.label}
                            </span>
                            <span className="font-semibold block truncate text-[11px] font-sans selection:bg-indigo-500/30">
                              {item.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shadow-sm rounded-md overflow-hidden shrink-0">
                            <button
                              onClick={() => onSelectSuggestion(item.name)}
                              className={`p-1 px-1.5 text-[9px] font-black uppercase transition-colors rounded ${
                                isDark ? "bg-indigo-605/10 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20" : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                              }`}
                              title="Load into workspace input"
                            >
                              Use
                            </button>
                            <button
                              onClick={() => handleCopyPreset(item.name, id)}
                              className={`p-1 rounded transition-all ${
                                copiedPreset === id
                                  ? "text-indigo-400"
                                  : isDark
                                    ? "text-slate-500 hover:text-white"
                                    : "text-stone-400 hover:text-black"
                              }`}
                              title="Copy name clip"
                            >
                              {copiedPreset === id ? (
                                <CheckSquare className="w-3 h-3" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
