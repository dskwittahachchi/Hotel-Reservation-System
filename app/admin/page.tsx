import type { Metadata } from "next";
import { AdminDashboard } from "@/components/AdminDashboard";

export const metadata: Metadata = {
  title: "Operations",
  description: "Nivara reservation, room, guest and payment operations.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
