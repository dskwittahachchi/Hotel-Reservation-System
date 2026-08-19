"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MapPin,
  ReceiptText,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { DEMO_RESERVATIONS, formatCurrency, type Reservation } from "@/lib/catalog";

function readableDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function StatusBadge({ status }: { status: Reservation["status"] }) {
  return <span className={`status-badge status-${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>;
}

export function BookingsExperience() {
  const [reservations, setReservations] = useState<Reservation[]>(() =>
    DEMO_RESERVATIONS.filter((reservation) => reservation.guestEmail === "maya@demo.com"),
  );
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/reservations?email=maya%40demo.com")
      .then(async (response) => {
        const result = (await response.json()) as { data?: Reservation[] };
        if (active && response.ok && result.data?.length) setReservations(result.data);
      })
      .catch(() => undefined)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function cancelReservation() {
    if (!cancelTarget) return;
    setCancelling(true);
    setNotice("");
    try {
      const response = await fetch(`/api/reservations/${cancelTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" }),
      });
      const result = (await response.json()) as { message: string };
      if (!response.ok) throw new Error(result.message);
      setReservations((current) => current.map((reservation) =>
        reservation.id === cancelTarget.id ? { ...reservation, status: "Cancelled" } : reservation,
      ));
      setNotice("Your reservation has been cancelled. Our team will follow up about the refund.");
      setCancelTarget(null);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "The reservation could not be cancelled.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <main className="bookings-page">
      <SiteHeader />
      <section className="bookings-hero">
        <div className="page-shell bookings-hero-inner">
          <div><p className="eyebrow">Welcome back, Maya</p><h1>Your journeys,<br />beautifully kept.</h1></div>
          <div className="profile-chip"><span>MC</span><div><strong>Maya Chen</strong><small>maya@demo.com</small></div></div>
        </div>
      </section>

      <section className="section page-shell bookings-content">
        <div className="bookings-title-row">
          <div><p className="eyebrow">Upcoming</p><h2>Your next Nivara chapter</h2></div>
          <Link className="button button-outline" href="/search">Plan another stay</Link>
        </div>
        {notice ? <div className="success-notice"><CheckCircle2 size={18} />{notice}<button onClick={() => setNotice("")} aria-label="Dismiss"><X size={15} /></button></div> : null}
        {loading ? <div className="inline-loading"><LoaderCircle className="spin" />Refreshing your trips…</div> : null}

        <div className="booking-list">
          {reservations.map((reservation) => (
            <article className="trip-card" key={reservation.id}>
              <div className="trip-image">
                <Image src={reservation.imageUrl} alt={reservation.roomName} fill sizes="(max-width: 800px) 100vw, 38vw" />
                <StatusBadge status={reservation.status} />
              </div>
              <div className="trip-content">
                <div className="trip-heading"><div><p className="eyebrow"><MapPin size={13} /> Tangalle, Sri Lanka</p><h2>{reservation.roomName}</h2><span>Room {reservation.roomNumber}</span></div><div className="trip-reference"><span>Booking</span><strong>{reservation.confirmationCode}</strong></div></div>
                <div className="trip-facts">
                  <span><CalendarDays size={18} /><small>Check in</small><strong>{readableDate(reservation.checkIn)}</strong></span>
                  <span><CalendarDays size={18} /><small>Check out</small><strong>{readableDate(reservation.checkOut)}</strong></span>
                  <span><UsersRound size={18} /><small>Guests</small><strong>{reservation.guests} guests</strong></span>
                  <span><ReceiptText size={18} /><small>Total paid</small><strong>{formatCurrency(reservation.total)}</strong></span>
                </div>
                <div className="trip-service"><Sparkles size={16} /><span><strong>Your host is preparing your stay.</strong> Personal preferences can be added until 48 hours before arrival.</span></div>
                <div className="trip-actions">
                  <button className="button button-primary" type="button">Personalise stay <ArrowRight size={16} /></button>
                  {reservation.status !== "Cancelled" && reservation.status !== "Checked Out" ? <button className="button-link-danger" type="button" onClick={() => setCancelTarget(reservation)}>Cancel reservation</button> : null}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="help-card"><Clock3 size={22} /><div><strong>Need a hand?</strong><p>Our reservations team is here around the clock.</p></div><a href="mailto:stay@nivara.example">Contact your host <ArrowRight size={15} /></a></div>
      </section>

      {cancelTarget ? (
        <div className="modal-backdrop" role="presentation">
          <section className="confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="cancel-title">
            <button className="icon-button dialog-close" type="button" onClick={() => setCancelTarget(null)} aria-label="Close"><X /></button>
            <span className="confirm-icon">!</span>
            <p className="eyebrow">Please confirm</p>
            <h2 id="cancel-title">Cancel {cancelTarget.roomName}?</h2>
            <p>This will release the room for {readableDate(cancelTarget.checkIn)}. Our team will confirm any eligible refund by email.</p>
            <div className="confirm-actions"><button className="button button-outline" onClick={() => setCancelTarget(null)}>Keep reservation</button><button className="button button-danger" onClick={cancelReservation} disabled={cancelling}>{cancelling ? <LoaderCircle className="spin" size={16} /> : null} Cancel stay</button></div>
          </section>
        </div>
      ) : null}
      <SiteFooter />
    </main>
  );
}
