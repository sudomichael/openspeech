"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MenuIcon, XIcon } from "./Icons";

type NavLink = { href: string; label: string };

export default function MobileMenu({
  links,
  repoUrl,
}: {
  links: NavLink[];
  repoUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        aria-expanded={open}
        className="px-2 py-1.5 rounded-md text-fg-muted hover:text-fg transition-colors inline-flex items-center"
      >
        {open ? <XIcon /> : <MenuIcon />}
      </button>

      {open && (
        <div className="absolute top-full inset-x-0 w-full bg-surface border-b border-border">
          <div className="px-6 py-2 flex flex-col">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 text-sm text-fg-muted hover:text-fg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="py-3 text-sm text-fg-muted hover:text-fg transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
