import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const roomTypes = sqliteTable("room_types", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  eyebrow: text("eyebrow").notNull(),
  description: text("description").notNull(),
  capacity: integer("capacity").notNull(),
  baseRate: integer("base_rate").notNull(),
  sizeSqm: integer("size_sqm").notNull(),
  beds: text("beds").notNull(),
  imageUrl: text("image_url").notNull(),
  amenities: text("amenities").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const rooms = sqliteTable("rooms", {
  id: text("id").primaryKey(),
  roomNumber: text("room_number").notNull().unique(),
  roomTypeId: text("room_type_id")
    .notNull()
    .references(() => roomTypes.id),
  floor: integer("floor").notNull(),
  status: text("status").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_rooms_room_type_status").on(table.roomTypeId, table.status),
]);

export const reservations = sqliteTable("reservations", {
  id: text("id").primaryKey(),
  confirmationCode: text("confirmation_code").notNull().unique(),
  guestId: text("guest_id").references(() => users.id),
  guestName: text("guest_name").notNull(),
  guestEmail: text("guest_email").notNull(),
  guestPhone: text("guest_phone").notNull(),
  roomId: text("room_id").notNull().references(() => rooms.id),
  checkIn: text("check_in").notNull(),
  checkOut: text("check_out").notNull(),
  guests: integer("guests").notNull(),
  nightlyRate: integer("nightly_rate").notNull(),
  total: integer("total").notNull(),
  status: text("status").notNull(),
  specialRequests: text("special_requests").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_reservations_room_dates").on(table.roomId, table.checkIn, table.checkOut),
  index("idx_reservations_guest_email").on(table.guestEmail),
  index("idx_reservations_status").on(table.status),
]);

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  reservationId: text("reservation_id").notNull().references(() => reservations.id),
  amount: integer("amount").notNull(),
  method: text("method").notNull(),
  status: text("status").notNull(),
  transactionRef: text("transaction_ref").notNull().unique(),
  paidAt: text("paid_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_payments_reservation_id").on(table.reservationId),
]);
