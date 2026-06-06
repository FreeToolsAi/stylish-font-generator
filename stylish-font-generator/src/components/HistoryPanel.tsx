import { useState } from "react";
import { Clock, Trash2, BookOpen, Star, Sparkles, Copy, Search, Check } from "lucide-react";
import { HistoryItem, FontCategory } from "../types";
import { motion, AnimatePresence } from "motion/react";
// @ts-ignore
import logoUrl from "../assets/images/glyph_studio_logo_1780658111401.png";

interface HistoryPanelProps {
  history: HistoryItem[];
  favoritesCount: number;
  selectedCategory: FontCategory;
  onSelectCategory: (category: FontCategory) => void;
  onSelectHistoryText: (text: string) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  totalStyles: number;
  searchFilter: string;
  setSearchFilter: (term: string) => void;
  themeMode?: "light" | "dark";
}

export default function HistoryPanel({
  history,
  favoritesCount,
  selectedCategory,
  onSelectCategory,
  onSelectHistoryText,
  onClearHistory,
  onDeleteHistoryItem,
  totalStyles,
  searchFilter,
  setSearchFilter,
  themeMode = "dark"
}: HistoryPanelProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories: { id: FontCategory; label: string; countText?: string }[] = [
    { id: "all", label: "All Fonts" },
    { id: "bold", label: "Bold & Strong" },
    { id: "script", label: "Script & Cursive" },
    { id: "gothic", label: "Gothic Fraktur" },
    { id: "bubble", label: "Bubbles & Squares" },
    { id: "special", label: "Weird & Glitchy" },
    { id: "decorated", label: "Aesthetic Overlays" }
  ];

  const isDark = themeMode === "dark";

  const handleCopyStyle = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div 
      className={`w-full flex flex-col h-full md:w-64 max-h-screen text-[13px] select-none border-r transition-colors ${
        isDark 
          ? "bg-[#111625] border-slate-800 text-slate-300" 
          : "bg-[#f8fafc] border-slate-200 text-stone-700"
      }`} 
      id="left-history-nav-panel"
    >
      {/* Brand logo for dashboard */}
      <div className={`p-4 border-b flex items-center gap-3 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
        <img
          src={logoUrl}
          alt="GlyphStudio Logo"
          className={`w-8 h-8 rounded-lg object-cover shadow border ${isDark ? "shadow-indigo-500/20 border-slate-800" : "border-zinc-300"}`}
          referrerPolicy="no-referrer"
        />
        <div>
          <h1 className={`text-sm font-bold font-sans tracking-tight m-0 uppercase ${isDark ? "text-white" : "text-stone-900"}`}>
            GlyphStudio
          </h1>
          <span className={`text-[10px] font-bold font-mono uppercase tracking-widest block mt-0.5 ${isDark ? "text-indigo-450 text-indigo-400" : "text-indigo-750 text-indigo-600"}`}>
            QUANTUM v2.5.0
          </span>
        </div>
      </div>

      {/* Main categories navigation / Tabs List */}
      <div className={`p-3 border-b space-y-1.5 flex-none ${isDark ? "border-slate-800" : "border-slate-200"}`}>
        <span className={`text-[10px] uppercase font-bold tracking-widest px-2 block select-none mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          STYLE CATEGORIES
        </span>
        <div className="space-y-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                  isActive
                    ? isDark
                      ? "bg-indigo-950/40 text-indigo-400 font-semibold pl-3 border-l-2 border-indigo-505 border-indigo-500"
                      : "bg-indigo-50 text-indigo-705 text-indigo-700 font-semibold pl-3 border-l-2 border-indigo-600"
                    : isDark
                      ? "hover:bg-slate-800/30 text-slate-400 hover:text-slate-200"
                      : "hover:bg-zinc-200/50 text-stone-605 hover:text-stone-900"
                }`}
              >
                <span>{cat.label}</span>
                {cat.id === "all" && (
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    isDark 
                      ? "bg-slate-950 border-slate-800 text-indigo-400" 
                      : "bg-zinc-200 border-zinc-300 text-stone-755 text-stone-700"
                  }`}>
                    {totalStyles}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Font Styles Filter Box */}
      <div className={`p-3 border-b flex-none gap-2 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
        <div className="relative">
          <Search className={`w-3.5 h-3.5 absolute left-2.5 top-2.5 ${isDark ? "text-indigo-400" : "text-stone-400"}`} />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search 100+ styles..."
            className={`w-full text-xs rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-505 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans border ${
              isDark
                ? "bg-slate-950 border-slate-800 text-slate-300 placeholder-slate-500"
                : "bg-white border-zinc-200 text-stone-800 placeholder-stone-400"
            }`}
          />
        </div>
      </div>

      {/* Recently processed history panel */}
      <div className="flex-1 overflow-y-auto flex flex-col min-h-0 select-none custom-scrollbar">
        <div className={`p-3 px-4 flex items-center justify-between text-[10px] tracking-wider uppercase font-bold sticky top-0 backdrop-blur-sm z-10 ${
          isDark ? "bg-[#111625]/95 text-slate-500" : "bg-[#f8fafc]/95 text-stone-500"
        }`}>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-indigo-400" />
            Copied History
          </span>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-red-500 hover:text-red-400 font-bold p-1 transition-colors cursor-pointer"
              title="Clear all history log"
            >
              Clear
            </button>
          )}
        </div>

        <div className="p-2 space-y-1.5 px-3">
          <AnimatePresence initial={false}>
            {history.length === 0 ? (
              <div className="text-center py-6 text-xs text-stone-500 leading-relaxed px-2">
                <BookOpen className="w-5 h-5 mx-auto text-stone-400 mb-1" />
                <p>No styled font copied yet.</p>
              </div>
            ) : (
              history.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`border rounded-lg p-2 flex flex-col gap-0.5 transition-all group ${
                    isDark
                      ? "bg-slate-900/40 hover:bg-slate-900/80 border-slate-800"
                      : "bg-white hover:bg-zinc-100/50 border-zinc-200"
                  }`}
                >
                  <div className="flex justify-between items-start gap-1">
                    <p
                      onClick={() => onSelectHistoryText(item.originalText)}
                      className={`text-xs line-clamp-2 cursor-pointer select-none leading-relaxed transition-colors break-all flex-1 ${
                        isDark ? "text-slate-300 hover:text-white" : "text-stone-800 hover:text-stone-950 font-medium"
                      }`}
                      title="Load original text to prompt area"
                    >
                      {item.originalText}
                    </p>
                    <button
                      onClick={() => onDeleteHistoryItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-stone-450 hover:text-red-500 p-0.5 transition-opacity cursor-pointer flex-none"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {item.copiedText && (
                    <div className={`mt-1 p-1 px-1.5 rounded text-[11px] font-mono break-all flex items-center justify-between gap-1.5 group/copyitem ${
                      isDark 
                        ? "bg-indigo-950/20 text-indigo-300 border border-indigo-900/30" 
                        : "bg-indigo-50 border border-indigo-100 text-indigo-800"
                    }`}>
                      <span className="truncate flex-1 font-bold select-all leading-normal" title={item.copiedText}>
                        {item.copiedText}
                      </span>
                      <button
                        onClick={() => handleCopyStyle(item.id, item.copiedText!)}
                        className={`p-1 rounded cursor-pointer transition-all flex-none flex items-center justify-center ${
                          copiedId === item.id
                            ? isDark
                              ? "text-emerald-400 bg-emerald-950/40 border border-emerald-500/20"
                              : "text-emerald-700 bg-emerald-50"
                            : isDark
                              ? "text-slate-400 hover:text-indigo-400 hover:bg-slate-800/40"
                              : "text-stone-505 hover:text-indigo-800 hover:bg-stone-200/50"
                        }`}
                        title="Re-copy this exact stylized font"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3 h-3 animate-scale-up" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}

                  <div className={`flex items-center justify-between text-[9px] mt-1 pt-1 font-mono border-t ${
                    isDark ? "text-indigo-400/80 border-slate-800" : "text-stone-500 border-zinc-100"
                  }`}>
                    <span>{item.timestamp}</span>
                    <span className={`px-1 rounded border ${
                      isDark 
                        ? "bg-slate-950 border-slate-800 text-indigo-400" 
                        : "bg-zinc-100 border-zinc-200 text-stone-600"
                    }`}>
                      copied: {item.copiedCount}
                    </span>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* System status node identifier */}
      <div className={`p-3 border-t text-[10px] font-mono flex items-center justify-between ${
        isDark ? "border-slate-800 bg-slate-950 text-slate-400" : "border-zinc-200 bg-zinc-100 text-stone-500"
      }`}>
        <span className="flex items-center gap-1">
          <Star className={`w-3 h-3 ${isDark ? "text-indigo-400 fill-indigo-400 animate-pulse" : "text-amber-500 fill-amber-500"}`} />
          Favorites: {favoritesCount}
        </span>
      </div>
    </div>
  );
}
