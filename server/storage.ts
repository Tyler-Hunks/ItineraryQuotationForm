import { type TravelBooking } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createTravelBooking(booking: TravelBooking): Promise<TravelBooking & { id: string; createdAt: Date }>;
  getTravelBooking(id: string): Promise<(TravelBooking & { id: string; createdAt: Date }) | undefined>;
}

export class MemStorage implements IStorage {
  private travelBookings: Map<string, TravelBooking & { id: string; createdAt: Date }>;

  constructor() {
    this.travelBookings = new Map();
  }

  async createTravelBooking(bookingData: TravelBooking): Promise<TravelBooking & { id: string; createdAt: Date }> {
    const id = randomUUID();
    const booking = {
      ...bookingData,
      id,
      createdAt: new Date(),
    };
    this.travelBookings.set(id, booking);
    return booking;
  }

  async getTravelBooking(id: string): Promise<(TravelBooking & { id: string; createdAt: Date }) | undefined> {
    return this.travelBookings.get(id);
  }
}

export const storage = new MemStorage();
