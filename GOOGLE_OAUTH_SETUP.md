# Google OAuth 2.0 Setup Guide

## InvestorBridge Solutions - Complete Configuration

This guide explains how to set up Google OAuth 2.0 for InvestorBridge, including both **Demo Mode** (testing) and **Production Mode** (live).

---

## 🎯 Quick Overview

| Feature | Demo Mode | Production Mode |
|---------|-----------|-----------------|
| **Google Requirements** | None needed | Google Cloud Project required |
| **Credentials** | Built-in test accounts | Real OAuth credentials |
| **Users** | 3 demo accounts | Real users |
| **Deployment** | Immediate | After OAuth app approval |

---

## Part 1: DEMO MODE SETUP (Testing)

### ✅ Demo Mode is Already Active

When `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are **NOT set in `.env`**, the system automatically uses Demo Mode.

### Demo Test Accounts

Three pre-configured test accounts are available:

```
Account 1: demo1@gmail.com (Demo Account One)
Account 2: demo2@gmail.com (Demo Account Two)  
Account 3: demo3@gmail.com (Demo Account Three)
```

### Testing Demo Mode

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to login or signup:**
   - Visit `http://localhost:3000/login`
   - Click "Continue with Google"

3. **Demo OAuth Screen appears:**
   - Select any test account
   - You're automatically logged in

4. **Database behavior:**
   - First login: New user created automatically
   - Subsequent logins: Existing user session created
   - Email verified: `true` (auto from Google)
   - Phone verified: `false` (awaits SMS OTP)

### Demo Features Working ✅

- ✅ User creation on first login
- ✅ Session management
- ✅ Account linking (Email + Google)
- ✅ Token generation (Access + Refresh)
- ✅ Rate limiting (5 attempts/min per IP)
- ✅ Audit logging
- ✅ Admin analytics dashboard

---

## Part 2: PRODUCTION MODE SETUP

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown (top-left)
3. Click **"NEW PROJECT"**
4. Enter project name: `InvestorBridge`
5. Click **"CREATE"**

Wait 1-2 minutes for project creation.

### Step 2: Enable OAuth 2.0 API

1. In the sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"** or **"OAuth 2.0"**
3. Click **"Google+ API"**
4. Click **"ENABLE"**

Wait for the API to be enabled (30-60 seconds).

### Step 3: Create OAuth Consent Screen

1. Go to **"APIs & Services"** → **"OAuth consent screen"**
2. Select **"External"** (for users outside your organization)
3. Click **"CREATE"**

Fill in the form:

**App Information:**
- **App name:** `InvestorBridge`
- **User support email:** `support@investorbridge.in`
- **Developer contact:** `dev@investorbridge.in`

**Scopes:**
- Click "Add or Remove Scopes"
- Search and add:
  - `openid`
  - `email`
  - `profile`
- Click "Save and Continue"

**Test Users (Optional for Demo):**
- Add emails of team members who will test

Click **"Save and Continue"** → **"Back to Dashboard"**

### Step 4: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** (top)
3. Select **"OAuth client ID"**
4. If prompted, click **"Configure OAuth consent screen"** again

**Application type:**
- Select **"Web application"**

**Name:**
- Enter: `InvestorBridge Web Client`

**Authorized redirect URIs:**
- Add your callback URL:
  ```
  http://localhost:3000/api/auth/google/callback    [Development]
  https://investorbridge.in/api/auth/google/callback  [Production]
  https://www.investorbridge.in/api/auth/google/callback [Production]
  ```

Click **"CREATE"**

A popup with credentials appears:

- **Client ID:** (copy this)
- **Client Secret:** (copy this)

Save these securely!

### Step 5: Set Environment Variables

Create or update `.env.local` in the project root:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/investorbridge"

# JWT
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"

# Google OAuth Production
GOOGLE_CLIENT_ID="YOUR_CLIENT_ID.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_client_secret_here"

# App URL
APP_URL="https://investorbridge.in"

# Node Environment
NODE_ENV="production"

# Other APIs
RESEND_API_KEY="re_xxxxx"
MSG91_API_KEY="xxxxx"
RAZORPAY_KEY_ID="rzp_live_xxxxx"
RAZORPAY_KEY_SECRET="xxxxx"
NEXTAUTH_SECRET="xxxxx"
```

### Step 6: Deploy to Production

1. **Push changes to GitHub:**
   ```bash
   git add .
   git commit -m "feat: Enable Google OAuth production credentials"
   git push origin main
   ```

2. **Deploy to hosting (Vercel, Railway, etc.):**
   - Add environment variables in hosting dashboard
   - Deploy main branch

3. **System Automatically Switches:**
   - Production mode activates when `GOOGLE_CLIENT_ID` is detected
   - No code changes needed!

---

## Part 3: VERIFICATION & TESTING

### Testing Production Mode

1. **Login Page:**
   - Visit `https://investorbridge.in/login`
   - Click "Continue with Google"
   - Redirected to Google Consent Screen (official Google UI)
   - Select your Google account
   - Redirected back to dashboard

2. **First Login:**
   - User created automatically
   - Email verified: `true`
   - Session created with tokens

3. **Admin Dashboard:**
   - Go to `/admin`
   - Check **"Google OAuth Analytics"** tab
   - Verify login metrics displayed

### Testing Refresh Token

