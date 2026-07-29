# The Fifth Element | Reliable Influencer Marketing Agency Website

A premium, luxury-themed Single-Page Application (SPA) and backend server for **The Fifth Element**, a marketing agency specializing in sustainable influencer marketing strategies, creator continuity, and data-driven growth.

---

## 🟢 Project Status: Fully Operational & Verified

All systems, integrations, and services in this project are **fully functional, verified, and configured for live use**:
- **Branding & Visuals**: Completely rebranded from "Punktuate" to "The Fifth Element" across all user-facing pages, styling classes, meta tags, admin panels, and documentation.
- **Razorpay Integration**: Configured with the latest Live API keys (`rzp_live_TCC2ALbMZzhoeX` and secret). Tested and confirmed that order creation (`/api/create-order`) and signature verification work successfully.
- **Firebase Database**: Seeding algorithms, content REST CRUD endpoints, and live booking persistence are fully functional.
- **EmailJS Integration**: Auto-confirmation email notifications are fully active and send ticket receipts immediately after signature verification.

---

## 🌟 Overview

The Fifth Element moves brands away from the traditional, volatile "chasing virality" mindset. Instead, it focuses on building repeatable content engines and authentic, long-term creator partnerships.

This repository implements the brand's premium digital presence, complete with a dynamic Single-Page Application, an interactive journal, a custom event ticketing system with Razorpay checkout, and a fully featured administrative dashboard backed by a Node.js/Express server and Firebase integration.

---

## 📂 Project Directory Structure

```text
├── index.html                      # Core SPA landing frame & global overlay views
├── index.css                       # Global styles, Tailwind base configurations, and custom animations
├── data.js                         # Local storage keys & fallback defaults (legacy/standalone backup)
├── server.js                       # Express.js backend application containing all REST APIs & payment logic
├── login.html                      # Access control screen for the admin dashboard
├── login.js                        # Client-side SHA-256 administrative password authentication logic
├── admin.html                      # Control panel template for managing database records
├── admin.css                       # Layout styles specific to the admin dashboard
├── admin.js                        # Dashboard application logic & CRUD operations
├── package.json                    # Project dependencies and script runner configurations
├── vercel.json                     # Serverless deployment mapping and API rewrites
├── .env.example                    # Template file for environment variable declarations
├── .gitignore                      # Standard version-control ignore configurations
│
├── api/
│   └── index.js                    # Vercel Serverless function entry wrapping Express.js app
│
├── js/                             # Modular Frontend Script Library
│   ├── data.js                     # Central source of truth for localStorage keys and default fallback values
│   ├── router.js                   # Client-side hash router for loading and caching pages
│   ├── nav.js                      # Handles mobile menu toggle views and scroll effects
│   ├── payment.js                  # Ticket state, quantities, Razorpay checkouts, and booking verification
│   ├── email.js                    # Contact form submission integration via EmailJS templates
│   ├── content.js                  # Dynamic data loading and rendering into page sections
│   └── animations.js               # visual effects, magnetic logs, parallax, and easter eggs
│
├── pages/                          # Injected Partial HTML Templates
│   ├── home.html                   # Cinematic hero, process description, case studies, and call-to-actions
│   ├── about.html                  # Agency philosophy, founder statements, team, and influencer lists
│   ├── services.html               # The Blueprint: agency service list details
│   ├── journal.html                # Thought leadership article directory grid
│   ├── jobs.html                   # Careers job listing template
│   ├── contact.html                # proposal / business inquiry form
│   ├── events-hub.html             # Shows upcoming events fetched from database
│   ├── event-dynamic.html          # Individual event details: schedule, maps, artist details, and tickets
│   └── payment.html                # Step-by-step guest details, review, checkout, and success templates
│
├── Influencers/                    # Directory structure containing static influencer details
│   ├── Aditi Fadtare/
│   │   └── Aditi.jpeg
│   ├── Dhanshri Dake/
│   │   └── Dhanashri.jpeg
│   ├── Osbert Dsouza/
│   │   └── Osbert.jpeg
│   ├── Shruti Dange/
│   │   └── Shruti Dange.jpeg
│   └── Vartika Vashista/
│       └── Vartika.jpeg
│
├── consistency-over-virality.html  # Standalone article: Why consistency beats luck
├── influencer-campaigns-fail.html  # Standalone article: Common pitfalls in marketing
├── systems-not-creators.html       # Standalone article: Fostering developer-level operations in content
└── *.png, *.jpg, *.jpeg            # Brand graphics, partner logos, backgrounds, and media assets
```

