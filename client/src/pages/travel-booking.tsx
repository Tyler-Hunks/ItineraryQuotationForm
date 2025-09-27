import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { travelBookingFormSchema, type TravelBookingForm, type TravelBooking } from "@shared/schema";
import { DynamicList } from "@/components/dynamic-list";
import { FileUpload } from "@/components/file-upload";
import { Loader2, Save, CheckCircle, AlertCircle } from "lucide-react";

const presetIncludes = [
  "Return International air fare + airport taxes + fuel surcharges + 20kg checked luggage",
  "Stay 05 Night as per itinerary based on twin / triple sharing",
  "Private touring in A/C coach with local Mandarin speaking guide as per itinerary",
  "Meals as per itinerary",
  "Tipping of tour guide & driver",
  "Travel Insurance (for age above 69 years old, require to top up RM108)",
  "01 tour leader service"
];

const presetExcludes = [
  "Hotel Portage in/out luggage",
  "Other expenses which are not indicated in itinerary"
];

// Local storage key for form data
const FORM_STORAGE_KEY = "travel-booking-form-data";
const STORAGE_VERSION = "v1"; // Version to handle schema changes

// Helper functions for local storage
const saveFormData = (data: TravelBookingForm) => {
  try {
    // Don't save if the form is essentially empty (only has default values)
    const hasData = data.starting_date || 
                   data.meals_provided || 
                   data.flight_information || 
                   data.uploaded_file ||
                   (data.tour_fair_includes && data.tour_fair_includes.length > presetIncludes.length) ||
                   (data.tour_fair_excludes && data.tour_fair_excludes.length > presetExcludes.length);
                   
    if (!hasData) {
      return;
    }
    
    // Create a copy of data without the file (which can't be JSON serialized)
    const dataToSave = { ...data };
    
    // Store file metadata separately if file exists
    let fileMetadata = null;
    if (data.uploaded_file) {
      fileMetadata = {
        filename: data.uploaded_file.filename,
        size: data.uploaded_file.size,
        type: data.uploaded_file.type
      };
      // Remove the actual file data before saving
      dataToSave.uploaded_file = null;
    }
    
    const storageData = {
      version: STORAGE_VERSION,
      timestamp: Date.now(),
      data: dataToSave,
      fileMetadata: fileMetadata
    };
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(storageData));
  } catch (error) {
    console.warn("Failed to save form data to localStorage:", error);
  }
};

const loadFormData = (): { data: Partial<TravelBookingForm>; hadFile: boolean } | null => {
  try {
    const stored = localStorage.getItem(FORM_STORAGE_KEY);
    if (!stored) return null;
    
    const parsed = JSON.parse(stored);
    
    // Check version compatibility
    if (parsed.version !== STORAGE_VERSION) {
      localStorage.removeItem(FORM_STORAGE_KEY);
      return null;
    }
    
    // Check if data is not too old (7 days)
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - parsed.timestamp > sevenDays) {
      localStorage.removeItem(FORM_STORAGE_KEY);
      return null;
    }
    
    return {
      data: parsed.data,
      hadFile: !!parsed.fileMetadata
    };
  } catch (error) {
    console.warn("Failed to load form data from localStorage:", error);
    localStorage.removeItem(FORM_STORAGE_KEY);
    return null;
  }
};

const clearFormData = () => {
  localStorage.removeItem(FORM_STORAGE_KEY);
};

