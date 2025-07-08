import PageHeader from "@/components/layout/page-header";
import { PurchaseForm } from "@/components/forms/purchase-form";
import { getStockMaster } from "@/lib/data";

export default async function PurchasesPage() {
  const stockItems = await getStockMaster();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader 
        title="Purchase Entry"
        description="Record a new purchase. This will update the Stock Master and Ledger sheets."
      />
      <div className="p-4 rounded-lg border bg-card shadow-sm">
        <PurchaseForm stockItems={stockItems} />
      </div>
    </div>
  );
}
