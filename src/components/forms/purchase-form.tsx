"use client";

import { useEffect, useActionState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { transactionSchema } from "@/lib/schemas";
import { addPurchaseAction } from "@/lib/actions";
import type { StockMasterItem } from "@/types";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, PackagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parse } from "date-fns";

interface PurchaseFormProps {
  stockItems: StockMasterItem[];
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="animate-spin" /> : "Record Purchase"}
    </Button>
  );
}

export function PurchaseForm({ stockItems }: PurchaseFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      bookId: "",
      qty: 0,
      amount: 0,
      paymentMode: "Offline",
      billNo: "",
      remarks: "",
      date: "",
      time: new Date().toTimeString().slice(0, 5),
    },
  });

  const [state, formAction] = useActionState(addPurchaseAction, { success: false, message: "" });
  
  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Success" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
      if (state.success) {
        form.reset();
      }
    }
  }, [state, toast, form]);
  
  if (stockItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-10 bg-secondary rounded-lg border border-dashed">
        <PackagePlus className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium font-headline">No Books in Inventory</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          You must first add a book to the master list before you can record a purchase.
        </p>
        <Button asChild className="mt-6">
          <Link href="/books/add">Add a New Book</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="md:col-span-1">
        <Label htmlFor="bookId">Book Name</Label>
        <Controller
          name="bookId"
          control={form.control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value} name="bookId">
              <SelectTrigger id="bookId">
                <SelectValue placeholder="Select a book" />
              </SelectTrigger>
              <SelectContent>
                {stockItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.bookName} ({item.language})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.bookId && <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.bookId.message}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <Label htmlFor="qty">Quantity</Label>
          <Input id="qty" name="qty" type="number" placeholder="0" {...form.register("qty", { valueAsNumber: true })} />
           {form.formState.errors.qty && <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.qty.message}</p>}
        </div>
        <div>
          <Label htmlFor="amount">Total Amount</Label>
          <Input id="amount" name="amount" type="number" placeholder="0.00" step="0.01" {...form.register("amount", { valueAsNumber: true })} />
           {form.formState.errors.amount && <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.amount.message}</p>}
        </div>
        <div>
           <Label htmlFor="date">Date of Purchase</Label>
            <Controller
                name="date"
                control={form.control}
                render={({field}) => (
                    <>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(parse(field.value, "yyyy-MM-dd", new Date()), "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="single"
                            selected={field.value ? parse(field.value, "yyyy-MM-dd", new Date()) : undefined}
                            onSelect={(date) => date && field.onChange(format(date, "yyyy-MM-dd"))}
                            initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    <input type="hidden" {...field} />
                    </>
                )}
            />
           {form.formState.errors.date && <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.date.message}</p>}
        </div>
        <div>
          <Label htmlFor="time">Time of Purchase</Label>
          <Input id="time" name="time" type="time" {...form.register("time")} />
          {form.formState.errors.time && <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.time.message}</p>}
        </div>
      </div>
      
      <div>
        <Label>Payment Mode</Label>
        <Controller
            name="paymentMode"
            control={form.control}
            render={({ field }) => (
              <RadioGroup
                name="paymentMode"
                className="flex items-center gap-4 pt-2"
                onValueChange={field.onChange}
                value={field.value}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Online" id="online" />
                  <Label htmlFor="online" className="font-normal">Online</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Offline" id="offline" />
                  <Label htmlFor="offline" className="font-normal">Offline</Label>
                </div>
              </RadioGroup>
            )}
        />
        {form.formState.errors.paymentMode && <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.paymentMode.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
            <Label htmlFor="billNo">Bill Number</Label>
            <Input id="billNo" name="billNo" type="text" placeholder="Optional" {...form.register("billNo")} />
        </div>
        <div className="md:col-span-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" name="remarks" placeholder="Optional" {...form.register("remarks")} />
        </div>
      </div>

      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
