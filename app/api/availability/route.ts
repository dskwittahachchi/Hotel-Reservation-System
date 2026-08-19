import { apiError, getHotelDb, parseAmenities } from "@/lib/hotel-db";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkIn = searchParams.get("checkIn") ?? "";
    const checkOut = searchParams.get("checkOut") ?? "";
    const guests = Number(searchParams.get("guests") ?? 2);

    if (
      !ISO_DATE.test(checkIn) ||
      !ISO_DATE.test(checkOut) ||
      checkIn >= checkOut ||
      !Number.isInteger(guests) ||
      guests < 1 ||
      guests > 8
    ) {
      return Response.json(
        { success: false, message: "Choose a valid date range and guest count.", errors: [] },
        { status: 400 },
      );
    }

    const db = await getHotelDb();
    const result = await db
      .prepare(
        `SELECT rt.*, COUNT(r.id) AS available_count, MIN(r.id) AS room_id
         FROM room_types rt
         JOIN rooms r ON r.room_type_id = rt.id
         WHERE rt.capacity >= ?
           AND r.status = 'Available'
           AND NOT EXISTS (
             SELECT 1 FROM reservations res
             WHERE res.room_id = r.id
               AND res.status IN ('Pending', 'Confirmed', 'Checked In')
               AND res.check_in < ?
               AND res.check_out > ?
           )
         GROUP BY rt.id
         ORDER BY rt.base_rate`,
      )
      .bind(guests, checkOut, checkIn)
      .all<Record<string, unknown>>();

    const rooms = result.results.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      eyebrow: row.eyebrow,
      description: row.description,
      capacity: row.capacity,
      baseRate: row.base_rate,
      sizeSqm: row.size_sqm,
      beds: row.beds,
      imageUrl: row.image_url,
      amenities: parseAmenities(row.amenities),
      availableCount: row.available_count,
      roomId: row.room_id,
    }));

    return Response.json({
      success: true,
      message: rooms.length ? "Available stays found" : "No rooms match those dates",
      data: rooms,
    });
  } catch (error) {
    return apiError(error);
  }
}