---

## ⚙️ Application Architecture & Core Flows

### 1. Client-Side SPA Router (`js/router.js`)
Rather than loading separate page frames, navigation relies on a custom, hash-based client-side router:
- **Navigation Trigger**: Functions like `router.navigate('pageId')` update the browser hash (e.g. `/#about`).
- **Template Fetching**: The router checks a map of endpoints in `PAGE_MAP` pointing to `/pages/<pageId>.html`.
- **Caching Mechanism**: Once a partial template is retrieved, it is saved in a memory cache object (`pageCache`) to avoid repetitive HTTP calls.
- **Dynamic Mounting**: The HTML is injected directly into the `#app` element, utilizing transition animations to smoothly fade content in.
- **Lifecycle Inits**: Following injection, the router automatically triggers relevant page initialization functions (e.g. `loadFounders()` on about page access).

### 2. Dynamic Content Hydration & Fallback System (`js/content.js` + `js/data.js`)
Pages are dynamically populated from server-side JSON collections using a robust caching and fallback design:
1. **API Queries**: The frontend queries REST endpoints (e.g., `/api/influencers`).
2. **Server Availability**:
   - *If online*: Fetches the database rows dynamically.
   - *If offline/unreachable*: The request fails gracefully and prints a warning console log.
3. **Mock Defaults Merger**: The client merges fetched records with default static JSON lists (defined in `js/data.js`). This ensures that the page layout remains fully populated and functional even if the backend is down.
4. **Observer Attributions**: Once cards are rendered, they are hooked to a shared `IntersectionObserver` to trigger scroll-reveal animations.

### 3. Integrated Event Ticketing & Razorpay Payment System (`js/payment.js`)
A major system feature is the custom, transactional ticketing and seat management flow:
- **Early Bird Seats Limitation**:
  - The frontend queries `/api/early-bird-count` which scans paid database records to calculate sold tickets.
  - If paid Early Bird tickets are `< 15` (max limit), the Early Bird card is enabled for ₹299.
  - If paid Early Bird tickets reach `15`, the tier is flagged as **SOLD OUT**; the Early Bird button disables, and the Regular ticket tier (₹499) activates.
- **Details Collection**: Customers complete full guest forms (name, age, contact, email, billing city) in Step 1.
- **Serverless Order Initiation**:
  - A post request is dispatched to `/api/create-order` containing the calculated price in paise (INR).
  - The server establishes an official order session via the Razorpay SDK, returning a valid `order_id`.
- **Payment Verification Gateway**:
  - After user verification, Razorpay returns a secure transaction payload.
  - The frontend posts these tokens to `/api/verify-payment`.
  - The server uses HMAC SHA-256 to hash the `razorpay_order_id` and `razorpay_payment_id` combined with the secret key, matching it against the `razorpay_signature`.
  - If authenticated, the payment is confirmed, ticket quantities update, and booking objects are pushed to the Firebase Realtime Database.
- **Confirmation Notifications**: EmailJS compiles values (name, email, tickets bought, total cost) and sends an automated ticket delivery notification to the client.
- **Celebration Feedback**: Initiates confetti animation overlays and updates the visual UI with printable booking identifiers.

### 4. Admin Panel Controls & Operations (`admin.js` + `login.js`)
A separate portal allows operations administrators to edit lists, schedules, and career records in real time:
- **Admin Authentication**:
  - Access is restricted. A valid admin cookie session token in `localStorage` is required.
  - Login uses client-side SHA-256 password hashing. Input values are compared against the secure admin hash: `d0bb7559fed4efa4d4834cf7c4392c5b4870d4b396f320a367bb2290a73fddbd`.
- **Interactive CRUD**:
  - The portal provides panels for `influencers`, `events`, `founders`, `faces`, `careers`, `announcements`, and `journals`.
  - Supports adding, editing, and deleting records via REST requests.
- **Image Processing**:
  - Incorporates FileReader bindings on input elements.
  - Uploaded images are read, converted to Base64 data strings, and saved directly as strings in the database, eliminating the need for separate media buckets.

