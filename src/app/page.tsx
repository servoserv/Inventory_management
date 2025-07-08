import { getStockMaster, getLedger } from "@/lib/data";
import { StockMasterTable } from "@/components/tables/stock-master-table";
import { StatCard } from "@/components/dashboard/stat-card";
import PageHeader from "@/components/layout/page-header";
import { IndianRupee, Package, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const stockMaster = await getStockMaster();
  const ledger = await getLedger();

  const totalProfit = stockMaster.reduce((sum, item) => sum + item.profit, 0);
  const totalSalesQty = stockMaster.reduce((sum, item) => sum + item.salesQty, 0);
  const totalClosingQty = stockMaster.reduce((sum, item) => sum + item.closingQty, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Stock Overview" />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Profit"
          value={formatCurrency(totalProfit)}
          icon={IndianRupee}
          description="Total profit from all sales"
        />
        <StatCard
          title="Total Items Sold"
          value={totalSalesQty.toString()}
          icon={TrendingUp}
          description="Total quantity of all books sold"
        />
        <StatCard
          title="Total Items in Stock"
          value={totalClosingQty.toString()}
          icon={Package}
          description="Total quantity of all books available"
        />
      </div>
      <div>
        <h2 className="text-2xl font-bold font-headline mb-4">Stock Master</h2>
        <StockMasterTable data={stockMaster} />
      </div>
    </div>
  );
}
