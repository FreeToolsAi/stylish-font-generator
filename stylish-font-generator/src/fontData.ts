/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Helper to convert dynamic UTF-32 code points into correct surrogate pairs
function fromCodePoint(cp: number): string {
  if (cp <= 0xFFFF) return String.fromCharCode(cp);
  cp -= 0x10000;
  return String.fromCharCode((cp >> 10) + 0xD800, (cp & 0x3FF) + 0xDC00);
}

// Map characters offset-wise
function mapOffset(text: string, upperStart: number, lowerStart: number, numberStart?: number): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    // Uppercase A-Z
    if (code >= 65 && code <= 90) {
      result += fromCodePoint(upperStart + (code - 65));
    }
    // Lowercase a-z
    else if (code >= 97 && code <= 122) {
      result += fromCodePoint(lowerStart + (code - 97));
    }
    // Numbers 0-9
    else if (code >= 48 && code <= 57 && numberStart) {
      result += fromCodePoint(numberStart + (code - 48));
    } else {
      result += text[i];
    }
  }
  return result;
}

// Inverted text map
const INVERT_MAP: Record<string, string> = {
  a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ", g: "ƃ", h: "ɥ", i: "ᴉ", j: "𝔿", k: "ʞ", l: "l", m: "ɯ",
  n: "u", o: "o", p: "d", q: "b", r: "ɹ", s: "s", t: "ʇ", u: "n", v: "ʌ", w: "ʍ", x: "x", y: "ʎ", z: "z",
  A: "∀", B: "𐐃", C: "Ɔ", D: "◖", E: "Ǝ", F: "Ⅎ", G: "⅁", H: "H", I: "I", J: "ſ", K: "⋊", L: "˥", M: "W",
  N: "N", O: "O", P: "Ԁ", Q: "Ό", R: "ᴚ", S: "S", T: "┴", U: "∩", V: "Λ", W: "M", X: "X", Y: "⅄", Z: "Z",
  "1": "⇂", "2": "ᄅ", "3": "Ɛ", "4": "ㄣ", "5": "ϛ", "6": "9", "7": "ㄥ", "8": "8", "9": "6", "0": "0",
  ".": "˙", ",": "'", "'": ",", "\"": "„", "?": "¿", "!": "¡", "(": ")", ")": "(", "[": "]", "]": "[",
  "{": "}", "}": "{", "<": ">", ">": "<", "_": "‾", "&": "⅋"
};

function invertString(text: string): string {
  let result = "";
  for (let i = text.length - 1; i >= 0; i--) {
    const char = text[i];
    result += INVERT_MAP[char] || char;
  }
  return result;
}

// Slashing / combining marks
function applyCombiningMark(text: string, markCode: string): string {
  return text.split("").map(c => c === " " ? " " : c + markCode).join("");
}

// Custom manual mappings for fonts with many holes in continuous block sequence (like script / double struck)
const SCRIPT_EXCEPTIONS: Record<string, string> = {
  B: "ℬ", H: "ℋ", I: "ℐ", L: "ℒ", M: "ℳ", R: "ℛ",
  e: "ℯ", g: "ℊ", o: "ℴ"
};

function mapScript(text: string, bold: boolean): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const char = text[i];
    if (bold) {
      // Script Bold is full 1D4D0 offset without many exceptions
      if (code >= 65 && code <= 90) result += fromCodePoint(0x1D4D0 + (code - 65));
      else if (code >= 97 && code <= 122) result += fromCodePoint(0x1D4EA + (code - 97));
      else result += char;
    } else {
      if (SCRIPT_EXCEPTIONS[char]) {
        result += SCRIPT_EXCEPTIONS[char];
      } else if (code >= 65 && code <= 90) {
        result += fromCodePoint(0x1D49C + (code - 65));
      } else if (code >= 97 && code <= 122) {
        result += fromCodePoint(0x1D4B6 + (code - 97));
      } else {
        result += char;
      }
    }
  }
  return result;
}

const DOUBLE_STRUCK_EXCEPTIONS: Record<string, string> = {
  C: "ℂ", H: "ℍ", N: "ℕ", P: "ℙ", Q: "ℚ", R: "ℝ", Z: "ℤ"
};

