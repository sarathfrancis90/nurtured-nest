import Link from "next/link";

const links = [
  ["Services", "/services"],
  ["About", "/about"],
  ["How It Works", "/how-it-works"],
  ["FAQ", "/faq"],
  ["Testimonials", "/testimonials"],
  ["Resources", "/resources"],
  ["Contact", "/contact"],
  ["Book", "/book"]
];

export function SiteHeader() {
  return (
    <header className="top-nav">
      <Link href="/" className="logo-mark">
        Nurtured Nest
      </Link>
      <nav className="nav-links" aria-label="Main Navigation">
        {links.map(([label, href]) => (
          <Link key={href} href={href} className="nav-link">
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
