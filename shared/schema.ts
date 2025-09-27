import { z } from "zod";

export const travelBookingSchema = z.object({
  starting_date: z.string().nullable(),
  meals_provided: z.boolean(),
  flight_information: z.string(),
  tour_fair_includes: z.array(z.string()),
  tour_fair_excludes: z.array(z.string()),
  uploaded_file: z.object({
    filename: z.string(),
    size: z.number(),
    type: z.string(),
    data: z.string()
  }).nullable(),
  file_size_limit_enabled: z.boolean(),
  itinerary_language: z.string()
});

export type TravelBooking = z.infer<typeof travelBookingSchema>;

// Form validation schema with additional constraints
export const travelBookingFormSchema = z.object({
  starting_date: z.string().optional(),
  meals_provided: z.boolean(),
  flight_information: z.string().optional(),
  tour_fair_includes: z.array(z.string()).min(1, "At least one include item is required"),
  tour_fair_excludes: z.array(z.string()).min(1, "At least one exclude item is required"),
  uploaded_file: z.object({
    filename: z.string(),
    size: z.number(),
    type: z.string(),
    data: z.string()
  }).nullable().refine((file) => file !== null, "Document upload is required"),
  file_size_limit_enabled: z.boolean(),
  itinerary_language: z.string().min(1, "Please select or enter an itinerary language")
});

export type TravelBookingForm = z.infer<typeof travelBookingFormSchema>;
