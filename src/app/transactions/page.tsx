import PageHeader from "@/components/layout/page-header";
import { LedgerTable } from "@/components/tables/ledger-table";
import { getLedger } from "@/lib/data";

export default async function TransactionsPage() {
  const ledgerEntries = await getLedger();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader 
        title="Recent Transactions"
        description="A log of all sales and purchase activities."
      />
      <LedgerTable data={ledgerEntries} />
    </div>
  );
}
