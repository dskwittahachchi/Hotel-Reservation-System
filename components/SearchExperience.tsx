"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CreditCard,
  LoaderCircle,
  Maximize2,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import {
  formatCurrency,
  nightsBetween,
  ROOM_TYPES,
  type RoomType,
} from "@/lib/catalog";

type SearchExperienceProps = {
  initialCheckIn: string;
  initialCheckOut: string;
  initialGuests: number;
  initialRoomSlug?: string;
};

type ReservationHold = {
  id: string;
  confirmationCode: string;
  total: number;
};

function BookingDialog({
  room,
  checkIn,
  checkOut,
  guests,
  onClose,
}: {
  room: RoomType;
  checkIn: string;
  checkOut: string;
  guests: number;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"details" | "payment" | "confirmed">("details");
  const [hold, setHold] = useState<ReservationHold | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const nights = nightsBetween(checkIn, checkOut);
  const staySubtotal = room.baseRate * nights;
  const expectedTotal = Math.round(staySubtotal * 1.2);

  async function createReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.roomId,
          roomTypeId: room.id,
          checkIn,
          checkOut,
          guests,
          guestName: form.get("guestName"),
          guestEmail: form.get("guestEmail"),
          guestPhone: form.get("guestPhone"),
          specialRequests: form.get("specialRequests"),
        }),
      });
      const result = (await response.json()) as {
        success: boolean;
        message: string;
        data?: ReservationHold;
      };
      if (!response.ok || !result.data) throw new Error(result.message);
      setHold(result.data);
      setStep("payment");
    } catch (bookingError) {
      setError(bookingError instanceof Error ? bookingError.message : "We could not hold this room.");
    } finally {
      setBusy(false);
    }
  }

  async function recordPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hold) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: hold.id,
          amount: hold.total,
          method: "Visa ending 4242",
        }),
      });
      const result = (await response.json()) as { success: boolean; message: string };
      if (!response.ok) throw new Error(result.message);
      setStep("confirmed");
    } catch (paymentError) {
      setError(paymentError instanceof Error ? paymentError.message : "Payment could not be recorded.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose();
    }}>
      <section className="booking-dialog" role="dialog" aria-modal="true" aria-labelledby="booking-title">
        <button className="icon-button dialog-close" type="button" onClick={onClose} aria-label="Close booking">
          <X aria-hidden="true" />
        </button>
        <div className="booking-dialog-summary">
          <div className="booking-summary-image">
            <Image src={room.imageUrl} alt="" fill sizes="360px" />
          </div>
          <div>
            <p className="eyebrow">Your stay</p>
            <h2>{room.name}</h2>
            <div className="booking-dates">
              <span><CalendarDays size={16} aria-hidden="true" />{checkIn} → {checkOut}</span>
              <span><UsersRound size={16} aria-hidden="true" />{guests} guests · {nights} nights</span>
            </div>
          </div>
          <div className="price-breakdown">
            <span><span>{formatCurrency(room.baseRate)} × {nights} nights</span><strong>{formatCurrency(staySubtotal)}</strong></span>
            <span><span>Taxes & service</span><strong>{formatCurrency(expectedTotal - staySubtotal)}</strong></span>
            <span className="price-total"><span>Total</span><strong>{formatCurrency(hold?.total ?? expectedTotal)}</strong></span>
          </div>
        </div>

        <div className="booking-dialog-form">
          {step === "details" ? (
            <form onSubmit={createReservation}>
              <div className="step-heading"><span>01</span><div><p className="eyebrow">Guest details</p><h3 id="booking-title">Who should we welcome?</h3></div></div>
              <div className="form-grid">
                <label className="field field-wide"><span>Full name</span><input name="guestName" defaultValue="Maya Chen" autoComplete="name" required /></label>
                <label className="field"><span>Email</span><input type="email" name="guestEmail" defaultValue="maya@demo.com" autoComplete="email" required /></label>
                <label className="field"><span>Phone</span><input name="guestPhone" defaultValue="+1 415 555 0198" autoComplete="tel" required /></label>
                <label className="field field-wide"><span>Anything we should know?</span><textarea name="specialRequests" rows={3} placeholder="Arrival time, dietary preferences or a special occasion" /></label>
              </div>
              {error ? <div className="form-error" role="alert">{error}</div> : null}
              <button className="button button-primary button-full" type="submit" disabled={busy}>
                {busy ? <LoaderCircle className="spin" size={18} aria-hidden="true" /> : null}
                Continue to payment <ArrowRight size={17} aria-hidden="true" />
              </button>
              <p className="secure-note"><ShieldCheck size={15} aria-hidden="true" /> Your room is rechecked before the reservation is created.</p>
            </form>
          ) : null}

          {step === "payment" && hold ? (
            <form onSubmit={recordPayment}>
              <button className="back-link" type="button" onClick={() => setStep("details")}><ArrowLeft size={15} /> Back</button>
              <div className="step-heading"><span>02</span><div><p className="eyebrow">Secure payment</p><h3 id="booking-title">Confirm your reservation.</h3></div></div>
              <div className="card-preview">
                <span>NIVARA</span><CreditCard size={25} aria-hidden="true" /><strong>•••• •••• •••• 4242</strong><small>MAYA CHEN</small>
              </div>
              <div className="form-grid">
                <label className="field field-wide"><span>Card number</span><input inputMode="numeric" defaultValue="4242 4242 4242 4242" required /></label>
                <label className="field"><span>Expiry</span><input defaultValue="12 / 29" required /></label>
                <label className="field"><span>CVC</span><input inputMode="numeric" defaultValue="424" required /></label>
              </div>
              {error ? <div className="form-error" role="alert">{error}</div> : null}
              <button className="button button-primary button-full" type="submit" disabled={busy}>
                {busy ? <LoaderCircle className="spin" size={18} aria-hidden="true" /> : <ShieldCheck size={17} aria-hidden="true" />}
                Pay {formatCurrency(hold.total)} & confirm
              </button>
              <p className="demo-note">Portfolio demo: no real card is charged.</p>
            </form>
          ) : null}

          {step === "confirmed" && hold ? (
            <div className="confirmation-panel">
              <div className="confirmation-icon"><CheckCircle2 aria-hidden="true" /></div>
              <p className="eyebrow">Reservation confirmed</p>
              <h3 id="booking-title">Your slower rhythm starts here.</h3>
              <p>A confirmation has been prepared for <strong>maya@demo.com</strong>. We&apos;ll be in touch before you arrive.</p>
              <div className="confirmation-code"><span>Booking reference</span><strong>{hold.confirmationCode}</strong></div>
              <a className="button button-primary button-full" href="/bookings">View my trip <ArrowRight size={17} /></a>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export function SearchExperience({
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  initialRoomSlug,
}: SearchExperienceProps) {
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const [rooms, setRooms] = useState<RoomType[]>(ROOM_TYPES);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(() =>
    ROOM_TYPES.find((room) => room.slug === initialRoomSlug) ?? null,
  );
  const [sort, setSort] = useState("recommended");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const sortedRooms = useMemo(() => {
    if (sort === "price-low") return [...rooms].sort((a, b) => a.baseRate - b.baseRate);
    if (sort === "space") return [...rooms].sort((a, b) => b.sizeSqm - a.sizeSqm);
    return rooms;
  }, [rooms, sort]);

  async function searchAvailability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const query = new URLSearchParams({ checkIn, checkOut, guests: String(guests) });
      const response = await fetch(`/api/availability?${query}`);
      const result = (await response.json()) as { success: boolean; message: string; data?: RoomType[] };
      if (!response.ok || !result.data) throw new Error(result.message);
      setRooms(result.data);
      setMessage(result.message);
    } catch (searchError) {
      setMessage(searchError instanceof Error ? searchError.message : "Availability could not be refreshed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="search-page">
      <SiteHeader />
      <section className="search-intro page-shell">
        <p className="eyebrow">Choose your space</p>
        <h1>Find your place to exhale.</h1>
        <p>Every stay includes breakfast, daily rituals and time that&apos;s entirely your own.</p>
      </section>

      <section className="availability-shell page-shell">
        <form className="availability-form" onSubmit={searchAvailability}>
          <label><span><CalendarDays size={15} /> Check in</span><input type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} required /></label>
          <label><span><CalendarDays size={15} /> Check out</span><input type="date" value={checkOut} onChange={(event) => setCheckOut(event.target.value)} required /></label>
          <label><span><UsersRound size={15} /> Guests</span><select value={guests} onChange={(event) => setGuests(Number(event.target.value))}>{[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count} {count === 1 ? "guest" : "guests"}</option>)}</select></label>
          <button className="button button-primary" type="submit" disabled={loading}>{loading ? <LoaderCircle className="spin" size={18} /> : <Search size={18} />} Search</button>
        </form>

        <div className="results-toolbar">
          <div><strong>{sortedRooms.length} stays available</strong><span>{message || `${checkIn} — ${checkOut}`}</span></div>
          <label className="sort-control"><span>Sort by</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="recommended">Recommended</option><option value="price-low">Lowest price</option><option value="space">Most spacious</option></select><ChevronDown size={14} /></label>
        </div>

        <div className="results-list">
          {sortedRooms.length ? sortedRooms.map((room, index) => (
            <article className="result-card" key={room.id}>
              <div className="result-image">
                <Image src={room.imageUrl} alt={room.name} fill sizes="(max-width: 800px) 100vw, 38vw" />
                {index === 0 ? <span className="result-badge"><Sparkles size={13} /> Best match</span> : null}
              </div>
              <div className="result-content">
                <div className="result-copy">
                  <p className="eyebrow">{room.eyebrow}</p>
                  <h2>{room.name}</h2>
                  <p>{room.description}</p>
                  <div className="room-facts"><span><Maximize2 size={15} />{room.sizeSqm} m²</span><span><UsersRound size={15} />Up to {room.capacity}</span><span><BedDouble size={15} />{room.beds}</span></div>
                  <div className="amenity-list">{room.amenities.map((amenity) => <span key={amenity}><Check size={13} />{amenity}</span>)}</div>
                </div>
                <div className="result-action">
                  <span className="scarcity">{room.availableCount ?? 2} rooms left</span>
                  <div className="result-price"><span>From</span><strong>{formatCurrency(room.baseRate)}</strong><small>per night</small></div>
                  <button className="button button-primary button-full" type="button" onClick={() => setSelectedRoom(room)}>Choose this stay</button>
                  <button className="text-button" type="button" onClick={() => setSelectedRoom(room)}>View room details <ArrowRight size={14} /></button>
                </div>
              </div>
            </article>
          )) : (
            <div className="empty-state"><Search size={28} /><h2>No rooms found</h2><p>Try a different date range or fewer guests.</p></div>
          )}
        </div>
      </section>

      {selectedRoom ? <BookingDialog room={selectedRoom} checkIn={checkIn} checkOut={checkOut} guests={guests} onClose={() => setSelectedRoom(null)} /> : null}
    </main>
  );
}
