import PageHeader from "@/components/layout/page-header";
import { getStockMaster } from "@/lib/data";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default async function AlertsPage() {
  const stockItems = await getStockMaster();

  const lowStockAlerts = stockItems
    .filter(item => item.closingQty < 5 && item.closingQty > 0)
    .map(item => ({
      bookName: item.bookName,
      closingQty: item.closingQty,
      alert: `Low stock: Only ${item.closingQty} units left!`,
    }));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader 
        title="Low Stock Alerts"
        description="Warnings for items with fewer than 5 units in stock."
      />
      
      {lowStockAlerts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {lowStockAlerts.map((alert, index) => (
            <Card key={index} className="border-destructive">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-headline">{alert.bookName}</CardTitle>
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{alert.closingQty} <span className="text-sm font-normal text-muted-foreground">units left</span></p>
                <p className="text-sm text-destructive mt-2">{alert.alert}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-10 bg-card rounded-lg border border-dashed">
          <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="mt-4 text-lg font-medium font-headline">All Good!</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            No items are currently low on stock.
          </p>
        </div>
      )}
    </div>
  );
}
