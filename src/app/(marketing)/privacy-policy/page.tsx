import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | The LOOP",
  description: "The LOOP privacy policy.",
};

const sections = [
  {
    title: "1. Introduction",
    content:
      'Welcome to The LOOP ("we," "our," or "us"). We respect your privacy and are committed to protecting the personal data you share with us. This Privacy Policy explains how we collect, use, and safeguard your information when you use our daily trivia web application.',
  },
  {
    title: "2. Information We Collect",
    content: "When you interact with our trivia web app, we may collect the following information:",
    items: [
      "Account Information: If you sign in using Google OAuth, we collect your name, email address, and profile picture.",
      "Gameplay Data: Trivia scores, game completion status, streak history, and leaderboard rankings.",
      "Technical & Usage Data: Standard browser information, IP address, device type, and interaction logs.",
    ],
  },
  {
    title: "3. How We Use Your Information",
    content: "We use your information solely to:",
    items: [
      "Authenticate your account and enable seamless sign-in via Google OAuth.",
      "Maintain and display public or friends leaderboards and score history.",
      "Ensure fair gameplay and prevent cheating or automated bot entries.",
      "Maintain and optimize the application performance.",
    ],
  },
  {
    title: "4. Third-Party Services",
    content: "We use third-party service providers to power our app:",
    items: [
      "Google OAuth: Used for user authentication. We do not store your Google password.",
      "Hosting & Analytics: Standard hosting infrastructure providers to serve web content securely.",
    ],
  },
  {
    title: "5. Data Sharing and Retention",
    content:
      "We do not sell, rent, or trade your personal information. We retain user data only for as long as necessary to provide game services, maintain score history, or comply with operational requirements.",
  },
  {
    title: "6. User Rights and Data Deletion",
    content: (
      <>
        You have the right to request access to or deletion of your personal
        data. To delete your account and associated score history, please
        contact us at{" "}
        <a
          href="mailto:support@thelooplearn.com"
          className="font-bold text-[#3a6757] underline"
        >
          support@thelooplearn.com
        </a>
        .
      </>
    ),
  },
  {
    title: "7. Contact Us",
    content: (
      <>
        For any questions regarding this Privacy Policy, please reach out to
        us at{" "}
        <a
          href="mailto:support@thelooplearn.com"
          className="font-bold text-[#3a6757] underline"
        >
          support@thelooplearn.com
        </a>
        .
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      lastUpdated="September 25, 2026"
      intro="We respect your privacy and are committed to protecting the personal data you share with us."
      sections={sections}
    />
  );
}
