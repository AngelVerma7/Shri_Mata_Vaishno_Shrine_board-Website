import { users, yatraBookings, accommodations, transportationServices, galleryImages, announcements } from "../shared/schema";
import type { User, InsertUser, YatraBooking, InsertYatraBooking, Accommodation, TransportationService, GalleryImage, Announcement } from "../shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Storage interface for user and booking operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Booking operations
  createYatraBooking(booking: InsertYatraBooking): Promise<YatraBooking>;
  getYatraBookingByReferenceId(referenceId: string): Promise<YatraBooking | undefined>;
  getUserBookings(userId: number): Promise<YatraBooking[]>;
  
  // Accommodation operations
  getAccommodations(): Promise<Accommodation[]>;
  getAccommodationsByLocation(location: string): Promise<Accommodation[]>;
  
  // Transportation operations
  getTransportationServices(): Promise<TransportationService[]>;
  
  // Gallery operations
  getGalleryImages(): Promise<GalleryImage[]>;
  getGalleryImagesByCategory(category: string): Promise<GalleryImage[]>;
  
  // Announcements operations
  getActiveAnnouncements(): Promise<Announcement[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createYatraBooking(booking: InsertYatraBooking): Promise<YatraBooking> {
    const [yatraBooking] = await db
      .insert(yatraBookings)
      .values(booking)
      .returning();
    return yatraBooking;
  }

  async getYatraBookingByReferenceId(referenceId: string): Promise<YatraBooking | undefined> {
    const [booking] = await db
      .select()
      .from(yatraBookings)
      .where(eq(yatraBookings.referenceId, referenceId));
    return booking || undefined;
  }

  async getUserBookings(userId: number): Promise<YatraBooking[]> {
    return await db
      .select()
      .from(yatraBookings)
      .where(eq(yatraBookings.userId, userId));
  }

  async getAccommodations(): Promise<Accommodation[]> {
    return await db
      .select()
      .from(accommodations)
      .where(eq(accommodations.available, true));
  }

  async getAccommodationsByLocation(location: string): Promise<Accommodation[]> {
    return await db
      .select()
      .from(accommodations)
      .where(eq(accommodations.location, location));
  }

  async getTransportationServices(): Promise<TransportationService[]> {
    return await db
      .select()
      .from(transportationServices)
      .where(eq(transportationServices.active, true));
  }

  async getGalleryImages(): Promise<GalleryImage[]> {
    return await db
      .select()
      .from(galleryImages)
      .where(eq(galleryImages.active, true));
  }

  async getGalleryImagesByCategory(category: string): Promise<GalleryImage[]> {
    return await db
      .select()
      .from(galleryImages)
      .where(eq(galleryImages.category, category));
  }

  async getActiveAnnouncements(): Promise<Announcement[]> {
    return await db
      .select()
      .from(announcements)
      .where(eq(announcements.active, true));
  }
}

export const storage = new DatabaseStorage();