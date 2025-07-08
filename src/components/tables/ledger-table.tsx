import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { LedgerEntry } from "@/types";
import { format, isValid } from "date-fns";

interface LedgerTableProps {
  data: LedgerEntry[];
}

export function LedgerTable({ data }: LedgerTableProps) {

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="rounded-lg border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-headline">Date</TableHead>
            <TableHead className="font-headline">Book Name</TableHead>
            <TableHead className="font-headline">Type</TableHead>
            <TableHead className="font-headline">Payment</TableHead>
            <TableHead className="text-right font-headline">Qty</TableHead>
            <TableHead className="text-right font-headline">Amount</TableHead>
            <TableHead className="text-right font-headline">Stock Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>{isValid(new Date(entry.date)) ? format(new Date(entry.date), "PP p") : 'Invalid Date'}</TableCell>
              <TableCell className="font-medium">{entry.bookName}</TableCell>
              <TableCell>
                <Badge variant={entry.transactionType === "Sale" ? "default" : "outline"} className={entry.transactionType === "Sale" ? "bg-accent text-accent-foreground" : ""}>
                  {entry.transactionType}
                </Badge>
              </TableCell>
              <TableCell>
                 <Badge variant={entry.paymentMode === "Online" ? "secondary" : "outline"}>
                  {entry.paymentMode}
                </Badge>
              </TableCell>
              <TableCell className="text-right">{entry.qty}</TableCell>
              <TableCell className="text-right">{formatCurrency(entry.amount)}</TableCell>
              <TableCell className="text-right font-medium">{entry.balance}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
