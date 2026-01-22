# Hanumat-Fest Sports Registration System - Frontend Pages Specification

## Table of Contents

1. [Overview](#overview)
2. [User Roles & Access](#user-roles--access)
3. [Public Pages](#public-pages)
4. [Authentication Pages](#authentication-pages)
5. [Participant Pages](#participant-pages)
6. [Admin Pages](#admin-pages)
7. [Shared Components](#shared-components)
8. [Page Workflows](#page-workflows)
9. [API Integration Guide](#api-integration-guide)

---

## Overview

### Tech Stack Recommendation
- **Framework:** Next.js 14+ (App Router) or React + Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand or React Query
- **Forms:** React Hook Form + Zod
- **UI Components:** shadcn/ui or Radix UI
- **Payments:** Razorpay Checkout.js
- **Realtime:** Supabase Realtime Client

### Environment Variables (Frontend)
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
NEXT_PUBLIC_API_URL=http://localhost:54321/functions/v1
```

---

## User Roles & Access

| Role | Access Level | Description |
|------|-------------|-------------|
| **Guest** | Public pages only | Can view sports, read event info |
| **Participant** | User dashboard | Can register, pay, manage registrations |
| **Coordinator** | Limited admin | Can view registrations, verify offline payments |
| **Admin** | Full access | All features including settings, analytics |

---

## Public Pages

### 1. Home Page (`/`)

**Purpose:** Landing page with event overview and featured sports

**Sections:**
- Hero banner with event name, dates, and CTA buttons
- Featured/upcoming sports carousel
- Event statistics (total registrations, sports count, colleges)
- Quick links to registration
- Event schedule preview
- Sponsors/partners section
- Footer with contact info

**API Calls:**
```typescript
// Get public stats (no auth required)
GET /analytics/public-stats

// Get featured sports
GET /sports?is_open=true&limit=6
```

**Components:**
- `HeroBanner` - Event branding and CTAs
- `SportCard` - Sport preview with fees, dates
- `StatsCounter` - Animated statistics
- `CountdownTimer` - Days until event

---

### 2. Sports Listing Page (`/sports`)

**Purpose:** Browse all available sports with filtering

**Features:**
- Category filter tabs (All, Indoor, Outdoor, Esports, Athletics)
- Search by sport name
- Sort options (Deadline, Name, Fees)
- Registration status badges (Open, Closed, Full, Waitlist)
- Pagination

**API Calls:**
```typescript
GET /sports?category={category}&is_open={boolean}&search={query}&sort={field}&page={n}&limit=12
```

**UI Elements:**
| Element | Description |
|---------|-------------|
| Category Tabs | indoor, outdoor, esports, athletics, all |
| Search Input | Debounced search (300ms) |
| Sort Dropdown | registration_deadline, name, fees |
| Sport Cards Grid | 3-4 columns responsive |
| Pagination | Page numbers or infinite scroll |

**Sport Card Display:**
```
┌─────────────────────────────────┐
│  [Sport Image]                  │
│  ─────────────────────────────  │
│  Cricket                        │
│  Category: Outdoor | Team: 11   │
│  ─────────────────────────────  │
│  ₹500  │  Deadline: 15 Jan     │
│  [Register Now] or [Closed]     │
└─────────────────────────────────┘
```

---

### 3. Sport Details Page (`/sports/[slug]`)

**Purpose:** Detailed view of a single sport with registration option

**Sections:**
1. **Header**
   - Sport name, category badge
   - Hero image
   - Registration status indicator

2. **Quick Info Cards**
   - Fee (show early bird if applicable)
   - Team size (if team event)
   - Current spots / Max capacity
   - Registration deadline countdown

3. **Description Tab**
   - Full description
   - Rules and regulations

4. **Schedule Tab**
   - Event date/time
   - Venue with map link

5. **Registration Section**
   - Eligibility check result
   - Register button or status message
   - Waitlist indicator

**API Calls:**
```typescript
// Get sport details (by slug or ID)
GET /sports/{slug}

// Response includes:
// - sport details
// - applicable_fees (considers early bird)
// - can_register (boolean)
// - register_reason (string)
// - waitlist_available (boolean)
// - spots_remaining (number)

// Check eligibility (if logged in)
GET /registrations/check/{sport_id}
```

**Conditional UI States:**

| State | UI Display |
|-------|------------|
| Not logged in | "Login to Register" button |
| Registration closed | "Registration Closed" disabled button |
| Already registered | "Already Registered" with link to registration |
| Spots available | "Register Now - ₹{fee}" button |
| Waitlist available | "Join Waitlist" button with position info |
| Full (no waitlist) | "Sport is Full" disabled button |

---

### 4. Contact Page (`/contact`)

**Purpose:** Contact information and support form

**Content:**
- Event organizer contact details (from settings)
- Support email and phone
- Contact form (optional - can use mailto)
- Social media links
- FAQ accordion

**API Calls:**
```typescript
// Get contact settings
GET /admin/settings
// Extract: contact_email, contact_phone, event_name
```

---

### 5. About/Rules Page (`/about`)

**Purpose:** General event information and rules

**Content:**
- About the event
- General rules and regulations
- Code of conduct
- Refund policy
- Privacy policy link

---

## Authentication Pages

### 6. Login Page (`/login`)

**Purpose:** User authentication

**Form Fields:**
| Field | Type | Validation |
|-------|------|------------|
| Email | email | Required, valid email format |
| Password | password | Required, min 8 chars |

**Features:**
- "Remember me" checkbox
- "Forgot password" link
- "Create account" link
- Social login buttons (if enabled)
- Error message display

**API Integration:**
```typescript
// Using Supabase Auth directly
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});
```

**Redirect Logic:**
- If `redirectTo` query param exists, redirect there
- If admin/coordinator, redirect to `/admin`
- Otherwise, redirect to `/dashboard`

---

### 7. Signup Page (`/signup`)

**Purpose:** New user registration

**Form Fields:**
| Field | Type | Validation | Error Messages |
|-------|------|------------|----------------|
| Name | text | Required, 2-100 chars | "Name must be between 2 and 100 characters" |
| Email | email | Required, valid format | "Invalid email format" |
| Phone | tel | Required, 10 digits, starts with 6-9 | "Enter valid 10-digit Indian mobile number" |
| College | text/select | Required, 2-200 chars | "College name is required" |
| Password | password | Required, min 8 chars | "Password must be at least 8 characters" |
| Confirm Password | password | Must match password | "Passwords do not match" |

**API Call:**
```typescript
POST /auth/signup
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "phone": "9876543210",
  "college": "IIT Delhi"
}
```

**Features:**
- College autocomplete from colleges list
- Password strength indicator
- Terms & conditions checkbox
- Success: Show verification message, redirect to login
- Error: Display specific error message

---

### 8. Forgot Password Page (`/forgot-password`)

**Purpose:** Password reset request

**Form:**
- Email input
- Submit button
- Back to login link

**API:**
```typescript
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`
});
```

---

### 9. Reset Password Page (`/reset-password`)

**Purpose:** Set new password after email verification

**Form:**
- New password
- Confirm password
- Submit button

**API:**
```typescript
await supabase.auth.updateUser({
  password: newPassword
});
```

---

## Participant Pages

### 10. Dashboard (`/dashboard`)

**Purpose:** User's main hub after login

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Welcome, {name}!                      [Notifications]│
├─────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ Active   │ │ Pending  │ │ Total    │            │
│  │ Regs: 3  │ │ Payment:1│ │ Paid:₹2k │            │
│  └──────────┘ └──────────┘ └──────────┘            │
├─────────────────────────────────────────────────────┤
│  Quick Actions                                       │
│  [Browse Sports] [My Registrations] [Payment History]│
├─────────────────────────────────────────────────────┤
│  Recent Registrations                                │
│  ┌─────────────────────────────────────────────┐    │
│  │ Cricket - REG-CRI-0001 - Confirmed          │    │
│  │ Football - REG-FOO-0002 - Payment Pending   │    │
│  └─────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────┤
│  Upcoming Events                                     │
│  • Cricket - 15 Mar 2024 - Main Ground              │
└─────────────────────────────────────────────────────┘
```

**API Calls:**
```typescript
// Get profile with summary
GET /auth/profile
// Returns: profile, registrations_count, unread_notifications

// Get recent registrations
GET /registrations/me?limit=5

// Get unread notification count
GET /notifications/unread-count
```

**Components:**
- `StatCard` - Quick statistics display
- `RegistrationCard` - Registration summary
- `UpcomingEventCard` - Next events
- `NotificationBell` - With unread count badge

---

### 11. My Registrations Page (`/dashboard/registrations`)

**Purpose:** View and manage all registrations

**Features:**
- Status filter tabs (All, Confirmed, Pending, Waitlist, Cancelled)
- List of registrations with details
- Action buttons per registration

**API Calls:**
```typescript
GET /registrations/me?status={status}&include_past=true
```

**Registration Card Details:**
```
┌─────────────────────────────────────────────────────┐
│  [Sport Image]                                       │
│                                                      │
│  Cricket Tournament                                  │
│  Registration #: REG-CRI-0001                       │
│  Status: ● Confirmed                                 │
│  ─────────────────────────────────────────────────  │
│  Team: Team Alpha (11 members)                      │
│  Amount Paid: ₹500                                  │
│  Registered: 10 Jan 2024                            │
│  ─────────────────────────────────────────────────  │
│  [View Details] [Download Receipt] [Cancel]          │
└─────────────────────────────────────────────────────┘
```

**Status Badges:**
| Status | Color | Icon |
|--------|-------|------|
| pending | gray | clock |
| payment_pending | yellow | credit-card |
| confirmed | green | check-circle |
| waitlist | blue | hourglass |
| cancelled | red | x-circle |
| withdrawn | gray | minus-circle |

---

### 12. Registration Details Page (`/dashboard/registrations/[id]`)

**Purpose:** Detailed view of a single registration

**Sections:**

1. **Header**
   - Sport name and image
   - Registration number
   - Current status badge
   - QR code (for check-in)

2. **Registration Info**
   - Registered date
   - Participant name
   - College

3. **Team Section** (if team event)
   - Team name
   - Team members list with roles
   - Edit team button (if status allows)

4. **Payment Info**
   - Amount paid
   - Payment date
   - Receipt number
   - Download receipt button

5. **Event Info**
   - Event date/time
   - Venue

6. **Actions**
   - Cancel registration (with confirmation)
   - Edit team (if pending)
   - Pay now (if payment pending)

**API Calls:**
```typescript
GET /registrations/{id}
// Returns: registration with sport, team_members, payments
```

---

### 13. Registration Form Page (`/sports/[slug]/register`)

**Purpose:** Multi-step registration form

**Step 1: Confirm Details**
```
┌─────────────────────────────────────────────────────┐
│  Register for Cricket                                │
│  ─────────────────────────────────────────────────  │
│  Your Details (from profile)                        │
│  Name: John Doe                                     │
│  Email: john@example.com                            │
│  Phone: 9876543210                                  │
│  College: IIT Delhi                                 │
│  ─────────────────────────────────────────────────  │
│  [Edit Profile]              [Continue]              │
└─────────────────────────────────────────────────────┘
```

**Step 2: Team Details** (if team event)
```
┌─────────────────────────────────────────────────────┐
│  Team Information                                    │
│  ─────────────────────────────────────────────────  │
│  Team Name: [_______________]                       │
│                                                      │
│  Team Members (Min: 11, Max: 15)                    │
│  ┌─────────────────────────────────────────────┐    │
│  │ 1. [Name] [Email] [Phone] [Captain ○]  [x]  │    │
│  │ 2. [Name] [Email] [Phone] [Captain ○]  [x]  │    │
│  │ ...                                          │    │
│  └─────────────────────────────────────────────┘    │
│  [+ Add Member]                                      │
│  ─────────────────────────────────────────────────  │
│  [Back]                          [Continue]          │
└─────────────────────────────────────────────────────┘
```

**Step 3: Review & Confirm**
```
┌─────────────────────────────────────────────────────┐
│  Review Registration                                 │
│  ─────────────────────────────────────────────────  │
│  Sport: Cricket                                      │
│  Registration Fee: ₹500 (Early Bird: ₹450)          │
│  Team: Team Alpha (12 members)                      │
│  ─────────────────────────────────────────────────  │
│  □ I agree to the terms and conditions              │
│  □ I agree to the refund policy                     │
│  ─────────────────────────────────────────────────  │
│  [Back]                     [Confirm & Pay ₹450]    │
└─────────────────────────────────────────────────────┘
```

**API Calls:**
```typescript
// Check eligibility first
GET /registrations/check/{sport_id}

// Create registration
POST /registrations
{
  "sport_id": "uuid",
  "is_team": true,
  "team_name": "Team Alpha",
  "team_members": [
    { "name": "John", "email": "john@ex.com", "phone": "98765", "is_captain": true },
    { "name": "Jane", "email": "jane@ex.com", "phone": "98766", "is_captain": false }
  ]
}

// If successful, redirect to payment
```

**Validation Rules:**
| Field | Rule |
|-------|------|
| Team Name | Required for team events, 3-100 chars |
| Member Name | Required, 2-100 chars |
| Member Email | Optional, valid email format |
| Member Phone | Optional, 10 digits |
| Captain | Exactly one captain required |
| Team Size | Between min and max for sport |

---

### 14. Payment Page (`/dashboard/registrations/[id]/pay`)

**Purpose:** Complete payment for a registration

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Complete Payment                                    │
│  ─────────────────────────────────────────────────  │
│  Order Summary                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │ Sport: Cricket                               │    │
│  │ Registration: REG-CRI-0001                   │    │
│  │ ─────────────────────────────────────────── │    │
│  │ Registration Fee:              ₹500.00       │    │
│  │ Early Bird Discount:          -₹50.00       │    │
│  │ ─────────────────────────────────────────── │    │
│  │ Total:                         ₹450.00       │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  [Pay ₹450 with Razorpay]                           │
│                                                      │
│  Secure payment powered by Razorpay                 │
└─────────────────────────────────────────────────────┘
```

**Razorpay Integration:**
```typescript
// 1. Create order
POST /payments/create-order
{ "registration_id": "uuid" }

// Response:
{
  "order_id": "order_xxx",
  "amount": 45000,  // in paise
  "currency": "INR",
  "key_id": "rzp_xxx",
  "prefill": { "name": "John", "email": "john@ex.com", "contact": "9876543210" }
}

// 2. Open Razorpay checkout
const options = {
  key: response.key_id,
  amount: response.amount,
  currency: response.currency,
  order_id: response.order_id,
  name: "Sports Fest 2024",
  description: "Registration for Cricket",
  prefill: response.prefill,
  handler: async (paymentResponse) => {
    // 3. Verify payment
    await verifyPayment(paymentResponse);
  }
};
const rzp = new Razorpay(options);
rzp.open();

// 3. Verify payment
POST /payments/verify
{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "sig_xxx"
}
```

**Success Page:**
```
┌─────────────────────────────────────────────────────┐
│           ✓ Payment Successful!                     │
│  ─────────────────────────────────────────────────  │
│  Your registration is confirmed.                    │
│                                                      │
│  Registration #: REG-CRI-0001                       │
│  Receipt #: RCP-24-000001                           │
│  Amount Paid: ₹450                                  │
│                                                      │
│  [Download Receipt] [View Registration]              │
│                                                      │
│  A confirmation email has been sent to your email.  │
└─────────────────────────────────────────────────────┘
```

---

### 15. Edit Team Page (`/dashboard/registrations/[id]/edit-team`)

**Purpose:** Modify team members for a pending registration

**Features:**
- Same form as registration step 2
- Pre-filled with existing team data
- Save changes button

**API Calls:**
```typescript
PATCH /registrations/{id}/team
{
  "team_name": "New Team Name",
  "team_members": [...]
}
```

**Access Control:**
- Only available when status is `pending` or `payment_pending`
- Show error if registration is already confirmed

---

### 16. Profile Page (`/dashboard/profile`)

**Purpose:** View and edit user profile

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  My Profile                                          │
│  ─────────────────────────────────────────────────  │
│  ┌────────┐                                         │
│  │ Avatar │  John Doe                               │
│  │        │  john@example.com                       │
│  └────────┘  Member since Jan 2024                  │
│  ─────────────────────────────────────────────────  │
│  Personal Information                                │
│  ┌─────────────────────────────────────────────┐    │
│  │ Name:    [John Doe_____________]             │    │
│  │ Phone:   [9876543210___________]             │    │
│  │ College: [IIT Delhi____________]             │    │
│  │ Avatar:  [Choose File] or [URL input]        │    │
│  └─────────────────────────────────────────────┘    │
│  [Save Changes]                                      │
│  ─────────────────────────────────────────────────  │
│  Account Actions                                     │
│  [Change Password] [Delete Account]                  │
└─────────────────────────────────────────────────────┘
```

**API Calls:**
```typescript
// Get profile
GET /auth/profile

// Update profile
PATCH /auth/profile
{
  "name": "John Smith",
  "phone": "9876543211",
  "college": "IIT Bombay",
  "avatar_url": "https://..."
}
```

---

### 17. Notifications Page (`/dashboard/notifications`)

**Purpose:** View all notifications

**Features:**
- Unread/All toggle
- Mark as read (individual or all)
- Click to navigate to related item
- Infinite scroll pagination

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Notifications                    [Mark All as Read]│
│  ─────────────────────────────────────────────────  │
│  [All] [Unread (3)]                                 │
│  ─────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────┐    │
│  │ ● Payment Successful!                 2h ago│    │
│  │   Your payment of ₹500 for Cricket...       │    │
│  ├─────────────────────────────────────────────┤    │
│  │ ● Registration Created              1d ago │    │
│  │   Registration created for Football...      │    │
│  ├─────────────────────────────────────────────┤    │
│  │ ○ Event Reminder                    2d ago │    │
│  │   Cricket starts tomorrow at 10 AM...       │    │
│  └─────────────────────────────────────────────┘    │
│  [Load More]                                         │
└─────────────────────────────────────────────────────┘
```

**API Calls:**
```typescript
// Get notifications
GET /notifications?unread_only={boolean}&limit=20&cursor={timestamp}

// Mark as read
POST /notifications/mark-read
{ "notification_ids": ["uuid1", "uuid2"] }

// Mark all as read
POST /notifications/mark-read
{ }  // Empty = mark all
```

**Notification Types & Icons:**
| Type | Icon | Color |
|------|------|-------|
| registration | clipboard-list | blue |
| payment | credit-card | green |
| announcement | megaphone | purple |
| reminder | bell | orange |
| waitlist | clock | yellow |
| cancellation | x-circle | red |

---

### 18. Payment History Page (`/dashboard/payments`)

**Purpose:** View all payment transactions

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Payment History                                     │
│  ─────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────┐    │
│  │ ₹500.00 │ Cricket        │ Success  │ 10 Jan│    │
│  │         │ RCP-24-000001  │ [Receipt]│       │    │
│  ├─────────────────────────────────────────────┤    │
│  │ ₹300.00 │ Football       │ Success  │ 08 Jan│    │
│  │         │ RCP-24-000002  │ [Receipt]│       │    │
│  ├─────────────────────────────────────────────┤    │
│  │ ₹150.00 │ Badminton      │ Refunded │ 05 Jan│    │
│  │         │ Refund: ₹150   │          │       │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

**API Calls:**
```typescript
GET /payments/me
```

---

## Admin Pages

### 19. Admin Dashboard (`/admin`)

**Purpose:** Admin overview and quick actions

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Admin Dashboard                                     │
├─────────────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │Total   │ │Confirmed│ │Pending │ │Waitlist│       │
│  │Regs    │ │        │ │Payment │ │        │       │
│  │  150   │ │  120   │ │   20   │ │   10   │       │
│  └────────┘ └────────┘ └────────┘ └────────┘       │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │Total   │ │Today's │ │Active  │ │Colleges│       │
│  │Revenue │ │Revenue │ │Sports  │ │        │       │
│  │₹50,000 │ │₹5,000  │ │   10   │ │   15   │       │
│  └────────┘ └────────┘ └────────┘ └────────┘       │
├─────────────────────────────────────────────────────┤
│  Quick Actions                                       │
│  [Manage Sports] [View Registrations] [Analytics]   │
├─────────────────────────────────────────────────────┤
│  Recent Registrations            Recent Payments    │
│  ┌─────────────────────┐  ┌─────────────────────┐  │
│  │ John - Cricket      │  │ ₹500 - John - 2h   │  │
│  │ Jane - Football     │  │ ₹300 - Jane - 3h   │  │
│  └─────────────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**API Calls:**
```typescript
GET /analytics/dashboard
```

---

### 20. Sports Management (`/admin/sports`)

**Purpose:** CRUD operations for sports

**Features:**
- List all sports (including archived)
- Create new sport
- Edit sport
- Toggle registration
- Duplicate sport
- Archive sport

**List View:**
```
┌─────────────────────────────────────────────────────┐
│  Sports Management                    [+ Add Sport] │
│  ─────────────────────────────────────────────────  │
│  [All] [Indoor] [Outdoor] [Esports] [Athletics]     │
│  [Search...] [Show Archived □]                      │
│  ─────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────┐    │
│  │ Cricket      │ Outdoor │ 10/16 │ ● Open    │    │
│  │ ₹500        │         │       │ [Actions ▼]│    │
│  ├─────────────────────────────────────────────┤    │
│  │ Football    │ Outdoor │ 18/20 │ ● Open     │    │
│  │ ₹300        │         │       │ [Actions ▼]│    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

**Actions Dropdown:**
- Edit
- Toggle Registration (Open/Close)
- Duplicate
- View Registrations
- Archive

**API Calls:**
```typescript
// List sports (admin sees all including archived)
GET /sports?page=1&limit=20

// Create sport
POST /sports
{ ...sportData }

// Update sport
PATCH /sports/{id}
{ ...updates }

// Toggle registration
POST /sports/{id}/toggle-registration

// Duplicate
POST /sports/{id}/duplicate

// Archive
POST /sports/{id}/archive
```

---

### 21. Sport Form Page (`/admin/sports/new` & `/admin/sports/[id]/edit`)

**Purpose:** Create or edit a sport

**Form Sections:**

**1. Basic Information**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Name | text | Yes | Auto-generates slug |
| Category | select | Yes | indoor/outdoor/esports/athletics |
| Description | textarea | No | Rich text or markdown |
| Rules | textarea | No | |
| Image | file/url | No | Upload or URL |
| Venue | text | No | |

**2. Team Configuration**
| Field | Type | Default |
|-------|------|---------|
| Is Team Event | toggle | false |
| Min Team Size | number | 1 |
| Max Team Size | number | 1 |

**3. Pricing**
| Field | Type | Notes |
|-------|------|-------|
| Registration Fee | number | Required |
| Early Bird Fee | number | Optional, must be < regular fee |
| Early Bird Deadline | datetime | Required if early bird fee set |

**4. Schedule**
| Field | Type | Notes |
|-------|------|-------|
| Registration Start | datetime | Required |
| Registration Deadline | datetime | Must be after start |
| Event Start | datetime | Optional |
| Event End | datetime | Must be after event start |

**5. Capacity**
| Field | Type | Default |
|-------|------|---------|
| Max Participants | number | null (unlimited) |
| Enable Waitlist | toggle | true |
| Max Waitlist | number | 10 |

---

### 22. Registrations Management (`/admin/registrations`)

**Purpose:** View and manage all registrations

**Features:**
- Advanced filtering
- Bulk actions
- Export to CSV
- Verify offline payments

**Filters:**
| Filter | Type | Options |
|--------|------|---------|
| Sport | select | All sports list |
| Status | select | All, pending, payment_pending, confirmed, waitlist, cancelled |
| Payment Status | select | All, pending, completed, failed, refunded |
| College | text/select | Search or dropdown |
| Date Range | date picker | From - To |
| Search | text | Name, email, registration number |

**Table Columns:**
| Column | Sortable |
|--------|----------|
| Reg # | Yes |
| Participant | Yes |
| Sport | Yes |
| College | No |
| Status | No |
| Payment | No |
| Date | Yes |
| Actions | No |

**Bulk Actions:**
- Confirm selected
- Cancel selected
- Export selected

**API Calls:**
```typescript
// Get registrations
GET /admin/registrations?sport_id={}&status={}&payment_status={}&college={}&search={}&date_from={}&date_to={}&page=1&limit=20

// Update single
PATCH /admin/registrations/{id}
{ "status": "confirmed" }

// Bulk update
POST /admin/registrations/bulk-update
{
  "registration_ids": ["uuid1", "uuid2"],
  "status": "confirmed",
  "reason": "Manual verification"
}

// Export
GET /admin/registrations/export?sport_id={}&status={}&format=csv
```

---

### 23. Registration Detail (Admin) (`/admin/registrations/[id]`)

**Purpose:** Detailed view with admin actions

**Additional Admin Features:**
- Change status dropdown
- Verify offline payment button
- Process refund button
- View payment history
- Add notes

**Verify Offline Payment Modal:**
```
┌─────────────────────────────────────────────────────┐
│  Verify Offline Payment                              │
│  ─────────────────────────────────────────────────  │
│  Registration: REG-CRI-0001                         │
│  Expected Amount: ₹500                              │
│  ─────────────────────────────────────────────────  │
│  Amount Received: [₹500_______]                     │
│  Verification Note: [Cash received at counter____]  │
│  ─────────────────────────────────────────────────  │
│  [Cancel]                           [Verify Payment]│
└─────────────────────────────────────────────────────┘
```

**API Call:**
```typescript
POST /payments/verify-offline
{
  "registration_id": "uuid",
  "amount": 500,
  "verification_note": "Cash received at counter"
}
```

---

### 24. Refund Modal

**Purpose:** Process refund for a payment

```
┌─────────────────────────────────────────────────────┐
│  Process Refund                                      │
│  ─────────────────────────────────────────────────  │
│  Payment: RCP-24-000001                             │
│  Original Amount: ₹500                              │
│  Already Refunded: ₹0                               │
│  Refundable Amount: ₹500                            │
│  ─────────────────────────────────────────────────  │
│  Refund Amount: [₹500_______]                       │
│  Reason: [Event cancelled________________]          │
│  ─────────────────────────────────────────────────  │
│  ⚠️ This will initiate a refund via Razorpay       │
│  [Cancel]                           [Process Refund]│
└─────────────────────────────────────────────────────┘
```

**API Call:**
```typescript
POST /payments/{id}/refund
{
  "amount": 500,
  "reason": "Event cancelled"
}
```

---

### 25. Analytics Page (`/admin/analytics`)

**Purpose:** Detailed analytics and reports

**Tabs:**
1. **Overview** - Dashboard stats
2. **Sports** - Per-sport analytics
3. **Revenue** - Financial reports
4. **Colleges** - College-wise breakdown
5. **Trends** - Registration trends

**Sports Analytics:**
```
┌─────────────────────────────────────────────────────┐
│  Sports Analytics                                    │
│  ─────────────────────────────────────────────────  │
│  ┌─────────────────────────────────────────────┐    │
│  │ Sport     │ Regs │ Confirmed │ Revenue      │    │
│  ├───────────┼──────┼───────────┼──────────────┤    │
│  │ Cricket   │  16  │    14     │ ₹7,000       │    │
│  │ Football  │  18  │    16     │ ₹4,800       │    │
│  │ Badminton │  28  │    25     │ ₹3,750       │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

**Revenue Chart:**
- Line chart showing daily/weekly/monthly revenue
- Period selector (daily, weekly, monthly)

**API Calls:**
```typescript
GET /analytics/dashboard
GET /analytics/sports
GET /analytics/sport/{id}
GET /analytics/colleges
GET /analytics/revenue?period=daily
GET /analytics/trends
```

---

### 26. Colleges Management (`/admin/colleges`)

**Purpose:** Manage college master list

**Features:**
- Add new college
- Edit college
- Deactivate college

**API Calls:**
```typescript
GET /admin/colleges?include_inactive=true
POST /admin/colleges
PATCH /admin/colleges/{id}
DELETE /admin/colleges/{id}  // Soft delete
```

---

### 27. Settings Page (`/admin/settings`)

**Purpose:** Application configuration

**Settings Groups:**

**1. General Settings**
| Setting | Type | Key |
|---------|------|-----|
| Event Name | text | event_name |
| Event Start Date | date | event_dates.start |
| Event End Date | date | event_dates.end |

**2. Registration Settings**
| Setting | Type | Key |
|---------|------|-----|
| Enable Registrations | toggle | registration_enabled |

**3. Payment Settings**
| Setting | Type | Key |
|---------|------|-----|
| Online Payments | toggle | payment_methods.online |
| Offline Payments | toggle | payment_methods.offline |

**4. Contact Settings**
| Setting | Type | Key |
|---------|------|-----|
| Support Email | email | contact_email |
| Support Phone | tel | contact_phone |

**API Calls:**
```typescript
GET /admin/settings
PATCH /admin/settings
{ "event_name": "Sports Fest 2025", "registration_enabled": true }
```

---

### 28. Audit Logs Page (`/admin/audit-logs`)

**Purpose:** View system audit trail

**Features:**
- Filter by user
- Filter by action type
- Filter by entity
- Date range filter

**Table:**
| Column | Description |
|--------|-------------|
| Timestamp | When action occurred |
| User | Who performed action |
| Action | What was done (CREATE, UPDATE, DELETE, etc.) |
| Entity | Which table/resource |
| Details | Old/new values |

**API Call:**
```typescript
GET /admin/audit-logs?user_id={}&entity_type={}&action={}&from={}&to={}&page=1&limit=50
```

---

### 29. Broadcast Notification Page (`/admin/notifications/broadcast`)

**Purpose:** Send announcements to users

**Form:**
```
┌─────────────────────────────────────────────────────┐
│  Send Broadcast                                      │
│  ─────────────────────────────────────────────────  │
│  Target Audience                                     │
│  ○ All Users                                        │
│  ○ Specific Sport: [Select Sport ▼]                │
│  ○ Specific College: [Select College ▼]            │
│  ─────────────────────────────────────────────────  │
│  Title: [_________________________________]         │
│  Message:                                           │
│  ┌─────────────────────────────────────────────┐    │
│  │                                              │    │
│  │                                              │    │
│  └─────────────────────────────────────────────┘    │
│  Priority: [Normal ▼]                               │
│  □ Also send email                                  │
│  ─────────────────────────────────────────────────  │
│  Estimated Recipients: 150 users                    │
│  [Cancel]                            [Send Broadcast]│
└─────────────────────────────────────────────────────┘
```

**API Call:**
```typescript
POST /notifications/broadcast
{
  "title": "Important Update",
  "message": "The event schedule has changed...",
  "priority": "high",
  "target": { "type": "sport", "value": "sport_uuid" },
  "send_email": true
}
```

---

## Shared Components

### Navigation Components

**1. Public Navbar**
- Logo
- Sports link
- About link
- Contact link
- Login/Signup buttons

**2. Authenticated Navbar**
- Logo
- Dashboard link
- My Registrations link
- Notification bell with badge
- Profile dropdown

**3. Admin Sidebar**
```
┌─────────────────┐
│ Dashboard       │
│ Sports          │
│ Registrations   │
│ Analytics       │
│ ───────────────│
│ Colleges        │
│ Settings        │
│ Audit Logs      │
│ ───────────────│
│ Broadcast       │
└─────────────────┘
```

### UI Components

| Component | Props | Usage |
|-----------|-------|-------|
| `Button` | variant, size, loading, disabled | All forms |
| `Input` | type, label, error, required | Form fields |
| `Select` | options, value, onChange | Dropdowns |
| `Card` | title, actions, footer | Content containers |
| `Badge` | variant (status colors) | Status indicators |
| `Modal` | title, isOpen, onClose | Confirmations, forms |
| `Table` | columns, data, sortable | Data display |
| `Pagination` | page, total, onChange | List navigation |
| `Tabs` | tabs, activeTab, onChange | Section switching |
| `Toast` | type, message | Notifications |
| `Skeleton` | count, type | Loading states |
| `EmptyState` | icon, title, description, action | No data views |
| `ConfirmDialog` | title, message, onConfirm | Destructive actions |

---

## Page Workflows

### Registration Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Sports List    │────▶│  Sport Detail   │────▶│  Check Login    │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                        ┌────────────────────────────────┼────────────────────────────────┐
                        │                                │                                │
                        ▼                                ▼                                ▼
               ┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
               │  Login Page     │              │  Already        │              │  Registration   │
               │  (redirect)     │              │  Registered     │              │  Form           │
               └─────────────────┘              └─────────────────┘              └────────┬────────┘
                                                                                          │
                                                                                          ▼
                                                                                 ┌─────────────────┐
                                                                                 │  Create         │
                                                                                 │  Registration   │
                                                                                 └────────┬────────┘
                                                                                          │
                        ┌─────────────────────────────────────────────────────────────────┼─────────┐
                        │                                                                 │         │
                        ▼                                                                 ▼         ▼
               ┌─────────────────┐                                               ┌─────────────────┐
               │  Waitlisted     │                                               │  Payment Page   │
               │  (Dashboard)    │                                               │  (Razorpay)     │
               └─────────────────┘                                               └────────┬────────┘
                                                                                          │
                                                                                          ▼
                                                                                 ┌─────────────────┐
                                                                                 │  Success Page   │
                                                                                 │  (Confirmed)    │
                                                                                 └─────────────────┘
```

### Payment Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Click Pay      │────▶│  Create Order   │────▶│  Razorpay       │────▶│  Verify Payment │
│  Button         │     │  (API)          │     │  Checkout       │     │  (API)          │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                                                  │
                                                        ┌─────────────────────────┼─────────────────┐
                                                        │                         │                 │
                                                        ▼                         ▼                 ▼
                                               ┌─────────────────┐       ┌─────────────────┐  (Webhook handles
                                               │  Success        │       │  Failure        │   edge cases)
                                               │  Redirect       │       │  Show Error     │
                                               └─────────────────┘       └─────────────────┘
```

---

## API Integration Guide

### Authentication Setup

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Get current session
export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  // Handle auth changes
});
```

### API Client

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const api = {
  async get(endpoint: string) {
    const session = await getSession();
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json',
      },
    });
    return res.json();
  },

  async post(endpoint: string, data: any) {
    const session = await getSession();
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Similar for PATCH, DELETE
};
```

### React Query Example

```typescript
// hooks/useSports.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useSports(params?: SportParams) {
  return useQuery({
    queryKey: ['sports', params],
    queryFn: () => api.get(`/sports?${new URLSearchParams(params)}`),
  });
}

export function useSport(slugOrId: string) {
  return useQuery({
    queryKey: ['sport', slugOrId],
    queryFn: () => api.get(`/sports/${slugOrId}`),
  });
}
```

### Realtime Notifications

```typescript
// hooks/useNotifications.ts
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeNotifications(userId: string, onNew: (n: Notification) => void) {
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          onNew(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onNew]);
}
```

---

## Route Summary

### Public Routes
| Route | Page |
|-------|------|
| `/` | Home |
| `/sports` | Sports Listing |
| `/sports/[slug]` | Sport Details |
| `/about` | About/Rules |
| `/contact` | Contact |
| `/login` | Login |
| `/signup` | Signup |
| `/forgot-password` | Forgot Password |
| `/reset-password` | Reset Password |

### Participant Routes (Protected)
| Route | Page |
|-------|------|
| `/dashboard` | User Dashboard |
| `/dashboard/registrations` | My Registrations |
| `/dashboard/registrations/[id]` | Registration Details |
| `/dashboard/registrations/[id]/pay` | Payment |
| `/dashboard/registrations/[id]/edit-team` | Edit Team |
| `/dashboard/profile` | Profile |
| `/dashboard/notifications` | Notifications |
| `/dashboard/payments` | Payment History |
| `/sports/[slug]/register` | Registration Form |

### Admin Routes (Admin Only)
| Route | Page |
|-------|------|
| `/admin` | Admin Dashboard |
| `/admin/sports` | Sports Management |
| `/admin/sports/new` | Create Sport |
| `/admin/sports/[id]/edit` | Edit Sport |
| `/admin/registrations` | Registrations Management |
| `/admin/registrations/[id]` | Registration Detail (Admin) |
| `/admin/analytics` | Analytics |
| `/admin/colleges` | Colleges Management |
| `/admin/settings` | Settings |
| `/admin/audit-logs` | Audit Logs |
| `/admin/notifications/broadcast` | Broadcast |

---

## Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | < 640px | Single column, hamburger menu |
| Tablet | 640px - 1024px | Two columns, collapsible sidebar |
| Desktop | > 1024px | Full layout, expanded sidebar |

---

## Error Handling

### Error Pages
- `/404` - Page not found
- `/500` - Server error
- `/403` - Unauthorized

### Error Messages
| Code | Message | Action |
|------|---------|--------|
| 400 | Bad Request | Show validation errors |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show access denied |
| 404 | Not Found | Show 404 page |
| 409 | Conflict | Show specific message (e.g., "Already registered") |
| 500 | Server Error | Show generic error, offer retry |

---

## Loading States

Each page should implement:
1. **Skeleton loaders** - For initial data fetch
2. **Button loading states** - During form submissions
3. **Optimistic updates** - For better UX on simple actions
4. **Error boundaries** - Catch and display errors gracefully
