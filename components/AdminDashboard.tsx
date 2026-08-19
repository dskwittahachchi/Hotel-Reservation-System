"use client";

import {
  BedDouble,
  Bell,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Gauge,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  Search,
  Settings,
  TrendingUp,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DEMO_RESERVATIONS, formatCurrency, ROOM_TYPES, type ReservationStatus } from "@/lib/catalog";

type AdminView = "Overview" | "Reservations" | "Rooms" | "Guests" | "Payments";

type DashboardReservation = {
  id: string;
  confirmationCode: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  total: number;
  status: ReservationStatus;
  roomNumber: string;
  roomName: string;
  paymentStatus: string;
};

type DashboardData = {
  summary: { activeBookings: number; arrivalsToday: number; revenue: number; availableRooms: number; totalRooms: number; occupancy: number };
  reservations: DashboardReservation[];
  inventory: Array<{ id: string; name: string; baseRate: number; imageUrl: string; amenities: string[]; totalRooms: number; availableRooms: number; occupiedRooms: number; maintenanceRooms: number }>;
  payments: Array<{ id: string; amount: number; method: string; status: string; transactionRef: string; paidAt: string; confirmationCode: string; guestName: string }>;
};

const fallbackData: DashboardData = {
  summary: { activeBookings: 12, arrivalsToday: 4, revenue: 48620, availableRooms: 4, totalRooms: 11, occupancy: 64 },
  reservations: DEMO_RESERVATIONS.map((reservation) => ({
    id: reservation.id,
    confirmationCode: reservation.confirmationCode,
    guestName: reservation.guestName,
    guestEmail: reservation.guestEmail,
    checkIn: reservation.checkIn,
    checkOut: reservation.checkOut,
    guests: reservation.guests,
    total: reservation.total,
    status: reservation.status,
    roomNumber: reservation.roomNumber,
    roomName: reservation.roomName,
    paymentStatus: reservation.paymentStatus,
  })),
  inventory: ROOM_TYPES.map((room, index) => ({ id: room.id, name: room.name, baseRate: room.baseRate, imageUrl: room.imageUrl, amenities: room.amenities, totalRooms: index === 3 ? 2 : 3, availableRooms: index % 2 ? 1 : 2, occupiedRooms: index === 3 ? 1 : 1, maintenanceRooms: 0 })),
  payments: DEMO_RESERVATIONS.map((reservation) => ({ id: `payment_${reservation.id}`, amount: reservation.total, method: "Visa ending 4242", status: "Paid", transactionRef: `TXN-${reservation.confirmationCode}`, paidAt: reservation.createdAt, confirmationCode: reservation.confirmationCode, guestName: reservation.guestName })),
};

const navItems: Array<{ label: AdminView; icon: typeof LayoutDashboard }> = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Reservations", icon: CalendarDays },
  { label: "Rooms", icon: BedDouble },
  { label: "Guests", icon: UsersRound },
  { label: "Payments", icon: CreditCard },
];

function adminDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function AdminStatus({ status }: { status: string }) {
  return <span className={`admin-status admin-status-${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</span>;
}

export function AdminDashboard() {
  const [view, setView] = useState<AdminView>("Overview");
  const [data, setData] = useState<DashboardData>(fallbackData);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [savingId, setSavingId] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/admin/dashboard")
      .then(async (response) => {
        const result = (await response.json()) as { data?: DashboardData };
        if (active && response.ok && result.data) setData(result.data);
      })
      .catch(() => undefined)
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visibleReservations = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return data.reservations;
    return data.reservations.filter((reservation) =>
      `${reservation.guestName} ${reservation.guestEmail} ${reservation.confirmationCode} ${reservation.roomName}`.toLowerCase().includes(query),
    );
  }, [data.reservations, search]);

  async function changeStatus(id: string, status: ReservationStatus) {
    setSavingId(id);
    const previous = data.reservations;
    setData((current) => ({ ...current, reservations: current.reservations.map((reservation) => reservation.id === id ? { ...reservation, status } : reservation) }));
    try {
      const response = await fetch(`/api/reservations/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!response.ok) throw new Error("Status update failed");
    } catch {
      setData((current) => ({ ...current, reservations: previous }));
    } finally {
      setSavingId("");
    }
  }

  const guests = useMemo(() => Array.from(new Map(data.reservations.map((reservation) => [reservation.guestEmail, reservation])).values()), [data.reservations]);

  return (
    <main className="admin-shell">
      <aside className={`admin-sidebar ${sidebarOpen ? "admin-sidebar-open" : ""}`}>
        <div className="admin-brand"><span>N</span><div><strong>NIVARA</strong><small>Operations</small></div><button type="button" onClick={() => setSidebarOpen(false)} aria-label="Close menu"><X /></button></div>
        <nav aria-label="Operations navigation">
          <p>Workspace</p>
          {navItems.map(({ label, icon: Icon }) => <button className={view === label ? "active" : ""} key={label} type="button" onClick={() => { setView(label); setSidebarOpen(false); }}><Icon size={18} />{label}{label === "Reservations" ? <em>{data.reservations.length}</em> : null}</button>)}
          <p>System</p>
          <button type="button"><Gauge size={18} />Reports</button><button type="button"><Settings size={18} />Settings</button>
        </nav>
        <div className="admin-profile"><span>AP</span><div><strong>Ari Perera</strong><small>General manager</small></div><LogOut size={17} /></div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu" type="button" aria-label="Open menu" onClick={() => setSidebarOpen(true)}><Menu /></button>
          <div className="admin-search"><Search size={17} /><input aria-label="Search reservations" placeholder="Search guests, rooms or bookings" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
          <div className="admin-top-actions"><span className="live-indicator">Live</span><button type="button" aria-label="Notifications"><Bell size={19} /><em>3</em></button><span className="admin-avatar">AP</span></div>
        </header>

        <div className="admin-content">
          <div className="admin-page-heading"><div><p>{new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date())}</p><h1>{view === "Overview" ? "Good morning, Ari." : view}</h1><span>{view === "Overview" ? "Here’s the rhythm of the retreat today." : `Manage Nivara ${view.toLowerCase()} from one place.`}</span></div>{loading ? <span className="syncing"><LoaderCircle className="spin" size={15} /> Syncing</span> : <button className="button admin-primary" type="button">New reservation</button>}</div>

          {view === "Overview" ? (
            <>
              <div className="metric-grid">
                <article><div className="metric-icon coral"><CalendarDays /></div><span>Active bookings</span><strong>{data.summary.activeBookings}</strong><small><TrendingUp size={13} /> 8% from last week</small></article>
                <article><div className="metric-icon teal"><UserRound /></div><span>Arrivals today</span><strong>{data.summary.arrivalsToday}</strong><small>{data.reservations[0]?.guestName || "No arrivals"} arrives first</small></article>
                <article><div className="metric-icon gold"><CircleDollarSign /></div><span>Revenue collected</span><strong>{formatCurrency(data.summary.revenue)}</strong><small><TrendingUp size={13} /> 12% this month</small></article>
                <article><div className="metric-icon blue"><BedDouble /></div><span>Occupancy</span><strong>{data.summary.occupancy}%</strong><small>{data.summary.availableRooms} of {data.summary.totalRooms} rooms available</small></article>
              </div>

              <div className="admin-dashboard-grid">
                <article className="admin-panel occupancy-panel"><div className="panel-heading"><div><p className="eyebrow">This week</p><h2>Occupancy rhythm</h2></div><button type="button">7 days <ChevronRight size={14} /></button></div><div className="occupancy-chart">{[54, 64, 72, 68, 82, 91, 76].map((height, index) => <div key={height + index}><span style={{ height: `${height}%` }}><em>{height}%</em></span><small>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</small></div>)}</div><div className="chart-summary"><span><i className="dot coral-dot" /> Rooms occupied</span><strong>+14.2% <small>vs last week</small></strong></div></article>
                <article className="admin-panel arrivals-panel"><div className="panel-heading"><div><p className="eyebrow">Front desk</p><h2>Arrivals & stays</h2></div><button type="button" onClick={() => setView("Reservations")}>View all <ChevronRight size={14} /></button></div><div className="arrival-list">{data.reservations.slice(0, 4).map((reservation) => <div key={reservation.id}><span className="guest-avatar">{reservation.guestName.split(" ").map((part) => part[0]).join("")}</span><div><strong>{reservation.guestName}</strong><small>{reservation.roomName} · {reservation.roomNumber}</small></div><span><AdminStatus status={reservation.status} /><small>{adminDate(reservation.checkIn)}</small></span></div>)}</div></article>
              </div>

              <article className="admin-panel reservation-panel"><div className="panel-heading"><div><p className="eyebrow">Recently updated</p><h2>Reservation desk</h2></div><button type="button" onClick={() => setView("Reservations")}>Manage all <ChevronRight size={14} /></button></div><ReservationTable reservations={visibleReservations.slice(0, 5)} savingId={savingId} onStatusChange={changeStatus} /></article>
            </>
          ) : null}

          {view === "Reservations" ? <article className="admin-panel reservation-panel full-panel"><div className="panel-heading"><div><p className="eyebrow">All bookings</p><h2>Reservation register</h2></div><span>{visibleReservations.length} records</span></div><ReservationTable reservations={visibleReservations} savingId={savingId} onStatusChange={changeStatus} /></article> : null}

          {view === "Rooms" ? <div className="inventory-grid">{data.inventory.map((room) => <article className="inventory-card" key={room.id}><div><p className="eyebrow">Room type</p><h2>{room.name}</h2><span>{formatCurrency(room.baseRate)} / night</span></div><div className="inventory-counts"><span><strong>{room.totalRooms}</strong>Total</span><span><strong>{room.availableRooms}</strong>Available</span><span><strong>{room.occupiedRooms}</strong>Occupied</span></div><div className="inventory-progress"><span style={{ width: `${(Number(room.occupiedRooms) / Number(room.totalRooms || 1)) * 100}%` }} /></div><button type="button">Manage inventory <ChevronRight size={14} /></button></article>)}</div> : null}

          {view === "Guests" ? <article className="admin-panel full-panel"><div className="panel-heading"><div><p className="eyebrow">Guest relationships</p><h2>Guest directory</h2></div><span>{guests.length} profiles</span></div><div className="guest-directory">{guests.map((guest) => <div key={guest.guestEmail}><span className="guest-avatar">{guest.guestName.split(" ").map((part) => part[0]).join("")}</span><div><strong>{guest.guestName}</strong><small>{guest.guestEmail}</small></div><span><strong>{guest.roomName}</strong><small>Latest stay · {adminDate(guest.checkIn)}</small></span><AdminStatus status={guest.status} /></div>)}</div></article> : null}

          {view === "Payments" ? <article className="admin-panel full-panel"><div className="panel-heading"><div><p className="eyebrow">Financial activity</p><h2>Payments & receipts</h2></div><strong>{formatCurrency(data.payments.reduce((sum, payment) => sum + Number(payment.amount), 0))}</strong></div><div className="payments-list">{data.payments.map((payment) => <div key={payment.id}><span className="payment-icon"><CreditCard /></span><div><strong>{payment.guestName}</strong><small>{payment.confirmationCode} · {payment.method}</small></div><span><strong>{formatCurrency(Number(payment.amount))}</strong><small>{payment.transactionRef}</small></span><AdminStatus status={payment.status} /></div>)}</div></article> : null}
        </div>
      </section>
    </main>
  );
}

