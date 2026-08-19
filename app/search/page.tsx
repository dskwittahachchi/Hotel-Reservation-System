import type { Metadata } from "next";
import { SearchExperience } from "@/components/SearchExperience";
import { futureDate } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Find your stay",
  description: "Search available rooms, pavilions and private villas at Nivara.",
};

type SearchPageProps = {
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    room?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  return (
    <SearchExperience
      initialCheckIn={params.checkIn || futureDate(30)}
      initialCheckOut={params.checkOut || futureDate(33)}
      initialGuests={Math.min(6, Math.max(1, Number(params.guests) || 2))}
      initialRoomSlug={params.room}
    />
  );
}
