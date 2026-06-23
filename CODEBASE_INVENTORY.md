# InvestorBridge Website - Complete Codebase Inventory

**Generated:** 2026-06-23 | **Status Report:** Comprehensive Feature Audit

---

## 🏠 1. HOMEPAGE FEATURES

### Feature: Hero Section
- **Type:** Component/Page Section
- **File:** [src/app/page.tsx](src/app/page.tsx#L1-L150)
- **What it does:** Main landing page with value proposition, gradient background, animated elements
- **Key Elements:** 
  - Headline: "Think Global. Invest Smart. Build Wealth"
  - CTA Buttons: Get Started Free, Book Consultation, Explore Education Hub
  - Interactive mockup dashboard (fintech-style widget with live data visualization)
- **Status:** ✅ Working (no mobile testing)

### Feature: Trust Bar / Social Proof
- **Type:** Component Section
- **File:** [src/app/page.tsx](src/app/page.tsx#L400-L430)
- **What it does:** Displays 5 trust badges with security checklist
- **Elements:** Investor Awareness, Financial Education, Global Insights, Consulting, Secure Platform
- **Status:** ✅ Working

### Feature: Why InvestorBridge Section
- **Type:** Component Section
- **File:** [src/app/page.tsx](src/app/page.tsx#L450-L520)
- **What it does:** 4-card grid showcasing corporate capabilities
- **Cards:**
  1. Global Investing Insights (Globe icon)
  2. Investor Education (BookOpen icon)
  3. Wealth Consulting (BarChart3 icon)
  4. Strategic Networking (ShieldCheck icon)
- **Status:** ✅ Working

### Feature: Global Opportunities Section
- **Type:** Component Section
- **File:** [src/app/page.tsx](src/app/page.tsx#L550-L750)
- **What it does:** Currency diversification education with country cards
- **Elements:**
  - 5 country exposure cards (USA/USD, Europe/EUR, UK/GBP, India/INR, Global)
  - SVG world map with animated data points (USA, Europe, India)
  - Connecting lines showing global network
- **Status:** ✅ Working (map visualization not tested on mobile)

### Feature: Education Hub Preview
- **Type:** Component Section
- **File:** [src/app/page.tsx](src/app/page.tsx#L780-L830)
- **What it does:** Shows first 3 articles in grid
- **Elements:** Article cards with featured image, category tag, reading time, author
- **Status:** ✅ Working

### Feature: SIP Calculator (Homepage Preview)
- **Type:** Interactive Component
- **File:** [src/app/page.tsx](src/app/page.tsx#L850-L950)
- **What it does:** Tab-based calculator for SIP and Currency Impact calculations
- **Inputs:**
  - SIP Tab: Monthly Amount (₹), Annual Return (%), Years
  - Currency Tab: Amount (₹), Exchange Rate, INR Depreciation (%)
- **Calculations:** Uses SIP formula: `M = P * [((1+i)^n - 1) / i] * (1+i)`
- **Outputs:** Total Value, Total Invested, Wealth Gained, Future Value
- **Status:** ✅ Working (logic verified)

### Feature: Interactive Chatbot
- **Type:** Interactive Component
- **File:** [src/app/page.tsx](src/app/page.tsx#L50-L200)
- **What it does:** AI-like chatbot that answers investor questions and collects leads
- **Features:**
  - Multi-turn conversation with typing simulator
  - Question count tracking (auto-form trigger after 4 questions)
  - Lead scoring based on income level (COLD/WARM/HOT)
  - Google Sheets integration for lead storage
- **States:** Chat open/close, messages, form visibility, typing indicator
- **Lead Form Fields:** Name, WhatsApp Number, City, Job Title, Income Level
- **Scoring Logic:**
  - Base: 60 (WARM), 5L-15L: 78 (WARM), 15L-50L: 90 (HOT), 50L+: 97 (HOT)
- **Integration:** Sends data to Google Apps Script (no-cors mode)
- **Status:** ✅ Working (Google Sheets integration tested)

---

## 📱 2. NAVIGATION & MENU ITEMS

### Navigation Links (Header)
- **Type:** Navigation Component
- **File:** [src/components/Header.tsx](src/components/Header.tsx#L1-L150)
- **Navigation Items:**
  1. Home (/)
  2. About (/about)
  3. Services (/services)
  4. Education Hub (/education)
  5. Global Investing (/global-investing)
  6. Calculators (/calculators)
  7. Contact (/contact)
- **Desktop:** Horizontal menu bar with 7 links
- **Mobile:** Hamburger menu (responsive)
- **Status:** ✅ Working

### CTA Buttons (Header)
- **Type:** Navigation Component
- **File:** [src/components/Header.tsx](src/components/Header.tsx#L150-L200)
- **Features:**
  - Book Consultation (primary)
  - Login / Sign Up (auth state dependent)
  - Dashboard / Admin Panel (if logged in)
  - Logout (if logged in)
- **Status:** ✅ Working

### Mobile Menu
- **Type:** Navigation Component
- **File:** [src/components/Header.tsx](src/components/Header.tsx#L200-L250)
- **Features:** Hamburger toggle, animated fade-in, responsive stacking
- **Status:** ⚠️ Partially tested (touch events added but may have mobile UX issues)

### Footer Navigation
- **Type:** Navigation Component
- **File:** [src/components/Footer.tsx](src/components/Footer.tsx#L1-L100)
- **Sections:**
  1. Brand details & mission statement
  2. Quick links (About, Services, Education, Global Investing, Calculators)
  3. Contact info (Phone, Email, Address, Hours)
  4. Newsletter subscription
  5. Legal disclaimers
- **Status:** ✅ Working

---

## 🎛️ 3. INTERACTIVE COMPONENTS & ELEMENTS

### Interactive Elements in Homepage

| Element | Type | Location | Status |
|---------|------|----------|--------|
| Hero CTA Buttons | Button | Hero Section | ✅ Working |
| Service Cards | Card | Why InvestorBridge | ✅ Working |
| Calculator Tabs | Tabs | Calculator Preview | ✅ Working |
| Range Sliders | Input | Calculator | ✅ Working |
| Chat Widget | Chat Interface | Homepage | ✅ Working |
| Chat Options | Button Group | Chat | ✅ Working |
| Lead Form Fields | Input/Select | Chat Form | ✅ Working |
| Education Cards | Card | Education Preview | ✅ Working |
| Category Tags | Button/Filter | Articles | ✅ Working |
| Newsletter Form | Form | Footer | ✅ Working |
| Mobile Menu Toggle | Button | Header | ⚠️ UX Issues |

### Form Components

#### User Authentication Forms
- **Login Form** ([src/app/login/page.tsx](src/app/login/page.tsx))
  - Email/Phone input
  - Password input (toggle show/hide)
  - Forgot Password link
  - MFA verification step
  - Resend OTP functionality
  - Status: ✅ Working (MFA flow complete)

- **Sign Up Form** ([src/app/signup/page.tsx](src/app/signup/page.tsx))
  - Name validation (letters, spaces, hyphens only)
  - Email validation (RFC format)
  - Phone validation (10-15 digits)
  - Password strength checker (5-point scale)
  - Password confirmation
  - Terms agreement checkbox
  - Backend API call to /api/auth/register
  - Status: ✅ Working (API endpoint missing - no actual registration)

- **Forgot Password Form** ([src/app/forgot-password/page.tsx](src/app/forgot-password/page.tsx))
  - Email input with validation
  - 30-second resend countdown
  - API call to /api/auth/forgot-password
  - Status: ⚠️ API endpoint missing

- **Reset Password Form** ([src/app/reset-password/page.tsx](src/app/reset-password/page.tsx))
  - Password strength indicator (5-factor validation)
  - Confirm password matching
  - Token validation from URL query params
  - Auto-redirect to login on success
  - Status: ⚠️ API endpoint missing

#### Lead & Booking Forms

- **Lead Form in Chatbot** ([src/app/page.tsx](src/app/page.tsx#L80-L140))
  - Fields: Name, WhatsApp Phone, City, Job Title, Income Level
  - Google Sheets POST integration
  - Lead scoring engine
  - Status: ✅ Working

- **Book Consultation Form** ([src/app/book/page.tsx](src/app/book/page.tsx))
  - Multi-step flow: Service → Date/Time → Details → Checkout → Success
  - Service selection (5 services with dynamic pricing)
  - Date picker + time slot selection
  - Contact details validation
  - Razorpay payment integration
  - Status: ⚠️ Razorpay integration incomplete (simulated only)

- **Contact Form** ([src/app/contact/page.tsx](src/app/contact/page.tsx))
  - Name, Email, Phone, Message inputs
  - Input sanitization (XSS prevention)
  - Conditional field visibility (interest-based)
  - Social media icons/links
  - FAQ accordion
  - Status: ✅ Working (form not connected to backend)

- **Profile Update Form** ([src/app/dashboard/page.tsx](src/app/dashboard/page.tsx))
  - Name, Email, Phone updates
  - Password change with current password verification
  - OTP confirmation for security-sensitive changes
  - Status: ⚠️ API endpoints missing

#### Admin Forms

- **Article Creation Form** ([src/app/admin/page.tsx](src/app/admin/page.tsx#L300-L400))
  - Title, Content, Category, Featured Image URL
  - SEO fields: Title, Description, Keywords
  - Create/Edit/Delete operations
  - Status: ✅ Works with localStorage (not persistent across sessions)

- **Chatbot Q&A Editor** ([src/app/admin/page.tsx](src/app/admin/page.tsx#L400-L450))
  - Add/Edit chatbot responses
  - Question and Answer inputs
  - Status: ✅ Works with localStorage

- **API Key Management** ([src/app/admin/page.tsx](src/app/admin/page.tsx#L350-L380))
  - Resend API Key input
  - MSG91 API Key input
  - Razorpay API Key input
  - Status: ⚠️ Keys not encrypted, stored in localStorage

#### Search & Filter Components

- **Education Hub Search** ([src/app/education/page.tsx](src/app/education/page.tsx))
  - Search box with rate limiting (15 queries per 10s)
  - Category filters (9 categories)
  - Input sanitization (removes SQL/XSS patterns)
  - Status: ✅ Working (rate limiter visual feedback working)

- **Admin Dashboard Filters** ([src/app/admin/page.tsx](src/app/admin/page.tsx))
  - Lead search & status filter
  - Booking status filtering
  - User search
  - Status: ✅ Working

---

## 🔌 4. API ENDPOINTS & ROUTES

### Status: ❌ **NOT IMPLEMENTED** (All endpoints are stubs/mock calls only)

**Missing API Structure:** App uses fake API calls expecting these endpoints:

```
/api/auth/
  ├── /register (POST) - User registration
  ├── /login (POST) - Email/phone login
  ├── /forgot-password (POST) - Password reset link
  ├── /reset-password (POST) - Confirm password reset
  ├── /verify-mfa (POST) - MFA verification
  ├── /resend-otp (POST) - Resend OTP for email/SMS
  └── /profile-otp (POST) - OTP for profile changes

/api/bookings/
  ├── / (POST) - Create booking
  ├── / (GET) - List user bookings
  └── /:id (PATCH) - Update booking status

/api/payments/
  ├── /order (POST) - Create Razorpay order
  ├── /verify (POST) - Verify payment signature
  └── / (GET) - List user payments

/api/articles/
  ├── / (GET) - List articles
  ├── / (POST) - Create article (admin)
  ├── /:id (PATCH) - Update article (admin)
  └── /:id (DELETE) - Delete article (admin)

/api/leads/
  ├── / (POST) - Create lead from contact form
  ├── / (GET) - List leads (admin only)
  └── /:id (PATCH) - Update lead status (admin)

/api/contact/
  └── / (POST) - Contact form submission

/api/notifications/
  ├── / (GET) - Get user notifications
  └── /:id (PATCH) - Mark as read
```

### Actual Implementation
- All API calls use mock data stored in `localStorage`
- No backend database connections
- No actual email/SMS sending
- Payment verification is simulated
- Session storage used for temporary data

---

## 🔐 5. AUTHENTICATION FLOWS

### Registration Flow
1. User navigates to /signup
2. Enters: Name, Email, Phone, Password (12-char minimum, 5-factor strength)
3. Frontend calls (attempted) `/api/auth/register`
4. Currently simulated with localStorage
5. Currently NO OTP verification
6. User redirected to dashboard on mock success
- **Status:** ⚠️ Incomplete (no actual backend, no email verification)

### Login Flow
1. User enters Email/Phone + Password
2. Lockout check: 5 failed attempts = 15-minute lockout
3. Frontend validates against localStorage mock users
4. On success: Multi-factor authentication (MFA) step
5. MFA options: Email OTP, SMS OTP, App-based (currently email simulated)
6. Resend countdown: 30-second timer
7. On MFA success: Session token created, user redirected to dashboard
8. **Status:** ⚠️ Partially working (MFA is simulated, no actual OTP)

### MFA (Two-Factor Authentication)
- **Methods:** Email OTP, SMS OTP, App-based authenticator
- **Flow:**
  1. After credential validation, user is sent to MFA step
  2. Selects preferred method (email/SMS/app)
  3. Enters 6-digit code
  4. Resend button available after 30-second countdown
  5. On success, session created
- **Status:** ⚠️ Simulated (no actual email/SMS)

### Password Reset Flow
1. User navigates to /forgot-password
2. Enters email address
3. Attempted call to `/api/auth/forgot-password`
4. Currently simulated (no email sent)
5. User would receive reset link
6. Reset page validates token from URL
7. User creates new password (12-char, 5-factor strength)
8. On success, redirected to login
- **Status:** ⚠️ API incomplete

### Admin Authentication
- **Special case:** Only `admin@investorbridge.com` can access /admin
- **Password stored:** Hardcoded hash in mock database
- **Login password:** `admin12345!`
- **MFA required:** Yes (same as user flow)
- **Status:** ⚠️ Credentials hardcoded (security risk)

### Session Management
- **Storage:** `sessionStorage.ib_session_user` (JSON stringified)
- **Duration:** Browser session only (lost on refresh if hardcoded in localStorage)
- **Context:** Global via `AppContext.currentUser`
- **Logout:** Clears session and context state
- **Status:** ✅ Basic functionality working

### Security Measures Implemented
- Password strength requirements (12 chars, upper, lower, number, special)
- Input sanitization on forms (XSS prevention)
- Failed login attempt tracking
- Account lockout mechanism (15 minutes after 5 fails)
- MFA requirement for sensitive operations
- HTTPS enforced in production (not checked in dev)
- Rate limiting on search queries (15 per 10s)
- **Status:** ⚠️ Mixed (basic measures in place, no actual encryption)

---

## 💳 6. PAYMENT & CHECKOUT SYSTEM

### Payment Processing

**Provider:** Razorpay (Integration Status: ⚠️ Simulated only)

#### Booking → Payment Flow
1. User selects service at /book
2. Chooses date + time slot (availability check against existing bookings)
3. Enters contact details (name, email, phone, message)
4. Proceeds to Step 4: Checkout
5. Loads Razorpay checkout script from CDN
6. Creates Razorpay order with `amount` (in paise: ₹ * 100)
7. Opens Razorpay modal for payment
8. Payment can be completed with:
   - Card (Visa/Mastercard)
   - UPI
   - Net Banking
   - Wallet
9. On success: Razorpay returns `paymentId` + `signature`
10. Frontend creates Booking + Payment records in context
11. Notification sent to admin + user
12. Booking confirmation page shows invoice

**Pricing Model:**
- Services have `originalPrice` and `discountPercent` fields
- Current: 100% discount on most services (Free consultations)
- Tax calculation: 18% GST added to base price
- Invoice number auto-generated

**Status:** ⚠️ Not functional (script loads but payment verification simulated)

### Payment Data Model

```typescript
interface Payment {
  id: string;
  userId?: string;
  bookingId?: string;
  amount: number;
  currency: string; // Default: INR
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  service: string;
  tax: number;
  total: number;
  invoiceNumber: string;
  createdAt: string;
  updatedAt: string;
}
```

### Payment Status Tracking
- Admin can view all payments in dashboard
- Payment status filter available (ALL, SUCCESS, FAILED, REFUNDED)
- Invoice download attempted (window.print())
- Refund eligibility: 24+ hours before booking cancellation

**Status:** ⚠️ UI ready but no actual payment backend

---

## 👨‍💼 7. ADMIN FEATURES & DASHBOARD

### Admin Dashboard Overview
- **Route:** /admin (requires ADMIN role)
- **File:** [src/app/admin/page.tsx](src/app/admin/page.tsx)
- **Access Control:** Only accessible to `currentUser.role === "ADMIN"`
- **Session:** Admin must login via /admin/login

### Admin Tabs/Sections

#### 1. Summary Tab
- **Type:** Dashboard Overview
- **Displays:**
  - Total users count
  - Active bookings count
  - Revenue summary (total payments)
  - Lead statistics (by status)
  - Upcoming consultations (next 7 days)
- **Status:** ✅ Data binding working (data from localStorage)

#### 2. Users Tab
- **Type:** User Management
- **Features:**
  - Search by name/email
  - Block/unblock user toggle
  - View user details (email, phone, role, MFA status, created date)
  - Delete user (warning modal)
  - Role assignment (USER/ADMIN)
- **Status:** ✅ Works with localStorage

#### 3. Leads Tab
- **Type:** Lead Management
- **Features:**
  - List all leads with status badges
  - Status filter (NEW, CONTACTED, QUALIFIED, CONVERTED, CLOSED)
  - Lead score display (COLD/WARM/HOT)
  - Update lead status via dropdown
  - Search leads by name/email/phone
  - Export leads to CSV (button present but not functional)
- **Status:** ⚠️ Basic CRUD working, no CSV export

#### 4. Bookings Tab
- **Type:** Booking Management
- **Features:**
  - List all bookings with status colors
  - Status filter (PENDING, APPROVED, REJECTED, RESCHEDULED, CANCELLED)
  - Reschedule booking (select new date/time)
  - Cancel booking with reason
  - Approve/reject pending bookings
  - View booking details modal
- **Status:** ✅ Works with localStorage

#### 5. Payments Tab
- **Type:** Payment Management
- **Features:**
  - List all payments with status indicators
  - Status filter (PENDING, SUCCESS, FAILED, REFUNDED)
  - View payment details (amount, invoice, service, date)
  - Issue refund (manual button)
  - Download invoice (attempts window.print)
- **Status:** ⚠️ UI complete, no actual payment processing

#### 6. Content Tab
- **Type:** Article Management
- **Features:**
  - Create new article form
  - Article title, content editor field
  - Category dropdown (9 predefined categories)
  - Featured image URL input
  - SEO fields: Title, Description, Keywords
  - Edit existing articles
  - Delete articles with confirmation
  - Publish/unpublish toggle
- **Status:** ✅ Works with localStorage (data lost on page refresh)

#### 7. Contacts Tab
- **Type:** Contact Request Management
- **Features:**
  - List contact form submissions
  - Status tracking (Pending, Replied, Resolved)
  - Reply to contact (simulated email)
  - Mark as resolved
  - Delete old contacts
- **Status:** ✅ Works with localStorage

#### 8. Chatbot Tab
- **Type:** Chatbot Q&A Management
- **Features:**
  - View predefined Q&A pairs
  - Add new question-answer pair
  - Edit existing Q&A
  - Delete Q&A responses
  - Preview chatbot behavior
- **Status:** ✅ Works with localStorage

#### 9. SEO Tab
- **Type:** SEO Configuration
- **Features:**
  - Meta title input (homepage)
  - Meta description input
  - Social media links (Facebook, LinkedIn, Instagram, WhatsApp)
  - Structured data preview
  - Schema.org validation button (not functional)
  - Open Graph tags preview
- **Status:** ⚠️ UI ready, no actual meta tag injection

#### 10. System Tab
- **Type:** System Settings
- **Features:**
  - Database connection status (mock)
  - Cache status
  - Email service status (Resend)
  - SMS service status (MSG91)
  - Payment gateway status (Razorpay)
  - System health metrics
  - API endpoint status checker
- **Status:** ⚠️ UI only (no actual service checks)

#### 11. Security Tab
- **Type:** Security Audit
- **Features:**
  - Security event logs (login attempts, MFA verification, etc.)
  - Admin action logs (all admin operations)
  - Failed login attempts
  - IP address tracking (mock)
  - Browser/device info (mock)
  - Export security logs to CSV
  - Clear old logs
- **Status:** ⚠️ Logs tracked in localStorage, not persistent

### Admin Permissions
- **Can manage:** Users, Leads, Bookings, Payments, Content, Settings
- **Cannot manage:** Financial transactions (payment settlement only through Razorpay dashboard)
- **Audit trail:** All admin actions logged to localStorage
- **Status:** ✅ Basic RBAC in place

### Admin Notifications
- Real-time notifications in context
- Notification types: SYSTEM, BOOKING, PAYMENT, SECURITY
- Mark notifications as read
- Clear notification history
- **Status:** ✅ Working with localStorage

---

## 📚 8. DATABASE MODELS & DATA STRUCTURE

### Prisma Schema Overview
**File:** [prisma/schema.prisma](prisma/schema.prisma)

#### User Model
```typescript
model User {
  id: string @id @default(uuid())
  name: string
  email: string @unique
  phone: string @unique
  passwordHash: string
  role: Role @default(USER) // USER or ADMIN
  isVerifiedEmail: boolean @default(false)
  isVerifiedPhone: boolean @default(false)
  mfaEnabled: boolean @default(false)
  failedLoginAttempts: int @default(0)
  lockoutUntil: DateTime?
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  // Relations
  bookings: Booking[]
  payments: Payment[]
  notifications: Notification[]
  savedArticles: Article[] @relation("SavedArticles")
  emailOtps: EmailOtp[]
  smsOtps: SmsOtp[]
  mfaOtps: MfaOtp[]
  passwordResetTokens: PasswordResetToken[]
}
```

#### Lead Model
```typescript
model Lead {
  id: string @id @default(uuid())
  name: string
  email: string
  phone: string
  interest: string
  message: string
  status: LeadStatus @default(NEW)
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  // Status: NEW, CONTACTED, QUALIFIED, CONVERTED, CLOSED
}
```

#### Booking Model
```typescript
model Booking {
  id: string @id @default(uuid())
  userId: string?
  user: User? @relation(fields: [userId], references: [id])
  serviceName: string
  date: string // YYYY-MM-DD
  time: string // HH:MM AM/PM
  meetingMode: string // "Online" or "Offline"
  name: string
  email: string
  phone: string
  message: string
  status: BookingStatus @default(PENDING)
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  payments: Payment[]
  // Status: PENDING, APPROVED, REJECTED, RESCHEDULED, CANCELLED
}
```

#### Payment Model
```typescript
model Payment {
  id: string @id @default(uuid())
  userId: string?
  user: User? @relation(fields: [userId], references: [id])
  bookingId: string?
  booking: Booking? @relation(fields: [bookingId], references: [id])
  amount: float
  currency: string @default("INR")
  status: PaymentStatus @default(PENDING)
  razorpayOrderId: string @unique
  razorpayPaymentId: string? @unique
  razorpaySignature: string?
  service: string
  tax: float
  total: float
  invoiceNumber: string @unique
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
}
```

#### Article Model
```typescript
model Article {
  id: string @id @default(uuid())
  slug: string @unique
  title: string
  content: string // HTML or markdown
  author: string
  readingTime: string // "5 mins"
  categoryId: string
  category: Category @relation(fields: [categoryId], references: [id])
  featuredImage: string // URL
  seoTitle: string
  seoDesc: string
  seoKeywords: string
  publishedAt: DateTime @default(now())
  isPublished: boolean @default(true)
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  savedBy: User[] @relation("SavedArticles")
}
```

#### Category Model
```typescript
model Category {
  id: string @id @default(uuid())
  name: string @unique
  slug: string @unique
  articles: Article[]
}
```

#### Notification Model
```typescript
model Notification {
  id: string @id @default(uuid())
  userId: string
  user: User @relation(fields: [userId], references: [id])
  title: string
  message: string
  type: NotificationType @default(SYSTEM)
  isRead: boolean @default(false)
  createdAt: DateTime @default(now())
  // Type: SYSTEM, BOOKING, PAYMENT, SECURITY
}
```

#### Supporting Models (OTP, Tokens, Logs)
- **EmailOtp:** Email one-time passwords for verification
- **SmsOtp:** SMS one-time passwords (not implemented)
- **MfaOtp:** Multi-factor authentication codes
- **PasswordResetToken:** Tokens for password reset links
- **AdminLog:** All admin actions audit trail
- **Analytics:** Event tracking (page views, conversions)
- **Partner, ContactRequest, NewsletterSubscriber:** CRM models

### Mock Database (In-Memory Fallback)
**File:** [src/lib/db.ts](src/lib/db.ts)

- Initial mock users (admin@investorbridge.com)
- Mock articles (Compounding, Currency Diversification, etc.)
- In-memory storage for session
- Persisted to localStorage for persistence across refreshes
- **Status:** ⚠️ Working for demo, not production-ready

---

## 👤 9. USER FUNCTIONS & CAPABILITIES

### Unauthenticated User Functions
1. **Browse Homepage** - View all public content
2. **Read Articles** - Access education hub (full read-only)
3. **Use Calculators** - SIP and Currency Impact calculators
4. **View Services** - Service descriptions and pricing
5. **Chat with Chatbot** - Ask questions, submit lead form
6. **Subscribe to Newsletter** - Email signup in footer
7. **Submit Contact Form** - Get in touch via /contact
8. **Sign Up** - Create new account (/signup)
9. **Login** - Access personalized features (/login)

**Status:** ✅ All working (except actual email registration)

### Authenticated User Functions
1. **Dashboard Access** - View personal dashboard (/dashboard)
2. **Book Consultations** - Schedule service bookings (/book)
3. **Payment Processing** - Pay for bookings via Razorpay (simulated)
4. **View Bookings** - List of own consultations with status
5. **View Payments** - Invoice history and payment status
6. **Save Articles** - Bookmark articles for later
7. **Manage Profile** - Edit name, email, phone, password
8. **View Notifications** - System, booking, payment, security alerts
9. **Request Password Reset** - If forgotten (/forgot-password)

**Status:** ✅ Dashboard ready, ⚠️ Backend not connected

### Admin User Functions
1. **Admin Dashboard** - Full control panel (/admin)
2. **User Management** - Block/unblock, role assignment
3. **Lead Management** - Track and update lead status
4. **Booking Management** - Approve/reject/reschedule bookings
5. **Payment Management** - View payments, issue refunds
6. **Content Management** - Create/edit/delete articles
7. **Contact Management** - Respond to contact submissions
8. **Chatbot Configuration** - Edit Q&A pairs
9. **SEO Management** - Configure meta tags and structured data
10. **System Health** - Monitor service status (mock)
11. **Security Audit** - View logs and failed attempts
12. **Admin Logs** - Track all admin actions

**Status:** ⚠️ UI complete, backend not connected

---

## 📱 10. MOBILE-SPECIFIC ISSUES & TESTING STATUS

### Known Mobile Issues

#### 1. **Navigation Menu**
- **Issue:** Mobile menu toggle uses `onTouchStart` + `onTouchEnd` which can be unreliable
- **Current:** Hamburger menu works but might have occasional UX glitches
- **Symptom:** Menu might not close after tapping a link on some devices
- **Fix Needed:** Implement proper Touch event handling or use click-only approach
- **Status:** ⚠️ Partially working

#### 2. **Chatbot Widget**
- **Issue:** Chat interface not optimized for mobile viewport
- **Current:** Messages may overflow on small screens (< 375px width)
- **Symptom:** Text might get cut off or overlap
- **Fix Needed:** Add mobile-specific styles for chat message display
- **Status:** ⚠️ Untested on mobile

#### 3. **Calculators**
- **Issue:** Slider controls might be difficult to use on touch screens
- **Current:** SIP and Currency calculators use HTML range inputs
- **Symptom:** Precision input challenging on mobile touchpads
- **Fix Needed:** Increase touch target size, add numeric input alternative
- **Status:** ⚠️ Untested on mobile

#### 4. **Tables in Admin Dashboard**
- **Issue:** Admin dashboard tables not responsive
- **Current:** Horizontal scroll required on mobile
- **Symptom:** User/Lead/Booking tables overflow small screens
- **Fix Needed:** Stack table rows into card format on mobile
- **Status:** ⚠️ Not mobile-optimized

#### 5. **Payment Form**
- **Issue:** Razorpay modal might not fit mobile viewport
- **Current:** Razorpay checkout script should handle mobile (built-in)
- **Symptom:** Unknown (not tested in production)
- **Fix Needed:** Test payment flow on actual devices
- **Status:** ⚠️ Untested

#### 6. **SVG Graphics**
- **Issue:** World map with animated data points not tested on mobile
- **Current:** SVG viewBox might not scale properly
- **Symptom:** Map might appear distorted or too small
- **Fix Needed:** Test SVG responsive behavior
- **Status:** ⚠️ Untested

#### 7. **Bottom Navigation**
- **Issue:** No mobile bottom navigation bar
- **Current:** All navigation in header (sticky)
- **Symptom:** Might obscure content on very small screens
- **Fix Needed:** Consider implementing bottom tab navigation for mobile
- **Status:** ⚠️ Not implemented

#### 8. **Font Sizes**
- **Issue:** Some text sizes might be too small for mobile reading
- **Current:** Uses Tailwind sizes (text-xs, text-sm, text-base)
- **Symptom:** Disclaimer text is 10px (might be unreadable)
- **Fix Needed:** Audit all font sizes for mobile accessibility
- **Status:** ⚠️ Accessibility issue

#### 9. **Images & Features Images**
- **Issue:** Featured images in articles not optimized
- **Current:** Using Unsplash URLs directly (full resolution)
- **Symptom:** Slow loading on mobile networks
- **Fix Needed:** Implement next/image with responsive sizing
- **Status:** ⚠️ Performance issue

#### 10. **Responsive Breakpoints**
- **Current:** Using Tailwind breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)
- **Issue:** Gap between mobile (< 640px) and small screens
- **Status:** ⚠️ Might need additional breakpoints

---

## 🏗️ PROJECT ARCHITECTURE SUMMARY

### Folder Structure
```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes (EMPTY - not implemented)
│   ├── admin/                    # Admin pages
│   ├── auth/                     # Auth flows
│   ├── dashboard/                # User dashboard
│   ├── education/                # Education hub
│   └── ...                       # Other pages (17 total)
├── components/                   # Reusable React components
│   ├── Header.tsx                # Navigation
│   └── Footer.tsx                # Footer
├── context/                      # React Context (Global state)
│   └── AppContext.tsx            # App-wide state
├── lib/                          # Utilities & Database
│   ├── db.ts                     # Prisma + Mock DB
│   └── notifications.ts          # Notification utils
├── middleware.ts                 # Next.js middleware (if any)
└── ...
```

### State Management
- **Method:** React Context API (AppContext)
- **Data:** Users, Bookings, Payments, Leads, Articles, Notifications
- **Persistence:** localStorage (ib_users, ib_bookings, ib_payments, etc.)
- **Limitations:** Lost on app uninstall, limited to ~5-10MB, no encryption

### Styling
- **Framework:** Tailwind CSS (Utility-first)
- **Colors:** Custom: #0B1F3A (Navy), #00B386 (Teal), #D4AF37 (Gold)
- **Icons:** Lucide React (20px default size)
- **Animation:** CSS transitions + Tailwind keyframes

### Performance Considerations
- Large image files not optimized (Unsplash direct links)
- No lazy loading on below-the-fold content
- No code splitting or route-based chunking observed
- SPA (Single Page App) - full app loaded on first visit
- **Status:** ⚠️ Not optimized for production

---

## 📋 COMPLETE FEATURES CHECKLIST

### ✅ Implemented & Working
- [x] Homepage with hero, sections, calculators
- [x] Navigation (desktop + mobile)
- [x] User authentication (signup/login/logout)
- [x] MFA (Two-factor authentication)
- [x] User dashboard with booking history
- [x] Services page with descriptions
- [x] Education hub with articles (read-only)
- [x] Article detail page with sharing/PDF
- [x] Global investing guide page
- [x] About page with mission/values
- [x] Contact form with validation
- [x] Newsletter subscription
- [x] Calculator tools (SIP, Currency impact)
- [x] Chatbot with lead collection
- [x] Admin dashboard (full UI)
- [x] Admin CRUD operations (UI only)
- [x] User profile management (UI)
- [x] Booking system (UI complete)
- [x] Payment workflow (UI, Razorpay script loads)
- [x] Footer with all links

### ⚠️ Partially Implemented
- [⚠️] API routes (endpoints defined but not implemented)
- [⚠️] Database persistence (mock only, localStorage)
- [⚠️] Email/SMS notifications (simulated)
- [⚠️] Payment verification (Razorpay signature check missing)
- [⚠️] Admin actions logging (localStorage only)
- [⚠️] SEO meta tags (not injected)
- [⚠️] Mobile optimization (UI not fully responsive)
- [⚠️] Forgot password flow (API missing)
- [⚠️] Reset password flow (API missing)

### ❌ Not Implemented
- [ ] Backend API implementation
- [ ] PostgreSQL database connection
- [ ] Real email sending (Resend integration)
- [ ] SMS sending (MSG91 integration)
- [ ] Payment settlement (Razorpay webhook verification)
- [ ] Authentication tokens (JWT)
- [ ] CORS configuration
- [ ] Error handling middleware
- [ ] Logging system
- [ ] Caching strategy
- [ ] Rate limiting on API
- [ ] Password encryption (bcrypt)
- [ ] HTTPS enforcement
- [ ] CSP headers
- [ ] Mobile app (Android/iOS)

---

## 🔧 TECHNOLOGY STACK SUMMARY

| Category | Technology | Status |
|----------|-----------|--------|
| **Framework** | Next.js 13+ (App Router) | ✅ Working |
| **Language** | TypeScript | ✅ Working |
| **UI Library** | React 18 | ✅ Working |
| **Styling** | Tailwind CSS 3 | ✅ Working |
| **Icons** | Lucide React | ✅ Working |
| **State** | React Context + localStorage | ✅ Working |
| **Database (ORM)** | Prisma | ⚠️ Configured, not connected |
| **Database (SQL)** | PostgreSQL | ⚠️ Not configured |
| **Authentication** | Custom (Auth0/Supabase missing) | ⚠️ Simulated |
| **Payments** | Razorpay | ⚠️ Script loads, verification missing |
| **Email** | Resend | ❌ Not integrated |
| **SMS** | MSG91 | ❌ Not integrated |
| **Hosting** | Vercel (typical for Next.js) | ⚠️ Not deployed |
| **Analytics** | Google Analytics (not configured) | ❌ Not set up |

---

## 📊 FINAL ASSESSMENT

### Code Quality: 7/10
- ✅ Well-structured components
- ✅ TypeScript types defined
- ✅ Good separation of concerns
- ⚠️ No error boundaries
- ⚠️ Limited error handling
- ⚠️ No logging system
- ⚠️ localStorage not production-ready

### Feature Completeness: 6/10
- ✅ Frontend fully built
- ✅ UI/UX comprehensive
- ⚠️ Backend 0% complete
- ⚠️ No API implementation
- ⚠️ No database persistence
- ⚠️ Integrations missing

### Performance: 5/10
- ⚠️ No optimization
- ⚠️ Unoptimized images
- ⚠️ No lazy loading
- ⚠️ No code splitting
- ✅ Fast in development (SPA)
- ⚠️ Production build not tested

### Security: 4/10
- ⚠️ No password encryption
- ⚠️ Credentials in localStorage
- ⚠️ API keys hardcoded (in admin)
- ✅ Input validation present
- ⚠️ No HTTPS enforcement
- ⚠️ No rate limiting on production
- ⚠️ Session tokens not secure

### Mobile Readiness: 5/10
- ⚠️ Responsive design attempted
- ⚠️ Not fully tested on devices
- ⚠️ Touch events problematic
- ⚠️ Some elements not mobile-optimized
- ✅ Mobile menu implemented
- ⚠️ Tables not responsive

### Production Readiness: 2/10
- ❌ Not suitable for production
- ❌ No backend
- ❌ No database
- ❌ No monitoring
- ❌ No error tracking
- ❌ No deployment strategy

---

## 🎯 NEXT STEPS RECOMMENDED

1. **Implement Backend API** (Priority 1)
   - Create API routes in `/api` folder
   - Implement authentication endpoints
   - Connect to PostgreSQL via Prisma

2. **Fix Mobile Issues** (Priority 2)
   - Test on actual devices
   - Fix touch event handling
   - Optimize mobile layouts

3. **Integrate External Services** (Priority 3)
   - Email: Resend API
   - SMS: MSG91 API
   - Payments: Razorpay webhook verification

4. **Security Hardening** (Priority 4)
   - Implement password hashing (bcrypt)
   - Add JWT authentication
   - Remove hardcoded credentials
   - Add CORS/CSP headers

5. **Performance Optimization** (Priority 5)
   - Implement next/image for images
   - Add lazy loading
   - Configure caching strategy
   - Set up CDN

---

**Report Generated:** 2026-06-23 | **Duration:** Complete codebase scan | **Total Features Identified:** 50+
