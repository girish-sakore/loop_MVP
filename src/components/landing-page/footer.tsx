// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#fffdf7] px-5 py-16 text-[#0b0b0f] md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12">
        <div className="col-span-2">
          <span className="font-display text-5xl leading-none block mb-4">
            Loop
          </span>
          <p className="max-w-sm text-lg text-[#343238]">
            Playful daily learning for curious people with five spare minutes.
          </p>
        </div>

        <div>
          <h6 className="font-extrabold text-sm mb-6 uppercase">
            Product
          </h6>
          <ul className="space-y-4 text-[#343238] text-sm font-bold">
            <li>
              <Link href="#" className="hover:text-[#9b73f6]">
                Features
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-[#9b73f6]">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-[#9b73f6]">
                Mobile App
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h6 className="font-extrabold text-sm mb-6 uppercase">
            Company
          </h6>
          <ul className="space-y-4 text-[#343238] text-sm font-bold">
            <li>
              <Link href="#" className="hover:text-[#9b73f6]">
                About Us
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-[#9b73f6]">
                Careers
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-[#9b73f6]">
                Blog
              </Link>
            </li>
          </ul>
        </div>

        <div className="col-span-2">
          <h6 className="font-extrabold text-sm mb-6 uppercase">
            Newsletter
          </h6>
          <div className="flex gap-2">
            <input
              className="min-w-0 flex-1 rounded-full border-[3px] border-[#0b0b0f] bg-white px-4 py-3 font-bold outline-none focus:ring-4 focus:ring-[#f7d91f]"
              placeholder="Email address"
              type="email"
            />
            <button className="btn-tactile rounded-full bg-[#85cb57] px-5 py-3 font-extrabold text-sm uppercase">
              Join
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-20 pt-8 border-t-[3px] border-[#0b0b0f] flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm font-bold text-[#343238]">
          © 2024 Loop Inc. All rights reserved.
        </p>
        <div className="flex gap-8 text-sm font-bold text-[#343238]">
          <Link href="#" className="hover:text-[#9b73f6]">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-[#9b73f6]">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
