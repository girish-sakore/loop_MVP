// components/Footer.tsx
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#f5f5f5] dark:bg-[#212121] py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12">
        {/* Brand Section */}
        <div className="col-span-2">
          <span className="text-3xl font-extrabold text-[#3a6757] tracking-tight block mb-4">
            Loop
          </span>
          <p className="text-gray-600 dark:text-gray-300">
            The tactile habit tracker for humans who want to thrive, not just survive.
          </p>
        </div>

        {/* Product Links */}
        <div>
          <h6 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-6 uppercase tracking-wider">
            Product
          </h6>
          <ul className="space-y-4 text-gray-600 dark:text-gray-300 text-sm">
            <li>
              <Link href="#" className="hover:text-[#3a6757]">
                Features
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-[#3a6757]">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-[#3a6757]">
                Mobile App
              </Link>
            </li>
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h6 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-6 uppercase tracking-wider">
            Company
          </h6>
          <ul className="space-y-4 text-gray-600 dark:text-gray-300 text-sm">
            <li>
              <Link href="#" className="hover:text-[#3a6757]">
                About Us
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-[#3a6757]">
                Careers
              </Link>
            </li>
            <li>
              <Link href="#" className="hover:text-[#3a6757]">
                Blog
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="col-span-2">
          <h6 className="font-bold text-sm text-gray-800 dark:text-gray-200 mb-6 uppercase tracking-wider">
            Newsletter
          </h6>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-white rounded-xl border-none focus:ring-2 focus:ring-[#3a6757]/20 px-4 py-2"
              placeholder="Email address"
              type="email"
            />
            <button className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 px-4 py-2 rounded-xl font-bold text-sm uppercase">
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-gray-300/30 dark:border-gray-600/30 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          © 2024 Loop Inc. All rights reserved.
        </p>
        <div className="flex gap-8 text-sm text-gray-600 dark:text-gray-300">
          <Link href="#" className="hover:text-[#3a6757]">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-[#3a6757]">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}