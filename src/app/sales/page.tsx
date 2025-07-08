import PageHeader from "@/components/layout/page-header";
import { SalesForm } from "@/components/forms/sales-form";
import { getStockMaster } from "@/lib/data";

export default async function SalesPage() {
  const stockItems = await getStockMaster();
  
  return (
    <div className="flex flex-col gap-8">
      <PageHeader 
        title="Sales Entry"
        description="Record a new sale. This will update the Stock Master and Ledger sheets."
      />
      <div className="p-4 rounded-lg border bg-card shadow-sm">
        <SalesForm stockItems={stockItems} />
      </div>
    </div>
  );
}