function mapDoubleStruck(text: string): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    const char = text[i];
    if (DOUBLE_STRUCK_EXCEPTIONS[char]) {
      result += DOUBLE_STRUCK_EXCEPTIONS[char];
    } else if (code >= 65 && code <= 90) {
      result += fromCodePoint(0x1D56C + (code - 65));
    } else if (code >= 97 && code <= 122) {
      result += fromCodePoint(0x1D586 + (code - 97));
    } else if (code >= 48 && code <= 57) {
      result += fromCodePoint(0x1D7D8 + (code - 48));
    } else {
      result += char;
    }
  }
  return result;
}

// Small Caps Character map
const SMALL_CAPS_MAP: Record<string, string> = {
  a: "ᴀ", b: "ʙ", c: "ᴄ", d: "ᴅ", e: "ᴇ", f: "ғ", g: "ɢ", h: "ʜ", i: "ɪ", j: "ᴊ", k: "ᴋ", l: "ʟ", m: "ᴍ",
  n: "ɴ", o: "ᴏ", p: "ᴘ", q: "ǫ", r: "ʀ", s: "s", t: "ᴛ", u: "ᴜ", v: "ᴠ", w: "ᴡ", x: "x", y: "ʏ", z: "ᴢ"
};

function mapSmallCaps(text: string): string {
  return text.split("").map(c => SMALL_CAPS_MAP[c.toLowerCase()] || c).join("");
}

// Zalgo markers
const ZALGO_UP = ["̍", "̎", "̄", "̅", "̿", "̑", "̆", "̐", "͒", "͗", "͑", "̇", "̈", "̊", "͂", "̓", "̈́", "͊", "͋", "͌", "̃", "̂", "̌", "͐", "̀", "́", "̋", "̽", "̚", "̕", "̛"];
const ZALGO_DOWN = ["̖", "̗", "̘", "̙", "̜", "̝", "̞", "̟", "̠", "̤", "̥", "̦", "̩", "̪", "̫", "̬", "̭", "̮", "̯", "̰", "̱", "̲", "̳", "̹", "̺", "̻", "̼", "ͅ", "͇", "͈", "͉"];
const ZALGO_MID = ["̕", "̛", "̢", "̧", "̨", "̴", "̵", "̶", "̷", "̸", "͏", "͓", "͔", "͕", "͖", "͗", "͘", "͚"];

function applyZalgo(text: string): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === " ") {
      result += " ";
      continue;
    }
    let zalgoChar = char;
    const numUp = 2;
    const numDown = 2;
    const numMid = 1;

    for (let j = 0; j < numUp; j++) zalgoChar += ZALGO_UP[Math.floor(Math.random() * ZALGO_UP.length)];
    for (let j = 0; j < numDown; j++) zalgoChar += ZALGO_DOWN[Math.floor(Math.random() * ZALGO_DOWN.length)];
    for (let j = 0; j < numMid; j++) zalgoChar += ZALGO_MID[Math.floor(Math.random() * ZALGO_MID.length)];
    result += zalgoChar;
  }
  return result;
}

// Type definitions
export interface DynamicPreset {
  id: string;
  name: string;
  prefix: string;
  suffix: string;
  prefixOverride?: string;
}

export const PRESET_DECORATIONS: DynamicPreset[] = [
  { id: "none", name: "None (Clean Style)", prefix: "", suffix: "" },
  { id: "sparkles", name: "Sparkles ✨", prefix: "✨ ", suffix: " ✨" },
  { id: "stars", name: "Star Wings ★彡", prefix: "★彡 [", suffix: "] 彡★" },
  { id: "brackets", name: "Double Brackets ⟦⟧", prefix: "⟦ ", suffix: " ⟧" },
  { id: "hearts", name: "Queen Hearts ♡", prefix: "🌹 𓆩♡𓆪 ", suffix: " 𓆩♡𓆪 🌹" },
  { id: "japanese", name: "Aesthetic Japan ❀", prefix: "❀〖 ", suffix: " 〗❀" },
  { id: "lightning", name: "Thunder Power ⚡", prefix: "⚡ ", suffix: " ⚡" },
  { id: "cross", name: "Sacred Cross ✞", prefix: "✞〖 ", suffix: " 〗✞" },
  { id: "arrows", name: "Pointer Link ➔", prefix: "➔ 🌟 ", suffix: " 🌟 ➔" }
];

export interface FontStyle {
  id: string;
  name: string;
  category: "all" | "bold" | "script" | "gothic" | "bubble" | "special" | "decorated";
  isPopular?: boolean;
  transform: (text: string) => string;
}

