import Link from "next/link";

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand" aria-label="Loop home">LOOP<span>.</span></Link>
        <nav className="site-links" aria-label="Marketing">
          <Link href="/#experience">Experience</Link>
          <Link href="/#benefits">Benefits</Link>
        </nav>
        <Link href="/login" className="site-sign-in">Sign in</Link>
      </div>
    </header>
  );
}
