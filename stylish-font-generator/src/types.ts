/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HistoryItem {
  id: string;
  originalText: string;
  copiedText?: string;
  timestamp: string;
  copiedCount: number;
  createdAt?: number; // millisecond timestamp for 1-week expiry
}

export type FontCategory = "all" | "bold" | "script" | "gothic" | "bubble" | "special" | "decorated";

export interface AIResponse {
  options: string[];
}