// The core 25 high-fidelity stylized fonts
const BASE_STYLES_LIST: FontStyle[] = [
  {
    id: "serif-bold",
    name: "Math Serif Bold",
    category: "bold",
    isPopular: true,
    transform: (t) => mapOffset(t, 0x1D400, 0x1D41A, 0x1D7CE)
  },
  {
    id: "serif-italic",
    name: "Math Serif Italic",
    category: "script",
    transform: (t) => mapOffset(t, 0x1D434, 0x1D44E)
  },
  {
    id: "serif-bold-italic",
    name: "Math Serif Bold Italic",
    category: "bold",
    isPopular: true,
    transform: (t) => mapOffset(t, 0x1D468, 0x1D482)
  },
  {
    id: "sans-normal",
    name: "Clean Sans-Serif",
    category: "decorated",
    transform: (t) => mapOffset(t, 0x1D5A0, 0x1D5BA, 0x1D7E2)
  },
  {
    id: "sans-bold",
    name: "Clean Sans-Serif Bold",
    category: "bold",
    isPopular: true,
    transform: (t) => mapOffset(t, 0x1D5D4, 0x1D5EE, 0x1D7EC)
  },
  {
    id: "sans-italic",
    name: "Clean Sans-Serif Italic",
    category: "script",
    transform: (t) => mapOffset(t, 0x1D608, 0x1D622)
  },
  {
    id: "sans-bold-italic",
    name: "Clean Sans Bold Italic",
    category: "bold",
    transform: (t) => mapOffset(t, 0x1D63C, 0x1D656)
  },
  {
    id: "script-normal",
    name: "Script Cursive Light",
    category: "script",
    isPopular: true,
    transform: (t) => mapScript(t, false)
  },
  {
    id: "script-bold",
    name: "Script Cursive Heavy",
    category: "script",
    isPopular: true,
    transform: (t) => mapScript(t, true)
  },
  {
    id: "gothic-normal",
    name: "Gothic Fraktur Light",
    category: "gothic",
    transform: (t) => mapOffset(t, 0x1D504, 0x1D51E)
  },
  {
    id: "gothic-bold",
    name: "Gothic Fraktur Heavy",
    category: "gothic",
    isPopular: true,
    transform: (t) => mapOffset(t, 0x1D538, 0x1D552)
  },
  {
    id: "double-struck",
    name: "Hollow Blackboard Dynamic",
    category: "decorated",
    isPopular: true,
    transform: (t) => mapDoubleStruck(t)
  },
  {
    id: "monospace",
    name: "Monospace Retro Typewriter",
    category: "special",
    transform: (t) => mapOffset(t, 0x1D670, 0x1D68A, 0x1D7F6)
  },
  {
    id: "circled-outline",
    name: "Circled Light Outlines",
    category: "bubble",
    isPopular: true,
    transform: (t) => mapOffset(t, 0x24B6, 0x24D0, 0x2460)
  },
  {
    id: "circled-solid",
    name: "Circled Inverse Dark Black",
    category: "bubble",
    transform: (t) => mapOffset(t, 0x1F150, 0x1F150, 0x2776) // mapped black circles
  },
  {
    id: "squared-outline",
    name: "Squared Block Outlines",
    category: "bubble",
    transform: (t) => mapOffset(t, 0x1F130, 0x1F130)
  },
  {
    id: "small-caps",
    name: "Clean Tiny Small Caps",
    category: "decorated",
    transform: (t) => mapSmallCaps(t)
  },
  {
    id: "inverted-flip",
    name: "Upside Down Flipped (uʍop ǝpᴉsd∩)",
    category: "special",
    transform: (t) => invertString(t)
  },
  {
    id: "glitch-zalgo",
    name: "Demonic Glitchee Zalgo ⛧",
    category: "special",
    isPopular: true,
    transform: (t) => applyZalgo(t)
  },
  {
    id: "strikethrough",
    name: "Crossout Strikethrough",
    category: "special",
    transform: (t) => applyCombiningMark(t, "\u0336")
  },
  {
    id: "slashed-center",
    name: "Bullet Slashed (̷S̷l̷a̷s̷h̷e̷d̷)",
    category: "special",
    transform: (t) => applyCombiningMark(t, "\u0338")
  },
  {
    id: "double-underline",
    name: "Double Underlined Block",
    category: "special",
    transform: (t) => applyCombiningMark(t, "\u0333")
  },
  {
    id: "wave-underline",
    name: "Wave Squiggly Underlined",
    category: "special",
    transform: (t) => applyCombiningMark(t, "\u0330")
  },
  {
    id: "alternating-case",
    name: "SpONgeBoB AlTeRnAtInG CaSe",
    category: "special",
    transform: (t) => t.split("").map((c, i) => i % 2 === 0 ? c.toUpperCase() : c.toLowerCase()).join("")
  },
  {
    id: "reverse-mirror",
    name: "Reversed Letters (rorriM)",
    category: "special",
    transform: (t) => t.split("").reverse().join("")
  },
  {
    id: "urdu-nastaliq-simple",
    name: "Jameel Noori Nastaliq Normal 🇵🇰",
    category: "special",
    isPopular: true,
    transform: (t) => t
  },
  {
    id: "urdu-royal-framed",
    name: "Urdu Royal Calligraphy ۩",
    category: "decorated",
    isPopular: true,
    transform: (t) => `۩ ۞ [ ${t} ] ۞ ۩`
  },
  {
    id: "urdu-glorious-wings",
    name: "Urdu Glorious Wings ꧁꧂",
    category: "decorated",
    transform: (t) => `꧁☬ ${t} ☬꧂`
  },
  {
    id: "urdu-flower-heart",
    name: "Urdu Flower & Heart 𓆩♡𓆪",
    category: "decorated",
    isPopular: true,
    transform: (t) => `𓆩♡𓆪 ${t} 𓆩♡𓆪`
  },
  {
    id: "urdu-bullet-shield",
    name: "Urdu Bullet Shield ︻╦╤─",
    category: "special",
    transform: (t) => `︻╦╤─ 【 ${t} 】 ─╤╦︻`
  },
  {
    id: "urdu-stellar-crescent",
    name: "Urdu Stellar Crescent ☪️",
    category: "decorated",
    transform: (t) => `🌙 ☪️ [ ${t} ] ☪️ 🌙`
  }
];

