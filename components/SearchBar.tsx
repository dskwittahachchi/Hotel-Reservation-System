import { CalendarDays, Search, UsersRound } from "lucide-react";
import { futureDate } from "@/lib/catalog";

type SearchBarProps = {
  compact?: boolean;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
};

export function SearchBar({
  compact = false,
  checkIn = futureDate(30),
  checkOut = futureDate(33),
  guests = 2,
}: SearchBarProps) {
  return (
    <form className={`search-bar ${compact ? "search-bar-compact" : ""}`} action="/search">
      <label className="search-field">
        <span><CalendarDays size={16} aria-hidden="true" /> Check in</span>
        <input type="date" name="checkIn" defaultValue={checkIn} min={futureDate(1)} required />
      </label>
      <label className="search-field">
        <span><CalendarDays size={16} aria-hidden="true" /> Check out</span>
        <input type="date" name="checkOut" defaultValue={checkOut} min={futureDate(2)} required />
      </label>
      <label className="search-field search-guests">
        <span><UsersRound size={16} aria-hidden="true" /> Guests</span>
        <select name="guests" defaultValue={guests} aria-label="Number of guests">
          {[1, 2, 3, 4, 5, 6].map((count) => (
            <option value={count} key={count}>{count} {count === 1 ? "guest" : "guests"}</option>
          ))}
        </select>
      </label>
      <button className="button button-search" type="submit">
        <Search size={18} aria-hidden="true" />
        <span>Find a stay</span>
      </button>
    </form>
  );
}
