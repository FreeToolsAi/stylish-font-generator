/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, useRef } from "react";
import {
  Sun,
  Moon,
  Sparkles,
  RotateCcw,
  Menu,
  X,
  Star,
  Layers,
  Flame,
  Check,
  Search,
  BookOpen,
  Volume2,
  Trash2,
  Sliders,
  Type
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { HistoryItem, FontCategory } from "./types";
import { ALL_FONT_STYLES, PRESET_DECORATIONS, DynamicPreset } from "./fontData";
import HistoryPanel from "./components/HistoryPanel";
import AIAssistantPanel from "./components/AIAssistantPanel";
import FontCard from "./components/FontCard";
import AdSenseBanner from "./components/AdSenseBanner";
import NicknameGenerator from "./components/NicknameGenerator";
// @ts-ignore
import logoUrl from "./assets/images/glyph_studio_logo_1780658111401.png";
// @ts-ignore
import bannerUrl from "./assets/images/typography_workspace_banner_1780658130815.png";

export default function App() {
  const [inputText, setInputText] = useState("Type standard keys here...");
  const [selectedCategory, setSelectedCategory] = useState<FontCategory>("all");
  const [searchFilter, setSearchFilter] = useState("");
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  const [isSplashActive, setIsSplashActive] = useState(true);
  const [splashProgress, setSplashProgress] = useState(0);

  // Splash progressive loader intervals matching 6-second requirement (6000ms / 55ms yields approx 100% nicely)
  useEffect(() => {
    const interval = setInterval(() => {
      setSplashProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / (6000 / 50));
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashActive(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  const getLoadingStatusMessage = (progress: number) => {
    if (progress < 22) return "Initializing typographical modules...";
    if (progress < 45) return "Loading 100+ creative glyph variations...";
    if (progress < 68) return "Preparing AI assistant copywriting tool...";
    if (progress < 90) return "Configuring custom layout borders & overlays...";
    return "Workspace ready!";
  };

  // Responsive Drawer states for tablet/mobile viewports
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);

  // Floating mobile bar and popup dialog helper states
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [textSizeOverride, setTextSizeOverride] = useState<number>(16); 
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Global decoration preset
  const [globalDecoId, setGlobalDecoId] = useState<string>("none");

  // Delayed loading batches for font variations (Infinite scroll simulator)
  const [visibleLimit, setVisibleLimit] = useState(15);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Policy modal overlay states
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isDataPermitModalOpen, setIsDataPermitModalOpen] = useState(false);
  const [permitOptIn, setPermitOptIn] = useState(true);

  // Auto reset limit on query changes to keep search intuitive
  useEffect(() => {
    setVisibleLimit(15);
  }, [selectedCategory, searchFilter]);

  const handleLoadMore = () => {
    if (isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleLimit((prev) => prev + 15);
      setIsLoadingMore(false);
    }, 3000); // 3 seconds delay for loading as requested
  };

  // Load favorites & history safely from state with fallback to storage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("stylish_favorites");
      return saved ? JSON.parse(saved) : ["serif-bold", "script-bold", "double-struck"];
    } catch {
      return ["serif-bold", "script-bold", "double-struck"];
    }
  });

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("stylish_history");
      if (!saved) return [];
      const parsed: HistoryItem[] = JSON.parse(saved);
      // Prune history elements older than 1 week (7 days)
      const oneWeekSpan = 7 * 24 * 60 * 60 * 1000;
      const thresholdTime = Date.now() - oneWeekSpan;
      return parsed.filter(item => {
        if (!item.createdAt) return true; // keep pre-existing items where createdAt wasn't specified yet
        return item.createdAt > thresholdTime;
      });
    } catch {
      return [];
    }
  });

  // Dual theme layout - defaults to dark mode like Google AI Studio's workspace
  const [themeMode, setThemeMode] = useState<"dark" | "light">("dark");

  // Save favorites and history back to local storage dynamically
  useEffect(() => {
    localStorage.setItem("stylish_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("stylish_history", JSON.stringify(history));
  }, [history]);

  // Load sample post trigger
  const handleLoadSample = (sample: string) => {
    setInputText(sample);
  };

  const clearInputText = () => {
    setInputText("");
  };

  const toggleFavorite = (styleId: string) => {
    setFavorites(prev =>
      prev.includes(styleId)
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };

  const handleCopySuccess = (copiedText: string) => {
    setCopiedNotification(copiedText);
    setTimeout(() => setCopiedNotification(null), 3000);

    const trimmedText = inputText.trim();
    if (trimmedText) {
      const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      setHistory(prev => {
        const existingIndex = prev.findIndex(item => item.originalText === trimmedText);
        let updated = [...prev];
        if (existingIndex !== -1) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            copiedText: copiedText,
            copiedCount: updated[existingIndex].copiedCount + 1,
            timestamp: currentTime,
            createdAt: Date.now()
          };
          const target = updated.splice(existingIndex, 1)[0];
          return [target, ...updated];
        } else {
          const newItem: HistoryItem = {
            id: `hist-${Date.now()}`,
            originalText: trimmedText,
            copiedText: copiedText,
            timestamp: currentTime,
            copiedCount: 1,
            createdAt: Date.now()
          };
          return [newItem, ...prev.slice(0, 19)];
        }
      });
    }
  };

  // Bulk clearing actions
  const clearHistory = () => {
    setHistory([]);
  };

  const deleteHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  // Find active decoration object
  const activeGlobalDeco = useMemo(() => {
    return PRESET_DECORATIONS.find(d => d.id === globalDecoId) || PRESET_DECORATIONS[0];
  }, [globalDecoId]);

  // Filter styles list to build grid dynamically
  const filteredStyles = useMemo(() => {
    return ALL_FONT_STYLES.filter(style => {
      // Category filter check
      const matchesCategory = selectedCategory === "all" || style.category === selectedCategory;

      // Text search filter check
      const matchesSearch = style.name.toLowerCase().includes(searchFilter.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchFilter]);

  // Group styles in order to showcase Favorites at the top
  const sortedAndGroupedStyles = useMemo(() => {
    const favoritesList = filteredStyles.filter(s => favorites.includes(s.id));
    const standardsList = filteredStyles.filter(s => !favorites.includes(s.id));
    return {
      favorites: favoritesList,
      standards: standardsList
    };
  }, [filteredStyles, favorites]);

  // Automated load-more on scroll observer
  useEffect(() => {
    if (isSplashActive) return;
    const triggerElement = document.getElementById("infinite-scroll-bottom-trigger");
    if (!triggerElement) return;

    const scrollObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && filteredStyles.length > visibleLimit) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    scrollObserver.observe(triggerElement);
    return () => scrollObserver.disconnect();
  }, [isSplashActive, isLoadingMore, visibleLimit, filteredStyles.length]);

  return (
    <div className={`min-h-screen text-[13px] font-sans transition-all duration-300 ${
      themeMode === "dark" 
        ? "bg-[#0b0f19] text-slate-100" 
        : "bg-[#f8fafc] text-slate-800"
    }`}>
      {/* Premium Studio Splash loading screen */}
      <AnimatePresence>
        {isSplashActive && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 bg-[#070913] text-white z-[9999] flex flex-col justify-center items-center select-none"
          >
            {/* Glowing cosmic accent spotlight */}
            <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

            <div className="flex flex-col items-center max-w-sm w-full p-6 text-center space-y-8 relative z-20">
              
              {/* Brand Logo with dynamic premium entrance */}
              <motion.div
                initial={{ scale: 0.85, rotate: -5, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative"
              >
                <img
                  src={logoUrl}
                  alt="GlyphStudio Elite Logo"
                  className="w-20 h-20 rounded-2xl object-cover shadow-2xl shadow-indigo-500/20 border border-slate-800/80"
                  referrerPolicy="no-referrer"
                />
                <motion.div
                  animate={{ scale: [1, 1.15, 1], rotate: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className="absolute -top-1.5 -right-1.5 p-1 bg-indigo-600 rounded-lg shadow-lg border border-indigo-400"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </motion.div>
              </motion.div>

              {/* Text Header */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="space-y-1.5"
              >
                <h1 className="text-2xl font-black tracking-tight font-sans text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300 uppercase">
                  GLYPHSTUDIO
                </h1>
                <p className="text-[10px] uppercase tracking-widest font-mono text-indigo-400 font-bold">
                   Elite Creative Workspace
                </p>
              </motion.div>

              {/* Custom Progressive Glass Slider Progress bar */}
              <div className="w-full space-y-2.5">
                <div className="relative h-1.5 w-full bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 shadow-[0_0_12px_rgba(99,102,241,0.6)]"
                    style={{ width: `${splashProgress}%` }}
                    transition={{ ease: "linear" }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono select-none">
                  <motion.span
                    key={getLoadingStatusMessage(splashProgress)}
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-slate-400 font-medium font-sans"
                  >
                    {getLoadingStatusMessage(splashProgress)}
                  </motion.span>
                  <span className="font-bold text-indigo-400 min-w-[32px] text-right">
                    {Math.min(100, Math.round(splashProgress))}%
                  </span>
                </div>
              </div>

              {/* App status badge */}
              <div className="pt-1">
                <span className="text-[9px] font-mono tracking-widest uppercase text-indigo-400 bg-indigo-950/40 border border-indigo-900/30 px-3.5 py-1 rounded-full font-bold">
                  v3.0.0 Quantum Core Live
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Copied Toast notification alert float */}
      <AnimatePresence>
        {copiedNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold p-3 px-6 rounded-xl flex items-center gap-2 shadow-2xl shadow-indigo-505/35 z-50 uppercase text-[11px] tracking-wider select-none border border-indigo-450 border-indigo-400"
          >
            <Check className="w-4 h-4 text-white stroke-[3px]" />
            Copied Style: <span className="text-cyan-200 line-clamp-1 max-w-[150px] lowercase italic font-mono font-bold font-sans">{copiedNotification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Dashboard */}
      <div className="flex h-screen overflow-hidden relative">
        
        {/* ================= DESKTOP LEFT SIDEBAR ================= */}
        <div className="hidden md:block flex-shrink-0">
          <HistoryPanel
            history={history}
            favoritesCount={favorites.length}
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => {
              setSelectedCategory(cat);
              setMobileLeftOpen(false);
            }}
            onSelectHistoryText={(text) => {
              setInputText(text);
              setMobileLeftOpen(false);
            }}
            onClearHistory={clearHistory}
            onDeleteHistoryItem={deleteHistoryItem}
            totalStyles={ALL_FONT_STYLES.length}
            searchFilter={searchFilter}
            setSearchFilter={setSearchFilter}
            themeMode={themeMode}
          />
        </div>

        {/* ================= MOBILE LEFT DRAWER ================= */}
        <AnimatePresence>
          {mobileLeftOpen && (
            <>
              {/* Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileLeftOpen(false)}
                className="fixed inset-0 bg-black/80 z-30 md:hidden"
              />
              {/* Drawer Content */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.25 }}
                className="fixed top-0 bottom-0 left-0 w-72 bg-[#0d111d] border-r border-[#20293a] z-40 md:hidden block h-full shadow-2xl"
              >
                <div className="absolute top-4 right-4 z-50">
                  <button
                    onClick={() => setMobileLeftOpen(false)}
                    className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white cursor-pointer border border-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <HistoryPanel
                  history={history}
                  favoritesCount={favorites.length}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(cat) => {
                    setSelectedCategory(cat);
                    setMobileLeftOpen(false);
                  }}
                  onSelectHistoryText={(text) => {
                    setInputText(text);
                    setMobileLeftOpen(false);
                  }}
                  onClearHistory={clearHistory}
                  onDeleteHistoryItem={deleteHistoryItem}
                  totalStyles={ALL_FONT_STYLES.length}
                  searchFilter={searchFilter}
                  setSearchFilter={setSearchFilter}
                  themeMode={themeMode}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ================= CENTRAL PLAYGROUND WORKSPACE ================= */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Main Top Header Navbar info */}
          <div className={`flex-none p-4 px-6 border-b flex items-center justify-between select-none ${
            themeMode === "dark" ? "border-slate-800/85 bg-slate-950/40 backdrop-blur-md" : "border-slate-200/80 bg-white/70 backdrop-blur-md"
          }`} id="main-app-header">
            {/* Left controller: Mobile nav menu togglers */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileLeftOpen(true)}
                className={`md:hidden p-2 rounded-lg border cursor-pointer transition-colors ${
                  themeMode === "dark" ? "bg-slate-900 hover:bg-slate-800 text-indigo-400 border-slate-800" : "bg-white hover:bg-slate-50 text-slate-700 border-slate-250"
                }`}
                title="Styles Categories & History"
              >
                <Menu className="w-4.5 h-4.5" />
              </button>

              <div className="hidden md:flex items-center gap-2">
                <img
                  src={logoUrl}
                  alt="GlyphStudio Mini"
                  className="w-5 h-5 rounded object-cover border border-slate-800/80 shadow"
                  referrerPolicy="no-referrer"
                />
                <span className={`text-xs font-bold font-mono tracking-wider ${
                  themeMode === "dark" ? "text-indigo-400" : "text-indigo-600"
                }`}>
                  QUANTUM PLAYGROUND PRO
                </span>
              </div>
            </div>

            {/* Right controller: Theme toggler & Mobile AI assistant trigger */}
            <div className="flex items-center gap-2.5">
              
              {/* Premium Light/Dark Switcher */}
              <button
                onClick={() => setThemeMode(prev => prev === "dark" ? "light" : "dark")}
                className={`p-2 rounded-xl border cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  themeMode === "dark" 
                    ? "bg-slate-900 hover:bg-slate-800 border-slate-800 text-amber-400" 
                    : "bg-white hover:bg-slate-50 border-slate-200 text-amber-500"
                }`}
                title="Toggle UI Color Mode"
              >
                {themeMode === "dark" ? (
                  <>
                     <Sun className="w-4 h-4 text-amber-400" />
                     <span className="text-[11px] font-sans text-slate-300 font-bold hidden sm:inline">Light Interface</span>
                  </>
                ) : (
                  <>
                     <Moon className="w-4 h-4 text-indigo-600" />
                     <span className="text-[11px] font-sans text-slate-750 font-bold hidden sm:inline">Dark Interface</span>
                  </>
                )}
              </button>

              {/* Mobile Right AI Assist Toggle */}
              <button
                onClick={() => setMobileRightOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-indigo-600 hover:bg-indigo-505 text-white font-extrabold flex items-center gap-1.5 cursor-pointer text-xs shadow-lg shadow-indigo-500/15"
                title="Open AI Polisher Panel"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span className="hidden sm:inline">AI Assist</span>
              </button>
            </div>
          </div>

          {/* Central Workspace Scroll container */}
          <div id="main-scroll-viewport" className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Title / Hero Intro Banner with Professional Banners & Images */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch py-2 select-none">
              <div className="md:col-span-7 flex flex-col justify-center text-left leading-relaxed">
                {/* Fallback brand line block for smaller layouts */}
                <div className="flex items-center gap-2 mb-2.5">
                  <img
                    src={logoUrl}
                    alt="GlyphStudio Logo"
                    className="w-5 h-5 rounded object-cover shadow shadow-indigo-500/10 border border-slate-800/80"
                    referrerPolicy="no-referrer"
                  />
                  <span className={`text-[10px] font-mono tracking-widest font-bold ${
                    themeMode === "dark" ? "text-indigo-400" : "text-indigo-600"
                  }`}>
                    GLYPHSTUDIO QUANTUM EDITION
                  </span>
                </div>
                <h2 className={`text-xl sm:text-2xl font-black font-sans tracking-tight flex items-center gap-2 ${
                  themeMode === "dark" ? "text-slate-100" : "text-stone-900"
                }`}>
                  Aesthetic Font Canvas
                </h2>
                <p className={`text-xs max-w-xl font-normal mt-1 leading-normal ${
                  themeMode === "dark" ? "text-slate-400" : "text-stone-500"
                }`}>
                  Instantly convert key characters into beautiful game symbols, calligraphic Nastaliq, cursive, or blackletter layouts.
                </p>
              </div>

              <div className="md:col-span-5 h-[120px] md:h-auto min-h-[110px] relative rounded-2xl overflow-hidden border border-slate-800/50 shadow-sm group">
                <img
                  src={bannerUrl}
                  alt="GlyphStudio Workspace"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800 font-bold">
                    Pro UI Studio
                  </span>
                </div>
              </div>
            </div>

            {/* Central Master Input Box Panel - AI Studio Prompt Box look */}
            <div className={`border rounded-2xl transition-all shadow-md ${
              themeMode === "dark" 
                ? "bg-[#111625] border-slate-800 shadow-black/20" 
                : "bg-white border-slate-200 shadow-slate-100/40"
            }`}>
              {/* Writer Header Toolbar */}
              <div className={`p-3 px-4 border-b flex items-center justify-between text-xs select-none ${
                themeMode === "dark" ? "border-slate-800/80 text-slate-350 bg-slate-950/20" : "border-slate-205 text-slate-705 bg-slate-50"
              }`}>
                <span className="flex items-center gap-1.5 font-bold">
                  <Type className="w-3.5 h-3.5 text-indigo-400" />
                  Text Prompt Workspace
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono font-bold ${
                    themeMode === "dark" ? "text-indigo-400" : "text-indigo-600"
                  }`}>
                    chars: {inputText.length}
                  </span>
                  {inputText && (
                    <button
                      onClick={clearInputText}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-bold ${
                        themeMode === "dark" 
                          ? "bg-slate-950 hover:bg-slate-900 border-slate-800 text-indigo-400"
                          : "bg-indigo-50 hover:bg-indigo-100 border-indigo-150 text-indigo-700"
                      }`}
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {/* Main text area input box style */}
              <div className="p-4 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Paste or write your words here to convert them..."
                  rows={4}
                  className={`w-full bg-transparent border-none text-[16px] placeholder-slate-400/40 focus:outline-none resize-none leading-relaxed font-sans font-normal ${
                    themeMode === "dark" ? "text-white" : "text-slate-900"
                  }`}
                />
              </div>

              {/* Writer Custom Quick helpers footer */}
              <div className={`p-3 border-t flex flex-wrap items-center justify-between gap-3 select-none text-xs ${
                themeMode === "dark" ? "border-slate-800/60 bg-slate-900/35" : "border-[#eaeaea] bg-slate-50/50"
              }`}>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">
                    Quick Templates:
                  </span>
                  <button
                    onClick={() => handleLoadSample("Check link in my bio 🌟")}
                    className={`border px-2.5 py-1.5 rounded-lg cursor-pointer text-[11px] transition-all font-semibold ${
                      themeMode === "dark"
                        ? "bg-[#161a29] hover:bg-slate-800 border-slate-800 text-indigo-300"
                        : "bg-white hover:bg-zinc-100 border-zinc-200 text-stone-850 shadow-sm"
                    }`}
                  >
                    🌸 Link in Bio
                  </button>
                  <button
                    onClick={() => handleLoadSample("★彡 [Asad_Asr_Gaming] 彡★")}
                    className={`border px-2.5 py-1.5 rounded-lg cursor-pointer text-[11px] transition-all font-semibold ${
                      themeMode === "dark"
                        ? "bg-[#161a29] hover:bg-slate-800 border-slate-800 text-indigo-300"
                        : "bg-white hover:bg-zinc-100 border-zinc-200 text-stone-850 shadow-sm"
                    }`}
                  >
                    👾 Gaming Alias
                  </button>
                  <button
                    onClick={() => handleLoadSample("New Youtube video is OUT now! Check out the link below ⚡")}
                    className={`border px-2.5 py-1.5 rounded-lg cursor-pointer text-[11px] transition-all font-semibold ${
                      themeMode === "dark"
                        ? "bg-[#161a29] hover:bg-slate-800 border-slate-800 text-indigo-300"
                        : "bg-white hover:bg-zinc-100 border-zinc-200 text-stone-850 shadow-sm"
                    }`}
                  >
                    🔥 YT Promo
                  </button>
                </div>

                {/* Reset button to standard help instructions text */}
                <button
                  onClick={() => handleLoadSample("Double draft bio creator index")}
                  className="text-slate-500 hover:text-slate-300 cursor-pointer transition-colors flex items-center gap-1"
                  title="Reset to helper prompt"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-405 text-indigo-400" />
                </button>
              </div>
            </div>

          {/* Aesthetic Global Decoration presets selection wrapper */}
          <div className={`p-4 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 ${
            themeMode === "dark" ? "bg-[#111625] border-slate-800" : "bg-white border-zinc-200 shadow-sm"
          }`}>
            <div className="space-y-0.5 select-none text-left">
              <span className={`text-xs font-bold flex items-center gap-1.5 ${
                themeMode === "dark" ? "text-slate-200" : "text-stone-850"
              }`}>
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                Insert Decoration Wrapper
              </span>
            </div>

            <div className="flex items-center gap-2 select-none">
              <select
                value={globalDecoId}
                onChange={(e) => setGlobalDecoId(e.target.value)}
                className={`border rounded-lg p-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
                  themeMode === "dark" ? "bg-slate-950 border-slate-800 text-indigo-300" : "bg-zinc-50 border-zinc-200 text-stone-800"
                }`}
              >
                {PRESET_DECORATIONS.map(preset => (
                   <option key={preset.id} value={preset.id}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Game & Social Presets Boards (Collapsible, dynamic styling output) */}
          <NicknameGenerator 
            onSelectSuggestion={(selectedText) => {
              setInputText(selectedText);
              const inputArea = document.querySelector("textarea");
              if (inputArea) {
                inputArea.scrollIntoView({ behavior: "smooth" });
              }
            }} 
            themeMode={themeMode} 
            inputText={inputText}
          />

            {/* Output Fonts Grid Canvas */}
            <div className="space-y-6">
              
              {/* FAVORITED STYLE TILES SECTION FIRST */}
              {sortedAndGroupedStyles.favorites.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 select-none">
                    <Star className="w-4 h-4 text-indigo-451 text-indigo-400 fill-indigo-400 animate-pulse" />
                    <span className={`text-xs uppercase font-bold tracking-wider ${
                      themeMode === "dark" ? "text-slate-400" : "text-slate-650"
                    }`}>
                      Favorite Font Styles
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sortedAndGroupedStyles.favorites.map((style) => (
                      <FontCard
                        key={style.id}
                        style={style}
                        rawText={inputText}
                        isFavorited={true}
                        onToggleFavorite={toggleFavorite}
                        onCopySuccess={handleCopySuccess}
                        globalDecoration={activeGlobalDeco}
                        themeMode={themeMode}
                        textSize={textSizeOverride}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* REGULAR AND STANDARD STYLE TILES SECTIONS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 select-none">
                  <Layers className="w-4 h-4 text-indigo-500" />
                  <span className={`text-xs uppercase font-bold tracking-wider ${
                    themeMode === "dark" ? "text-slate-400" : "text-slate-650"
                  }`}>
                    {selectedCategory === "all" ? "Aesthetic Font Decks" : `${selectedCategory} Fonts List`}
                  </span>
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                    themeMode === "dark" ? "text-indigo-400 bg-slate-950 border-slate-800" : "text-slate-600 bg-slate-100 border-slate-200"
                  }`}>
                    showing {filteredStyles.length} results
                  </span>
                </div>

                {filteredStyles.length === 0 ? (
                  <div className={`text-center py-12 border border-dashed rounded-2xl select-none ${
                    themeMode === "dark" ? "border-slate-800 bg-[#111625]/20" : "border-slate-205 bg-white"
                  }`}>
                    <BookOpen className="w-8 h-8 mx-auto text-slate-500 mb-2 animate-pulse" />
                    <p className={`text-xs ${themeMode === "dark" ? "text-slate-500" : "text-slate-500"}`}>No fonts match "{searchFilter}" under category "{selectedCategory}"</p>
                    <button
                      onClick={() => {
                        setSearchFilter("");
                        setSelectedCategory("all");
                      }}
                      className="mt-3.5 text-indigo-400 hover:text-indigo-300 font-bold text-xs cursor-pointer"
                    >
                      Reset and show all fonts
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {sortedAndGroupedStyles.standards.slice(0, visibleLimit).map((style, idx) => {
                        const showAdInside = idx === 4 || idx === 12;
                        return (
                          <div key={style.id} className="contents">
                            {showAdInside && (
                              <div className={`col-span-1 sm:col-span-2 p-4 rounded-xl border border-dashed transition-all relative overflow-hidden select-none flex flex-col md:flex-row items-center justify-between gap-4 ${
                                themeMode === "dark" 
                                  ? "bg-indigo-500/5 hover:bg-indigo-505/10 border-slate-800/80" 
                                  : "bg-[#f8fafc] hover:bg-slate-100/80 border-slate-200"
                              }`}>
                                <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-black font-mono px-2.5 py-1 rounded-bl tracking-widest uppercase">
                                  Sponsored AdSense Item
                                </span>
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 border border-slate-800/80 flex items-center justify-center font-bold text-xs animate-pulse">
                                    Ads
                                  </div>
                                  <div className="text-left space-y-0.5">
                                    <p className={`text-xs font-bold ${themeMode === "dark" ? "text-slate-200" : "text-slate-800"}`}>
                                      Responsive In-Feed Google AdSense Unit
                                    </p>
                                    <p className="text-[10px] text-slate-500 leading-normal max-w-md">
                                      This ad unit serves relevant local campaigns. Simply customize the script parameters inside <code className="text-indigo-400 bg-slate-950 font-mono px-1">AdSenseBanner.tsx</code> to activate continuous cash payouts.
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[10px] bg-indigo-950 text-indigo-305 px-2.5 py-1 rounded-md font-bold select-none border border-indigo-900/30">
                                  Active Placement
                                </span>
                              </div>
                            )}
                            <FontCard
                              style={style}
                              rawText={inputText}
                              isFavorited={favorites.includes(style.id)}
                              onToggleFavorite={toggleFavorite}
                              onCopySuccess={handleCopySuccess}
                              globalDecoration={activeGlobalDeco}
                              themeMode={themeMode}
                              textSize={textSizeOverride}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Standard Loading Delay simulator (Infinite scroll look) after 15 fonts */}
                    {sortedAndGroupedStyles.standards.length > visibleLimit && (
                      <div className={`mt-4 p-5 rounded-2xl border text-center transition-all ${
                        themeMode === "dark" 
                          ? "bg-[#111625] border-slate-800" 
                          : "bg-[#f8fafc] border-slate-200"
                      }`}>
                        {isLoadingMore ? (
                          <div className="flex flex-col items-center justify-center space-y-3 py-4">
                            <div className="flex items-center gap-2">
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                                className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full"
                              />
                              <span className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest animate-pulse">
                                Loading more typography variations...
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Please wait while the engine compiles the next blocks.
                            </p>
                            <div className="w-56 h-1 w-full max-w-xs bg-slate-950 rounded-full overflow-hidden mt-1">
                              <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, ease: "easeInOut" }}
                                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2.5 py-2">
                            <p className="text-xs text-slate-400">
                              You've reached the initial batch limit. {sortedAndGroupedStyles.standards.length - visibleLimit} more styles are queued for rendering.
                            </p>
                            <button
                              onClick={handleLoadMore}
                              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold uppercase text-[11px] px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-indigo-500/15 inline-flex items-center gap-2 hover:scale-102"
                            >
                              <span>🚀 Scroll Down or Click to Load More</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Intersection Observer trigger for automatic scrolling load */}
                    <div id="infinite-scroll-bottom-trigger" className="h-6 w-full opacity-0 pointer-events-none select-none" />
                  </div>
                )}
              </div>

              {/* Master Google AdSense Banner Leaderboard Slot (Ready for Paste) */}
              <AdSenseBanner clientId="ca-pub-XXXXXXXXXXXXXXXX" slotId="1234567890" themeMode={themeMode} />

              {/* STYLISH FOOTER DESIGN BY A.A.A. COMMUNITY */}
              <footer className={`mt-12 pt-6 pb-8 border-t text-center space-y-4 select-none ${
                themeMode === "dark" ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-600"
              }`}>
                <p className="text-xs font-bold tracking-wide">
                  Developed by <span className="text-indigo-400 font-bold font-mono">A.A.A. Community</span> with Love ✨
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono font-bold">
                  <button 
                    onClick={() => setIsPrivacyModalOpen(true)}
                    className="text-indigo-400 hover:text-indigo-300 cursor-pointer hover:underline"
                  >
                    Privacy Policy
                  </button>
                  <span className="opacity-30">|</span>
                  <button 
                    onClick={() => setIsDataPermitModalOpen(true)}
                    className="text-indigo-400 hover:text-indigo-305 cursor-pointer hover:underline"
                  >
                    Don't Sell My Data (Opt-Out)
                  </button>
                  <span className="opacity-30">|</span>
                  <span className="text-slate-500 text-[10px]">
                    © 2026 GlyphStudio • All Rights Reserved
                  </span>
                </div>
              </footer>

            </div>

          </div>
        </div>

        {/* ================= DESKTOP RIGHT SOCIAL ASSIST SIDEBAR ================= */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <AIAssistantPanel
            onApplyText={(text) => {
              setInputText(text);
              setMobileRightOpen(false);
            }}
            currentInput={inputText}
          />
        </div>

        {/* ================= MOBILE RIGHT DRAWER ================= */}
        <AnimatePresence>
          {mobileRightOpen && (
            <>
              {/* Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileRightOpen(false)}
                className="fixed inset-0 bg-black z-30 lg:hidden"
              />
              {/* Drawer Content */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.2 }}
                className="fixed top-0 bottom-0 right-0 w-80 bg-[#080d05] border-l border-[#1f3614] z-40 lg:hidden block h-full"
              >
                <div className="absolute top-4 left-4 z-50">
                  <button
                    onClick={() => setMobileRightOpen(false)}
                    className="p-1.5 rounded-lg bg-black text-lime-400 border border-lime-900/30 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-full pt-10">
                  <AIAssistantPanel
                    onApplyText={(text) => {
                      setInputText(text);
                      setMobileRightOpen(false);
                    }}
                    currentInput={inputText}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ================= PRIVACY POLICY DIALOG ================= */}
        <AnimatePresence>
          {isPrivacyModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black"
                onClick={() => setIsPrivacyModalOpen(false)}
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`w-full max-w-lg rounded-2xl border p-5 sm:p-6 shadow-2xl relative z-10 overflow-hidden ${
                  themeMode === "dark" ? "bg-[#090e06] border-[#1d3212] text-slate-100" : "bg-white border-lime-200 text-slate-800"
                }`}
              >
                {/* Accent parrot glow */}
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-lime-500/10 blur-xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-lime-900/20 pb-3 mb-4">
                  <h3 className="text-sm font-black uppercase text-lime-400 tracking-wider flex items-center gap-2 font-sans">
                    🦜 GlyphStudio Privacy Policy
                  </h3>
                  <button
                    onClick={() => setIsPrivacyModalOpen(false)}
                    className="p-1 rounded-lg hover:bg-lime-900/10 transition-colors text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed overflow-y-auto max-h-[300px] pr-1">
                  <p className="font-bold text-lime-100">
                    Your privacy is our utmost priority. This document outlines how GlyphStudio processes, stores, and protects user configurations.
                  </p>
                  <div>
                    <h4 className="font-bold text-[#84cc16] uppercase text-[10px] tracking-wider mb-0.5">1. Localized Preference Engine</h4>
                    <p className="text-slate-400">
                      We operate on a zero-tracking static client-side preference model. Your favorite glyphs, font category layouts, history logs of text copying actions, and customized color themes are serialized exclusively inside your browser's persistent <code className="text-lime-400">localStorage</code> storage. We do not store, catalog, or transmit your individual key logs or character codes to secondary cloud databases.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#84cc16] uppercase text-[10px] tracking-wider mb-0.5">2. Smart Analytical Polishers</h4>
                    <p className="text-slate-400">
                      When utilizing our AI-Polisher panel, the typed inputs are sent to the Google Gemini API to analyze context and render alternative typographical weights. These variables are handled and protected securely under enterprise-grade server infrastructure.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#84cc16] uppercase text-[10px] tracking-wider mb-0.5">3. Advertiser Compliance</h4>
                    <p className="text-slate-400">
                      Standard Google AdSense banner placement hooks do not read personal identifiers without explicit user consensus. The advertising script reads viewport dimensions to yield corresponding high-contrast mobile/desktop banner responsive layouts.
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-lime-900/10 pt-4 flex justify-end">
                  <button
                    onClick={() => setIsPrivacyModalOpen(false)}
                    className="bg-[#84cc16] hover:bg-[#a3e635] text-black font-extrabold text-[11px] uppercase p-2 px-5 rounded-lg transition-colors cursor-pointer"
                  >
                    Acknowledge Policy
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ================= DON'T SELL MY DATA MODAL ================= */}
        <AnimatePresence>
          {isDataPermitModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black"
                onClick={() => setIsDataPermitModalOpen(false)}
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className={`w-full max-w-lg rounded-2xl border p-5 sm:p-6 shadow-2xl relative z-10 overflow-hidden ${
                  themeMode === "dark" ? "bg-[#090e06] border-[#1d3212] text-slate-100" : "bg-white border-lime-200 text-slate-800"
                }`}
              >
                {/* Accent parrot glow */}
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-lime-500/10 blur-xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-lime-900/20 pb-3 mb-4">
                  <h3 className="text-sm font-black uppercase text-lime-400 tracking-wider flex items-center gap-2 font-sans">
                    🛡️ Do Not Sell My Personal Info
                  </h3>
                  <button
                    onClick={() => setIsDataPermitModalOpen(false)}
                    className="p-1 rounded-lg hover:bg-lime-900/10 transition-colors text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <p className="font-bold text-lime-100 leading-normal">
                    GLYPHSTUDIO DOES NOT SELL DATA. Your user parameters stay with you. Under state CCPA & worldwide specifications, you hold absolute sovereign dominion over your workspace choices.
                  </p>
                  
                  <div className={`p-4 rounded-xl border border-dashed flex flex-col gap-3 ${
                    themeMode === "dark" ? "bg-[#050803] border-[#1c3211]" : "bg-lime-50/20 border-lime-200"
                  }`}>
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={permitOptIn}
                        onChange={(e) => {
                          const state = e.target.checked;
                          setPermitOptIn(state);
                          if (!state) {
                            setFavorites([]);
                            setHistory([]);
                            localStorage.removeItem("stylish_favorites");
                            localStorage.removeItem("stylish_history");
                            alert("Opt-Out Triggered Successfully: Local storage favorites and history have been cleared and restricted in compliance with your Do-Not-Sell directive!");
                          }
                        }}
                        className="w-4 h-4 rounded mt-0.5 accent-[#84cc16]"
                      />
                      <div className="text-left">
                        <span className="font-bold text-[11px] block text-lime-400 uppercase tracking-wide">
                          Opt-In to Localized Cache Storage (Recommended)
                        </span>
                        <span className="text-[10px] text-slate-400 leading-relaxed block mt-0.5">
                          Unchecking this checkbox immediately clears all your saved favorites and search histories from this machine's browser memory workspace.
                        </span>
                      </div>
                    </label>
                  </div>

                  <p className="text-[10px] text-slate-500 italic mt-2">
                    ※ Note: Any data collection matrices here are 100% self-contained. No server holds secondary backups. Disabling options gives you complete total localized protection from analytics serialization trackers.
                  </p>
                </div>

                <div className="mt-5 border-t border-lime-900/10 pt-4 flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span className="text-lime-500 font-bold">
                    Status: {permitOptIn ? "✅ Absolute Local Compliance" : "❌ Total Opt-Out Asserted"}
                  </span>
                  <button
                    onClick={() => setIsDataPermitModalOpen(false)}
                    className="bg-[#84cc16] hover:bg-[#a3e635] text-black font-extrabold text-[11px] uppercase p-2 px-5 rounded-lg transition-colors cursor-pointer"
                  >
                    Confirm Choice
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ================= MOBILE FLOATING BOTTOM BAR ================= */}
        <div className="md:hidden fixed bottom-4 left-4 right-4 h-16 bg-[#090e06]/95 backdrop-blur-md border border-[#233d14] rounded-2xl flex items-center justify-between px-6 shadow-2xl z-[49] text-white select-none">
          {/* Home Button */}
          <button
            onClick={() => {
              const viewport = document.getElementById("main-scroll-viewport");
              if (viewport) {
                viewport.scrollTo({ top: 0, behavior: "smooth" });
              }
              setSelectedCategory("all");
              setSearchFilter("");
            }}
            className="flex flex-col items-center justify-center p-1 cursor-pointer active:scale-95 transition-transform text-lime-400 font-bold"
          >
            <span className="text-lg">🏠</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#a3e635]">Home</span>
          </button>

          {/* Junior Reload / Reset button in Center */}
          <div className="relative -top-3">
            <motion.button
              animate={isShaking ? {
                x: [0, -4, 4, -4, 4, -2, 2, 0],
                rotate: [0, -3, 3, -3, 3, -1, 1, 0]
              } : {}}
              transition={{ duration: 0.5 }}
              onClick={() => {
                setIsShaking(true);
                setInputText("");
                setTimeout(() => setIsShaking(false), 500);
              }}
              className="w-14 h-14 bg-gradient-to-tr from-[#84cc16] to-[#a3e635] text-black rounded-full flex flex-col items-center justify-center shadow-xl shadow-lime-500/30 border-2 border-[#122204] cursor-pointer animate-pulse"
            >
              <RotateCcw className="w-5 h-5 text-black" />
              <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5 leading-none">RESET</span>
            </motion.button>
          </div>

          {/* Plus More Options Menu Switch */}
          <button
            onClick={() => setIsPlusMenuOpen(!isPlusMenuOpen)}
            className="flex flex-col items-center justify-center p-1 cursor-pointer active:scale-95 transition-transform text-lime-400 font-bold"
          >
            <motion.div
              animate={{ rotate: isPlusMenuOpen ? 45 : 0 }}
              className="text-lg bg-[#111e0a] border border-[#233d14] w-9 h-9 rounded-xl flex items-center justify-center text-lime-400 shadow-inner hover:bg-slate-900 duration-300"
            >
              ➕
            </motion.div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#a3e635]">More</span>
          </button>
        </div>

        {/* ================= MOBILE PLUS ACTION sheet modal popup ================= */}
        <AnimatePresence>
          {isPlusMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPlusMenuOpen(false)}
                className="fixed inset-0 bg-black/80 z-[90] md:hidden"
              />
              
              {/* Flyout bottom drawer sheet */}
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={`fixed bottom-0 left-0 right-0 rounded-t-3xl border-t p-6 pb-24 z-[99] max-h-[85vh] overflow-y-auto md:hidden shadow-3xl text-left ${
                  themeMode === "dark" 
                    ? "bg-[#090e06] border-[#1d3212] text-slate-100" 
                    : "bg-white border-lime-200 text-slate-800"
                }`}
              >
                {/* Drag handle decoration */}
                <div className="w-12 h-1.5 bg-slate-700/30 rounded-full mx-auto mb-4" />

                <div className="flex items-center justify-between border-b border-[#1d3212]/30 pb-3 mb-5 select-none">
                  <h3 className="text-sm font-black uppercase text-lime-400 tracking-wider flex items-center gap-1.5 font-sans">
                    ✨ Intelligent Helper Suite
                  </h3>
                  <button
                    onClick={() => setIsPlusMenuOpen(false)}
                    className="p-1 rounded-lg hover:bg-lime-900/15 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Main controls list */}
                <div className="space-y-6">
                  {/* Option 1: Accessibility text size scaling */}
                  <div className="space-y-2">
                    <span className="text-xs uppercase font-black text-lime-400 tracking-wider font-mono flex items-center gap-1">
                      ⚙️ Accessibilities: Preview Font Scale
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Instantly scale the English previews to improve legibility on touch screen panels. Current: <span className="text-lime-500 font-bold">{textSizeOverride}px</span>
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-500">14px</span>
                      <input 
                        type="range" 
                        min="14" 
                        max="24" 
                        value={textSizeOverride}
                        onChange={(e) => setTextSizeOverride(Number(e.target.value))}
                        className="flex-1 accent-[#84cc16] cursor-pointer bg-slate-950 h-1.5 rounded-lg border border-[#1f3614]"
                      />
                      <span className="text-xs font-bold text-slate-500">24px</span>
                    </div>
                  </div>

                  {/* Option 2: Active theme Mode Toggler */}
                  <div className="flex items-center justify-between border-t border-[#1d3212]/20 pt-4">
                    <div className="text-left space-y-0.5">
                      <span className="text-xs uppercase font-black text-lime-400 tracking-wider font-mono block">
                        🌓 Workspace Theme Switcher
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Toggle high-contrast Dark interface & eye-protecting Light theme.
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setThemeMode(themeMode === "dark" ? "light" : "dark");
                      }}
                      className="p-2 px-4 bg-[#84cc16] text-black font-extrabold rounded-xl text-xs uppercase shadow-md shadow-lime-500/20 active:scale-95 transition-transform"
                    >
                      {themeMode === "dark" ? "☀️ Light mode" : "🌙 Dark mode"}
                    </button>
                  </div>

                  {/* Option 3: Technical Developer Contact help cards */}
                  <div className="border-t border-[#1d3212]/20 pt-4 space-y-2">
                    <span className="text-xs uppercase font-black text-lime-400 tracking-wider font-mono block">
                      📮 Contact AAA Community Support
                    </span>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      GlyphStudio tool represents premium crafted, zero-addiction typography. For business inquiries, technical APIs partnership, or API integration feedback:
                    </p>
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-[#1d3212] flex items-center justify-between">
                      <div className="text-left">
                        <span className="text-xs font-bold text-slate-350 block">Support Mail:</span>
                        <span className="text-xs text-[#84cc16] font-mono select-all">legal@aaa-community.org</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase border border-slate-700/50 px-2.5 py-1 rounded-md">
                        Developer ID
                      </span>
                    </div>
                  </div>

                  {/* Option 4: Static documentation notice */}
                  <div className="border-t border-[#1d3212]/20 pt-4 text-center select-none">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-widest font-mono">
                      v2.5.0 • Powered inside sandbox nodes
                    </span>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
