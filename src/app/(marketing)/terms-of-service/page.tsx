import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service | The LOOP",
  description: "The LOOP terms of service.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By accessing or using The LOOP, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.",
  },
  {
    title: "2. Use of Service & Fair Play",
    items: [
      "Eligibility: You must be at least 13 years old or meet the minimum age of digital consent in your jurisdiction to use this service.",
      "Fair Play: Players must play fairly. Any use of automated scripts, bots, exploit tools, or attempts to tamper with trivia scores or API requests is strictly prohibited and will result in score forfeiture or account termination.",
    ],
  },
  {
    title: "3. User Accounts",
    content:
      "When creating an account via Google Sign-In, you are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.",
  },
  {
    title: "4. Intellectual Property",
    content:
      "All content included in the app, such as trivia questions, graphics, branding, code, and UI elements, is the property of The LOOP or its licensors and is protected by intellectual property laws.",
  },
  {
    title: "5. Disclaimer of Warranties",
    content:
      'The service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied, regarding uptime, accuracy of trivia content, or uninterrupted access.',
  },
  {
    title: "6. Limitation of Liability",
    content:
      "To the fullest extent permitted by law, LOOP and its operators shall not be liable for any indirect, incidental, or consequential damages resulting from your use or inability to use the service.",
  },
  {
    title: "7. Changes to Terms",
    content:
      "We reserve the right to update or modify these Terms of Service at any time. Continued use of the app following any changes constitutes acceptance of the new terms.",
  },
  {
    title: "8. Contact Information",
    content: (
      <>
        For questions regarding these Terms of Service, contact us at{" "}
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

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Terms of Service"
      lastUpdated="September 25, 2026"
      intro="These terms govern your access to and use of The LOOP daily trivia application."
      sections={sections}
    />
  );
}
