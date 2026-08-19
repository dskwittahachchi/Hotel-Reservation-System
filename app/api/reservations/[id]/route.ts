import { apiError, getHotelDb } from "@/lib/hotel-db";

const allowedStatuses = new Set([
  "Pending",
  "Confirmed",
  "Checked In",
  "Checked Out",
  "Cancelled",
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const payload = (await request.json()) as { status?: string };
    const status = payload.status ?? "";

    if (!allowedStatuses.has(status)) {
      return Response.json(
        { success: false, message: "Choose a valid reservation status.", errors: [] },
        { status: 400 },
      );
    }

    const db = await getHotelDb();
    const result = await db
      .prepare("UPDATE reservations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(status, id)
      .run();

    if (!result.meta.changes) {
      return Response.json(
        { success: false, message: "Reservation not found.", errors: [] },
        { status: 404 },
      );
    }

    return Response.json({ success: true, message: `Reservation marked ${status}`, data: { id, status } });
  } catch (error) {
    return apiError(error);
  }
}
