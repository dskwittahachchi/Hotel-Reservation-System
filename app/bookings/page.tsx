import type { Metadata } from "next";
import { BookingsExperience } from "@/components/BookingsExperience";

export const metadata: Metadata = {
  title: "My trips",
  description: "Review and manage your upcoming Nivara reservations.",
};

export default function BookingsPage() {
  return <BookingsExperience />;
}
