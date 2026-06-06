import React, { useEffect, useState } from "react";
import { AlertTriangle, Info } from "lucide-react";

interface AdSenseBannerProps {
  slotId?: string; // e.g. "9876543210"
  clientId?: string; // e.g. "ca-pub-XXXXXXXXXXXXXXXX"
  styleFormat?: React.CSSProperties;
  layout?: string;
  themeMode: "light" | "dark";
}

export default function AdSenseBanner({
  slotId = "1234567890", // Placeholder default slotId
  clientId = "ca-pub-XXXXXXXXXXXXXXXX", // Placeholder default client ID
  styleFormat = { display: "block", textAlign: "center" },
  layout,
  themeMode,
}: AdSenseBannerProps) {
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    try {
      // Trigger standard google ads push
      if (typeof window !== "undefined") {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setActivated(true);
      }
    } catch (e) {
      console.warn("AdSense script push was deferred or blocked by browser blockers", e);
    }
  }, [slotId, clientId]);

  return (
    <div
      className={`my-6 rounded-2xl border border-dashed transition-all p-4 relative overflow-hidden select-none ${
        themeMode === "dark"
          ? "bg-[#090e06]/60 border-lime-500/20 hover:border-lime-500/40"
          : "bg-lime-50/25 border-lime-200 hover:border-lime-300"
      }`}
    >
      {/* Small marker badge */}
      <div className="absolute top-0 right-0 bg-[#84cc16] text-black text-[8px] font-black font-mono px-2 py-0.5 rounded-bl tracking-widest uppercase">
        Sponsor Placement
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#84cc16]/10 text-[#84cc16] border border-[#1f3614] flex items-center justify-center font-bold text-xs select-none">
            Ads
          </div>
          <div className="text-left">
            <h4 className={`text-xs font-black tracking-wide uppercase ${themeMode === "dark" ? "text-lime-400" : "text-lime-700"}`}>
              Google AdSense Banner Slot
            </h4>
            <p className="text-[10px] text-slate-400 max-w-lg leading-normal mt-0.5">
              Paste your AdSense IDs in the code file. Currently configured with Client ID: <code className="text-lime-400 bg-[#121f0e] px-1 py-0.5 rounded text-[9px] font-mono">{clientId}</code> and Slot ID: <code className="text-lime-400 bg-[#121f0e] px-1 py-0.5 rounded text-[9px] font-mono">{slotId}</code>.
            </p>
          </div>
        </div>
        
        <div className="text-right text-[10px] font-mono text-slate-500 flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-lime-500" />
          <span>Active CPC Unit</span>
        </div>
      </div>

      {/* Real HTML container for Google AdSense - ready for the script insertion */}
      <div className="mt-3 flex justify-center w-full">
        <ins
          className="adsbygoogle"
          style={styleFormat}
          data-ad-client={clientId}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
          {...(layout ? { "data-ad-layout": layout } : {})}
        />
      </div>
    </div>
  );
}
