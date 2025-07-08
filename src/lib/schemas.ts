import { z } from "zod";

export const transactionSchema = z.object({
  bookId: z.string().min(1, "Please select a book."),
  qty: z.coerce.number().positive("Quantity must be a positive number."),
  amount: z.coerce.number().positive("Amount must be a positive number."),
  date: z.string().min(1, { message: "Please select a date." }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, { message: "Please enter a valid time (HH:MM)." }),
  paymentMode: z.enum(["Online", "Offline"], {
    required_error: "Please select a payment mode.",
  }),
  billNo: z.string().optional(),
  remarks: z.string().optional(),
});

export const salesTransactionSchema = transactionSchema.superRefine((data, ctx) => {
    // This part would require client-side access to available stock
    // We will handle this in the form component itself
});

export const addBookSchema = z.object({
  bookName: z.string().min(3, "Book name must be at least 3 characters long."),
  language: z.string().min(1, "Please select a language from the list."),
  otherLanguage: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.language === 'other' && (!data.otherLanguage || data.otherLanguage.trim().length < 2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please specify the language (at least 2 characters).",
      path: ["otherLanguage"],
    });
  }
});