```bash
# Terminal test
curl -X POST http://localhost:3000/api/auth/token/refresh \
  -H "Cookie: refresh-token=YOUR_REFRESH_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "accessToken": "new_jwt_token",
  "message": "Token refreshed successfully"
}
```

---

## Part 4: USER FLOWS

### First-Time Google User

1. Clicks "Continue with Google"
2. Authenticates with Google
3. InvestorBridge creates account automatically
4. Redirected to dashboard
5. Email verified: ✅
6. Can link email password later

### Existing Email User → Google Login

1. Email user clicks "Continue with Google"
2. Uses same email as existing account
3. System links Google account to existing user
4. Single account, two login methods ✅

### Session Management

- **Access Token:** 15 minutes validity
- **Refresh Token:** 30 days validity
- **Token Rotation:** Each refresh generates new tokens
- **Old tokens:** Invalidated immediately

---

## Part 5: ANALYTICS & MONITORING

### Admin Dashboard Metrics

Visit `/admin` → **"Google OAuth Analytics"** tab to see:

- **Google Users Count**
- **Email Users Count**
- **Conversion Rate** (% using Google)
- **Monthly Login Graph**
- **Recent Google Logins**

### Security Logs

Visit `/admin` → **"Security & Action Logs"** tab to track:

- All login attempts
- IP addresses
- Browser/Device info
- Timestamp of each login

### Active Sessions

Visit `/admin` → **"Active Sessions"** tab to see:

- Current active sessions
- Device type (Desktop, Mobile)
- Browser name
- IP address
- Last activity time

---

## Part 6: TROUBLESHOOTING

### "Error: Invalid Client ID"

**Solution:** 
- Verify `GOOGLE_CLIENT_ID` is correct
- Check it ends with `.apps.googleusercontent.com`
- Remove extra spaces in `.env`

### "Redirect URI mismatch"

**Solution:**
- Add exact URI in Google Cloud Console
- For localhost: `http://localhost:3000/api/auth/google/callback`
- For production: `https://yourdomain.com/api/auth/google/callback`

### "Email not verified"

**Solution:**
- This is normal for test accounts
- Production Google accounts return `emailVerified: true`
- SMS verification still required for phone number

### Session not created

**Solution:**
- Check database connection (`DATABASE_URL`)
- Verify Prisma migrations: `npx prisma migrate dev`
- Check Prisma models have Account/Session tables

### Refresh token fails

**Solution:**
- Token must be in HttpOnly cookie
- Check `refresh-token` cookie is sent
- Token must not be expired (30 days max)

---

## Part 7: SECURITY CHECKLIST

Before going live, verify:

- ✅ `HTTPS` enabled on production domain
- ✅ Google OAuth credentials stored in `.env` (never in code)
- ✅ Cookies are `HttpOnly` and `Secure`
- ✅ CSRF token implemented
- ✅ Rate limiting on OAuth endpoint (5 req/min)
- ✅ Audit logging enabled
- ✅ Refresh token rotation enabled
- ✅ XSS protection enabled
- ✅ SQL injection protection (Prisma ORM)

---

## Part 8: GOOGLE OAUTH APP VERIFICATION

### For Large-Scale Deployment

If you plan to use Google OAuth widely:

1. Submit app for verification at [Google API Console](https://console.cloud.google.com/)
2. Google reviews the app (usually 2-4 weeks)
3. Once approved, move from "External" to "Public" status
4. Users no longer see "Unverified app" warning

---

## 📞 Support

For issues or questions:

- Check the [troubleshooting section](#part-6-troubleshooting)
- Review [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- Contact: `dev@investorbridge.in`

---

## 🎓 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      User Browser                           │
│  Clicks "Continue with Google"                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ├─ PRODUCTION MODE ──────────────────┐
                       │                                    │
                       ▼                                    ▼
        ┌──────────────────────┐          ┌────────────────────────┐
        │   Demo Mode Active   │          │ Google OAuth Screen    │
        │  (No Credentials)    │          │ (Official Google UI)   │
        │                      │          │                        │
        │ - 3 test accounts    │          │ - Google auth          │
        │ - Auto session       │          │ - Real user account    │
        │ - Inline demo page   │          │ - Returns ID token     │
        └──────────────┬───────┘          └─────────────┬──────────┘
                       │                               │
                       └───────────────┬───────────────┘
                                       │
                                       ▼
                       ┌────────────────────────────────┐
                       │  Backend OAuth Handler         │
                       │  /api/auth/google/callback     │
                       │                                │
                       │ - Verify token                 │
                       │ - Find/create user             │
                       │ - Create session               │
                       │ - Generate tokens              │
                       └───────────┬────────────────────┘
                                   │
                                   ▼
                       ┌────────────────────────────────┐
                       │     Database                   │
                       │                                │
                       │ - User record created          │
                       │ - Account linked               │
                       │ - Session stored               │
                       │ - Audit log recorded           │
                       └───────────┬────────────────────┘
                                   │
                                   ▼
                       ┌────────────────────────────────┐
                       │     Dashboard Access           │
                       │  User fully authenticated      │
                       │  with Google OAuth             │
                       └────────────────────────────────┘
```

---

**Version:** 1.0  
**Last Updated:** June 2026  
**Framework:** Next.js 16 + Prisma + PostgreSQL
