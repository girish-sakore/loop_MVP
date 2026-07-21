import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="bg-white flex justify-between items-center w-full px-6 py-2 h-16 fixed top-0 left-0 z-50 border-b">
      <div className="flex items-center gap-2">
        <Link href="/">
          <span className="text-2xl font-extrabold text-[#3a6757] tracking-tight">Loop</span>
        </Link>
      </div>
      <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest">
        <Link href="#experience" className="hover:opacity-80">Experience</Link>
        <Link href="#benefits" className="hover:opacity-80">Benefits</Link>
      </nav>
      <Link href="/login">
        <button className="bg-[#3A6757] text-white px-4 py-2 rounded-lg text-sm">Sign In</button>
      </Link>
    </header>
  );
}