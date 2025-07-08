import { fetchStockMaster, fetchLedger } from './sheets';
import type { StockMasterItem, LedgerEntry } from "@/types";

// The Google Sheet is now the source of truth.
// The functions in this file now wrap the sheet fetching logic.
// The old mock data has been removed.

export async function getStockMaster(): Promise<StockMasterItem[]> {
  try {
    return await fetchStockMaster();
  } catch (error) {
    console.error("Failed to fetch stock master data:", error);
    // Return empty array or throw error to be handled by the page
    return [];
  }
}

export async function getLedger(): Promise<LedgerEntry[]> {
  try {
    const ledger = await fetchLedger();
    // Return sorted by date descending
    return ledger.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Failed to fetch ledger data:", error);
    return [];
  }
}
