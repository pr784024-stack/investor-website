# INVESTORBRIDGE SOLUTIONS — EMAIL, SMS OTP, RAZORPAY & DATABASE SETUP PROMPT

Implement a professional fintech-grade infrastructure for InvestorBridge Solutions inspired by the architecture patterns used in modern financial platforms.

The system must include:
- Email Verification System
- SMS OTP Verification System
- Razorpay Payment System
- PostgreSQL Database System

All sensitive operations must happen on the backend. API keys, secrets and credentials must never be exposed to frontend users.

---

## 1. EMAIL VERIFICATION SYSTEM
### Provider
- **Primary:** Resend
- **Fallback:** Brevo

### Registration Email Flow
1. **User enters:** Full Name, Email, Mobile Number, Password
2. Frontend sends data to backend.
3. **Backend validates:** Email format, Duplicate email, Input security
4. **Backend generates Email OTP:** (Example: `583921`), OTP Expiry: 5 minutes
5. Store OTP securely in database (Status: `Pending Verification`)
6. **Send OTP through Resend:** Email Subject: `Verify Your InvestorBridge Account`
7. User enters OTP
8. **Backend verifies:** Correct OTP, Not expired, Not already used
9. Email marked as verified
10. OTP deleted or invalidated

### Email Use Cases
Send emails for:
- Registration Verification
- Login Alerts
- Consultation Confirmation
- Payment Confirmation
- Invoice Delivery
- Password Reset
- Security Alerts
- Newsletter

---

## 2. SMS OTP SYSTEM
### Provider
- **Primary:** MSG91
- **Fallback:** Twilio Verify

### Mobile Verification Flow
1. **User enters** mobile number
2. **Backend validates:** Country code, Mobile format, Duplicate number
3. **Backend generates OTP:** (Example: `847562`), Expiry: 5 minutes
4. OTP stored securely
5. **MSG91 sends OTP SMS**
6. User enters OTP
7. **Backend verifies:** OTP, Expiry, Usage status
8. Mobile number marked verified
9. OTP invalidated

### SMS Use Cases
Send SMS for:
- Registration OTP
- Booking Confirmation
- Payment Confirmation
- Security Alerts

---

## 3. RAZORPAY PAYMENT SYSTEM
### Purpose
Use Razorpay as the primary payment gateway.
- **Supported Methods:** UPI, Debit Card, Credit Card, Net Banking, Wallet

### Payment Flow
1. **User selects service:** (Example: Financial Consultation)
2. **Backend creates Razorpay Order**
3. Store order details in database (Status: `Pending`)
4. **Frontend opens Razorpay Checkout**
5. User completes payment
6. **Razorpay returns:** Payment ID, Order ID, Signature
7. **Backend verifies:** Signature, Order ID, Payment ID
8. Payment marked successful
9. Transaction stored in database
10. Invoice generated
11. Confirmation Email sent
12. Confirmation SMS sent

### Failed Payment Flow
If payment fails:
1. Store failure record
2. Show failure page
3. Allow retry

---

## 4. DATABASE SYSTEM
- **Database:** PostgreSQL
- **ORM:** Prisma ORM

### DATABASE TABLES

#### Users
Store:
- `id`
- `full_name`
- `email`
- `mobile`
- `password_hash`
- `email_verified`
- `mobile_verified`
- `created_at`
- `updated_at`

#### Email OTPs
Store:
- `id`
- `user_id`
- `otp_hash`
- `expires_at`
- `used`
- `created_at`

#### SMS OTPs
Store:
- `id`
- `user_id`
- `otp_hash`
- `expires_at`
- `used`
- `created_at`

#### Consultation Bookings
Store:
- `id`
- `user_id`
- `service_name`
- `booking_date`
- `booking_time`
- `status`
- `created_at`

#### Razorpay Orders
Store:
- `id`
- `user_id`
- `order_id`
- `amount`
- `status`
- `created_at`

#### Razorpay Payments
Store:
- `id`
- `user_id`
- `payment_id`
- `order_id`
- `amount`
- `status`
- `payment_method`
- `created_at`

#### Notifications
Store:
- `id`
- `user_id`
- `type`
- `message`
- `read_status`
- `created_at`

---

## SECURITY RULES
- **Passwords:** Store only bcrypt hash or argon2 hash. Never store plain text passwords.
- **OTPs:** Store only hashed OTPs. Never store plain OTP values permanently.
- **API Keys:** Store only in `.env` (Never expose secrets to frontend):
  - `DATABASE_URL=xxxx`
  - `RESEND_API_KEY=xxxx`
  - `MSG91_API_KEY=xxxx`
  - `RAZORPAY_KEY_ID=xxxx`
  - `RAZORPAY_KEY_SECRET=xxxx`

---

## COMPLETE FLOW
1. User Registers
2. Email OTP Sent
3. SMS OTP Sent
4. Email Verified
5. Mobile Verified
6. Account Created
7. User Books Consultation
8. Razorpay Order Created
9. Payment Completed
10. Backend Verification
11. Payment Stored
12. Booking Confirmed
13. Email Confirmation Sent
14. SMS Confirmation Sent
15. User Dashboard Updated
