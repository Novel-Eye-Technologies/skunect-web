'use client';

import { SiteNavbar } from '@/components/shared/site-navbar';
import { SiteFooter } from '@/components/shared/site-footer';
import { PageHeader } from '@/components/shared/page-header';

export default function TermsOfServicePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNavbar />
      
      <main id="main-content" className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <PageHeader
            title="Terms and Conditions"
            description="Effective Date: April 9, 2026 | Last Updated: April 9, 2026"
          />

          <div className="prose prose-slate max-w-none text-justify rounded-2xl border bg-white p-8 shadow-sm sm:p-12">
            <p>
              These Terms and Conditions (&quot;Terms&quot;) govern your access to and use of the Skunect platform, including the website at skunect.com, the Skunect web application, and the Skunect mobile application (collectively, the &quot;Platform&quot;), operated by Novel Eye Tech Limited (&quot;we,&quot; &quot;us,&quot; &quot;our,&quot; or &quot;Novel Eye Tech&quot;), a company registered in Nigeria.
            </p>
            <p>
              By accessing or using the Platform, you agree to be bound by these Terms. If you do not agree, you must not use the Platform.
            </p>

            <h2>1. Definitions</h2>
            <ul>
              <li><strong>&quot;Platform&quot;</strong> means the Skunect website, web application, and mobile application, including all features, content, and services provided through them.</li>
              <li><strong>&quot;School&quot;</strong> means an educational institution that subscribes to and uses the Platform under a paid or trial subscription.</li>
              <li><strong>&quot;Subscription&quot;</strong> means the agreement between a School and Novel Eye Tech for access to the Platform, including the selected plan and associated fees.</li>
              <li><strong>&quot;Admin&quot;</strong> means a user designated by a School as an administrator with full school management privileges on the Platform.</li>
              <li><strong>&quot;Teacher&quot;</strong> means a user authorized by a School to use the Platform for classroom operations.</li>
              <li><strong>&quot;Parent&quot;</strong> means a parent or legal guardian who accesses the Platform to monitor their child(ren)&apos;s school activities.</li>
              <li><strong>&quot;User&quot;</strong> or <strong>&quot;you&quot;</strong> means any individual who accesses or uses the Platform, including Admins, Teachers, and Parents.</li>
              <li><strong>&quot;Student Data&quot;</strong> means personal and educational data relating to students processed through the Platform.</li>
              <li><strong>&quot;Content&quot;</strong> means any data, text, messages, information, or materials uploaded to or generated through the Platform.</li>
            </ul>

            <h2>2. Eligibility</h2>
            <h3>2.1</h3>
            <p>The Platform is intended for use by schools and their authorized personnel (administrators and teachers) and by parents or legal guardians of enrolled students.</p>
            <h3>2.2</h3>
            <p>You must be at least 18 years of age to create an account on the Platform. Students do not create accounts; their data is managed by authorized school staff and viewed by parents.</p>
            <h3>2.3</h3>
            <p>By creating an account, you represent and warrant that:</p>
            <ul>
              <li>You are at least 18 years old</li>
              <li>The information you provide is accurate and complete</li>
              <li>You are authorized to act on behalf of the school (if registering as an Admin) or are a parent/guardian of an enrolled student (if registering as a Parent)</li>
            </ul>

            <h2>3. Account Registration and Security</h2>
            
            <h3>3.1 Account Creation</h3>
            <p>Accounts are created through our passwordless authentication system using one of the following methods:</p>
            <ul>
              <li>Email-based one-time password (OTP)</li>
              <li>Phone-based one-time password (OTP)</li>
              <li>Google Sign-In</li>
              <li>Apple Sign-In</li>
            </ul>

            <h3>3.2 Account Security</h3>
            <p>You are responsible for:</p>
            <ul>
              <li>Maintaining the security of your email account and phone number used for authentication</li>
              <li>Not sharing your OTP codes with anyone</li>
              <li>Logging out from shared or public devices</li>
              <li>Notifying us immediately at <a href="mailto:support@skunect.com" className="text-teal hover:underline">support@skunect.com</a> if you suspect unauthorized access to your account</li>
            </ul>

            <h3>3.3 Multi-School and Multi-Role Access</h3>
            <p>A single user account may be associated with multiple schools and may hold different roles at different schools (e.g., Teacher at one school, Parent at another). You agree to use the Platform appropriately for each role and within the scope of permissions granted for that role.</p>

            <h2>4. School Subscriptions and Fees</h2>

            <h3>4.1 Subscription Plans</h3>
            <p>Schools access the Platform through paid subscription plans. Subscription details, including features, pricing, and billing cycles, are provided during the enrollment process and may be updated from time to time.</p>

            <h3>4.2 Payment Terms</h3>
            <ul>
              <li>Fees are billed in accordance with the selected subscription plan.</li>
              <li>All fees are quoted in Nigerian Naira (NGN) unless otherwise specified.</li>
              <li>Payment is due as specified in the subscription agreement.</li>
              <li>Failure to pay fees may result in suspension or termination of the School&apos;s access to the Platform.</li>
            </ul>

            <h3>4.3 Refund Policy</h3>
            <ul>
              <li>Refund eligibility depends on the specific subscription plan and any applicable trial period.</li>
              <li>Schools may request a refund within 14 days of initial subscription if they are dissatisfied, provided they have not used the Platform extensively (as determined at our reasonable discretion).</li>
              <li>Refund requests should be submitted to <a href="mailto:support@skunect.com" className="text-teal hover:underline">support@skunect.com</a>.</li>
            </ul>

            <h3>4.4 Free Trials and Beta Programs</h3>
            <ul>
              <li>We may offer free trial periods or beta access programs at our discretion.</li>
              <li>Trial and beta access may have limited features and is provided &quot;as is.&quot;</li>
              <li>We reserve the right to modify or discontinue trial and beta programs at any time.</li>
            </ul>

            <h2>5. Acceptable Use</h2>

            <h3>5.1 Permitted Use</h3>
            <p>You may use the Platform only for its intended purpose: school management, parent engagement, and educational operations. Specifically:</p>
            <ul>
              <li><strong>Admins</strong> may manage school settings, users, classes, fee structures, and school-wide operations.</li>
              <li><strong>Teachers</strong> may record attendance, manage grades and homework, communicate with parents, and perform classroom operations for their assigned classes.</li>
              <li><strong>Parents</strong> may view their child(ren)&apos;s attendance, academic performance, homework status, fee information, and safety updates, and communicate with teachers and school administrators.</li>
            </ul>

            <h3>5.2 Prohibited Conduct</h3>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Platform for any purpose other than school management and parent engagement</li>
              <li>Access data of students, parents, or staff outside of your authorized scope</li>
              <li>Attempt to access another school&apos;s data or bypass the Platform&apos;s multi-tenant isolation</li>
              <li>Share your authentication credentials (OTP codes, session tokens) with others</li>
              <li>Upload, transmit, or distribute any content that is unlawful, harmful, threatening, abusive, defamatory, or otherwise objectionable</li>
              <li>Use the messaging features to send spam, unsolicited messages, or content unrelated to school activities</li>
              <li>Attempt to reverse engineer, decompile, disassemble, or otherwise derive the source code of the Platform</li>
              <li>Interfere with or disrupt the Platform&apos;s infrastructure, security features, or other users&apos; access</li>
              <li>Use automated scripts, bots, or scrapers to access the Platform (except through our authorized API)</li>
              <li>Misrepresent your identity, role, or affiliation with a school</li>
              <li>Use Student Data for any purpose other than the educational purposes for which it was collected</li>
              <li>Download or export Student Data in bulk for use outside the Platform, except as expressly permitted by the Platform&apos;s features</li>
            </ul>

            <h3>5.3 Enforcement</h3>
            <p>We reserve the right to suspend or terminate any account that violates these Terms, with or without prior notice, depending on the severity of the violation.</p>

            <h2>6. Student Data and Privacy</h2>

            <h3>6.1 Data Controller Responsibilities</h3>
            <p>Schools are the primary data controllers for Student Data entered into the Platform. Schools are responsible for ensuring they have appropriate consent and legal basis to collect and process Student Data.</p>
            <p>Novel Eye Tech acts as a data processor, processing Student Data on behalf of Schools in accordance with these Terms and our Privacy Policy.</p>

            <h3>6.2 Consent</h3>
            <p>By enrolling on the Platform and entering Student Data, Schools represent and warrant that they have obtained all necessary parental consents and legal authorizations required under applicable law to process Student Data through the Platform.</p>

            <h3>6.3 Data Use Restrictions</h3>
            <ul>
              <li>Student Data will only be used for the educational and operational purposes described in these Terms and our Privacy Policy.</li>
              <li>We will never sell Student Data to third parties.</li>
              <li>We will never use Student Data for advertising or marketing purposes.</li>
              <li>We will not use Student Data to build profiles for any purpose other than providing the Platform&apos;s services.</li>
            </ul>

            <h3>6.4 Data Security</h3>
            <p>We implement industry-standard security measures to protect Student Data, as described in our Privacy Policy. However, no system is completely secure, and we cannot guarantee absolute security.</p>

            <h3>6.5 Data Portability and Deletion</h3>
            <ul>
              <li>Schools may request export of their data by contacting <a href="mailto:support@skunect.com" className="text-teal hover:underline">support@skunect.com</a>.</li>
              <li>Upon termination of a School&apos;s subscription, data will be retained for 12 months to allow for reactivation, after which it will be scheduled for deletion.</li>
              <li>Schools may request immediate deletion of their data, subject to legal retention requirements.</li>
            </ul>

            <h2>7. Intellectual Property</h2>

            <h3>7.1 Our Intellectual Property</h3>
            <p>The Platform, including its design, code, features, logos, trademarks, and documentation, is the intellectual property of Novel Eye Tech Limited. Nothing in these Terms grants you any right, title, or interest in our intellectual property, except for the limited right to use the Platform in accordance with these Terms.</p>

            <h3>7.2 Your Content</h3>
            <ul>
              <li>You retain ownership of all Content you upload to the Platform.</li>
              <li>By uploading Content, you grant us a non-exclusive, worldwide, royalty-free license to store, process, and display that Content solely for the purpose of providing the Platform&apos;s services to you and your school.</li>
              <li>This license terminates when your Content is deleted from the Platform.</li>
            </ul>

            <h3>7.3 Feedback</h3>
            <p>If you provide us with suggestions, ideas, or feedback about the Platform, we may use such feedback without any obligation to you.</p>

            <h2>8. Communications</h2>

            <h3>8.1 Platform Communications</h3>
            <p>By using the Platform, you consent to receive:</p>
            <ul>
              <li>Transactional messages necessary for Platform operation (OTP codes, system notifications, security alerts)</li>
              <li>In-app notifications and announcements from your school</li>
              <li>Messages from teachers, parents, or administrators through the Platform&apos;s messaging features</li>
            </ul>

            <h3>8.2 Service Communications</h3>
            <p>We may send you communications about:</p>
            <ul>
              <li>Important updates to the Platform or these Terms</li>
              <li>Security incidents affecting your account</li>
              <li>Subscription and billing information (for Admins)</li>
            </ul>

            <h3>8.3 Opting Out</h3>
            <p>You may adjust your notification preferences within the Platform settings. However, you cannot opt out of essential transactional and security communications.</p>

            <h2>9. Disclaimers</h2>

            <h3>9.1 &quot;As Is&quot; Service</h3>
            <p>THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY. TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</p>

            <h3>9.2 No Guarantee of Availability</h3>
            <p>While we strive for high availability, we do not guarantee uninterrupted or error-free access to the Platform. The Platform may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.</p>

            <h3>9.3 Educational Decisions</h3>
            <p>The Platform is a tool to support school management and parent engagement. We do not provide educational, medical, or professional advice. Schools, teachers, and parents are solely responsible for educational decisions made using information from the Platform.</p>

            <h3>9.4 Data Accuracy</h3>
            <p>We rely on Schools, Teachers, and Admins to enter accurate data. We are not responsible for the accuracy, completeness, or timeliness of data entered by users.</p>

            <h2>10. Limitation of Liability</h2>

            <h3>10.1</h3>
            <p>To the fullest extent permitted by applicable law:</p>
            <ul>
              <li>Novel Eye Tech&apos;s total aggregate liability for any claims arising out of or related to these Terms or the Platform shall not exceed the amount paid by the School to Novel Eye Tech in the 12 months preceding the claim.</li>
              <li>We shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, loss of revenue, loss of business opportunities, or reputational harm, regardless of whether we were advised of the possibility of such damages.</li>
            </ul>

            <h3>10.2</h3>
            <p>Nothing in these Terms excludes or limits liability for:</p>
            <ul>
              <li>Death or personal injury caused by negligence</li>
              <li>Fraud or fraudulent misrepresentation</li>
              <li>Any other liability that cannot be excluded under applicable Nigerian law</li>
            </ul>

            <h2>11. Indemnification</h2>
            <p>You agree to indemnify, defend, and hold harmless Novel Eye Tech, its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising out of or related to:</p>
            <ul>
              <li>Your use of the Platform in violation of these Terms</li>
              <li>Your breach of any representation or warranty in these Terms</li>
              <li>Your violation of any applicable law or regulation</li>
              <li>Content you upload or transmit through the Platform</li>
              <li>For Schools: any failure to obtain appropriate consent for Student Data processing</li>
            </ul>

            <h2>12. Termination</h2>

            <h3>12.1 By You</h3>
            <ul>
              <li>Individual users may deactivate their account at any time by contacting <a href="mailto:support@skunect.com" className="text-teal hover:underline">support@skunect.com</a>.</li>
              <li>Schools may cancel their subscription in accordance with the subscription agreement terms.</li>
            </ul>

            <h3>12.2 By Us</h3>
            <p>We may suspend or terminate your access to the Platform:</p>
            <ul>
              <li>Immediately, if you materially breach these Terms</li>
              <li>Immediately, if required by law or to protect the safety of users</li>
              <li>With 30 days&apos; notice, for any other reason</li>
            </ul>

            <h3>12.3 Effect of Termination</h3>
            <ul>
              <li>Upon termination, your right to access the Platform ceases immediately.</li>
              <li>School data will be handled in accordance with Section 6.5 (Data Portability and Deletion).</li>
              <li>Sections that by their nature should survive termination (including Sections 7, 10, 11, and 13) will survive.</li>
            </ul>

            <h2>13. Dispute Resolution</h2>

            <h3>13.1 Informal Resolution</h3>
            <p>Before initiating any formal proceedings, you agree to contact us at <a href="mailto:support@skunect.com" className="text-teal hover:underline">support@skunect.com</a> to attempt to resolve the dispute informally. We will make reasonable efforts to resolve the matter within 30 days.</p>

            <h3>13.2 Mediation</h3>
            <p>If informal resolution fails, either party may propose mediation through a mutually agreed-upon mediator in Lagos, Nigeria. The costs of mediation shall be shared equally.</p>

            <h3>13.3 Governing Law and Jurisdiction</h3>
            <p>These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes that cannot be resolved through mediation shall be subject to the exclusive jurisdiction of the courts in Lagos, Nigeria.</p>

            <h2>14. General Provisions</h2>

            <h3>14.1 Entire Agreement</h3>
            <p>These Terms, together with our Privacy Policy and any subscription agreement between a School and Novel Eye Tech, constitute the entire agreement between you and Novel Eye Tech regarding your use of the Platform.</p>

            <h3>14.2 Severability</h3>
            <p>If any provision of these Terms is found to be unenforceable, the remaining provisions shall continue in full force and effect.</p>

            <h3>14.3 Waiver</h3>
            <p>Our failure to enforce any provision of these Terms shall not constitute a waiver of that provision or any other provision.</p>

            <h3>14.4 Assignment</h3>
            <p>You may not assign your rights or obligations under these Terms without our written consent. We may assign our rights and obligations without restriction.</p>

            <h3>14.5 Force Majeure</h3>
            <p>We shall not be liable for any failure or delay in performing our obligations due to causes beyond our reasonable control, including but not limited to natural disasters, acts of government, internet or telecommunications failures, power outages, or epidemics.</p>

            <h3>14.6 Notices</h3>
            <p>Notices to you will be sent to the email address associated with your account. Notices to us should be sent to <a href="mailto:legal@skunect.com" className="text-teal hover:underline">legal@skunect.com</a>.</p>

            <h2>15. Changes to These Terms</h2>
            <p>We may update these Terms from time to time. When we make material changes:</p>
            <ul>
              <li>We will update the &quot;Last Updated&quot; date at the top</li>
              <li>We will notify users through the Platform or by email</li>
              <li>For changes affecting School subscriptions or Student Data handling, we will provide at least 30 days&apos; advance notice</li>
            </ul>
            <p>Continued use after changes take effect constitutes acceptance.</p>
            <p>If you do not agree with the updated Terms, you must stop using the Platform and, if applicable, cancel your subscription.</p>

            <h2>16. Contact Us</h2>
            <p>If you have questions about these Terms, please contact us:</p>
            <ul>
              <li><strong>Email:</strong> <a href="mailto:legal@skunect.com" className="text-teal hover:underline">legal@skunect.com</a></li>
              <li><strong>Support:</strong> <a href="mailto:support@skunect.com" className="text-teal hover:underline">support@skunect.com</a></li>
              <li><strong>Website:</strong> <a href="https://skunect.com" target="_blank" rel="noopener noreferrer" className="text-teal hover:underline">https://skunect.com</a></li>
            </ul>

            <div className="mt-12 rounded-xl bg-teal/5 p-6 border border-teal/10 not-prose">
              <h3 className="text-sm font-semibold text-teal uppercase tracking-wider mb-2">Need Further Assistance?</h3>
              <p className="text-sm text-muted-foreground">
                If you have any questions about these Terms, please contact us at <a href="mailto:legal@skunect.com" className="text-teal hover:underline font-medium">legal@skunect.com</a>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
