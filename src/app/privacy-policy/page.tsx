'use client';

import { SiteNavbar } from '@/components/shared/site-navbar';
import { SiteFooter } from '@/components/shared/site-footer';
import { PageHeader } from '@/components/shared/page-header';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteNavbar />
      
      <main id="main-content" className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <PageHeader
            title="Privacy Policy"
            description="Effective Date: April 9, 2026 | Last Updated: April 9, 2026"
          />

          <div className="prose prose-slate max-w-none text-justify rounded-2xl border bg-white p-8 shadow-sm sm:p-12">
            <p>
              Novel Eye Tech Limited (&quot;we,&quot; &quot;us,&quot; &quot;our,&quot; or &quot;Novel Eye Tech&quot;) operates the Skunect platform, which includes the website at skunect.com, the Skunect web application, and the Skunect mobile application (collectively, the &quot;Platform&quot;). This Privacy Policy explains how we collect, use, store, share, and protect information about our users, including school administrators, teachers, parents, and students.
            </p>
            <p>
              We take the privacy of children&apos;s data especially seriously. Given that our Platform processes educational records and personal information relating to minors, we are committed to maintaining the highest standards of data protection.
            </p>
            <p>
              By using the Platform, you agree to the practices described in this Privacy Policy. If you do not agree, please do not use the Platform.
            </p>

            <h2>1. Definitions</h2>
            <ul>
              <li><strong>&quot;School&quot;</strong> means any educational institution that subscribes to and uses the Platform.</li>
              <li><strong>&quot;Admin&quot;</strong> means a school administrator or school owner who manages the School&apos;s account on the Platform.</li>
              <li><strong>&quot;Teacher&quot;</strong> means an educator authorized by a School to use the Platform for classroom operations.</li>
              <li><strong>&quot;Parent&quot;</strong> means a parent or legal guardian who accesses the Platform to monitor their child(ren).</li>
              <li><strong>&quot;Student&quot;</strong> means a minor enrolled at a subscribing School whose educational data is processed through the Platform.</li>
              <li><strong>&quot;Personal Data&quot;</strong> means any information that identifies or can be used to identify an individual.</li>
            </ul>

            <h2>2. Information We Collect</h2>
            
            <h3>2.1 Information You Provide Directly</h3>
            <h4>Account Registration & Authentication</h4>
            <ul>
              <li>Full name (first and last)</li>
              <li>Email address</li>
              <li>Phone number (optional, Nigerian format supported)</li>
              <li>Authentication method (email OTP, phone OTP, Google Sign-In, or Apple Sign-In)</li>
            </ul>

            <h4>School Enrollment</h4>
            <ul>
              <li>School name, address, city, and state</li>
              <li>Administrator contact details (name, email, phone)</li>
              <li>Estimated student count</li>
            </ul>

            <h4>Beta Program Participation</h4>
            <ul>
              <li>Role (school owner, administrator, teacher, or parent)</li>
              <li>School name and size</li>
              <li>City and state</li>
              <li>Whether the school uses an existing management system</li>
            </ul>

            <h3>2.2 Information Generated Through Platform Use</h3>
            <h4>Student Academic Data</h4>
            <ul>
              <li>Attendance records (daily check-in/check-out)</li>
              <li>Assessment scores (continuous assessments, examinations)</li>
              <li>Homework assignments and completion status</li>
              <li>Academic performance trends and term reports</li>
            </ul>

            <h4>Student Welfare Data</h4>
            <ul>
              <li>Health records entered by the school</li>
              <li>Behavioral observations and welfare logs</li>
              <li>Mood tracking data</li>
              <li>Disciplinary records</li>
            </ul>

            <h4>Student Safety Data</h4>
            <ul>
              <li>Pickup authorization records</li>
              <li>Emergency contact information</li>
              <li>Emergency alert history</li>
              <li>Bus tracking and transport location data</li>
            </ul>

            <h4>Financial Data</h4>
            <ul>
              <li>Fee structures and invoice records</li>
              <li>Payment status and history</li>
              <li>Outstanding balance information</li>
            </ul>

            <h4>Communication Data</h4>
            <ul>
              <li>Direct messages between parents, teachers, and administrators</li>
              <li>Announcements and notifications</li>
              <li>Message history</li>
            </ul>

            <h4>Audit and System Data</h4>
            <ul>
              <li>User activity logs (actions performed, timestamps)</li>
              <li>Login history and session data</li>
              <li>Device information and browser type</li>
            </ul>

            <h3>2.3 Information Collected Automatically</h3>
            <p>
              <strong>Analytics:</strong> We use Plausible Analytics, a privacy-focused analytics service that does not use cookies, does not collect personal data, and does not track individual users across websites. Plausible collects aggregate, anonymized data including page views, referral sources, browser and device type, and country of origin.
            </p>
            <p>
              <strong>Bot Protection:</strong> We use Cloudflare Turnstile on certain forms (such as beta signup) to distinguish human users from automated bots. This service processes minimal data necessary for bot detection and does not track users.
            </p>

            <h3>2.4 Information from Third-Party Authentication</h3>
            <p>
              When you sign in using Google or Apple, we receive only the information you authorize those services to share, which typically includes your name and email address. We do not access your Google or Apple account passwords.
            </p>

            <h2>3. How We Use Your Information</h2>
            <p>We use the information we collect for the following purposes:</p>

            <h3>3.1 Platform Operations</h3>
            <ul>
              <li>Authenticating users and maintaining account security</li>
              <li>Enabling schools to manage attendance, grading, homework, and communications</li>
              <li>Providing parents with real-time visibility into their children&apos;s academic progress, attendance, and welfare</li>
              <li>Facilitating teacher-parent and school-parent communication</li>
              <li>Processing and tracking school fee payments</li>
              <li>Managing student safety features (pickup authorization, emergency alerts)</li>
            </ul>

            <h3>3.2 Platform Improvement</h3>
            <ul>
              <li>Analyzing aggregate usage patterns to improve features and user experience</li>
              <li>Identifying and fixing technical issues</li>
              <li>Developing new features based on user needs</li>
            </ul>

            <h3>3.3 Communications</h3>
            <ul>
              <li>Sending transactional messages (OTP codes, account notifications, system alerts)</li>
              <li>Delivering in-app notifications and announcements from schools</li>
              <li>Providing customer support</li>
            </ul>

            <h3>3.4 Security and Compliance</h3>
            <ul>
              <li>Maintaining audit logs to ensure accountability and regulatory compliance</li>
              <li>Detecting and preventing fraud, abuse, or unauthorized access</li>
              <li>Enforcing our Terms and Conditions</li>
            </ul>

            <h2>4. Data Sharing and Disclosure</h2>
            
            <h3>4.1 Within the Platform</h3>
            <p>Data is shared within the Platform strictly on a need-to-know basis, governed by user roles:</p>
            <ul>
              <li><strong>Admins</strong> can access all data within their school, including student records, teacher activities, parent information, and financial records.</li>
              <li><strong>Teachers</strong> can access data for students in their assigned classes, including attendance, grades, homework, and parent contact information for communication purposes.</li>
              <li><strong>Parents</strong> can access data only for their own child(ren), including attendance, academic performance, homework, fee status, and safety information.</li>
            </ul>
            <p>
              No cross-school data access. Each school&apos;s data is fully isolated. A user affiliated with multiple schools can only see data scoped to the school they are currently viewing.
            </p>

            <h3>4.2 Third-Party Service Providers</h3>
            <p>We share data with the following categories of third-party service providers, solely to operate and improve the Platform:</p>
            <div className="overflow-x-auto not-prose my-6">
              <table className="w-full text-sm text-left border-collapse border border-slate-200">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 border-b border-slate-200">Provider Category</th>
                    <th scope="col" className="px-6 py-3 border-b border-slate-200">Purpose</th>
                    <th scope="col" className="px-6 py-3 border-b border-slate-200">Data Shared</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white border-b hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 border-slate-200 font-medium whitespace-nowrap">Cloud infrastructure (AWS)</td>
                    <td className="px-6 py-4 border-slate-200">Hosting and data storage</td>
                    <td className="px-6 py-4 border-slate-200">All platform data (encrypted at rest and in transit)</td>
                  </tr>
                  <tr className="bg-white border-b hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 border-slate-200 font-medium whitespace-nowrap">Email delivery service</td>
                    <td className="px-6 py-4 border-slate-200">Sending OTP codes and notifications</td>
                    <td className="px-6 py-4 border-slate-200">Email addresses, message content</td>
                  </tr>
                  <tr className="bg-white border-b hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 border-slate-200 font-medium whitespace-nowrap">Analytics (Plausible)</td>
                    <td className="px-6 py-4 border-slate-200">Aggregate usage statistics</td>
                    <td className="px-6 py-4 border-slate-200">No personal data (anonymized only)</td>
                  </tr>
                  <tr className="bg-white border-b hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 border-slate-200 font-medium whitespace-nowrap">Bot protection (Cloudflare)</td>
                    <td className="px-6 py-4 border-slate-200">Preventing automated abuse</td>
                    <td className="px-6 py-4 border-slate-200">IP addresses, browser metadata</td>
                  </tr>
                  <tr className="bg-white border-b hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 border-slate-200 font-medium whitespace-nowrap">Authentication (Google, Apple)</td>
                    <td className="px-6 py-4 border-slate-200">Social sign-in</td>
                    <td className="px-6 py-4 border-slate-200">Name, email (as authorized by user)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>4.3 Legal Requirements</h3>
            <p>We may disclose information if required to do so by law, regulation, legal process, or governmental request, or if we believe in good faith that disclosure is necessary to protect the rights, property, or safety of Novel Eye Tech, our users, or the public.</p>

            <h3>4.4 Business Transfers</h3>
            <p>In the event of a merger, acquisition, or sale of assets, user data may be transferred as part of the transaction. We will notify affected users before their data becomes subject to a different privacy policy.</p>

            <h3>4.5 No Sale of Data</h3>
            <p>We do not sell, rent, or trade personal data to third parties for marketing or advertising purposes. We will never monetize student data.</p>

            <h2>5. Data Storage and Security</h2>
            
            <h3>5.1 Where Data Is Stored</h3>
            <p>Platform data is stored on Amazon Web Services (AWS) infrastructure. Database services use PostgreSQL with encryption at rest. Data may be processed in regions where AWS operates data centers to ensure optimal performance and reliability.</p>

            <h3>5.2 Security Measures</h3>
            <p>We implement the following security measures to protect your data:</p>
            <ul>
              <li><strong>Encryption in transit:</strong> All data transmitted between your device and our servers is encrypted using TLS/HTTPS and WSS (WebSocket Secure).</li>
              <li><strong>Encryption at rest:</strong> Database storage is encrypted using AWS managed encryption keys.</li>
              <li><strong>Access controls:</strong> Role-based access control (RBAC) ensures users only access data appropriate to their role and school affiliation.</li>
              <li><strong>Multi-tenant isolation:</strong> Each school&apos;s data is logically isolated at the database level using row-level security. No school can access another school&apos;s data.</li>
              <li><strong>Secure authentication:</strong> Passwordless authentication (OTP-based) eliminates password-related vulnerabilities. JWT tokens are signed using RSA-256.</li>
              <li><strong>Mobile device security:</strong> On mobile devices, authentication tokens are stored using device-level encrypted storage (Expo SecureStore).</li>
              <li><strong>Audit logging:</strong> All significant user actions are logged for accountability and security monitoring.</li>
            </ul>

            <h3>5.3 Data Retention</h3>
            <ul>
              <li><strong>Active accounts:</strong> We retain your data for as long as your account remains active and as long as the subscribing school maintains its subscription.</li>
              <li><strong>Inactive accounts:</strong> If a school&apos;s subscription lapses, we retain the data for a period of 12 months to allow for reactivation, after which the school will be notified and data will be scheduled for deletion.</li>
              <li><strong>Deleted accounts:</strong> When a user requests account deletion, we will remove or anonymize personal data within 30 days, except where retention is required by law or legitimate business purposes (such as audit logs and financial records).</li>
              <li><strong>Student records:</strong> Student academic and attendance records are retained for the duration of the school&apos;s subscription plus an additional period as may be required by applicable education regulations.</li>
            </ul>

            <h2>6. Children&apos;s Privacy</h2>
            <p>The Platform processes data about students who are minors. We take the following precautions:</p>
            <ul>
              <li><strong>School responsibility:</strong> Schools are responsible for obtaining appropriate parental consent before enrolling students and entering their data into the Platform. By using the Platform and entering student data, the School represents that it has obtained all necessary consents.</li>
              <li><strong>Parental access:</strong> Parents have full read-only access to their child(ren)&apos;s data through the Platform, including attendance, grades, homework, welfare records, and fee status.</li>
              <li><strong>Limited collection:</strong> We only collect student data that is necessary for the educational purposes of the Platform. We do not collect data directly from students.</li>
              <li><strong>No direct marketing to children:</strong> We do not use student data for advertising or marketing purposes.</li>
              <li><strong>No student accounts:</strong> Students do not have their own accounts on the Platform. Student data is entered and managed by school staff (administrators and teachers) and viewed by parents.</li>
            </ul>

            <h2>7. Your Rights</h2>
            <p>Depending on your location and applicable law, you may have the following rights regarding your personal data:</p>

            <h3>7.1 All Users</h3>
            <ul>
              <li><strong>Access:</strong> You may request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> You may request that we correct inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> You may request deletion of your account and personal data, subject to legal and contractual retention requirements.</li>
              <li><strong>Data portability:</strong> You may request your data in a structured, machine-readable format.</li>
              <li><strong>Withdraw consent:</strong> Where processing is based on consent, you may withdraw consent at any time.</li>
            </ul>

            <h3>7.2 Parents</h3>
            <ul>
              <li><strong>Access to child&apos;s data:</strong> You may view all data held about your child(ren) through the Platform at any time.</li>
              <li><strong>Request corrections:</strong> You may request corrections to your child(ren)&apos;s records through the school or by contacting us.</li>
            </ul>

            <h3>7.3 School Administrators</h3>
            <ul>
              <li><strong>Data controller responsibilities:</strong> As the primary data controller for student and staff data within your school, you are responsible for ensuring the accuracy of data entered and for responding to data subject requests from your school community.</li>
            </ul>

            <h3>7.4 Exercising Your Rights</h3>
            <p>To exercise any of these rights, please contact us at <a href="mailto:privacy@skunect.com" className="text-teal hover:underline font-medium">privacy@skunect.com</a>. We will respond to requests within 30 days.</p>

            <h2>8. Cookies and Tracking</h2>
            <p>The Platform does not use traditional tracking cookies. Specifically:</p>
            <ul>
              <li><strong>No advertising cookies:</strong> We do not use cookies for advertising or cross-site tracking.</li>
              <li><strong>No third-party tracking pixels:</strong> We do not embed Facebook Pixel, Google Analytics, or similar third-party trackers.</li>
              <li><strong>Analytics:</strong> We use Plausible Analytics, which is fully cookie-free and does not collect personal data.</li>
              <li><strong>Essential storage:</strong> The web application uses browser localStorage to maintain your session (authentication tokens and UI preferences). This is essential for the Platform to function and is not used for tracking.</li>
            </ul>

            <h2>9. International Data Transfers</h2>
            <p>Our servers are hosted on AWS infrastructure which may process data in regions outside of Nigeria. Where data is transferred internationally, we ensure that appropriate safeguards are in place, including:</p>
            <ul>
              <li>Using service providers that maintain industry-standard security certifications</li>
              <li>Ensuring data is encrypted in transit and at rest</li>
              <li>Limiting access to authorized personnel only</li>
            </ul>
            <p>We are committed to complying with the Nigeria Data Protection Act (NDPA) 2023 and the Nigeria Data Protection Regulation (NDPR) as applicable.</p>

            <h2>10. Third-Party Links</h2>
            <p>The Platform may contain links to third-party websites or services. We are not responsible for the privacy practices of those third parties. We encourage you to review the privacy policies of any third-party service you interact with.</p>

            <h2>11. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. When we make material changes, we will:</p>
            <ul>
              <li>Update the &quot;Last Updated&quot; date at the top of this policy</li>
              <li>Notify users through the Platform (via in-app notification or email)</li>
              <li>For changes affecting student data handling, provide schools with at least 30 days&apos; advance notice</li>
            </ul>
            <p>Your continued use of the Platform after changes take effect constitutes acceptance of the updated policy.</p>

            <h2>12. Contact Us</h2>
            <p>If you have questions, concerns, or complaints about this Privacy Policy or our data practices, please contact us:</p>
            <ul>
              <li><strong>Email:</strong> <a href="mailto:privacy@skunect.com" className="text-teal hover:underline">privacy@skunect.com</a></li>
              <li><strong>Support:</strong> <a href="mailto:support@skunect.com" className="text-teal hover:underline">support@skunect.com</a></li>
              <li><strong>Website:</strong> <a href="https://skunect.com" target="_blank" rel="noopener noreferrer" className="text-teal hover:underline">https://skunect.com</a></li>
            </ul>
            <p>For data protection inquiries specifically related to a school&apos;s data, please contact both the school&apos;s administration and Novel Eye Tech.</p>

            <h2>13. Governing Law</h2>
            <p>This Privacy Policy is governed by and construed in accordance with the laws of the Federal Republic of Nigeria, including the Nigeria Data Protection Act (NDPA) 2023. Any disputes arising from this policy shall be subject to the exclusive jurisdiction of the courts of Nigeria.</p>

            <div className="mt-12 rounded-xl bg-teal/5 p-6 border border-teal/10 not-prose">
              <h3 className="text-sm font-semibold text-teal uppercase tracking-wider mb-2">Need Further Assistance?</h3>
              <p className="text-sm text-muted-foreground">
                If you have any questions about how we handle your data, please contact us at <a href="mailto:support@skunect.com" className="text-teal hover:underline font-medium">support@skunect.com</a>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
