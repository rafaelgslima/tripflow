import { HeaderPreLogin } from "@/components/Header/HeaderPreLogin";
import { useRouter } from "next/router";

export default function TermsOfServicePage() {
  const router = useRouter();
  const isLoggedIn = router.query.loggedIn === "true";
  const Header = isLoggedIn ? () => null : HeaderPreLogin;

  return (
    <div className="min-h-screen bg-tf-bg">
      {!isLoggedIn && <HeaderPreLogin />}
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <h1 className="text-4xl font-cormorant font-bold text-tf-text mb-2">
          Terms of Service
        </h1>

        <div className="prose prose-invert max-w-none space-y-8 text-[15px] leading-relaxed text-tf-text">
          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing and using TripFlow, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              2. Age Eligibility
            </h2>
            <p>
              This service is intended for users 18 years of age or older. By using TripFlow, you represent and warrant that you are at least 18 years old. If you are under 18 years old, you are not permitted to use this service. We do not knowingly collect personal information from individuals under 18 years of age. If we become aware that we have collected information from someone under 18, we will take appropriate steps to delete such information and terminate the user's account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              3. Use License
            </h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on TripFlow for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Modifying or copying the materials</li>
              <li>Using the materials for any commercial purpose or for any public display</li>
              <li>Attempting to decompile or reverse engineer any software contained on TripFlow</li>
              <li>Removing any copyright or other proprietary notations from the materials</li>
              <li>Transferring the materials to another person or &quot;mirroring&quot; the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              4. Collaboration & Sharing
            </h2>
            <p>
              TripFlow allows you to create travel plans and share them with other users. When you share a plan:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Collaborators you invite gain the ability to view, edit, and delete items within the shared plan</li>
              <li>Only the plan owner can delete the entire travel plan and revoke access to collaborators</li>
              <li>You are responsible for inviting only authorized users and maintaining plan privacy</li>
              <li>Sharing is done via email invitation; you must provide valid email addresses</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              5. User Conduct
            </h2>
            <p>You agree not to use TripFlow to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Harass, threaten, or abuse other users</li>
              <li>Share or post illegal, violent, or harmful content</li>
              <li>Spam or manipulate the sharing and invitation features</li>
              <li>Attempt to gain unauthorized access to accounts or systems</li>
              <li>Share abusive, defamatory, or obscene content in travel plans</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              6. Account Responsibility
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your account login credentials and for all activities that occur under your account. You agree to notify TripFlow immediately of any unauthorized use of your account. TripFlow is not responsible for losses caused by unauthorized access to your account due to your failure to protect your credentials.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              7. Data Ownership & Deletion
            </h2>
            <p>
              You retain full ownership of your travel plans and the data you create. When you delete your account:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>All your travel plans and itineraries are deleted from our systems</li>
              <li>We retain anonymized usage logs for up to 30 days for security purposes</li>
              <li>Collaborators will lose access to your shared plans</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              8. Limitation of Liability
            </h2>
            <p>
              TripFlow is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, either express or implied. TripFlow disclaims all warranties, express or implied, including but not limited to implied warranties of merchantability and fitness for a particular purpose. TripFlow will not be liable for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
              <li>Data loss or service interruptions</li>
              <li>Travel mishaps, accidents, or incidents related to plans created on the platform</li>
              <li>Disputes between you and other users or collaborators</li>
              <li>Damages arising from unauthorized access to your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              9. Modifications to Service
            </h2>
            <p>
              TripFlow reserves the right to modify or discontinue, temporarily or permanently, the service (or any part thereof) with or without notice. You agree that TripFlow shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              10. Governing Law
            </h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which TripFlow operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              11. GDPR & LGPD Compliance
            </h2>
            <p>
              TripFlow is committed to compliance with the General Data Protection Regulation (GDPR) in the European Union and the Lei Geral de Proteção de Dados (LGPD) in Brazil.
            </p>
            <p className="mt-4">
              When you accept these Terms of Service during signup:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>You consent to our collection and processing of personal data as described in our Privacy Policy</li>
              <li>Your consent timestamp and the Privacy Policy version are recorded for transparency and compliance audits</li>
              <li>Audit logs recording your data processing activities are retained for 180 days for compliance purposes, then automatically deleted</li>
              <li>You have the right to withdraw consent at any time by deleting your account</li>
              <li>You retain all rights under GDPR and LGPD, including data access, correction, deletion, and portability</li>
              <li>In the event of a data breach, we will notify affected users via email within 72 hours as required by GDPR Article 33 and LGPD Article 33</li>
            </ul>
            <p className="mt-4">
              For more details on your rights and how we protect your data, please review our{" "}
              <a
                href="/privacy-policy"
                className="text-tf-amber font-medium no-underline hover:underline"
              >
                Privacy Policy
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              12. Contact Us
            </h2>
            <p>
              If you have questions about these Terms of Service, please contact us at{" "}
              <a
                href="mailto:support@tripflow.app"
                className="text-tf-amber font-medium no-underline hover:underline"
              >
                support@tripflow.app
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
