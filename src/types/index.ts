export interface StockMasterItem {
  rowIndex?: number; // The row number in the Google Sheet, for updates
  id: string;
  bookName: string;
  language: string;
  purchaseQty: number;
  purchaseAmt: number;
  salesQty: number;
  salesAmt: number;
  closingQty: number;
  closingPrice: number;
  profit: number;
}

export interface LedgerEntry {
  id: string;
  date: Date;
  bookId: string;
  bookName: string;
  transactionType: "Purchase" | "Sale";
  qty: number;
  amount: number;
  paymentMode: "Online" | "Offline";
  billNo?: string;
  balance: number;
  remarks?: string;
}

export interface DailyRecord {
  qty: number;
  amt: number;
}

export interface MonthlyRecord {
  [day: number]: DailyRecord;
}

export interface SaleRecord {
  bookName: string;
  dailyData: MonthlyRecord;
}

export interface PurchaseRecord {
  bookName: string;
  dailyData: MonthlyRecord;
}
