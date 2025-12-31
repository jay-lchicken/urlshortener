"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const termsSections = [
  {
    title: "Acceptance of Terms",
    paragraphs: [
      "By accessing or using this service, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.",
    ],
  },
  {
    title: "Eligibility",
    paragraphs: [
      "You may use the service only if you have the legal capacity to form a binding contract under applicable law, or you have obtained valid consent from a parent or legal guardian.",
    ],
  },
  {
    title: "User Accounts",
    paragraphs: [
      "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use or security breach involving your account.",
    ],
  },
  {
    title: "Prohibited Use",
    paragraphs: [
      "You may not use the service for scams, phishing, malware distribution, impersonation, or any other illegal activity.",
      "You are responsible for the links you create and the content they point to, and you must comply with all applicable laws and regulations.",
    ],
  },
  {
    title: "Enforcement",
    paragraphs: [
      "We reserve the right to block, disable, or delete links and accounts that violate these terms or applicable law.",
    ],
  },
  {
    title: "Service Availability",
    paragraphs: [
      "The service is provided on an “as is” and “as available” basis. We do not guarantee uninterrupted access, error-free operation, or that the service will meet your requirements.",
    ],
  },
  {
    title: "Data Storage and Third-Party Providers",
    paragraphs: [
      "By using the service, you acknowledge and agree that your data may be stored, processed, and backed up on infrastructure provided by third-party hosting and backup providers, which may be located in other countries or regions.",
    ],
  },
  {
    title: "Data Loss Disclaimer",
    paragraphs: [
      "You are solely responsible for maintaining backups of your data. We are not responsible for any loss of data, content, or information, whether due to system failure, service interruption, user error, or any other cause.",
    ],
  },
  {
    title: "Intellectual Property",
    paragraphs: [
      "All content and materials provided through the service, including trademarks, logos, text, graphics, and software, are owned by us or our licensors and are protected by intellectual property laws. You receive a limited, non-transferable license to use the service solely for your personal or internal use.",
    ],
  },
  {
    title: "User Content",
    paragraphs: [
      "You retain ownership of any content you submit or upload to the service, but you grant us a non-exclusive, worldwide license to host, store, display, and process that content as necessary to operate and improve the service.",
    ],
  },
  {
    title: "Third-Party Links and Services",
    paragraphs: [
      "The service may contain links to third-party websites or integrate with third-party services. We are not responsible for the content, policies, or practices of those third parties and encourage you to review their terms and privacy notices.",
    ],
  },
  {
    title: "Limitation of Liability",
    paragraphs: [
      "To the fullest extent permitted by law, we will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenue, data, or use, arising out of or related to your use of the service.",
    ],
  },
  {
    title: "Indemnification",
    paragraphs: [
      "You agree to indemnify and hold us harmless from any claims, damages, liabilities, and expenses arising from your use of the service, your violation of these terms, or your infringement of any third-party rights.",
    ],
  },
  {
    title: "Termination",
    paragraphs: [
      "We may suspend or terminate your access to the service at any time, with or without notice, if we believe you have violated these terms or if we discontinue the service.",
    ],
  },
  {
    title: "Changes to These Terms",
    paragraphs: [
      "We may update these terms from time to time. Continued use of the service after changes become effective constitutes acceptance of the updated terms.",
    ],
  },
  {
    title: "Contact Information",
    paragraphs: [
      "If you have questions about these terms or how your data is handled, please contact us using the contact details provided in the service or on our website.",
    ],
  },
]

const privacySections = [
  {
    title: "Data We Collect",
    paragraphs: [
      "We collect account details you provide, and usage data such as link clicks, timestamps, IP addresses, device and browser data, and referrers where available.",
    ],
  },
  {
    title: "How We Use Data",
    paragraphs: [
      "We use this data to operate the service, deliver analytics, prevent abuse, and improve performance and reliability.",
    ],
  },
  {
    title: "Sharing and Disclosure",
    paragraphs: [
      "We may share aggregated or link-level analytics with the account that created the link.",
      "We may disclose information to law enforcement or regulators when required by law.",
    ],
  },
  {
    title: "Cookies and Tracking",
    paragraphs: [
      "The service may use cookies and similar technologies to remember preferences, analyze usage, and improve performance. You can manage cookies through your browser settings, but disabling them may affect certain features.",
    ],
  },
]

const abuseSections = [
  {
    title: "Acceptable Use / Abuse Policy",
    paragraphs: [
      "No scams, phishing, malware, or fraud. Links may be scanned and blocked.",
      "We may suspend or delete links or accounts that violate this policy.",
    ],
  },
]

export function TermsContent() {
  const [activeSection, setActiveSection] = useState("terms")

  const sections =
    activeSection === "privacy"
      ? privacySections
      : activeSection === "abuse"
        ? abuseSections
        : termsSections

  const title =
    activeSection === "privacy"
      ? "Privacy Policy"
      : activeSection === "abuse"
        ? "Acceptable Use"
        : "Terms of Service"

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="text-sm text-muted-foreground">
              Last updated: 31/12/2025
            </p>
          </div>
          <Select value={activeSection} onValueChange={setActiveSection}>
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue placeholder="Select policy" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="terms">Terms of Service</SelectItem>
              <SelectItem value="privacy">Privacy Policy</SelectItem>
              <SelectItem value="abuse">Acceptable Use</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="space-y-6">
        {sections.map((section) => (
          <section
            key={section.title}
            className="space-y-3 text-sm leading-relaxed text-muted-foreground"
          >
            <h2 className="text-base font-semibold text-foreground">
              {section.title}
            </h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
