
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { transactionSchema, addBookSchema } from "./schemas";
import { fetchStockMaster, appendSheetRow, updateSheetRow, deleteRow } from "./sheets";
import { getLedger } from "./data";
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { format } from "date-fns";

export type FormState = {
  message: string;
  success: boolean;
};

const STOCK_MASTER_SHEET_NAME = 'Stock Master';
const LEDGER_SHEET_NAME = 'Ledger';
const SALES_SHEET_NAME = 'Sales';
const PURCHASES_SHEET_NAME = 'Purchases';

export async function addSaleAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const data = Object.fromEntries(formData.entries());
    const parsedData = transactionSchema.safeParse(data);

    if (!parsedData.success) {
      const firstError = parsedData.error.errors[0];
      const errorMessage = firstError ? `${firstError.path.join('.')}: ${firstError.message}` : "Invalid form data. Please check all fields.";
      return { success: false, message: errorMessage };
    }
    
    const { bookId, qty, amount, date: dateString, time, billNo, remarks, paymentMode } = parsedData.data;

    const fullDateString = `${dateString}T${time}`;
    const transactionDateTime = fromZonedTime(fullDateString, 'Asia/Kolkata');

    const stockItems = await fetchStockMaster();
    const allTransactions = await getLedger();
    const stockItem = stockItems.find(item => item.id === bookId);

    if (!stockItem || typeof stockItem.rowIndex === 'undefined') {
        return { success: false, message: "Selected book not found in stock master." };
    }
    
    if (qty > stockItem.closingQty) {
        return { success: false, message: `Cannot sell ${qty} units. Only ${stockItem.closingQty} available.`};
    }

    const firstPurchase = allTransactions
      .filter(t => t.bookId === bookId && t.transactionType === 'Purchase')
      .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

    if (firstPurchase) {
      if (transactionDateTime < firstPurchase.date) {
        return { 
          success: false, 
          message: `Sale date/time cannot be before the first purchase date/time of ${format(firstPurchase.date, "PP p")}.`
        };
      }
    } else {
        return { success: false, message: "Cannot sell a book that has never been purchased." };
    }

    const newSalesQty = stockItem.salesQty + qty;
    const newSalesAmt = stockItem.salesAmt + amount;
    const newClosingQty = stockItem.closingQty - qty;
    const purchasePricePerUnit = stockItem.purchaseQty > 0 ? stockItem.purchaseAmt / stockItem.purchaseQty : 0;
    const costOfGoodsSold = purchasePricePerUnit * qty;
    const newProfit = stockItem.profit + (amount - costOfGoodsSold);

    const transactionId = `TXN-${Date.now()}`;
    const formattedDate = formatInTimeZone(transactionDateTime, 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');

    const updatedStockRow = [
      stockItem.id,
      stockItem.bookName,
      stockItem.language,
      stockItem.purchaseQty,
      stockItem.purchaseAmt,
      newSalesQty,
      newSalesAmt,
      newClosingQty,
      stockItem.closingPrice,
      newProfit,
    ];

    const ledgerEntryRow = [
      transactionId,
      formattedDate,
      bookId,
      stockItem.bookName,
      'Sale',
      qty,
      amount,
      paymentMode,
      billNo || '',
      newClosingQty,
      remarks || '',
    ];

    const salesEntryRow = [
        transactionId,
        formattedDate,
        bookId,
        stockItem.bookName,
        qty,
        amount,
        paymentMode,
        billNo || '',
        remarks || '',
    ];

    await updateSheetRow(STOCK_MASTER_SHEET_NAME, stockItem.rowIndex, updatedStockRow);
    await appendSheetRow(LEDGER_SHEET_NAME, ledgerEntryRow);
    await appendSheetRow(SALES_SHEET_NAME, salesEntryRow);
    
    revalidatePath('/');
    revalidatePath('/transactions');
    revalidatePath('/alerts');
    revalidatePath('/sales');

    return { success: true, message: `Successfully recorded sale of ${qty} units of ${stockItem.bookName}.` };
  } catch (error) {
    console.error("addSaleAction Error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, message };
  }
}

