import Link from "next/link";
import { ArrowUpRight, Instagram, Mail, MapPin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand-block">
          <Link className="brand brand-footer" href="/">
            <span className="brand-mark" aria-hidden="true">N</span>
            <span>NIVARA</span>
          </Link>
          <p>A quiet coastal retreat shaped by Sri Lanka&apos;s wild southern edge.</p>
          <div className="footer-location"><MapPin size={16} aria-hidden="true" /> Tangalle, Sri Lanka</div>
        </div>
        <div>
          <p className="footer-heading">Explore</p>
          <Link href="/search">Rooms & villas</Link>
          <Link href="/#experiences">Experiences</Link>
          <Link href="/bookings">My trips</Link>
          <Link href="/admin">Operations demo</Link>
        </div>
        <div>
          <p className="footer-heading">At your service</p>
          <a href="mailto:stay@nivara.example"><Mail size={15} aria-hidden="true" /> stay@nivara.example</a>
          <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
            <Instagram size={15} aria-hidden="true" /> Instagram <ArrowUpRight size={13} aria-hidden="true" />
          </a>
          <p className="footer-note">Daily, 24 hours</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Nivara Retreat</span>
        <span>Designed for considered stays</span>
      </div>
    </footer>
  );
}
