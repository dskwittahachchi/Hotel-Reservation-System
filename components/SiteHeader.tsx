"use client";

import Link from "next/link";
import { Menu, UserRound, X } from "lucide-react";
import { useState } from "react";

type SiteHeaderProps = {
  overlay?: boolean;
};

export function SiteHeader({ overlay = false }: SiteHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className={`site-header ${overlay ? "site-header-overlay" : ""}`}>
      <div className="site-header-inner">
        <Link className="brand" href="/" aria-label="Nivara home">
          <span className="brand-mark" aria-hidden="true">N</span>
          <span>NIVARA</span>
        </Link>
        <nav className={`site-nav ${open ? "site-nav-open" : ""}`} aria-label="Primary navigation">
          <Link href="/search" onClick={() => setOpen(false)}>Stay</Link>
          <Link href="/#experiences" onClick={() => setOpen(false)}>Experiences</Link>
          <Link href="/#story" onClick={() => setOpen(false)}>Our story</Link>
          <Link href="/admin" onClick={() => setOpen(false)}>Operations</Link>
        </nav>
        <div className="site-header-actions">
          <Link className="header-account" href="/bookings">
            <UserRound size={17} strokeWidth={1.8} aria-hidden="true" />
            <span>My trips</span>
          </Link>
          <Link className="button button-small button-light" href="/search">Reserve</Link>
          <button
            className="menu-toggle"
            type="button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}