export async function addPurchaseAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const data = Object.fromEntries(formData.entries());
    const parsedData = transactionSchema.safeParse(data);

    if (!parsedData.success) {
      const firstError = parsedData.error.errors[0];
      const errorMessage = firstError ? `${firstError.path.join('.')}: ${firstError.message}` : "Invalid form data. Please check all fields.";
      return { success: false, message: errorMessage };
    }

    const { bookId, qty, amount, date: dateString, time, billNo, remarks, paymentMode } = parsedData.data;

    const fullDateString = `${dateString}T${time}`;
    const transactionDateTime = fromZonedTime(fullDateString, 'Asia/Kolkata');

    const stockItems = await fetchStockMaster();
    const stockItem = stockItems.find(item => item.id === bookId);

    if (!stockItem || typeof stockItem.rowIndex === 'undefined') {
      return { success: false, message: "Selected book not found in stock master." };
    }

    const newPurchaseQty = stockItem.purchaseQty + qty;
    const newPurchaseAmt = stockItem.purchaseAmt + amount;
    const newClosingQty = stockItem.closingQty + qty;
    const newClosingPrice = newPurchaseQty > 0 ? newPurchaseAmt / newPurchaseQty : 0;
    
    const transactionId = `TXN-${Date.now()}`;
    const formattedDate = formatInTimeZone(transactionDateTime, 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');

    const updatedStockRow = [
      stockItem.id,
      stockItem.bookName,
      stockItem.language,
      newPurchaseQty,
      newPurchaseAmt,
      stockItem.salesQty,
      stockItem.salesAmt,
      newClosingQty,
      newClosingPrice.toFixed(2),
      stockItem.profit,
    ];

    const ledgerEntryRow = [
      transactionId,
      formattedDate,
      bookId,
      stockItem.bookName,
      'Purchase',
      qty,
      amount,
      paymentMode,
      billNo || '',
      newClosingQty,
      remarks || '',
    ];

    const purchaseEntryRow = [
        transactionId,
        formattedDate,
        bookId,
        stockItem.bookName,
        qty,
        amount,
        paymentMode,
        billNo || '',
        remarks || '',
    ];

    await updateSheetRow(STOCK_MASTER_SHEET_NAME, stockItem.rowIndex, updatedStockRow);
    await appendSheetRow(LEDGER_SHEET_NAME, ledgerEntryRow);
    await appendSheetRow(PURCHASES_SHEET_NAME, purchaseEntryRow);

    revalidatePath('/');
    revalidatePath('/transactions');
    revalidatePath('/alerts');
    revalidatePath('/purchases');

    return { success: true, message: `Successfully recorded purchase of ${qty} units of ${stockItem.bookName}.` };
  } catch (error) {
    console.error("addPurchaseAction Error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, message };
  }
}

export async function addBookAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const data = Object.fromEntries(formData.entries());
    const parsedData = addBookSchema.safeParse(data);

    if (!parsedData.success) {
      const firstError = parsedData.error.errors[0];
      const errorMessage = firstError ? `${firstError.path.join('.')}: ${firstError.message}` : "Invalid form data.";
      return { success: false, message: errorMessage };
    }

    const { bookName, language, otherLanguage } = parsedData.data;
    const finalLanguage = language === 'other' ? otherLanguage : language;

    if (!finalLanguage || finalLanguage.trim() === '') {
      return { success: false, message: "Language cannot be empty." };
    }
    
    const sanitizedLanguage = finalLanguage.trim().charAt(0).toUpperCase() + finalLanguage.trim().slice(1);

    const id = `${sanitizedLanguage.substring(0, 3).toUpperCase()}-${bookName.replace(/\s+/g, '_').toUpperCase()}`;

    const stockItems = await fetchStockMaster();
    if (stockItems.some(item => item.id === id)) {
      return { success: false, message: `Book with ID ${id} already exists.` };
    }

    const newBookRow = [id, bookName, sanitizedLanguage, 0, 0, 0, 0, 0, 0, 0];
    
    await appendSheetRow(STOCK_MASTER_SHEET_NAME, newBookRow);
    
    revalidatePath('/');
    revalidatePath('/sales');
    revalidatePath('/purchases');
    revalidatePath('/books/add');

    return { success: true, message: `Successfully added book: ${bookName}` };
  } catch (error) {
    console.error("addBookAction Error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred while adding the book.";
    return { success: false, message };
  }
}

export async function deleteBookAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const rowIndex = Number(formData.get("rowIndex"));
    const bookName = String(formData.get("bookName"));

    if (!rowIndex || rowIndex < 2) { 
        return { success: false, message: "Invalid row index provided." };
    }

    await deleteRow(STOCK_MASTER_SHEET_NAME, rowIndex);

    revalidatePath('/');
    revalidatePath('/sales');
    revalidatePath('/purchases');
    revalidatePath('/alerts');
    
    return { success: true, message: `Successfully deleted book: ${bookName}` };
  } catch (error) {
    console.error("deleteBookAction Error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred while deleting the book.";
    return { success: false, message };
  }
}