// Aesthetic Decoration Overlays to dynamically expand to 100+ Styles
// This maps to 9 decorative presets applied to our top 9 base fonts, multiplying option diversity instantly to over 105 total styles!
const OVERLAY_DECORATIONS = [
  { prefix: "✨ 𓆩", suffix: "𓆪 ✨", desc: "Aesthetic Glitter" },
  { prefix: "★彡 ", suffix: " 彡★", desc: "Star-Winged" },
  { prefix: "【 ", suffix: " 】", desc: "Bold Brackets" },
  { prefix: "🎀 𝔖𝔱𝔶𝔩𝔢 ➔ [", suffix: "] 🎀", desc: "Ribbon Bow" },
  { prefix: "❀〖 ", suffix: " 〗❀", desc: "Sakura Blossom" },
  { prefix: "⚡☠ ", suffix: " ☠⚡", desc: "Lightning Skull" },
  { prefix: "➔ 🔗 {", suffix: "}", desc: "Direct Linker" },
  { prefix: "✞🩸 𝕲𝖔𝖙𝖍 [", suffix: "] 🩸✞", desc: "Vampire Goth" },
  { prefix: "｡.｡:+* ", suffix: " *+:｡.｡", desc: "Vintage Wave" },
  { prefix: "♛ [", suffix: "] ♛", desc: "Imperial Crown" }
];

export const ALL_FONT_STYLES: FontStyle[] = [...BASE_STYLES_LIST];

let scaleId = 1500;
OVERLAY_DECORATIONS.forEach((deco) => {
  const targetBases = [
    { id: "serif-bold", cat: "decorated" as const },
    { id: "script-bold", cat: "script" as const },
    { id: "gothic-bold", cat: "gothic" as const },
    { id: "double-struck", cat: "decorated" as const },
    { id: "small-caps", cat: "decorated" as const },
    { id: "sans-bold", cat: "bold" as const },
    { id: "circled-outline", cat: "bubble" as const },
    { id: "monospace", cat: "special" as const }
  ];

  targetBases.forEach((target) => {
    const original = BASE_STYLES_LIST.find(s => s.id === target.id);
    if (original) {
      ALL_FONT_STYLES.push({
        id: `overlay-${scaleId++}`,
        name: `${original.name} (${deco.desc})`,
        category: "decorated",
        transform: (text) => `${deco.prefix}${original.transform(text)}${deco.suffix}`
      });
    }
  });
});

console.log(`Total styles computed programmatically: ${ALL_FONT_STYLES.length}`);
