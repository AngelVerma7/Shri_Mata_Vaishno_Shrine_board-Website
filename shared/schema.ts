import { pgTable, serial, varchar, text, timestamp, integer, boolean, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 15 }).notNull(),
  age: integer('age').notNull(),
  gender: varchar('gender', { length: 10 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Yatra bookings table
export const yatraBookings = pgTable('yatra_bookings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  referenceId: varchar('reference_id', { length: 20 }).notNull().unique(),
  visitDate: timestamp('visit_date').notNull(),
  duration: integer('duration').notNull(), // in days
  groupSize: integer('group_size').notNull(),
  transportMode: varchar('transport_mode', { length: 50 }),
  accommodation: varchar('accommodation', { length: 50 }),
  roomType: varchar('room_type', { length: 50 }),
  wheelchairAccess: boolean('wheelchair_access').default(false),
  medicalAssistance: boolean('medical_assistance').default(false),
  specialDiet: boolean('special_diet').default(false),
  additionalRequests: text('additional_requests'),
  status: varchar('status', { length: 20 }).default('pending'), // pending, confirmed, cancelled
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Accommodation table
export const accommodations = pgTable('accommodations', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  location: varchar('location', { length: 100 }).notNull(), // katra, adhkuwari, bhawan
  type: varchar('type', { length: 50 }).notNull(), // dormitory, standard, deluxe, suite
  pricePerNight: decimal('price_per_night', { precision: 8, scale: 2 }).notNull(),
  amenities: text('amenities'), // JSON string of amenities
  capacity: integer('capacity').notNull(),
  available: boolean('available').default(true),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Transportation services table
export const transportationServices = pgTable('transportation_services', {
  id: serial('id').primaryKey(),
  serviceName: varchar('service_name', { length: 100 }).notNull(),
  route: varchar('route', { length: 200 }).notNull(),
  duration: varchar('duration', { length: 50 }).notNull(),
  priceRange: varchar('price_range', { length: 100 }).notNull(),
  availability: varchar('availability', { length: 100 }).notNull(),
  description: text('description'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Gallery images table
export const galleryImages = pgTable('gallery_images', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  imageUrl: varchar('image_url', { length: 500 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(), // temple, journey, architecture, devotees
  altText: varchar('alt_text', { length: 200 }),
  featured: boolean('featured').default(false),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// News and announcements table
export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // news, announcement, alert
  priority: varchar('priority', { length: 20 }).default('normal'), // low, normal, high, urgent
  publishDate: timestamp('publish_date').defaultNow().notNull(),
  expiryDate: timestamp('expiry_date'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  yatraBookings: many(yatraBookings),
}));

export const yatraBookingsRelations = relations(yatraBookings, ({ one }) => ({
  user: one(users, {
    fields: [yatraBookings.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type YatraBooking = typeof yatraBookings.$inferSelect;
export type InsertYatraBooking = typeof yatraBookings.$inferInsert;
export type Accommodation = typeof accommodations.$inferSelect;
export type InsertAccommodation = typeof accommodations.$inferInsert;
export type TransportationService = typeof transportationServices.$inferSelect;
export type InsertTransportationService = typeof transportationServices.$inferInsert;
export type GalleryImage = typeof galleryImages.$inferSelect;
export type InsertGalleryImage = typeof galleryImages.$inferInsert;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;