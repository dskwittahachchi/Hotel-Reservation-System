import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  ChevronRight,
  Coffee,
  Leaf,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Waves,
} from "lucide-react";
import { SearchBar } from "@/components/SearchBar";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { formatCurrency, ROOM_TYPES } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "A quieter kind of luxury",
};

const highlights = [
  { icon: Waves, label: "Private bay" },
  { icon: Coffee, label: "Breakfast included" },
  { icon: Leaf, label: "Low-impact stays" },
  { icon: ShieldCheck, label: "Flexible booking" },
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <Image
          className="hero-image"
          src="https://images.unsplash.com/photo-1776761731066-c89caa8d25e6?auto=format&fit=crop&fm=jpg&q=88&w=2400"
          alt="Nivara's hillside resort and infinity pool framed by tropical palms"
          fill
          priority
          sizes="100vw"
        />
        <div className="hero-overlay" />
        <SiteHeader overlay />
        <div className="hero-content page-shell">
          <div className="hero-copy">
            <div className="eyebrow eyebrow-light"><MapPin size={14} aria-hidden="true" /> Tangalle, Sri Lanka</div>
            <h1>A slower rhythm<br />by the sea.</h1>
            <p>Unhurried villas, instinctive care and the wild southern coast—held in perfect balance.</p>
            <Link className="hero-text-link" href="#story">Discover the Nivara story <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
          <div className="hero-rating">
            <span className="hero-rating-score">4.9</span>
            <span><Star size={14} fill="currentColor" aria-hidden="true" /> Guest rating</span>
            <small>from 286 considered stays</small>
          </div>
        </div>
        <div className="hero-search page-shell"><SearchBar /></div>
      </section>

      <section className="trust-strip page-shell" aria-label="Stay highlights">
        {highlights.map(({ icon: Icon, label }) => (
          <div key={label}><Icon size={19} strokeWidth={1.6} aria-hidden="true" /> {label}</div>
        ))}
      </section>

      <section className="section page-shell" id="story">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">Stay your way</p>
            <h2>Spaces made for exhaling.</h2>
          </div>
          <p>Each room opens gently to the landscape—quiet materials, generous light and the ocean always close.</p>
        </div>
        <div className="room-grid">
          {ROOM_TYPES.slice(0, 3).map((room, index) => (
            <article className={`room-card ${index === 1 ? "room-card-featured" : ""}`} key={room.id}>
              <Link className="room-card-image" href={`/search?room=${room.slug}`} aria-label={`Explore ${room.name}`}>
                <Image src={room.imageUrl} alt={room.name} fill sizes="(max-width: 800px) 100vw, 33vw" />
                <span className="room-card-tag">{index === 1 ? "Guest favourite" : room.eyebrow}</span>
              </Link>
              <div className="room-card-content">
                <div>
                  <h3>{room.name}</h3>
                  <p>{room.sizeSqm} m² · Up to {room.capacity} guests</p>
                </div>
                <div className="room-card-price"><span>from</span>{formatCurrency(room.baseRate)}<small>/night</small></div>
              </div>
              <Link className="room-card-link" href={`/search?room=${room.slug}`}>View stay <ChevronRight size={15} aria-hidden="true" /></Link>
            </article>
          ))}
        </div>
        <div className="center-action"><Link className="button button-outline" href="/search">Explore all rooms</Link></div>
      </section>

      <section className="planner-section" id="experiences">
        <div className="page-shell planner-grid">
          <div className="planner-visual">
            <Image
              src="https://images.unsplash.com/photo-1768737676967-5d340e2f86cc?auto=format&fit=crop&fm=jpg&q=84&w=1800"
              alt="Infinity pool overlooking a tropical beach"
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
            />
            <div className="floating-note">
              <Sparkles size={16} aria-hidden="true" />
              <span><strong>Golden hour ritual</strong> Sunset tea at 5:42 PM</span>
            </div>
          </div>
          <div className="planner-copy">
            <p className="eyebrow eyebrow-light"><Bot size={15} aria-hidden="true" /> Nivara Guide</p>
            <h2>A stay that<br />finds your pace.</h2>
            <p>Our intelligent stay planner turns a few preferences into a thoughtful daily rhythm—from quiet coves to table reservations and just enough empty space.</p>
            <div className="planner-prompt">
              <p>“We have three slow mornings, love local food, and want one unforgettable adventure.”</p>
              <div><span>Sunrise sail</span><span>Market breakfast</span><span>Clifftop massage</span></div>
            </div>
            <Link className="button button-coral" href="/search">Plan my stay <ArrowRight size={17} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="section page-shell journal-section">
        <p className="eyebrow">Notes from Nivara</p>
        <blockquote>“The rare kind of place that feels designed around how you want to feel, not simply where you want to sleep.”</blockquote>
        <div className="quote-meta"><span className="quote-avatar">MC</span><span><strong>Maya C.</strong><small>San Francisco · Stayed July 2026</small></span></div>
      </section>

      <SiteFooter />
    </main>
  );
}
