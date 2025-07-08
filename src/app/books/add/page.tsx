import PageHeader from "@/components/layout/page-header";
import { AddBookForm } from "@/components/forms/add-book-form";

export default async function AddBookPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader 
        title="Add a New Book"
        description="Add a new book title to the inventory master list."
      />
      <div className="p-4 rounded-lg border bg-card shadow-sm">
        <AddBookForm />
      </div>
    </div>
  );
}
