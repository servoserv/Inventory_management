
'use server';

import { google } from 'googleapis';
import type { StockMasterItem, LedgerEntry } from '@/types';
import { parse, format, isValid } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SHEET_ID;
const STOCK_MASTER_SHEET_NAME = 'Stock Master';
const LEDGER_SHEET_NAME = 'Ledger';

const getSheets = async () => {
  if (!process.env.GOOGLE_SHEETS_CLIENT_EMAIL || !process.env.GOOGLE_SHEETS_PRIVATE_KEY || !SPREADSHEET_ID) {
    throw new Error('Google Sheets API credentials are not set in .env file or the Sheet has not been shared with the client email.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client as any });
  return sheets;
};

const rowsToStockMaster = (rows: any[][]): StockMasterItem[] => {
  if (!rows || rows.length <= 1) return [];
  const headers = rows[0].map(h => h.replace(/_([a-z])/g, (g: any) => g[1].toUpperCase()));
  const data = rows.slice(1);
  return data.map((row, index) => {
    const item: any = { rowIndex: index + 2 };
    headers.forEach((header, i) => {
      const numericKeys = ['purchaseQty', 'purchaseAmt', 'salesQty', 'salesAmt', 'closingQty', 'closingPrice', 'profit'];
      item[header] = numericKeys.includes(header) ? parseFloat(row[i] || '0') : row[i];
    });
    return item as StockMasterItem;
  }).filter(item => item.id); // Filter out empty rows
};

const rowsToLedger = (rows: any[][]): LedgerEntry[] => {
    if (!rows || rows.length <= 1) return [];
    const headers = rows[0].map(h => h.replace(/_([a-z])/g, (g: any) => g[1].toUpperCase()));
    const data = rows.slice(1);
    return data.map((row, index) => {
      const item: any = { rowIndex: index + 2 };
      headers.forEach((header, i) => {
        const numericKeys = ['qty', 'amount', 'balance'];
        if (header === 'date') {
          const dateString = row[i];
          if (dateString) {
            // This logic is designed to correctly parse date strings from the sheet, assuming they represent IST.
            // It creates a proper Date object that represents the correct moment in time (in UTC).
            const formatsToTry = [
                'yyyy-MM-dd HH:mm:ss',
                'yyyy-MM-dd h:mm:ss a',
                'M/d/yyyy HH:mm:ss',
                'M/d/yyyy h:mm:ss a',
            ];
            let naiveDate: Date | null = null;
            for (const fmt of formatsToTry) {
                const d = parse(dateString, fmt, new Date());
                if (isValid(d)) {
                    naiveDate = d;
                    break;
                }
            }
            if (naiveDate) {
                const neutralString = format(naiveDate, "yyyy-MM-dd'T'HH:mm:ss");
                item.date = fromZonedTime(neutralString, 'Asia/Kolkata');
            } else {
                item.date = new Date('invalid');
            }
          } else {
            item.date = new Date('invalid');
          }
        } else {
            item[header] = numericKeys.includes(header) ? parseFloat(row[i] || '0') : row[i];
        }
      });
      if (!item.paymentMode) {
        item.paymentMode = "Offline";
      }
      return item as LedgerEntry;
    }).filter(item => item.id); // Filter out empty rows
};

// Find the sheetId (gid) for a given sheet name
const getSheetIdByName = async (sheets: any, sheetName: string): Promise<number | null> => {
    const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
    });
    const sheet = spreadsheet.data.sheets?.find((s: any) => s.properties?.title === sheetName);
    return sheet?.properties?.sheetId ?? null;
};

export const deleteRow = async (sheetName: string, rowIndex: number) => {
    const sheets = await getSheets();
    const sheetId = await getSheetIdByName(sheets, sheetName);

    if (sheetId === null) {
        throw new Error(`Sheet with name "${sheetName}" not found.`);
    }

    await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: {
            requests: [
                {
                    deleteDimension: {
                        range: {
                            sheetId: sheetId,
                            dimension: 'ROWS',
                            startIndex: rowIndex - 1, 
                            endIndex: rowIndex,
                        },
                    },
                },
            ],
        },
    });
};

export const getSheetData = async (sheetName: string) => {
  const sheets = await getSheets();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: sheetName,
  });
  return response.data.values || [];
};

export const appendSheetRow = async (sheetName: string, row: any[]) => {
  const sheets = await getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: sheetName,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [row],
    },
  });
};

export const updateSheetRow = async (sheetName: string, rowIndex: number, row: any[]) => {
    const sheets = await getSheets();
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
};

export async function fetchStockMaster(): Promise<StockMasterItem[]> {
    const rows = await getSheetData(STOCK_MASTER_SHEET_NAME);
    return rowsToStockMaster(rows);
}

export async function fetchLedger(): Promise<LedgerEntry[]> {
    const rows = await getSheetData(LEDGER_SHEET_NAME);
    return rowsToLedger(rows);
}
