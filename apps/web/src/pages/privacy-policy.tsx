import { HeaderPreLogin } from "@/components/Header/HeaderPreLogin";
import { useRouter } from "next/router";

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const isLoggedIn = router.query.loggedIn === "true";
  const Header = isLoggedIn ? () => null : HeaderPreLogin;

  return (
    <div className="min-h-screen bg-tf-bg">
      {!isLoggedIn && <HeaderPreLogin />}
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <h1 className="text-4xl font-cormorant font-bold text-tf-text mb-2">
          Privacy Policy
        </h1>

        <div className="prose prose-invert max-w-none space-y-8 text-[15px] leading-relaxed text-tf-text">
          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              1. Introduction
            </h2>
            <p>
              TripFlow (&quot;we,&quot; &quot;us,&quot; &quot;our,&quot; or &quot;Company&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              2. Information We Collect
            </h2>
            <p>We collect information you provide directly and information collected automatically:</p>

            <h3 className="text-lg font-semibold text-tf-text mt-6 mb-3">
              Information You Provide:
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Full name and email address (during account creation)</li>
              <li>Password (hashed and never stored in plain text)</li>
              <li>Travel plans, itineraries, and activities you create</li>
              <li>Emails of collaborators you invite to share plans</li>
            </ul>

            <h3 className="text-lg font-semibold text-tf-text mt-6 mb-3">
              Information Collected Automatically:
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>IP address and browser type</li>
              <li>Pages visited and time spent on the application</li>
              <li>Device information (OS, browser, device type)</li>
              <li>Authentication tokens (JWT) used to verify your identity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              3. How We Use Your Information
            </h2>
            <p>We use your information for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>To create and maintain your account</li>
              <li>To enable you to create, edit, and share travel plans with collaborators</li>
              <li>To send you invitation emails on your behalf</li>
              <li>To authenticate your identity and verify security claims</li>
              <li>To provide customer support and respond to your inquiries</li>
              <li>To improve the functionality and performance of TripFlow</li>
              <li>To ensure security and prevent fraud or misuse</li>
            </ul>
            <p className="mt-4 font-semibold">
              We do NOT use your travel data for marketing, analytics, profiling, or any third-party sharing without your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              4. Legal Basis for Processing (GDPR Article 6 & LGPD Article 7)
            </h2>
            <p>
              We process your personal data under the following legal bases:
            </p>
            <div className="space-y-3 ml-4 mt-4">
              <div>
                <strong>Contract Performance (Article 6(1)(b) GDPR, Article 7.I LGPD):</strong>
                <p className="text-tf-text mt-1">
                  We process your name, email, and travel plans to provide the TripFlow service and enable collaboration features.
                </p>
              </div>
              <div>
                <strong>Legitimate Interest (Article 6(1)(f) GDPR, Article 7.IX LGPD):</strong>
                <p className="text-tf-text mt-1">
                  We process collaborators&apos; email addresses (for invitations) and security logs to protect against fraud, abuse, and to maintain service integrity. We believe our interest in security outweighs any privacy impact, and we minimize data processed.
                </p>
              </div>
              <div>
                <strong>Consent (Article 6(1)(a) GDPR, Article 7.I LGPD):</strong>
                <p className="text-tf-text mt-1">
                  You consent to this Privacy Policy and Terms of Service at signup. Your consent timestamp is recorded for transparency.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              5. Data Sharing with Collaborators
            </h2>
            <p>
              When you share a travel plan with collaborators:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>The invited collaborator gains access to the full plan, including all itineraries and activities</li>
              <li>Your name and account information are visible to collaborators on shared plans</li>
              <li>Collaborators can see who else has access to the plan</li>
              <li>You remain in control and can revoke collaborator access at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              6. Third-Party Services & Data Processors
            </h2>
            <p>
              TripFlow uses the following third-party services to operate the platform. These services are Data Processors under GDPR and LGPD, meaning they process personal data on our behalf under a contractual Data Processing Agreement (DPA).
            </p>

            <h3 className="text-lg font-semibold text-tf-text mt-6 mb-3">
              Supabase (Database & Authentication)
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Purpose:</strong> Cloud database storage, user authentication, and data management
              </li>
              <li>
                <strong>Data Processed:</strong> Account credentials, profile information (name, email), travel plans, itineraries, share invitations
              </li>
              <li>
                <strong>Data Center Location:</strong> Central EU (Frankfurt, Germany) — your data is stored within the EU
              </li>
              <li>
                <strong>Data Processing Agreement:</strong> Supabase has signed our Data Processing Agreement based on their Standard Terms of Service. See{" "}
                <a
                  href="https://supabase.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-tf-amber font-medium no-underline hover:underline"
                >
                  Supabase Privacy Policy
                </a>{" "}
                for details on how they protect data.
              </li>
              <li>
                <strong>Security:</strong> Data is encrypted in transit (TLS/SSL) and at rest. Supabase applies security measures including firewalls, intrusion detection, and regular security audits.
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-tf-text mt-6 mb-3">
              Google Gmail (Email Provider)
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Purpose:</strong> Sending transactional emails (travel plan invitations, account notifications, contact form responses)
              </li>
              <li>
                <strong>Data Processed:</strong> Recipient email addresses, sender email addresses, invitation links, contact form submissions
              </li>
              <li>
                <strong>Data Processing Agreement:</strong> Gmail SMTP is covered under{" "}
                <a
                  href="https://cloud.google.com/terms/data-processing-terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-tf-amber font-medium no-underline hover:underline"
                >
                  Google Cloud Data Processing Terms
                </a>
                . Email metadata may be processed by Google for security and abuse prevention purposes.
              </li>
              <li>
                <strong>Note:</strong> Transactional emails are sent based on contract performance and your explicit request (e.g., accepting an invitation), not based on consent.
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-tf-text mt-6 mb-3">
              Klaro (Consent Management)
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Purpose:</strong> Managing your privacy preferences for analytics and optional services
              </li>
              <li>
                <strong>Data Processed:</strong> Consent preferences (stored in a browser cookie)
              </li>
              <li>
                <strong>Privacy:</strong> Klaro is an open-source tool; your consent data is stored only in your browser, not on Klaro servers
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-tf-text mt-6 mb-3">
              Google Analytics (Optional)
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Purpose:</strong> Optional analytics to understand how you use TripFlow
              </li>
              <li>
                <strong>Opt-In Required:</strong> Google Analytics is disabled by default and requires your explicit consent via the Klaro consent banner
              </li>
              <li>
                <strong>Data Processed:</strong> If enabled: browser type, device info, pages visited, session duration (see{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-tf-amber font-medium no-underline hover:underline"
                >
                  Google Privacy Policy
                </a>
                )
              </li>
              <li>
                <strong>How to Opt Out:</strong> Uncheck &quot;Analytics&quot; in the Klaro consent banner, or modify your preferences anytime
              </li>
            </ul>

            <p className="mt-4">
              All third parties are contractually obligated to protect your data, process it only for the purposes we specify, and comply with GDPR and LGPD.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              7. Data Storage Location & International Transfers
            </h2>
            <p>
              Your personal data is primarily stored in <strong>Central Europe (Frankfurt, Germany)</strong> on Supabase servers, which means it remains within the European Union.
            </p>
            <p className="mt-4">
              <strong>International Data Transfers:</strong> As a global application, some data processing may occur in the United States (e.g., Google services for email). These transfers are based on:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Standard Contractual Clauses (SCCs) with our processors</li>
              <li>Your explicit consent (e.g., enabling Google Analytics)</li>
              <li>Legitimate business necessity for service provision</li>
            </ul>
            <p className="mt-4">
              You have the right to object to international transfers. Contact{" "}
              <a
                href="mailto:privacy@tripflow.app"
                className="text-tf-amber font-medium no-underline hover:underline"
              >
                privacy@tripflow.app
              </a>{" "}
              if you have concerns about your data being transferred abroad.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              8. Security of Your Information
            </h2>
            <p>
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>All data is encrypted in transit using TLS/SSL</li>
              <li>Passwords are hashed using secure algorithms</li>
              <li>Authentication tokens (JWTs) are signed and validated on every request</li>
              <li>Row-Level Security (RLS) policies restrict database access to authorized users only</li>
              <li>Sensitive tokens are never logged or stored in plain text</li>
            </ul>
            <p className="mt-4">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              8. Data Retention
            </h2>
            <p>
              We retain your information for as long as your account is active or as needed to provide you with our services. Here&apos;s what happens when you delete your account:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>All personal information and travel plans are deleted from our database</li>
              <li>Audit logs recording your data processing activities are retained for 180 days, then automatically deleted</li>
              <li>We retain anonymized usage logs for 30 days for security and audit purposes</li>
              <li>Collaborators on your shared plans will lose access</li>
              <li>We do not retain backups of deleted personal data beyond our standard backup retention window</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              9. Your Privacy Rights (GDPR & LGPD)
            </h2>
            <p>
              Under GDPR (EU) and LGPD (Brazil), you have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Right to Access (GDPR Article 15 / LGPD Article 18):</strong> You can request a copy of all personal data we hold about you. We provide this via the &quot;Download your data&quot; button on your profile page.
              </li>
              <li>
                <strong>Right to Correct (GDPR Article 16 / LGPD Article 19):</strong> You can update or correct inaccurate information in your profile at any time.
              </li>
              <li>
                <strong>Right to Delete (GDPR Article 17 / LGPD Article 12):</strong> You can request deletion of your account and all associated data. We will delete your account immediately.
              </li>
              <li>
                <strong>Right to Portability (GDPR Article 20 / LGPD Article 6.V):</strong> You can request your data in a portable format (JSON). Download it via the &quot;Download your data&quot; button.
              </li>
              <li>
                <strong>Right to Object (GDPR Article 21 / LGPD Article 16.VI):</strong> You can object to processing based on legitimate interest. Contact us to discuss.
              </li>
              <li>
                <strong>Right to Restrict Processing (GDPR Article 18):</strong> You can request we limit how we process your data.
              </li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, contact us at{" "}
              <a
                href="mailto:privacy@tripflow.app"
                className="text-tf-amber font-medium no-underline hover:underline"
              >
                privacy@tripflow.app
              </a>
              . We will respond within 30 days (GDPR) or 15 days (LGPD).
            </p>
            <h3 className="text-lg font-semibold text-tf-text mt-6 mb-3">
              Supervisory Authorities
            </h3>
            <p>
              If you believe we have violated your privacy rights, you have the right to lodge a complaint with the relevant supervisory authority:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>
                <strong>For EU residents:</strong> Contact your local Data Protection Authority (DPA). Find yours at{" "}
                <a
                  href="https://edpb.ec.europa.eu/about-edpb/board/members_en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-tf-amber font-medium no-underline hover:underline"
                >
                  EDPB members
                </a>
              </li>
              <li>
                <strong>For Brazil residents:</strong> Contact ANPD (Autoridade Nacional de Proteção de Dados) at{" "}
                <a
                  href="https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-tf-amber font-medium no-underline hover:underline"
                >
                  anpd.gov.br
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              10. Cookies & Tokens
            </h2>
            <p>
              TripFlow uses authentication tokens (JWT) to maintain your logged-in session. These tokens:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Are stored securely in your browser&apos;s local storage or memory</li>
              <li>Contain cryptographic signatures verified on every API request</li>
              <li>Expire after a set period for security (details in your auth settings)</li>
              <li>Are never transmitted to third parties without your knowledge</li>
            </ul>
            <h3 className="text-lg font-semibold text-tf-text mt-6 mb-3">
              Consent Management & Analytics
            </h3>
            <p>
              We use Klaro, an open-source consent management solution, to manage your privacy preferences. By default, all non-essential services including Google Analytics are <strong>disabled</strong> until you explicitly opt in via the consent modal.
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>
                <strong>Google Analytics:</strong> Requires explicit consent. Only enabled if you accept analytics in the consent banner. You can withdraw consent at any time.
              </li>
              <li>
                <strong>Consent Cookies:</strong> A preference cookie is stored to remember your choices for one year.
              </li>
              <li>
                <strong>Revoking Consent:</strong> You can change your consent preferences at any time by clicking the consent modal button on our site.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              11. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any significant changes via email or by posting a notice on our application. Your continued use of TripFlow following such notification constitutes your acceptance of the updated Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              12. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-tf-card border border-tf-border rounded-lg">
              <p>
                Email:{" "}
                <a
                  href="mailto:privacy@tripflow.app"
                  className="text-tf-amber font-medium no-underline hover:underline"
                >
                  privacy@tripflow.app
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-cormorant font-bold text-tf-text mb-4">
              13. Security Breach Notification
            </h2>
            <p>
              We are committed to protecting your personal data and maintaining robust security measures. However, no system is completely immune to security incidents. In the event of a data breach, we will:
            </p>
            <h3 className="text-lg font-semibold text-tf-text mt-6 mb-3">
              What is a Security Breach?
            </h3>
            <p>
              A breach is an unauthorized access to, or loss of, personal data that may compromise the security or privacy of such data.
            </p>
            <h3 className="text-lg font-semibold text-tf-text mt-6 mb-3">
              Our Notification Procedure
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li>
                <strong>Timing:</strong> Notify affected users via email within 72 hours of discovering the breach (GDPR Article 33) or without undue delay (LGPD Article 33).
              </li>
              <li>
                <strong>What You&apos;ll Receive:</strong> A notification email that includes:
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Date and timeframe of the breach</li>
                  <li>Specific data that may have been affected</li>
                  <li>Steps TripFlow has taken to mitigate the incident</li>
                  <li>Recommended actions you should take (e.g., password change)</li>
                  <li>Contact information for our privacy team</li>
                </ul>
              </li>
              <li>
                <strong>Regulatory Compliance:</strong> If the breach poses a high risk to affected individuals&apos; rights and freedoms, we will notify the relevant supervisory authority:
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>For EU residents: The relevant Data Protection Authority (DPA)</li>
                  <li>For Brazil residents: ANPD (Autoridade Nacional de Proteção de Dados)</li>
                </ul>
              </li>
              <li>
                <strong>Questions:</strong> If you have concerns about a breach notification, contact our privacy team at{" "}
                <a
                  href="mailto:privacy@tripflow.app"
                  className="text-tf-amber font-medium no-underline hover:underline"
                >
                  privacy@tripflow.app
                </a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
