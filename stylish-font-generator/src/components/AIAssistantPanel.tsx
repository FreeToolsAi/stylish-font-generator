import { useState } from "react";
import { Sparkles, ArrowRight, Loader2, RefreshCw, Send, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AIAssistantPanelProps {
  onApplyText: (text: string) => void;
  currentInput: string;
}

export default function AIAssistantPanel({ onApplyText, currentInput }: AIAssistantPanelProps) {
  const [promptInput, setPromptInput] = useState("");
  const [tone, setTone] = useState("playful");
  const [platform, setPlatform] = useState("instagram");
  const [loading, setLoading] = useState(false);
  const [refinedOptions, setRefinedOptions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleAutocomplete = () => {
    if (currentInput.trim()) {
      setPromptInput(currentInput);
    } else {
      setPromptInput("my new youtube vlog is officially out check the link in my bio to watch right now");
    }
  };

  const generateAIPropositions = async () => {
    if (!promptInput.trim()) {
      setError("Please write some draft words first before triggering Gemini.");
      return;
    }

    setLoading(true);
    setError(null);
    setRefinedOptions([]);

    try {
      const res = await fetch("/api/gemini/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: promptInput,
          tone,
          platform
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to contact Gemini engine.");
      }

      if (data.options && Array.isArray(data.options)) {
        setRefinedOptions(data.options);
      } else {
        throw new Error("Incorrect payload layout received from servers.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#111625] border-l border-slate-800 text-slate-100 flex flex-col h-full overflow-y-auto select-none custom-scrollbar" id="right-control-panel">
      {/* Parameter Panel Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 px-1.5 bg-indigo-600 rounded text-xs font-black tracking-wide text-white uppercase select-none shadow shadow-indigo-500/20">
            GEMINI AI
          </div>
          <h2 className="text-sm font-bold font-sans tracking-wide text-slate-100">
            Quantum Copy Refiner
          </h2>
        </div>
        <Sparkles className="w-4 h-4 text-indigo-400 rotate-12 animate-pulse" />
      </div>

      <div className="p-4 flex-1 flex flex-col gap-4">
        {/* Helper Tip */}
        <div className="bg-indigo-950/20 border border-indigo-900/30 rounded-lg p-3 text-xs text-indigo-300 leading-relaxed">
          <p className="font-bold mb-1 flex items-center gap-1.5 text-indigo-200">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            Social Copy Polisher
          </p>
          Engage your crowd with polished bios. Type simple raw words below and click refine. Our server-side Gemini system generates rich aesthetic variations you can format!
        </div>

        {/* Input Block */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs text-slate-450">
            <span className="font-semibold text-slate-400">Raw Draft Idea</span>
            <button
              onClick={handleAutocomplete}
              className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer text-[11px] font-bold"
            >
              Autofill templates
            </button>
          </div>
          <textarea
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            placeholder="e.g. follow me for lifestyle tips and daily travel vlog content check out link in bio"
            rows={4}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono resize-none leading-relaxed"
          />
        </div>

        {/* Controls Layout */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-semibold">Desired Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="playful" className="bg-slate-950">✨ Playful & Fun</option>
              <option value="professional" className="bg-slate-950">💼 Professional</option>
              <option value="aesthetic" className="bg-slate-950">🌸 Soft Aesthetic</option>
              <option value="hype" className="bg-slate-950">🔥 Hype & Energy</option>
              <option value="minimal" className="bg-slate-950">🍃 Minimal Clean</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-semibold">Target Context</label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="instagram" className="bg-slate-950">Instagram Bio</option>
              <option value="tiktok" className="bg-slate-950">TikTok Caption</option>
              <option value="twitter" className="bg-slate-950">Twitter / X Post</option>
              <option value="gaming" className="bg-slate-950">Discord / Forums</option>
              <option value="generic" className="bg-slate-950">Universal Post</option>
            </select>
          </div>
        </div>

        {/* Action Run Button */}
        <button
          onClick={generateAIPropositions}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-bold uppercase p-3 rounded-lg flex items-center justify-center gap-2 border border-transparent shadow shadow-indigo-500/10 cursor-pointer transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Calling Gemini AI...
            </>
          ) : (
            <>
              Refine with Gemini AI ✦
            </>
          )}
        </button>

        {/* Content Options Box */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-950/40 border border-red-900/50 p-3 rounded-lg text-[11px] text-red-300"
            >
              <p className="font-semibold">Gemini Error:</p>
              <p className="mt-0.5">{error}</p>
            </motion.div>
          )}

          {refinedOptions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-3 mt-1"
            >
              <div className="flex justify-between items-center text-[10px] text-slate-450 px-1">
                <span className="uppercase tracking-widest font-extrabold text-indigo-400">Gemini Variations</span>
                <span>Select one to load</span>
              </div>

              {refinedOptions.map((opt, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950 border border-slate-800 hover:border-indigo-500 rounded-lg p-3 relative flex flex-col group transition-all"
                >
                  <p className="text-xs text-slate-200 leading-relaxed font-sans select-all pr-4">
                     {opt}
                  </p>
                  <button
                    onClick={() => onApplyText(opt)}
                    className="mt-3.5 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer self-end transition-transform group-hover:translate-x-0.5"
                  >
                    Apply into playground
                    <ArrowRight className="w-3 h-3 text-indigo-400" />
                  </button>
                  <span className="absolute top-2.5 right-3 text-[10px] font-mono text-slate-500 font-bold">
                    0{idx + 1}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Social Bio Quick Guide */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 text-slate-400 text-xs mt-auto space-y-2">
        <span className="font-bold text-indigo-400 uppercase tracking-widest text-[10px] block font-mono">
          Font Copier Quick Tips
        </span>
        <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px] leading-relaxed">
          <li>We support all major social engines (Instagram, TikTok, YT, X).</li>
          <li>Just type standard characters, select any style, and click to copy.</li>
          <li>Some old Android or iOS models may block complex symbols.</li>
        </ul>
      </div>
    </div>
  );
}
