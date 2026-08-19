import { apiError, getHotelDb, parseAmenities } from "@/lib/hotel-db";

export async function GET() {
  try {
    const db = await getHotelDb();
    const [summary, reservations, inventory, payments] = await Promise.all([
      db.prepare(
        `SELECT
          (SELECT COUNT(*) FROM reservations WHERE status IN ('Confirmed', 'Checked In')) AS active_bookings,
          (SELECT COUNT(*) FROM reservations WHERE check_in = date('now') AND status != 'Cancelled') AS arrivals_today,
          (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'Paid') AS revenue,
          (SELECT COUNT(*) FROM rooms WHERE status = 'Available') AS available_rooms,
          (SELECT COUNT(*) FROM rooms) AS total_rooms`,
      ).first<Record<string, number>>(),
      db.prepare(
        `SELECT res.id, res.confirmation_code, res.guest_name, res.guest_email,
          res.check_in, res.check_out, res.guests, res.total, res.status,
          rooms.room_number, room_types.name AS room_name,
          COALESCE(MAX(payments.status), 'Unpaid') AS payment_status
         FROM reservations res
         JOIN rooms ON rooms.id = res.room_id
         JOIN room_types ON room_types.id = rooms.room_type_id
         LEFT JOIN payments ON payments.reservation_id = res.id
         GROUP BY res.id
         ORDER BY res.check_in DESC
         LIMIT 20`,
      ).all<Record<string, unknown>>(),
      db.prepare(
        `SELECT rt.id, rt.name, rt.base_rate, rt.image_url, rt.amenities,
          COUNT(rooms.id) AS total_rooms,
          SUM(CASE WHEN rooms.status = 'Available' THEN 1 ELSE 0 END) AS available_rooms,
          SUM(CASE WHEN rooms.status = 'Occupied' THEN 1 ELSE 0 END) AS occupied_rooms,
          SUM(CASE WHEN rooms.status = 'Maintenance' THEN 1 ELSE 0 END) AS maintenance_rooms
         FROM room_types rt
         LEFT JOIN rooms ON rooms.room_type_id = rt.id
         GROUP BY rt.id
         ORDER BY rt.base_rate`,
      ).all<Record<string, unknown>>(),
      db.prepare(
        `SELECT payments.id, payments.amount, payments.method, payments.status,
          payments.transaction_ref, payments.paid_at, reservations.confirmation_code,
          reservations.guest_name
         FROM payments
         JOIN reservations ON reservations.id = payments.reservation_id
         ORDER BY payments.created_at DESC
         LIMIT 20`,
      ).all<Record<string, unknown>>(),
    ]);

    const totalRooms = summary?.total_rooms ?? 0;
    const availableRooms = summary?.available_rooms ?? 0;

    return Response.json({
      success: true,
      message: "Operations dashboard loaded",
      data: {
        summary: {
          activeBookings: summary?.active_bookings ?? 0,
          arrivalsToday: summary?.arrivals_today ?? 0,
          revenue: summary?.revenue ?? 0,
          availableRooms,
          totalRooms,
          occupancy: totalRooms ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) : 0,
        },
        reservations: reservations.results.map((row) => ({
          id: row.id,
          confirmationCode: row.confirmation_code,
          guestName: row.guest_name,
          guestEmail: row.guest_email,
          checkIn: row.check_in,
          checkOut: row.check_out,
          guests: row.guests,
          total: row.total,
          status: row.status,
          roomNumber: row.room_number,
          roomName: row.room_name,
          paymentStatus: row.payment_status,
        })),
        inventory: inventory.results.map((row) => ({
          id: row.id,
          name: row.name,
          baseRate: row.base_rate,
          imageUrl: row.image_url,
          amenities: parseAmenities(row.amenities),
          totalRooms: row.total_rooms,
          availableRooms: row.available_rooms,
          occupiedRooms: row.occupied_rooms,
          maintenanceRooms: row.maintenance_rooms,
        })),
        payments: payments.results.map((row) => ({
          id: row.id,
          amount: row.amount,
          method: row.method,
          status: row.status,
          transactionRef: row.transaction_ref,
          paidAt: row.paid_at,
          confirmationCode: row.confirmation_code,
          guestName: row.guest_name,
        })),
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
