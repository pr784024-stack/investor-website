# GLOBAL INPUT SECURITY & SYSTEM RULES

## 1. GLOBAL INPUT SECURITY RULES
Apply these rules to every form, input field, search field, registration field, booking field, payment field and contact form.
- **General Protection:**
  - HTTPS only, TLS 1.3
  - Server-side validation & Client-side validation
  - Rate limiting & Bot detection (reCAPTCHA / Cloudflare Turnstile simulation/ready)
  - CSRF protection, XSS protection, SQL injection protection
  - Input sanitization
  - Audit logging

---

## 2. SIGN UP PAGE SECURITY
- **Fields & Constraints:**
  - **Full Name:** 2–100 characters; letters, spaces, hyphens only; strip harmful scripts; block code injection.
  - **Email:** RFC-compliant validation; disposable email detection (optional); email uniqueness check; verification required.
  - **Mobile Number:** Country code support; format validation; duplicate account detection; OTP verification mandatory.
  - **Password:** Minimum 12 characters; uppercase required; lowercase required; number required; special character required; password strength meter; block common passwords.
  - **Confirm Password:** Exact match validation.
- **Create Account Button:**
  - Before account creation: Email verification, Mobile OTP verification, Fraud/risk checks, Rate limiting.

---

## 3. LOGIN PAGE SECURITY
- **Fields:** Email / Mobile, Password.
- **Validation & Protection:**
  - Format validation.
  - Enumeration protection (don't reveal whether account exists in error messages).
  - Secure comparison; no plaintext storage; hashed password verification.
  - Failed login counter; temporary lockout after repeated failures.
  - Suspicious login detection; device/session tracking.
  - **MFA (supported/optional):** Email OTP, Authenticator App, SMS OTP.

---

## 4. CONTACT FORM SECURITY
- **Fields:** Name, Email, Phone, Message.
- **Security:** Spam detection, CAPTCHA, length limits, profanity filtering (optional), script injection blocking.

---

## 5. CONSULTATION BOOKING SECURITY
- **Fields:** Service, Date, Time, Name, Email, Phone, Notes.
- **Security:** Availability validation, duplicate booking prevention, time slot locking, input sanitization, fraud protection.

---

## 6. ARTICLE SEARCH SECURITY
- **Search Bar Security:** Sanitized search queries, SQL injection protection, rate limiting, search abuse protection.

---

## 7. CALCULATOR PAGE SECURITY
- **Inputs:** Amount, Years, Returns, Age.
- **Security:** Numeric validation, min/max limits, overflow protection, sanitized calculations.

---

## 8. PAYMENT PAGE SECURITY (RAZORPAY)
- **Reference:** Modern fintech payment security standards.
- **Security:**
  - Razorpay Order Verification
  - Webhook Signature Verification
  - Transaction Logging
  - Duplicate Payment Prevention
  - Replay Attack Protection
  - PCI-DSS compliant gateway usage (Razorpay Hosted Checkout/elements)
  - No card data stored on application servers
- **Supported:** UPI, Credit Card, Debit Card, Net Banking, Wallets

---

## 9. USER DASHBOARD SECURITY
- Secure session management, automatic session expiration.
- Login history, active device tracking, notification on new login.
- Secure profile updates.

---

## 10. PROFILE UPDATE SECURITY
- When changing Email, Phone, or Password, require:
  - Current password verification.
  - OTP verification.
  - Re-authentication for sensitive actions.

---

## 11. ADMIN PANEL SECURITY
- **Reference:** Enterprise SaaS / fintech admin security.
- **Requirements:** Role-Based Access Control (RBAC), Audit Logs, Admin Activity Tracking, Session Monitoring, MFA Mandatory, IP Monitoring, Secure Password Policies, Permission-based access.

---

## 12. DATABASE SECURITY
- **Database:** PostgreSQL (with Prisma ORM).
- **Security:** Encryption at rest, encrypted backups, parameterized queries, least-privilege access, backup & recovery policies.

---

## 13. FILE UPLOAD SECURITY
- If any file upload exists: Allowed file type validation, malware scanning, size limits, randomized filenames, secure storage.

---

## 14. NOTIFICATION SECURITY
- **Email Notifications:** Verification emails, booking confirmations, payment confirmations, login alerts.
- Never expose passwords, sensitive internal IDs, or payment secrets.

---

## 15. SESSION SECURITY
- Secure cookies, HttpOnly cookies, SameSite protection, session expiration, logout from all devices support.

---

## 16. MONITORING & FRAUD PREVENTION
- Suspicious activity detection, excessive request monitoring, failed login monitoring, payment anomaly monitoring, admin alerts.
