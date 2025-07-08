"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
import type { StockMasterItem } from "@/types";
import { deleteBookAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

interface StockMasterTableProps {
  data: StockMasterItem[];
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <Button variant="destructive" type="submit" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : "Yes, delete it"}
    </Button>
  );
}

function DeleteBookDialog({ bookName, rowIndex }: { bookName: string, rowIndex: number }) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(deleteBookAction, { success: false, message: "" });
  
  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Success" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
    }
  }, [state, toast]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete {bookName}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <form action={formAction}>
          <input type="hidden" name="rowIndex" value={rowIndex} />
          <input type="hidden" name="bookName" value={bookName} />
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the book "{bookName}" from your Stock Master sheet. This action cannot be undone. 
              <br/><br/>
              Historical transaction records in the Ledger, Sales, and Purchases sheets will not be deleted to preserve your accounting history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <DeleteButton />
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}


export function StockMasterTable({ data }: StockMasterTableProps) {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-headline">Book Name</TableHead>
            <TableHead className="font-headline">Language</TableHead>
            <TableHead className="text-right font-headline">Closing Qty</TableHead>
            <TableHead className="text-right font-headline">Closing Price</TableHead>
            <TableHead className="text-right font-headline">Sales Qty</TableHead>
            <TableHead className="text-right font-headline">Sales Amt</TableHead>
            <TableHead className="text-right font-headline">Purchase Qty</TableHead>
            <TableHead className="text-right font-headline">Purchase Amt</TableHead>
            <TableHead className="text-right font-headline">Profit</TableHead>
            <TableHead className="text-center font-headline w-[50px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.bookName}</TableCell>
              <TableCell>{item.language}</TableCell>
              <TableCell className="text-right">
                <Badge variant={item.closingQty < 5 ? "destructive" : "secondary"}>
                  {item.closingQty}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(item.closingPrice)}</TableCell>
              <TableCell className="text-right">{item.salesQty}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.salesAmt)}</TableCell>
              <TableCell className="text-right">{item.purchaseQty}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.purchaseAmt)}</TableCell>
              <TableCell className="text-right font-medium text-green-600 dark:text-green-400">{formatCurrency(item.profit)}</TableCell>
              <TableCell className="text-center">
                {item.rowIndex && <DeleteBookDialog bookName={item.bookName} rowIndex={item.rowIndex} />}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