function ReservationTable({ reservations, savingId, onStatusChange }: { reservations: DashboardReservation[]; savingId: string; onStatusChange: (id: string, status: ReservationStatus) => void }) {
  return <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Guest</th><th>Stay</th><th>Dates</th><th>Payment</th><th>Status</th><th>Total</th></tr></thead><tbody>{reservations.map((reservation) => <tr key={reservation.id}><td><strong>{reservation.guestName}</strong><small>{reservation.confirmationCode}</small></td><td><strong>{reservation.roomName}</strong><small>Room {reservation.roomNumber}</small></td><td><strong>{adminDate(reservation.checkIn)} — {adminDate(reservation.checkOut)}</strong><small>{reservation.guests} guests</small></td><td><AdminStatus status={reservation.paymentStatus} /></td><td><label className="status-select"><select aria-label={`Status for ${reservation.guestName}`} value={reservation.status} onChange={(event) => onStatusChange(reservation.id, event.target.value as ReservationStatus)}>{["Pending", "Confirmed", "Checked In", "Checked Out", "Cancelled"].map((status) => <option key={status}>{status}</option>)}</select>{savingId === reservation.id ? <LoaderCircle className="spin" size={13} /> : null}</label></td><td><strong>{formatCurrency(Number(reservation.total))}</strong></td></tr>)}</tbody></table>{!reservations.length ? <div className="empty-state"><Search /><h2>No reservations match</h2><p>Try another guest name or booking reference.</p></div> : null}</div>;
}
