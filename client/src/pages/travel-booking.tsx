import { useState } from "react";
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

export default function TravelBooking() {
  const { toast } = useToast();
  const [fileSizeLimit, setFileSizeLimit] = useState(true);

  const form = useForm<TravelBookingForm>({
    resolver: zodResolver(travelBookingFormSchema),
    defaultValues: {
      starting_date: "",
      meals_provided: false,
      flight_information: "",
      tour_fair_includes: presetIncludes,
      tour_fair_excludes: presetExcludes,
      uploaded_file: null,
      file_size_limit_enabled: true
    }
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Travel Booking Form</h1>
          <p className="text-muted-foreground text-lg">Complete your travel booking details below</p>
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