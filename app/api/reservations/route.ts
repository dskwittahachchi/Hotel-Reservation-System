import { apiError, getHotelDb, reservationCode } from "@/lib/hotel-db";
import { nightsBetween } from "@/lib/catalog";

type ReservationPayload = {
  roomId?: string;
  roomTypeId?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  specialRequests?: string;
};

const reservationSelect = `
  SELECT res.id, res.confirmation_code, res.guest_name, res.guest_email,
    res.guest_phone, res.room_id, res.check_in, res.check_out, res.guests,
    res.nightly_rate, res.total, res.status, res.special_requests, res.created_at,
    rooms.room_number, room_types.name AS room_name, room_types.image_url,
    COALESCE(MAX(payments.status), 'Unpaid') AS payment_status
  FROM reservations res
  JOIN rooms ON rooms.id = res.room_id
  JOIN room_types ON room_types.id = rooms.room_type_id
  LEFT JOIN payments ON payments.reservation_id = res.id
`;

function mapReservation(row: Record<string, unknown>) {
  return {
    id: row.id,
    confirmationCode: row.confirmation_code,
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    guestPhone: row.guest_phone,
    roomId: row.room_id,
    roomName: row.room_name,
    roomNumber: row.room_number,
    imageUrl: row.image_url,
    checkIn: row.check_in,
    checkOut: row.check_out,
    guests: row.guests,
    nightlyRate: row.nightly_rate,
    total: row.total,
    status: row.status,
    paymentStatus: row.payment_status,
    specialRequests: row.special_requests,
    createdAt: row.created_at,
  };
}

export async function GET(request: Request) {
  try {
    const db = await getHotelDb();
    const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase();
    const where = email ? "WHERE LOWER(res.guest_email) = ?" : "";
    const statement = db.prepare(
      `${reservationSelect} ${where} GROUP BY res.id ORDER BY res.check_in DESC`,
    );
    const result = email
      ? await statement.bind(email).all<Record<string, unknown>>()
      : await statement.all<Record<string, unknown>>();

    return Response.json({
      success: true,
      message: "Reservations loaded",
      data: result.results.map(mapReservation),
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ReservationPayload;
    const checkIn = payload.checkIn ?? "";
    const checkOut = payload.checkOut ?? "";
    const guests = Number(payload.guests ?? 0);
    const guestName = payload.guestName?.trim() ?? "";
    const guestEmail = payload.guestEmail?.trim().toLowerCase() ?? "";
    const guestPhone = payload.guestPhone?.trim() ?? "";

    if (
      !payload.roomTypeId ||
      !checkIn ||
      !checkOut ||
      checkIn >= checkOut ||
      guests < 1 ||
      !guestName ||
      !guestEmail.includes("@") ||
      !guestPhone
    ) {
      return Response.json(
        { success: false, message: "Complete all required booking details.", errors: [] },
        { status: 400 },
      );
    }

    const db = await getHotelDb();
    const room = await db
      .prepare(
        `SELECT rooms.id, room_types.base_rate
         FROM rooms
         JOIN room_types ON room_types.id = rooms.room_type_id
         WHERE rooms.room_type_id = ?
           AND rooms.status = 'Available'
           AND room_types.capacity >= ?
           AND NOT EXISTS (
             SELECT 1 FROM reservations res
             WHERE res.room_id = rooms.id
               AND res.status IN ('Pending', 'Confirmed', 'Checked In')
               AND res.check_in < ?
               AND res.check_out > ?
           )
         ORDER BY CASE WHEN rooms.id = ? THEN 0 ELSE 1 END, rooms.room_number
         LIMIT 1`,
      )
      .bind(payload.roomTypeId, guests, checkOut, checkIn, payload.roomId ?? "")
      .first<{ id: string; base_rate: number }>();

    if (!room) {
      return Response.json(
        { success: false, message: "That stay was just reserved. Please choose another room.", errors: [] },
        { status: 409 },
      );
    }

    const nights = nightsBetween(checkIn, checkOut);
    const total = Math.round(room.base_rate * nights * 1.2);
    const id = crypto.randomUUID();
    const confirmationCode = reservationCode();

    await db
      .prepare(
        `INSERT INTO reservations
          (id, confirmation_code, guest_name, guest_email, guest_phone, room_id, check_in, check_out, guests, nightly_rate, total, status, special_requests)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
      )
      .bind(
        id,
        confirmationCode,
        guestName,
        guestEmail,
        guestPhone,
        room.id,
        checkIn,
        checkOut,
        guests,
        room.base_rate,
        total,
        payload.specialRequests?.trim() ?? "",
      )
      .run();

    return Response.json(
      {
        success: true,
        message: "Reservation held for payment",
        data: { id, confirmationCode, total, status: "Pending" },
      },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}

export { mapReservation, reservationSelect };
