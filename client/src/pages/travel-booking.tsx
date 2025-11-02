import { useState, useCallback, KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { travelBookingFormSchema, type TravelBookingForm, type TravelBooking } from "@shared/schema";
import { DynamicList } from "@/components/dynamic-list";
import { EditableTemplateList } from "@/components/editable-template-list";
import { FileUpload } from "@/components/file-upload";
import { Loader2 } from "lucide-react";

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

const presetTerms = [
  "Tour fare is subject to change if group size less than {{enter number}} pax",
  "Quotation valid till {{pick/enter date}}. Rate subject to change after {{enter/pick date}}"
];


export default function TravelBooking() {
  const { toast } = useToast();
  const [fileSizeLimit, setFileSizeLimit] = useState(true);

  // Initialize form with default values
  const defaultValues: TravelBookingForm = {
    starting_date: "",
    meals_provided: false,
    flight_information: "",
    number_of_delegates: 1,
    number_of_tour_leaders: 1,
    hotel_selection: "",
    tour_fare: null,
    single_supplement: null,
    special_terms_enabled: false,
    special_terms: presetTerms,
    tour_fair_includes: presetIncludes,
    tour_fair_excludes: presetExcludes,
    uploaded_file: null as any,
    markdown_content: "",
    file_size_limit_enabled: true,
    itinerary_language: "English"
  };

  const form = useForm<TravelBookingForm>({
    resolver: zodResolver(travelBookingFormSchema),
    defaultValues: defaultValues
  });


  const submitMutation = useMutation({
    mutationFn: async (data: TravelBooking) => {
      const response = await apiRequest("POST", "/api/travel-booking", data);
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Success",
        description: result.message || "Travel booking submitted successfully!",
      });
      
      // Reset form to default values
      form.reset(defaultValues);
      setFileSizeLimit(true);
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
      number_of_delegates: data.number_of_delegates,
      number_of_tour_leaders: data.number_of_tour_leaders,
      hotel_selection: data.hotel_selection,
      tour_fare: data.tour_fare,
      single_supplement: data.single_supplement,
      special_terms_enabled: data.special_terms_enabled,
      special_terms: data.special_terms,
      tour_fair_includes: data.tour_fair_includes,
      tour_fair_excludes: data.tour_fair_excludes,
      uploaded_file: data.uploaded_file,
      markdown_content: data.markdown_content || "",
      file_size_limit_enabled: fileSizeLimit,
      itinerary_language: data.itinerary_language
    };

    submitMutation.mutate(submissionData);
  };

  // Keyboard navigation helper
  const handleFormKeyDown = useCallback((e: KeyboardEvent<HTMLFormElement>) => {
    // Skip button navigation with Escape key to reset focus to form
    if (e.key === 'Escape') {
      e.preventDefault();
      (e.currentTarget as HTMLFormElement).focus();
    }
    
    // Allow users to navigate between sections with Ctrl+Arrow keys
    if (e.ctrlKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      e.preventDefault();
      const sections = e.currentTarget.querySelectorAll('section[aria-labelledby]');
      const currentElement = document.activeElement;
      
      if (currentElement && sections.length > 0) {
        // Find which section contains the currently focused element
        let currentSectionIndex = -1;
        sections.forEach((section, index) => {
          if (section.contains(currentElement)) {
            currentSectionIndex = index;
          }
        });
        
        // Navigate to next/previous section
        if (currentSectionIndex >= 0) {
          const nextIndex = e.key === 'ArrowDown' 
            ? Math.min(currentSectionIndex + 1, sections.length - 1)
            : Math.max(currentSectionIndex - 1, 0);
          
          const nextSection = sections[nextIndex];
          const firstInput = nextSection.querySelector('input, textarea, button, [tabindex="0"]') as HTMLElement;
          if (firstInput) {
            firstInput.focus();
          }
        }
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Skip Links for Screen Readers */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded focus:shadow-lg"
      >
        Skip to main content
      </a>
      <a 
        href="#submit-button" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-40 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded focus:shadow-lg"
      >
        Skip to submit
      </a>
      
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8" role="banner">
          <h1 className="text-3xl font-bold text-foreground mb-2" id="main-heading">Itinerary Quotation</h1>
          <p className="text-muted-foreground text-lg" aria-describedby="main-heading">Complete your travel booking details below</p>
        </header>

        {/* Itinerary Quotation */}
        <Card className="shadow-lg">
          <CardContent className="p-8" id="main-content">
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit(onSubmit)} 
                onKeyDown={handleFormKeyDown}
                className="space-y-8"
                aria-labelledby="main-heading"
                noValidate
                tabIndex={-1}
              >
                
                {/* Date Section */}
                <section className="space-y-4" aria-labelledby="date-section-heading">
                  <h2 className="text-xl font-semibold text-card-foreground" id="date-section-heading">Travel Date</h2>
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
                            aria-describedby={field.value ? undefined : "date-help"}
                            placeholder="Select your travel start date"
                          />
                        </FormControl>
                        {!field.value && (
                          <p id="date-help" className="text-sm text-muted-foreground">
                            Choose the date your travel begins
                          </p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                {/* Meals Section */}
                <section className="space-y-4" aria-labelledby="meals-section-heading">
                  <h2 className="text-xl font-semibold text-card-foreground" id="meals-section-heading">Meal Options</h2>
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
                            aria-describedby="meals-help"
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
                        <p id="meals-help" className="text-sm text-muted-foreground">
                          Select whether meals are included in your travel package
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                {/* Group Information Section */}
                <section className="space-y-4" aria-labelledby="group-section-heading">
                  <h2 className="text-xl font-semibold text-card-foreground" id="group-section-heading">Group Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="number_of_delegates"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Delegates <span className="text-destructive" aria-label="required">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              data-testid="input-delegates"
                              aria-describedby="delegates-help"
                            />
                          </FormControl>
                          <p id="delegates-help" className="text-sm text-muted-foreground">
                            Total number of delegates in the group
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="number_of_tour_leaders"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Number of Tour Leaders <span className="text-destructive" aria-label="required">*</span></FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              data-testid="input-tour-leaders"
                              aria-describedby="tour-leaders-help"
                            />
                          </FormControl>
                          <p id="tour-leaders-help" className="text-sm text-muted-foreground">
                            Default is 1 tour leader
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                {/* Flight Info Section */}
                <section className="space-y-4" aria-labelledby="flight-section-heading">
                  <h2 className="text-xl font-semibold text-card-foreground" id="flight-section-heading">Flight Information</h2>
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
                            aria-describedby="flight-help"
                          />
                        </FormControl>
                        <p id="flight-help" className="text-sm text-muted-foreground">
                          Include flight numbers, departure/arrival times, airline names, and destinations. This helps us better assist with your travel needs.
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                {/* Hotel Selection Section */}
                <section className="space-y-4" aria-labelledby="hotel-section-heading">
                  <h2 className="text-xl font-semibold text-card-foreground" id="hotel-section-heading">Hotel Selection</h2>
                  <FormField
                    control={form.control}
                    name="hotel_selection"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hotel Details <span className="text-destructive" aria-label="required">*</span></FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter hotel name and details (e.g., 5Night @ Holiday Inn Express Xi'an Daxing IHG or similar local 4*)"
                            className="resize-none"
                            rows={4}
                            {...field}
                            data-testid="textarea-hotel-selection"
                            aria-describedby="hotel-help"
                          />
                        </FormControl>
                        <p id="hotel-help" className="text-sm text-muted-foreground">
                          Specify the hotel name, location, star rating, and number of nights
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                {/* Pricing & Special Terms Section */}
                <section className="space-y-6" aria-labelledby="pricing-section-heading">
                  <h2 className="text-xl font-semibold text-card-foreground" id="pricing-section-heading">Pricing Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tour_fare"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tour Fare</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              min="0"
                              placeholder="e.g., 5098"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                              data-testid="input-tour-fare"
                              aria-describedby="tour-fare-help"
                            />
                          </FormControl>
                          <p id="tour-fare-help" className="text-sm text-muted-foreground">
                            Total tour fare per person (e.g., RM 5098)
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="single_supplement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Single Supplement</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              min="0"
                              placeholder="e.g., 558"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                              data-testid="input-single-supplement"
                              aria-describedby="single-supplement-help"
                            />
                          </FormControl>
                          <p id="single-supplement-help" className="text-sm text-muted-foreground">
                            Additional cost for single room (e.g., RM 558)
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Special Terms and Conditions */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-card-foreground">Special Terms and Conditions</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Add pricing-related terms with editable template variables
                        </p>
                      </div>
                      <FormField
                        control={form.control}
                        name="special_terms_enabled"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 mb-0">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="toggle-special-terms"
                                aria-label="Enable special terms and conditions"
                              />
                            </FormControl>
                            <FormLabel className="!mt-0 cursor-pointer">
                              Apply Terms
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    {form.watch("special_terms_enabled") && (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                          Click on highlighted fields like <code className="bg-muted px-1 py-0.5 rounded text-primary">{'{{enter number}}'}</code> to edit them directly
                        </p>
                        <FormField
                          control={form.control}
                          name="special_terms"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <EditableTemplateList
                                  items={field.value}
                                  onChange={field.onChange}
                                  presetItems={presetTerms}
                                  testId="list-special-terms"
                                  addButtonTestId="button-add-special-term"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </section>

                {/* Itinerary Language Section */}
                <section className="space-y-4" aria-labelledby="language-section-heading">
                  <h2 className="text-xl font-semibold text-card-foreground" id="language-section-heading">Itinerary Language</h2>
                  <FormField
                    control={form.control}
                    name="itinerary_language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Language for Itinerary <span className="text-destructive" aria-label="required">*</span></FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            <Select
                              onValueChange={(value) => {
                                if (value === "other") {
                                  field.onChange("");
                                } else {
                                  field.onChange(value);
                                }
                              }}
                              value={["English", "Mandarin"].includes(field.value) ? field.value : "other"}
                              aria-describedby="language-help"
                            >
                              <SelectTrigger data-testid="select-language">
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="Mandarin">Mandarin</SelectItem>
                                <SelectItem value="other">Other (specify below)</SelectItem>
                              </SelectContent>
                            </Select>
                            
                            {!["English", "Mandarin"].includes(field.value) && (
                              <Input
                                placeholder="Enter your preferred language"
                                value={field.value}
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                }}
                                data-testid="input-custom-language"
                                aria-label="Custom language input"
                              />
                            )}
                          </div>
                        </FormControl>
                        <p id="language-help" className="text-sm text-muted-foreground">
                          Select the language you prefer for your travel itinerary documentation
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                {/* Tour Fair Includes Section */}
                <section className="space-y-4" aria-labelledby="includes-section-heading">
                  <h2 className="text-xl font-semibold text-card-foreground" id="includes-section-heading">Tour Fair Includes</h2>
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
                <section className="space-y-4" aria-labelledby="excludes-section-heading">
                  <h2 className="text-xl font-semibold text-card-foreground" id="excludes-section-heading">Tour Fair Excludes</h2>
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
                <section className="space-y-4" aria-labelledby="upload-section-heading">
                  <h2 className="text-xl font-semibold text-card-foreground" id="upload-section-heading">
                    Document Upload <span className="text-destructive" aria-label="required">*</span>
                  </h2>
                  
                  {/* File size limit toggle */}
                  <Card className="bg-accent">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium text-accent-foreground">
                            10MB File Size Limit
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1" id="file-limit-description">
                            Toggle to enable/disable 10MB file size restriction
                          </p>
                        </div>
                        <Switch
                          checked={fileSizeLimit}
                          onCheckedChange={setFileSizeLimit}
                          data-testid="toggle-file-size-limit"
                          aria-describedby="file-limit-description"
                          aria-label="Toggle 10MB file size limit"
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
                          Upload Travel Itinerary <span className="text-destructive" aria-label="required">*</span>
                        </FormLabel>
                        <FormControl>
                          <FileUpload
                            value={field.value}
                            onChange={field.onChange}
                            maxSize={fileSizeLimit ? 10 * 1024 * 1024 : undefined}
                            accept=".pdf,.doc,.docx,.xlsx,.md"
                            testId="input-file-upload"
                            required={true}
                            isInvalid={!!form.formState.errors.uploaded_file}
                            errorId={form.formState.errors.uploaded_file ? "upload-error" : undefined}
                          />
                        </FormControl>
                        <FormMessage id="upload-error" />
                      </FormItem>
                    )}
                  />

                  {/* Markdown Content Backup */}
                  <FormField
                    control={form.control}
                    name="markdown_content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Markdown Content (Optional Backup)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Paste markdown or markdown-formatted tables here as a backup if document processing doesn't work..."
                            className="resize-none font-mono text-sm"
                            rows={8}
                            {...field}
                            data-testid="textarea-markdown-content"
                            aria-describedby="markdown-help"
                          />
                        </FormControl>
                        <p id="markdown-help" className="text-sm text-muted-foreground">
                          Optional: Paste markdown content or tables here as a fallback if automated document processing fails
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                {/* Submit Section */}
                <section className="pt-6 border-t border-border" aria-labelledby="submit-section">
                  <Button 
                    type="submit" 
                    className="w-full"
                    size="lg"
                    disabled={submitMutation.isPending}
                    data-testid="button-submit"
                    aria-describedby="submit-help"
                    id="submit-button"
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
                  <p id="submit-help" className="text-sm text-muted-foreground text-center mt-3">
                    By submitting this form, you agree to our terms and conditions. Your information will be processed securely.
                  </p>
                </section>

              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}