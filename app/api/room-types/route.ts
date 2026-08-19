import { apiError, getHotelDb, parseAmenities } from "@/lib/hotel-db";

export async function GET() {
  try {
    const db = await getHotelDb();
    const result = await db.prepare(
      `SELECT rt.*, COUNT(r.id) AS available_count, MIN(r.id) AS room_id
       FROM room_types rt
       LEFT JOIN rooms r ON r.room_type_id = rt.id AND r.status = 'Available'
       GROUP BY rt.id
       ORDER BY rt.base_rate`,
    ).all<Record<string, unknown>>();

    const roomTypes = result.results.map((row) => ({
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

    return Response.json({ success: true, message: "Room types loaded", data: roomTypes });
  } catch (error) {
    return apiError(error);
  }
}
