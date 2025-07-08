"use client";

import { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addBookSchema } from "@/lib/schemas";
import { addBookAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// Expanded list of languages
const languages = [
  // Indian Languages
  "Assamese", "Bengali", "Bodo", "Dogri", "English", "Gujarati", "Hindi", "Kannada", "Kashmiri", "Konkani", "Maithili", "Malayalam", "Manipuri", "Marathi", "Nepali", "Odia", "Punjabi", "Sanskrit", "Santali", "Sindhi", "Tamil", "Telugu", "Urdu",
  // Major Foreign Languages
  "Arabic", "Chinese (Mandarin)", "French", "German", "Indonesian", "Italian", "Japanese", "Korean", "Portuguese", "Russian", "Spanish", "Swahili", "Turkish",
  // Other Formats
  "Braille",
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="animate-spin" /> : "Add Book"}
    </Button>
  );
}

export function AddBookForm() {
  const { toast } = useToast();
  const [generatedId, setGeneratedId] = useState<string>("");

  const form = useForm<z.infer<typeof addBookSchema>>({
    resolver: zodResolver(addBookSchema),
    defaultValues: {
      bookName: "",
      language: "",
      otherLanguage: ""
    },
  });

  const bookNameValue = form.watch("bookName");
  const languageValue = form.watch("language");
  const otherLanguageValue = form.watch("otherLanguage");

  useEffect(() => {
    const finalLanguage = languageValue === 'other' ? otherLanguageValue : languageValue;
    if (bookNameValue && finalLanguage) {
      const id = `${finalLanguage.substring(0, 3).toUpperCase()}-${bookNameValue.replace(/\s+/g, '_').toUpperCase()}`;
      setGeneratedId(id);
    } else {
      setGeneratedId("");
    }
  }, [bookNameValue, languageValue, otherLanguageValue]);

  const [state, formAction] = useActionState(addBookAction, { success: false, message: "" });
  
  useEffect(() => {
    if (state.message) {
      toast({
        title: state.success ? "Success" : "Error",
        description: state.message,
        variant: state.success ? "default" : "destructive",
      });
      if (state.success) {
        form.reset();
        setGeneratedId("");
      }
    }
  }, [state, toast, form]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-6">
        <div>
          <Label htmlFor="bookName">Book Name</Label>
          <Input id="bookName" name="bookName" type="text" placeholder="e.g., The Alchemist" {...form.register("bookName")} />
           {form.formState.errors.bookName && <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.bookName.message}</p>}
        </div>

        <Controller
          name="language"
          control={form.control}
          render={({ field }) => (
            <div>
              <Label htmlFor="language">Language</Label>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  if (value !== 'other') {
                    form.setValue("otherLanguage", "", { shouldValidate: false });
                  }
                }}
                value={field.value}
                name="language"
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                  <SelectItem value="other">Other...</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.language && <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.language.message}</p>}
            </div>
          )}
        />
        
        {languageValue === 'other' && (
          <div>
            <Label htmlFor="otherLanguage">Please specify language</Label>
            <Input
              id="otherLanguage"
              name="otherLanguage"
              type="text"
              placeholder="e.g., Braille"
              {...form.register("otherLanguage")}
            />
            {form.formState.errors.otherLanguage && <p className="text-sm font-medium text-destructive mt-1">{form.formState.errors.otherLanguage.message}</p>}
          </div>
        )}
      </div>
      
      {generatedId && (
        <div className="p-3 bg-secondary rounded-md">
          <p className="text-sm font-medium text-secondary-foreground">Generated Book ID</p>
          <p className="text-lg font-bold font-mono text-primary">{generatedId}</p>
        </div>
      )}
      
      <div className="flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