export default function TravelBooking() {
  const { toast } = useToast();
  const [fileSizeLimit, setFileSizeLimit] = useState(true);
  const [isRestoringData, setIsRestoringData] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasRestoredData, setHasRestoredData] = useState(false);
  const [hadFileBeforeRestore, setHadFileBeforeRestore] = useState(false);
  const [isSubmittingSuccessfully, setIsSubmittingSuccessfully] = useState(false);

  // Initialize form with potential restored data
  const getInitialValues = useCallback((): TravelBookingForm => {
    const saved = loadFormData();
    
    if (saved?.data) {
      const data = saved.data;
      return {
        starting_date: data.starting_date || "",
        meals_provided: data.meals_provided || false,
        flight_information: data.flight_information || "",
        tour_fair_includes: data.tour_fair_includes || presetIncludes,
        tour_fair_excludes: data.tour_fair_excludes || presetExcludes,
        uploaded_file: null, // Always null - files can't be persisted
        file_size_limit_enabled: data.file_size_limit_enabled !== undefined ? data.file_size_limit_enabled : true
      };
    }
    
    return {
      starting_date: "",
      meals_provided: false,
      flight_information: "",
      tour_fair_includes: presetIncludes,
      tour_fair_excludes: presetExcludes,
      uploaded_file: null,
      file_size_limit_enabled: true
    };
  }, []);

  const form = useForm<TravelBookingForm>({
    resolver: zodResolver(travelBookingFormSchema),
    defaultValues: getInitialValues()
  });

  // Watch form values and auto-save to localStorage
  const formValues = form.watch();
  
  // Clear file restoration warning when a new file is uploaded
  useEffect(() => {
    if (formValues.uploaded_file && hadFileBeforeRestore) {
      setHadFileBeforeRestore(false);
    }
  }, [formValues.uploaded_file, hadFileBeforeRestore]);
  
  useEffect(() => {
    // Don't save during initial restoration or successful submission
    if (isRestoringData || isSubmittingSuccessfully) {
      setIsRestoringData(false);
      return;
    }
    
    setIsSaving(true);
    
    // Debounce saving to avoid excessive localStorage writes
    const timeoutId = setTimeout(() => {
      saveFormData(formValues);
      setIsSaving(false);
    }, 500);
    
    return () => {
      clearTimeout(timeoutId);
      setIsSaving(false);
    };
  }, [formValues, isRestoringData, isSubmittingSuccessfully]);

  // Restore fileSizeLimit state from saved data
  useEffect(() => {
    // Don't try to restore if we already have restored data (form was just reset)
    if (hasRestoredData) {
      setIsRestoringData(false);
      return;
    }
    
    const saved = loadFormData();
    
    if (saved?.data) {
      setHasRestoredData(true);
      setHadFileBeforeRestore(saved.hadFile);
      
      if (saved.data.file_size_limit_enabled !== undefined) {
        setFileSizeLimit(saved.data.file_size_limit_enabled);
      }
      
      // Show notification that data was restored with appropriate message
      const description = saved.hadFile 
        ? "Your previous progress has been restored. Please re-upload your document file."
        : "Your previous progress has been automatically restored.";
      
      toast({
        title: "Form data restored",
        description,
        duration: saved.hadFile ? 6000 : 4000,
      });
    }
    setIsRestoringData(false);
  }, [toast, hasRestoredData]);

  const submitMutation = useMutation({
    mutationFn: async (data: TravelBooking) => {
      const response = await apiRequest("POST", "/api/travel-booking", data);
      return response.json();
    },
    onSuccess: (result) => {
      // Set submission flag to prevent auto-save during reset
      setIsSubmittingSuccessfully(true);
      
      toast({
        title: "Success",
        description: result.message || "Travel booking submitted successfully!",
      });
      
      // Clear saved form data from localStorage immediately
      clearFormData();
      
      // Clear all restoration state
      setHasRestoredData(false);
      setHadFileBeforeRestore(false);
      
      // Clear file first, then reset form
      form.setValue("uploaded_file", null, { shouldDirty: false, shouldTouch: false, shouldValidate: false });
      form.reset({
        starting_date: "",
        meals_provided: false,
        flight_information: "",
        tour_fair_includes: presetIncludes,
        tour_fair_excludes: presetExcludes,
        uploaded_file: null,
        file_size_limit_enabled: true
      });
      setFileSizeLimit(true);
      
      // Reset submission flag after a brief delay to ensure form reset is complete
      setTimeout(() => {
        setIsSubmittingSuccessfully(false);
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: TravelBookingForm) => {
    // Transform form data to match API schema
    const submissionData: TravelBooking = {
      starting_date: data.starting_date || null,
      meals_provided: data.meals_provided,
      flight_information: data.flight_information || "",
      tour_fair_includes: data.tour_fair_includes,
      tour_fair_excludes: data.tour_fair_excludes,
      uploaded_file: data.uploaded_file,
      file_size_limit_enabled: fileSizeLimit
    };

    submitMutation.mutate(submissionData);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">Travel Booking Form</h1>
            {!isRestoringData && (
              <div className="flex items-center space-x-2 text-sm">
                {isSaving ? (
                  <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-400">
                    <Save className="w-4 h-4 animate-pulse" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Auto-saved</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-muted-foreground text-lg">Complete your travel booking details below</p>
          {hasRestoredData && (
            <div className="mt-3 inline-flex items-center space-x-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Previous progress restored</span>
            </div>
          )}
        </header>

        {/* Travel Booking Form */}
        <Card className="shadow-lg">
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Date Section */}
                <section className="space-y-4">
                  <h2 className="text-xl font-semibold text-card-foreground">Travel Date</h2>
                  <FormField
                    control={form.control}
                    name="starting_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Starting Date of Travel</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field} 
                            data-testid="input-starting-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                {/* Meals Section */}
                <section className="space-y-4">
                  <h2 className="text-xl font-semibold text-card-foreground">Meal Options</h2>
                  <FormField
                    control={form.control}
                    name="meals_provided"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Meals Provided</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value === "yes")}
                            value={field.value ? "yes" : "no"}
                            className="flex space-x-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="yes" id="meals-yes" data-testid="radio-meals-yes" />
                              <Label htmlFor="meals-yes">Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="no" id="meals-no" data-testid="radio-meals-no" />
                              <Label htmlFor="meals-no">No</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                {/* Flight Info Section */}
                <section className="space-y-4">
                  <h2 className="text-xl font-semibold text-card-foreground">Flight Information</h2>
                  <FormField
                    control={form.control}
                    name="flight_information"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Flight Details</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Paste your flight information here (flight numbers, times, destinations, etc.)"
                            className="resize-none"
                            rows={6}
                            {...field}
                            data-testid="textarea-flight-info"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                {/* Tour Fair Includes Section */}
                <section className="space-y-4">
                  <h2 className="text-xl font-semibold text-card-foreground">Tour Fair Includes</h2>
                  <FormField
                    control={form.control}
                    name="tour_fair_includes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <DynamicList
                            items={field.value}
                            onChange={field.onChange}
                            presetItems={presetIncludes}
                            testId="list-includes"
                            addButtonTestId="button-add-include"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                {/* Tour Fair Excludes Section */}
                <section className="space-y-4">
                  <h2 className="text-xl font-semibold text-card-foreground">Tour Fair Excludes</h2>
                  <FormField
                    control={form.control}
                    name="tour_fair_excludes"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <DynamicList
                            items={field.value}
                            onChange={field.onChange}
                            presetItems={presetExcludes}
                            testId="list-excludes"
                            addButtonTestId="button-add-exclude"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                {/* File Upload Section */}
                <section className="space-y-4">
                  <h2 className="text-xl font-semibold text-card-foreground">
                    Document Upload <span className="text-destructive">*</span>
                  </h2>
                  
                  {/* File size limit toggle */}
                  <Card className="bg-accent">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium text-accent-foreground">
                            10MB File Size Limit
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Toggle to enable/disable 10MB file size restriction
                          </p>
                        </div>
                        <Switch
                          checked={fileSizeLimit}
                          onCheckedChange={setFileSizeLimit}
                          data-testid="toggle-file-size-limit"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <FormField
                    control={form.control}
                    name="uploaded_file"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Upload Travel Itinerary <span className="text-destructive">*</span>
                        </FormLabel>
                        {hadFileBeforeRestore && !field.value && (
                          <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-200">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Re-upload required</span>
                            </div>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                              A file was previously uploaded but needs to be selected again due to browser security restrictions.
                            </p>
                          </div>
                        )}
                        <FormControl>
                          <FileUpload
                            value={field.value}
                            onChange={field.onChange}
                            maxSize={fileSizeLimit ? 10 * 1024 * 1024 : undefined}
                            accept=".pdf,.doc,.docx"
                            testId="input-file-upload"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                {/* Submit Section */}
                <section className="pt-6 border-t border-border">
                  <Button 
                    type="submit" 
                    className="w-full"
                    size="lg"
                    disabled={submitMutation.isPending}
                    data-testid="button-submit"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Booking Form"
                    )}
                  </Button>
                </section>

              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}