### 5. Interactive Frontend Effects & Easter Eggs (`js/animations.js`)
The application features curated, high-end micro-interactions:
- **Scroll Reveal**: Elements with the class `.scroll-reveal` fade in and slide up as the user scrolls, controlled by an Intersection Observer.
- **Ambient Mouse Parallax**: Background blobs move slightly in response to cursor movement, creating a sense of depth.
- **Magnetic Logo Navigation**: Calculates the cursor's distance from the logo. If within 100px, it applies a translation/rotation force using trigonometric vectors (`Math.hypot` and `Math.atan2`).
- **Click Dot Ripple Effect**: A custom cursor handler appends `.fifth-element-point` particles at coordinate click locations, which fade out after 800ms.
- **Konami Code Event**: Typing `ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight b a` on the keyboard reveals a fullscreen `#konamiOverlay` with a custom canvas starfield simulation.
- **Gold Layout Mode**: Triple-clicking the logo element applies a global `.gold-mode` theme class to the document body for 3 seconds.
- **Punctuation Highlight**: Regex patterns automatically wrap punctuation symbols (`.` and `!`) in headings with a `.text-[#D4AF37]` span for stylistic contrast.

---

## 🔌 API Endpoints

All API endpoints are defined in `server.js` and serve dynamic collections:

### 1. Content CRUD Operations
Supports `GET` (list all), `POST` (create), `PUT` (update/upsert), and `DELETE` (remove) operations for the following collections:
`influencers`, `events`, `founders`, `faces`, `careers`, `announcements`, `journals`

| Method | Endpoint | Request Payload | Response JSON |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/:collection` | *None* | Array of collection items |
| **POST** | `/api/:collection` | `{ ...fields }` | `{ id: "base36_val", ...fields }` |
| **PUT** | `/api/:collection/:id` | `{ ...fields }` | `{ id: "id_val", ...updatedFields }` |
| **DELETE** | `/api/:collection/:id` | *None* | `{ success: true }` |
| **PUT** | `/api/:collection` | `[ { ...items } ]` | `{ success: true, count: number }` (Bulk replace) |

### 2. Configuration & Utilities

#### GET `/api/config`
Retrieves public API configuration variables.
- **Response**:
  ```json
  { "razorpayKeyId": "rzp_test_..." }
  ```

#### GET `/api/early-bird-count`
Calculates paid registrations from database bookings.
- **Response**:
  ```json
  { "count": 5, "max": 15 }
  ```

### 3. Payment Processing Endpoints

#### POST `/api/create-order`
Creates a Razorpay order.
- **Request Body**:
  ```json
  {
    "amount": 29900,
    "currency": "INR",
    "receipt": "rcpt_custom_id"
  }
  ```
- **Response**:
  ```json
  {
    "order_id": "order_xyz123",
    "amount": 29900,
    "currency": "INR"
  }
  ```

#### POST `/api/verify-payment`
Validates Razorpay payment signature and stores transaction logs.
- **Request Body**:
  ```json
  {
    "razorpay_order_id": "order_xyz123",
    "razorpay_payment_id": "pay_abc789",
    "razorpay_signature": "sha256_hash",
    "customerData": {
      "name": "John Doe",
      "age": "25",
      "phone": "9876543210",
      "email": "john@example.com",
      "city": "Mumbai"
    },
    "ticketInfo": {
      "type": "early-bird",
      "name": "Early Bird Ticket",
      "price": 299,
      "quantity": 1,
      "total": 299
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "paymentId": "pay_abc789"
  }
  ```

---

## 🛠️ Local Setup & Configuration

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Configuration Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):
```env
PORT=3000
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"..."}
```

### Installation
1. Install project dependencies:
   ```bash
   npm install
   ```
2. Start the local server:
   ```bash
   npm run start:local
   ```
3. Open your browser and navigate to `http://localhost:3000`.

---

## 📦 Deployment & Production Integration

The project is preconfigured for serverless hosting on **Vercel**:

### Vercel Routing Configuration (`vercel.json`)
The application defines serverless redirects and static routing rules:
- **Build Configurations**:
  - Directs `/api/index.js` compilation to the standard `@vercel/node` runtime builder.
  - Maps general assets directly to the `@vercel/static` directory builder.
- **API Rewrites**:
  - Rewrites all traffic targeting `/api/(.*)` to the `api/index.js` entry point. This initializes and exports our core `server.js` Express application, ensuring compatibility with Vercel's serverless environment.
- **Static Access fallback**:
  - Normal root URL directories bypass router intercepts, allowing direct asset downloads (like JPEG, PNG, MP4, and CSS stylesheets).
