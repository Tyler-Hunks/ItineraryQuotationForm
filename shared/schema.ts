import { z } from "zod";

export const travelBookingSchema = z.object({
  starting_date: z.string().nullable(),
  meals_provided: z.boolean(),
  flight_information: z.string(),
  number_of_delegates: z.number(),
  number_of_tour_leaders: z.number(),
  hotel_selection: z.string(),
  tour_fare: z.number().nullable(),
  single_supplement: z.number().nullable(),
  special_terms_enabled: z.boolean(),
  special_terms: z.array(z.string()),
  tour_fair_includes: z.array(z.string()),
  tour_fair_excludes: z.array(z.string()),
  uploaded_file: z.object({
    filename: z.string(),
    size: z.number(),
    type: z.string(),
    data: z.string()
  }).nullable(),
  markdown_content: z.string(),
  file_size_limit_enabled: z.boolean(),
  itinerary_language: z.string()
});

export type TravelBooking = z.infer<typeof travelBookingSchema>;

// Form validation schema with additional constraints
export const travelBookingFormSchema = z.object({
  starting_date: z.string().optional(),
  meals_provided: z.boolean(),
  flight_information: z.string().optional(),
  number_of_delegates: z.number().min(1, "At least 1 delegate is required"),
  number_of_tour_leaders: z.number().min(1, "At least 1 tour leader is required"),
  hotel_selection: z.string().min(1, "Hotel selection is required"),
  tour_fare: z.number().nullable(),
  single_supplement: z.number().nullable(),
  special_terms_enabled: z.boolean(),
  special_terms: z.array(z.string()),
  tour_fair_includes: z.array(z.string()).min(1, "At least one include item is required"),
  tour_fair_excludes: z.array(z.string()).min(1, "At least one exclude item is required"),
  uploaded_file: z.object({
    filename: z.string(),
    size: z.number(),
    type: z.string(),
    data: z.string()
  }).nullable().refine((file) => file !== null, "Document upload is required"),
  markdown_content: z.string().optional(),
  file_size_limit_enabled: z.boolean(),
  itinerary_language: z.string().min(1, "Please select or enter an itinerary language")
});

export type TravelBookingForm = z.infer<typeof travelBookingFormSchema>;
