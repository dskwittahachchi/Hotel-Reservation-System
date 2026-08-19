import { env } from "cloudflare:workers";
import { DEMO_RESERVATIONS, ROOM_TYPES } from "./catalog";

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Guest', 'Admin', 'Receptionist')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS room_types (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    eyebrow TEXT NOT NULL,
    description TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    base_rate INTEGER NOT NULL,
    size_sqm INTEGER NOT NULL,
    beds TEXT NOT NULL,
    image_url TEXT NOT NULL,
    amenities TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    room_number TEXT NOT NULL UNIQUE,
    room_type_id TEXT NOT NULL REFERENCES room_types(id),
    floor INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Available', 'Occupied', 'Maintenance')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS reservations (
    id TEXT PRIMARY KEY,
    confirmation_code TEXT NOT NULL UNIQUE,
    guest_id TEXT REFERENCES users(id),
    guest_name TEXT NOT NULL,
    guest_email TEXT NOT NULL,
    guest_phone TEXT NOT NULL,
    room_id TEXT NOT NULL REFERENCES rooms(id),
    check_in TEXT NOT NULL,
    check_out TEXT NOT NULL,
    guests INTEGER NOT NULL,
    nightly_rate INTEGER NOT NULL,
    total INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled')),
    special_requests TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    reservation_id TEXT NOT NULL REFERENCES reservations(id),
    amount INTEGER NOT NULL,
    method TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Paid', 'Refunded', 'Failed')),
    transaction_ref TEXT NOT NULL UNIQUE,
    paid_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  "CREATE INDEX IF NOT EXISTS idx_rooms_room_type_status ON rooms(room_type_id, status)",
  "CREATE INDEX IF NOT EXISTS idx_reservations_room_dates ON reservations(room_id, check_in, check_out)",
  "CREATE INDEX IF NOT EXISTS idx_reservations_guest_email ON reservations(guest_email)",
  "CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status)",
  "CREATE INDEX IF NOT EXISTS idx_payments_reservation_id ON payments(reservation_id)",
];

let initialization: Promise<void> | null = null;

async function seedDatabase(db: D1Database) {
  const roomTypeCount = await db
    .prepare("SELECT COUNT(*) AS count FROM room_types")
    .first<{ count: number }>();

  if ((roomTypeCount?.count ?? 0) > 0) return;

  const roomTypeStatements = ROOM_TYPES.map((roomType) =>
    db
      .prepare(
        `INSERT INTO room_types
          (id, slug, name, eyebrow, description, capacity, base_rate, size_sqm, beds, image_url, amenities)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        roomType.id,
        roomType.slug,
        roomType.name,
        roomType.eyebrow,
        roomType.description,
        roomType.capacity,
        roomType.baseRate,
        roomType.sizeSqm,
        roomType.beds,
        roomType.imageUrl,
        JSON.stringify(roomType.amenities),
      ),
  );

  const roomStatements = [
    ["room_101", "101", "roomtype_sanctuary", 1],
    ["room_102", "102", "roomtype_sanctuary", 1],
    ["room_103", "103", "roomtype_sanctuary", 1],
    ["room_201", "201", "roomtype_ocean", 2],
    ["room_202", "202", "roomtype_ocean", 2],
    ["room_203", "203", "roomtype_ocean", 2],
    ["room_301", "301", "roomtype_pool", 3],
    ["room_302", "302", "roomtype_pool", 3],
    ["room_303", "303", "roomtype_pool", 3],
    ["room_401", "401", "roomtype_family", 4],
    ["room_402", "402", "roomtype_family", 4],
  ].map(([id, number, roomTypeId, floor]) =>
    db
      .prepare(
        "INSERT INTO rooms (id, room_number, room_type_id, floor, status) VALUES (?, ?, ?, ?, 'Available')",
      )
      .bind(id, number, roomTypeId, floor),
  );

  await db.batch([
    ...roomTypeStatements,
    ...roomStatements,
    db
      .prepare(
        "INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
      )
      .bind("user_demo_maya", "Maya Chen", "maya@demo.com", "demo-hash", "Guest"),
    db
      .prepare(
        "INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)",
      )
      .bind("user_demo_admin", "Ari Perera", "ari@nivara.com", "demo-hash", "Admin"),
  ]);

  for (const reservation of DEMO_RESERVATIONS) {
    await db
      .prepare(
        `INSERT INTO reservations
          (id, confirmation_code, guest_id, guest_name, guest_email, guest_phone, room_id, check_in, check_out, guests, nightly_rate, total, status, special_requests, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        reservation.id,
        reservation.confirmationCode,
        reservation.guestEmail === "maya@demo.com" ? "user_demo_maya" : null,
        reservation.guestName,
        reservation.guestEmail,
        reservation.guestPhone,
        reservation.roomId,
        reservation.checkIn,
        reservation.checkOut,
        reservation.guests,
        reservation.nightlyRate,
        reservation.total,
        reservation.status,
        reservation.specialRequests,
        reservation.createdAt,
      )
      .run();

    await db
      .prepare(
        `INSERT INTO payments
          (id, reservation_id, amount, method, status, transaction_ref, paid_at)
         VALUES (?, ?, ?, 'Visa ending 4242', 'Paid', ?, ?)`,
      )
      .bind(
        `payment_${reservation.id}`,
        reservation.id,
        reservation.total,
        `TXN-${reservation.confirmationCode}`,
        reservation.createdAt,
      )
      .run();
  }
}

async function initializeDatabase(db: D1Database) {
  await db.batch(schemaStatements.map((sql) => db.prepare(sql)));
  await seedDatabase(db);
}

export async function getHotelDb() {
  if (!env.DB) {
    throw new Error("The hotel database is not available in this environment.");
  }

  initialization ??= initializeDatabase(env.DB);
  await initialization;
  return env.DB;
}

export function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  return Response.json(
    { success: false, message, errors: [] },
    { status: 500 },
  );
}

export function parseAmenities(value: unknown): string[] {
  try {
    return JSON.parse(String(value)) as string[];
  } catch {
    return [];
  }
}

export function reservationCode() {
  return `NVR-${Math.floor(10000 + Math.random() * 89999)}`;
}
