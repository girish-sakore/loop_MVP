import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | Loop",
  description: "The Loop privacy policy.",
};

const CONTACT = (
  <a href="mailto:support@thelooplearn.com">support@thelooplearn.com</a>
);

const sections: LegalSection[] = [
  {
    title: "1. Introduction",
    content:
      'Welcome to Loop ("we," "our," or "us"). We respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy explains how we collect, use, and safeguard your information when you use our daily game for curious adults.',
  },
  {
    title: "2. Information We Collect",
    content: "When you use Loop, we may collect the following information:",
    items: [
      "Account Information: If you sign in using Google OAuth or your email address, used to sign you in with a one-time link, we collect your name, email address, and profile picture if added.",
      "Gameplay Data: edition and game progress, completed games, streak history and answer results.",
      "Payment Data: if you subscribe to Premium, payments are handled by Razorpay. We receive your subscription status and transaction references, never your card or bank details.",
      "Technical & Usage Data: Standard browser and device information, IP address, and interaction logs.",
    ],
  },
  {
    title: "3. How We Use Your Information",
    content: "We use your information to:",
    items: [
      "Sign you in and keep your account and progress in sync across devices.",
      "Track your streak and show your progress.",
      "Process Premium subscriptions and unlock the content you have paid for.",
      "Prevent cheating and automated access.",
      "Maintain and improve the app.",
    ],
  },
  {
    title: "4. Third-Party Services",
    content: "We use trusted service providers to run Loop:",
    items: [
      "Google OAuth: Used for user authentication. We do not store your Google password.",
      "Email delivery: sends your sign-in link.",
      "Razorpay: processes Premium payments under its own privacy policy.",
      "Hosting & Analytics: Standard hosting infrastructure providers to serve web content securely.",
    ],
  },
  {
    title: "5. Data Sharing and Retention",
    content:
      "We do not sell, rent, or trade your personal information. We keep your account and progress for as long as your account is active. Payment records are kept for as long as the law requires.",
  },
  {
    title: "6. Your Rights and Data Deletion",
    content: (
      <>
        You have the right to request access to or deletion of your personal
        data. To delete your account and associated score history, please
        contact us at{" "}
        {CONTACT}.
      </>
    ),
  },
  {
    title: "7. Contact Us",
    content: <>For any questions regarding this Privacy Policy, email {CONTACT}.</>,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="November 5, 2026"
      intro="We respect your privacy and are committed to protecting the personal data you share with us."
      sections={sections}
    />
  );
}