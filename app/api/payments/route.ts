import { apiError, getHotelDb } from "@/lib/hotel-db";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      reservationId?: string;
      amount?: number;
      method?: string;
    };

    if (!payload.reservationId || !payload.amount || payload.amount <= 0) {
      return Response.json(
        { success: false, message: "Payment details are incomplete.", errors: [] },
        { status: 400 },
      );
    }

    const db = await getHotelDb();
    const reservation = await db
      .prepare("SELECT id, total FROM reservations WHERE id = ?")
      .bind(payload.reservationId)
      .first<{ id: string; total: number }>();

    if (!reservation || reservation.total !== Math.round(payload.amount)) {
      return Response.json(
        { success: false, message: "The payment amount does not match this reservation.", errors: [] },
        { status: 400 },
      );
    }

    const paymentId = crypto.randomUUID();
    const transactionRef = `TXN-${Date.now()}-${Math.floor(Math.random() * 999)}`;
    await db.batch([
      db
        .prepare(
          `INSERT INTO payments
            (id, reservation_id, amount, method, status, transaction_ref, paid_at)
           VALUES (?, ?, ?, ?, 'Paid', ?, CURRENT_TIMESTAMP)`,
        )
        .bind(
          paymentId,
          payload.reservationId,
          Math.round(payload.amount),
          payload.method?.trim() || "Visa ending 4242",
          transactionRef,
        ),
      db
        .prepare(
          "UPDATE reservations SET status = 'Confirmed', updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        )
        .bind(payload.reservationId),
    ]);

    return Response.json(
      {
        success: true,
        message: "Payment recorded and reservation confirmed",
        data: { paymentId, transactionRef, status: "Paid" },
      },
      { status: 201 },
    );
  } catch (error) {
    return apiError(error);
  }
}
