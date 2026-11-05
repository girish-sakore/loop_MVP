import type { Metadata } from "next";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service | The LOOP",
  description: "The LOOP terms of service.",
};

const sections: LegalSection[] = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using The LOOP, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.",
  },
  {
    title: "2. Use of Service & Fair Play",
    items: [
      // TODO: confirm the minimum age and parental-consent rules with counsel (see notes).
      "Eligibility: You must be at least 13 years old, or the minimum age of digital consent in your jurisdiction, to use this service.",
      "Fair Play: Players must play fairly. Any use of automated scripts, bots, exploit tools, or attempts to tamper with game progress, scores or API requests is prohibited and may result in forfeited progress or account termination.",
    ],
  },
  {
    title: "3. User Accounts",
    content:
      "When creating an account via Google Sign-In or You sign in with your email address using a one-time link. the confidentiality of your account credentials and for all activities that occur under your account.",
  },
  {
    title: "4. Premium Subscriptions",
    content:
      "Premium access is sold as a subscription, with payments processed by Razorpay. Prices, billing periods and cancellation terms are shown before you pay.",
  },
  {
    title: "5. Intellectual Property",
    content:
      "All content in the app, including games, questions, illustrations, branding, code, and UI elements, is the property of Loop or its licensors and is protected by intellectual property laws.",
  },
  {
    title: "6. Disclaimer of Warranties",
    content:
      'The service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, express or implied, regarding uptime, the accuracy of game content, or uninterrupted access.',
  },
  {
    title: "7. Limitation of Liability",
    content:
      "To the fullest extent permitted by law, Loop and its operators shall not be liable for any indirect, incidental, or consequential damages resulting from your use or inability to use the service.",
  },
  {
    title: "8. Changes to Terms",
    content:
      "We reserve the right to update or modify these Terms of Service at any time. Continued use of the app following any changes constitutes acceptance of the new terms.",
  },
  {
    title: "9. Contact Information",
    content: (
      <>
        For questions regarding these Terms of Service, contact us at{" "}
        <a href="mailto:support@thelooplearn.com">support@thelooplearn.com</a>.
      </>
    ),
  },
];

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="November 5, 2026"
      intro="These terms govern your access to and use of Loop, the daily game for curious adults."
      sections={sections}
    />
  );
}