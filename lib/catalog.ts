export type RoomType = {
  id: string;
  slug: string;
  name: string;
  eyebrow: string;
  description: string;
  capacity: number;
  baseRate: number;
  sizeSqm: number;
  beds: string;
  imageUrl: string;
  amenities: string[];
  availableCount?: number;
  roomId?: string;
};

export type Reservation = {
  id: string;
  confirmationCode: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomId: string;
  roomName: string;
  roomNumber: string;
  imageUrl: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nightlyRate: number;
  total: number;
  status: ReservationStatus;
  paymentStatus: string;
  specialRequests: string;
  createdAt: string;
};

export type ReservationStatus =
  | "Pending"
  | "Confirmed"
  | "Checked In"
  | "Checked Out"
  | "Cancelled";

export const ROOM_TYPES: RoomType[] = [
  {
    id: "roomtype_sanctuary",
    slug: "garden-sanctuary",
    name: "Garden Sanctuary",
    eyebrow: "Quiet garden wing",
    description:
      "A calming hideaway framed by native palms, with a private terrace and hand-finished local details.",
    capacity: 2,
    baseRate: 340,
    sizeSqm: 42,
    beds: "1 king bed",
    imageUrl:
      "https://images.unsplash.com/photo-1747133608846-ac16fb165862?auto=format&fit=crop&fm=jpg&q=82&w=1800",
    amenities: ["Garden terrace", "Rain shower", "Breakfast", "High-speed Wi-Fi"],
    availableCount: 3,
    roomId: "room_101",
  },
  {
    id: "roomtype_ocean",
    slug: "ocean-pavilion",
    name: "Ocean Pavilion",
    eyebrow: "Uninterrupted Indian Ocean views",
    description:
      "Wake to an endless blue horizon in a generous pavilion with a window lounge and sunset balcony.",
    capacity: 3,
    baseRate: 485,
    sizeSqm: 58,
    beds: "1 king bed + daybed",
    imageUrl:
      "https://images.unsplash.com/photo-1709187516056-d4929b67e89f?auto=format&fit=crop&fm=jpg&q=82&w=1800",
    amenities: ["Ocean balcony", "Soaking tub", "Breakfast", "Butler service"],
    availableCount: 3,
    roomId: "room_201",
  },
  {
    id: "roomtype_pool",
    slug: "pool-villa",
    name: "Private Pool Villa",
    eyebrow: "Secluded villa living",
    description:
      "A private courtyard, plunge pool and spacious indoor-outdoor living designed for slow tropical days.",
    capacity: 4,
    baseRate: 690,
    sizeSqm: 86,
    beds: "1 king bed + sofa bed",
    imageUrl:
      "https://images.unsplash.com/photo-1776761363365-ad83248b93df?auto=format&fit=crop&fm=jpg&q=82&w=1800",
    amenities: ["Private pool", "Courtyard", "Airport transfer", "Evening turndown"],
    availableCount: 3,
    roomId: "room_301",
  },
  {
    id: "roomtype_family",
    slug: "family-residence",
    name: "Family Residence",
    eyebrow: "Room to reconnect",
    description:
      "A two-bedroom residence with a shared salon, flexible dining and thoughtful space for every generation.",
    capacity: 6,
    baseRate: 860,
    sizeSqm: 118,
    beds: "2 king beds + twin daybeds",
    imageUrl:
      "https://images.unsplash.com/photo-1776761731066-c89caa8d25e6?auto=format&fit=crop&fm=jpg&q=82&w=1800",
    amenities: ["Two bedrooms", "Living room", "Private host", "Daily experiences"],
    availableCount: 2,
    roomId: "room_401",
  },
];

export const DEMO_RESERVATIONS: Reservation[] = [
  {
    id: "res_demo_1",
    confirmationCode: "NVR-24891",
    guestName: "Maya Chen",
    guestEmail: "maya@demo.com",
    guestPhone: "+1 415 555 0198",
    roomId: "room_201",
    roomName: "Ocean Pavilion",
    roomNumber: "201",
    imageUrl: ROOM_TYPES[1].imageUrl,
    checkIn: "2026-09-18",
    checkOut: "2026-09-22",
    guests: 2,
    nightlyRate: 485,
    total: 2328,
    status: "Confirmed",
    paymentStatus: "Paid",
    specialRequests: "Late arrival around 9:30 PM",
    createdAt: "2026-08-12T09:30:00.000Z",
  },
  {
    id: "res_demo_2",
    confirmationCode: "NVR-18740",
    guestName: "Noah Williams",
    guestEmail: "noah@example.com",
    guestPhone: "+44 7700 900123",
    roomId: "room_101",
    roomName: "Garden Sanctuary",
    roomNumber: "102",
    imageUrl: ROOM_TYPES[0].imageUrl,
    checkIn: "2026-08-20",
    checkOut: "2026-08-24",
    guests: 2,
    nightlyRate: 340,
    total: 1632,
    status: "Checked In",
    paymentStatus: "Paid",
    specialRequests: "Anniversary stay",
    createdAt: "2026-07-28T13:10:00.000Z",
  },
  {
    id: "res_demo_3",
    confirmationCode: "NVR-39415",
    guestName: "Sofia Alvarez",
    guestEmail: "sofia@example.com",
    guestPhone: "+34 612 345 678",
    roomId: "room_301",
    roomName: "Private Pool Villa",
    roomNumber: "301",
    imageUrl: ROOM_TYPES[2].imageUrl,
    checkIn: "2026-08-24",
    checkOut: "2026-08-29",
    guests: 3,
    nightlyRate: 690,
    total: 4140,
    status: "Confirmed",
    paymentStatus: "Paid",
    specialRequests: "Vegetarian tasting menu",
    createdAt: "2026-08-04T16:45:00.000Z",
  },
];

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export const nightsBetween = (checkIn: string, checkOut: string) => {
  const start = new Date(`${checkIn}T00:00:00Z`).getTime();
  const end = new Date(`${checkOut}T00:00:00Z`).getTime();
  return Math.max(1, Math.round((end - start) / 86_400_000));
};

export const futureDate = (offset: number) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
};
