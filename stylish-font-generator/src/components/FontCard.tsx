import React, { useState, useRef } from "react";
import { Copy, Check, Star, Sparkles, Image, Settings } from "lucide-react";
import { FontStyle, DynamicPreset, PRESET_DECORATIONS } from "../fontData";
import { motion, AnimatePresence } from "motion/react";

interface FontCardProps {
  key?: string;
  style: FontStyle;
  rawText: string;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
  onCopySuccess: (text: string) => void;
  globalDecoration: DynamicPreset;
  themeMode?: "dark" | "light";
  textSize?: number;
}

export default function FontCard({
  style,
  rawText,
  isFavorited,
  onToggleFavorite,
  onCopySuccess,
  globalDecoration,
  themeMode = "dark",
  textSize = 16
}: FontCardProps) {
  const [copied, setCopied] = useState(false);
  const [localDecoId, setLocalDecoId] = useState<string>("default");
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);

  // Filter text logic inside card
  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = { id: Date.now() + Math.random(), x, y };
      setRipples(prev => [...prev, newRipple]);
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 700);
    }

    // Generate text styled
    let textToStyle = rawText || "Preview Text";
    let styledConverted = style.transform(textToStyle);

    // Apply decorations
    let finalOutput = styledConverted;
    
    // Check if there is a local override decoration, otherwise use global decoration
    if (localDecoId !== "default") {
      const matchingLocal = PRESET_DECORATIONS.find(d => d.id === localDecoId);
      if (matchingLocal) {
        finalOutput = `${matchingLocal.prefix}${styledConverted}${matchingLocal.suffix}`;
      }
    } else if (globalDecoration.id !== "none") {
      finalOutput = `${globalDecoration.prefix}${styledConverted}${globalDecoration.suffix}`;
    }

    try {
      await navigator.clipboard.writeText(finalOutput);
      setCopied(true);
      onCopySuccess(finalOutput);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Clipboard issue:", err);
    }
  };

  const styledText = style.transform(rawText || "Preview Text");
  
  // Calculate final display output based on override states
  let displayOutput = styledText;
  if (localDecoId !== "default") {
    const matchingLocal = PRESET_DECORATIONS.find(d => d.id === localDecoId);
    if (matchingLocal) {
      displayOutput = `${matchingLocal.prefix}${styledText}${matchingLocal.suffix}`;
    }
  } else if (globalDecoration.id !== "none") {
    displayOutput = `${globalDecoration.prefix}${styledText}${globalDecoration.suffix}`;
  }

  // Choose a nice badge style for clean minimal theme
  const getBadgeStyle = () => {
    if (themeMode === "dark") {
      switch (style.category) {
        case "bold": return "bg-indigo-500/10 text-indigo-350 border-indigo-500/20";
        case "script": return "bg-pink-500/10 text-pink-450 border-pink-500/20";
        case "gothic": return "bg-purple-500/10 text-purple-450 border-purple-500/20";
        case "bubble": return "bg-amber-500/10 text-amber-450 border-amber-500/20";
        case "special": return "bg-cyan-500/10 text-cyan-455 border-cyan-500/20";
        default: return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      }
    } else {
      switch (style.category) {
        case "bold": return "bg-indigo-50 text-indigo-600 border-indigo-100";
        case "script": return "bg-pink-50 text-pink-600 border-pink-100";
        case "gothic": return "bg-purple-50 text-purple-650 border-purple-100";
        case "bubble": return "bg-amber-50 text-amber-600 border-amber-100";
        case "special": return "bg-cyan-50 text-cyan-650 border-cyan-100";
        default: return "bg-blue-50 text-blue-600 border-blue-100";
      }
    }
  };

  return (
    <motion.div
      ref={cardRef}
      layout="position"
      className={`rounded-xl p-4 transition-all relative overflow-hidden group flex flex-col justify-between border ${
        copied
          ? themeMode === "dark"
            ? "border-indigo-500 bg-indigo-950/15 shadow-[0_0_15px_rgba(99,102,241,0.25)]"
            : "border-indigo-405 bg-indigo-50/10 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
          : themeMode === "dark" 
            ? "bg-[#161b22]/40 border-slate-800 hover:bg-[#161b22] hover:border-indigo-500" 
            : "bg-white border-slate-200 hover:bg-slate-50/70 hover:border-indigo-500"
      } shadow-sm`}
    >
      {/* Absolute Click Ripple Animation Effects */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className={`absolute rounded-full pointer-events-none z-0 ${
              themeMode === "dark" ? "bg-indigo-500/20" : "bg-indigo-500/15"
            }`}
            initial={{ width: 0, height: 0, x: ripple.x, y: ripple.y, opacity: 1 }}
            animate={{ 
              width: 650, 
              height: 650, 
              x: ripple.x - 325, 
              y: ripple.y - 325, 
              opacity: 0 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      <div className="relative z-10">
        {/* Header Metadata */}
        <div className="flex items-center justify-between mb-3.5 select-none">
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-semibold truncate max-w-[140px] md:max-w-none ${
              themeMode === "dark" ? "text-slate-200" : "text-slate-800"
            }`}>
              {style.name}
            </span>
            {style.isPopular && (
              <span className={`text-[9px] font-mono font-bold px-1 rounded uppercase ${
                themeMode === "dark" ? "bg-blue-500/10 text-blue-300" : "bg-blue-550/10 text-blue-600"
              }`}>
                POPs
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Category tag */}
            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${getBadgeStyle()}`}>
              {style.category}
            </span>

            {/* Favorite Star action */}
            <button
              onClick={() => onToggleFavorite(style.id)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isFavorited
                  ? "bg-blue-550/10 bg-blue-500/10 border-blue-550/30 border-blue-500/30 text-blue-500"
                  : themeMode === "dark"
                    ? "bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-300"
                    : "bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600"
              }`}
            >
              <Star className="w-3 h-3 fill-current stroke-current" />
            </button>
          </div>
        </div>

        {/* Dynamic Transformed String Canvas */}
        <div className={`border rounded-lg p-3.5 min-h-[64px] flex items-center justify-start transition-all font-sans relative overflow-hidden ${
          themeMode === "dark" ? "bg-slate-950 border-[#1c2128]" : "bg-slate-50 border-slate-100"
        }`}>
          {(() => {
            const isUrdu = /[\u0600-\u06FF]/.test(displayOutput);
            return (
              <p
                dir={isUrdu ? "rtl" : "ltr"}
                style={{
                  ...isUrdu ? { fontFamily: '"Jameel Noori Nastaleeq", "Noto Nastaliq Urdu", serif' } : {},
                  fontSize: !isUrdu && textSize ? `${textSize}px` : undefined
                }}
                className={`font-normal break-all select-all w-full ${
                  isUrdu 
                    ? "text-[22px] !leading-[2.5] text-right font-urdu" 
                    : "leading-relaxed text-left font-sans"
                } ${
                  themeMode === "dark" ? "text-slate-100" : "text-slate-850"
                }`}
              >
                {displayOutput}
              </p>
            );
          })()}

          <AnimatePresence>
            {copied && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-indigo-650/95 bg-indigo-600/95 backdrop-blur-[2px] rounded-lg flex items-center justify-center gap-1.5 text-xs text-white uppercase font-bold tracking-widest pointer-events-none select-none z-10"
              >
                <Check className="w-4 h-4 stroke-[3px]" />
                Copied to clipboard
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Font Card Actions Toolbar */}
      <div className={`mt-3.5 flex items-center justify-between border-t pt-3 select-none relative z-10 ${
        themeMode === "dark" ? "border-slate-800/60" : "border-slate-200/50"
      }`}>
        {/* Quick decoration override */}
        <div className="flex items-center gap-1">
          <Settings className="w-3 h-3 text-slate-500" />
          <select
            value={localDecoId}
            onChange={(e) => setLocalDecoId(e.target.value)}
            className={`bg-transparent text-[10px] font-medium font-sans focus:outline-none cursor-pointer min-w-[70px] max-w-[120px] ${
              themeMode === "dark" ? "text-slate-400 focus:text-slate-200" : "text-slate-500 focus:text-slate-850"
            }`}
          >
            <option value="default">Use Global Settings</option>
            {PRESET_DECORATIONS.map(d => (
              <option key={d.id} value={d.id} className={themeMode === "dark" ? "bg-slate-900" : "bg-white text-slate-800"}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Direct Copy Action Button with Check State & Spring Animation */}
        <button
          onClick={(e) => handleCopy(e)}
          className={`font-semibold p-1.5 px-3 rounded-lg flex items-center gap-1.5 text-[11px] uppercase cursor-pointer border shadow transition-all duration-300 z-10 overflow-hidden ${
            copied
              ? "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/35 font-bold scale-[1.03]"
              : themeMode === "dark"
                ? "bg-slate-800 hover:bg-indigo-600 active:bg-indigo-700 text-white border-transparent"
                : "bg-slate-900 hover:bg-indigo-600 active:bg-indigo-700 text-white border-transparent"
          }`}
        >
          {copied ? (
            <motion.div 
              initial={{ scale: 0.5, rotate: -30 }} 
              animate={{ scale: 1, rotate: 0 }} 
              className="flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5 stroke-[3px]" />
              <span>Copied!</span>
            </motion.div>
          ) : (
            <div className="flex items-center gap-1">
              <Copy className="w-3 h-3" />
              <span>Copy Font</span>
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
}
