# 🏥 ClaimMax

> **Healthcare Claims Made Simple** — Helping Indian citizens access their rightful government health insurance benefits through AI-powered bill analysis and card verification.

![ClaimMax](https://img.shields.io/badge/ClaimMax-v1.0.0-green)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-22.x-green)

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [Our Solution](#-our-solution)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [How It Works](#-how-it-works)
- [Offline Capabilities](#-offline-capabilities)
- [AI/ML Components](#-aiml-components)
- [API Documentation](#-api-documentation)
- [Team](#-team)

---

## 🎯 Problem Statement

**Millions of Indians are unaware of or unable to claim their healthcare benefits** under government schemes like **PM-JAY (Ayushman Bharat)** and **ESIC (Employee State Insurance)**. 

The challenges include:
- ❌ Complex claim procedures
- ❌ Lack of awareness about eligibility
- ❌ Fraudulent cards in circulation
- ❌ Language and literacy barriers
- ❌ No easy way to understand bill breakdowns

---

## 💡 Our Solution

**ClaimMax** is a mobile-first web application that:

1. **📸 Scans hospital bills** using OCR to automatically extract amounts
2. **🔒 Verifies government health cards** (PM-JAY/ESIC) for authenticity
3. **💰 Calculates eligible claim amounts** based on treatment type
4. **📄 Generates claim documents** in PDF format ready for submission
5. **💳 Offers EMI options** for users who don't qualify for government schemes

---

## ✨ Key Features

### For Users
| Feature | Description |
|---------|-------------|
| 📷 **Bill Scanner** | Take a photo of your hospital bill - we extract the amount automatically |
| 🆔 **Card Verification** | AI-powered authenticity check for PM-JAY/ESIC cards |
| 🧮 **Claim Calculator** | Instant breakdown of how much you can claim from each scheme |
| 📑 **Document Generator** | Download ready-to-submit claim documents as PDF |
| 📱 **Works Offline** | All core features work without internet (client-side ML) |
| 🌐 **Mobile First** | Designed for smartphones - works on any device |

### Technical Highlights
| Feature | Technology |
|---------|------------|
| **Client-Side OCR** | Tesseract.js - no server needed for bill extraction |
| **ML Card Verification** | Feature extraction + baseline comparison for fraud detection |
| **QR Code Scanning** | ZXing library for reading card QR codes |
| **Hologram Detection** | Image analysis for verifying security features |
| **Tamper Detection** | Multi-layer checks (edge artifacts, noise patterns, compression) |

---

## 🛠 Tech Stack

### Frontend
```
React 18.3 + TypeScript + Vite
├── Tesseract.js       → Client-side OCR
├── jsPDF              → PDF generation
├── TailwindCSS        → Styling
└── Lucide React       → Icons
```

### Backend
```
Node.js + Express 5 + TypeScript
├── Prisma ORM         → Database access (SQLite)
├── Multer             → File uploads
├── Tesseract.js       → Server-side OCR fallback
├── PDFKit             → Server PDF generation
└── Zod                → Request validation
```

### AI/ML Pipeline
```
TypeScript + Canvas API
├── Track A: Bill OCR & Treatment Classification
│   ├── extract-fields.ts   → Field extraction from bills
│   ├── scheme-engine.ts    → Eligibility rules engine
│   └── treatment-cat.ts    → Treatment categorization
│
└── Track B: Card Fraud Detection
    ├── qr-scanner.ts       → QR code verification
    ├── hologram-detector.ts → Security hologram check
    ├── tamper-detector.ts   → Tampering detection
    └── pmjay-validator.ts   → Card ID format validation
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  React + Vite (Port 5173)                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│
│  │ Bill Scanner │ │Card Verifier │ │ PDF Generator        ││
│  │ (Tesseract)  │ │ (ML Model)   │ │ (jsPDF)             ││
│  └──────────────┘ └──────────────┘ └──────────────────────┘│
└────────────────────────────┬────────────────────────────────┘
                             │ REST API
┌────────────────────────────▼────────────────────────────────┐
│                        BACKEND                              │
│  Express + TypeScript (Port 4000)                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│
│  │ /extract-bill│ │/compute-claim│ │ /generate-docs       ││
│  │ OCR Service  │ │ Rules Engine │ │ PDF Service          ││
│  └──────────────┘ └──────────────┘ └──────────────────────┘│
│                           │                                 │
│  ┌────────────────────────▼────────────────────────────────┐│
│  │                   Prisma + SQLite                       ││
│  │  Cases → Bills → Claims (with PDF URLs)                 ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
ClaimMax_final/
├── frontend/                    # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.tsx  # Main app flow
│   │   │   ├── Navbar.tsx       # Navigation
│   │   │   └── HowItWorks.tsx   # Info page
│   │   ├── services/
│   │   │   ├── billOcr.ts       # Client-side OCR (trained)
│   │   │   ├── cardVerification.ts # ML card validation
│   │   │   └── pdfGenerator.ts  # PDF document creation
│   │   └── theme/
│   │       └── colors.ts        # Design system colors
│   └── public/
│       └── logo.png
│
├── backend/                     # Express Backend
│   ├── server.ts                # Entry point
│   ├── routes/
│   │   ├── extractBill.ts       # POST /api/extract-bill
│   │   ├── computeClaims.ts     # POST /api/compute-claims
│   │   └── generateDocs.ts      # POST /api/generate-docs
│   ├── services/
│   │   ├── ocrService.ts        # Tesseract integration
│   │   ├── rulesEngine.ts       # Claim computation
│   │   └── pdfService.ts        # PDFKit generation
│   ├── controllers/             # Business logic
│   ├── data/
│   │   └── rules.json           # Scheme coverage rules
│   └── prisma/
│       └── schema.prisma        # Database schema
│
└── ai/                          # AI/ML Pipeline
    ├── track-a/                 # Bill Processing
    │   ├── ocr/
    │   │   ├── extract-fields.ts
    │   │   ├── scheme-engine.ts
    │   │   └── preprocess.ts
    │   ├── classifier/
    │   │   └── treatment-cat.ts
    │   └── test_bills/          # Training data
    │
    └── track-b/                 # Card Verification
        └── js/
            ├── detectors/
            │   ├── qr-scanner.ts
            │   ├── hologram-detector.ts
            │   └── tamper-detector.ts
            ├── validators/
            │   ├── pmjay-validator.ts
            │   └── esic-validator.ts
            └── utils/
                └── model-inference.ts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/AfterMath-2026/AfterMath_HereWeGo_Civic.git
cd ClaimMax_final

# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install

# Setup database
npx prisma generate
npx prisma db push
```

### Running the Application

```bash
# Terminal 1: Start Backend (Port 4000)
cd backend
npm run dev

# Terminal 2: Start Frontend (Port 5173)
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📱 How It Works

### User Flow

```
1️⃣ UPLOAD BILL
   └── Take photo or upload image
   └── OCR extracts total amount automatically
   └── Enter patient name

2️⃣ VERIFY CARD
   └── Select card type (PM-JAY / ESIC)
   └── Scan your government health card
   └── AI verifies authenticity (QR, hologram, tampering)

3️⃣ VIEW RESULTS
   ├── ✅ Card Verified (Green)
   │   └── See claim breakdown:
   │       • PM-JAY: 50% coverage
   │       • ESIC: 20% coverage
   │       • Total savings displayed
   │
   └── ❌ Card Not Verified (Red)
       └── EMI payment option offered
       └── Manual verification suggested

4️⃣ GET DOCUMENTS
   └── Download PDF with:
       • Patient details
       • Original bill amount
       • Claim deductions
       • Final payable amount
       • Next steps
```

---

## 📴 Offline Capabilities

ClaimMax is designed for **low-connectivity environments** like rural hospitals:

| Feature | Offline Status | How |
|---------|---------------|-----|
| Bill OCR | ✅ Works | Tesseract.js runs in browser |
| Card Verification | ✅ Works | Client-side ML + localStorage model |
| PDF Generation | ✅ Works | jsPDF runs in browser |
| Camera Capture | ✅ Works | Browser Camera API |

**Why this matters:**
- No server round-trip for core functionality
- Trained ML model cached in localStorage
- Works after single initial load

---

## 🤖 AI/ML Components

### 1. Bill OCR (Track A)

**Technology:** Tesseract.js with trained pattern matching

```typescript
// Trained patterns for Indian hospital bills
const TRAINED_PATTERNS = [
  { name: 'TOTAL_BILL_AMOUNT', regex: /total\s*bill\s*amount/i },
  { name: 'OUTSTANDING_AMOUNT', regex: /outstanding\s*amount/i },
  { name: 'NET_PAYABLE', regex: /net\s*(amount\s*)?payable/i },
  // ... 13 patterns trained on 10 sample bills
];
```

**Accuracy:** Tested on 10 diverse hospital bills with 80% success rate.

### 2. Card Verification (Track B)

**Multi-layer verification pipeline:**

| Check | Method | Score Weight |
|-------|--------|--------------|
| QR Code | ZXing library decode | 25% |
| Hologram | Brightness variance analysis | 25% |
| ID Format | Regex validation (scheme-specific) | 25% |
| Tampering | Edge/noise/compression analysis | 25% |

**Threshold:** Cards with >50% score are marked "Verified" (green).

### 3. Scheme Eligibility Engine

Rule-based engine using `rules.json`:

```json
{
  "fracture": {
    "pmjay": { "covered": true, "coveragePct": 0.8, "maxAmount": 50000 },
    "esic": { "covered": true, "maxAmount": 7000 }
  }
}
```

---

## 📡 API Documentation

### `POST /api/extract-bill`
Extract bill information from uploaded image.

**Request:** `multipart/form-data` with `billImage`  
**Response:**
```json
{
  "hospitalName": "Apollo Hospital",
  "amount": 25000,
  "treatment": "fracture",
  "confidence": 0.92
}
```

### `POST /api/compute-claims`
Calculate eligible claims.

**Request:**
```json
{
  "caseId": 1,
  "treatment": "fracture",
  "billAmount": 25000
}
```

**Response:**
```json
{
  "claims": [
    { "scheme": "pmjay", "eligible": true, "amount": 20000 },
    { "scheme": "esic", "eligible": true, "amount": 5000 }
  ]
}
```

### `POST /api/generate-docs`
Generate claim PDF document.

**Request:**
```json
{
  "caseId": 1,
  "scheme": "pmjay"
}
```

**Response:**
```json
{
  "pdfUrl": "/docs/claim_1_pmjay.pdf"
}
```

---

## 🗃 Database Schema

```prisma
model Case {
  id        Int      @id @default(autoincrement())
  sessionId String
  createdAt DateTime @default(now())
  bill      Bill?
  claims    Claim[]
}

model Bill {
  id            Int      @id @default(autoincrement())
  caseId        Int      @unique
  hospitalName  String?
  treatment     String?
  amount        Float
  admissionDate String?
  dischargeDate String?
}

model Claim {
  id        Int      @id @default(autoincrement())
  caseId    Int
  scheme    String   // "pmjay" | "esic" | "group"
  eligible  Boolean
  amount    Float
  reason    String
  pdfUrl    String?
}
```

---

## 🎨 Design System

**Color Palette:**
| Name | Hex | Usage |
|------|-----|-------|
| Forest Moss | `#386641` | Primary actions, success |
| Cinnabar | `#BC4749` | Accents, warnings |
| Lavender | `#E9EEF3` | Backgrounds, sections |
| Vanilla Custard | `#F5F0E5` | Page background |

---

## 🔐 Security Considerations

- ✅ All ML processing happens client-side (no image uploads to server)
- ✅ Session-based case tracking (no user accounts required)
- ✅ Automatic cleanup of old data via scheduled service
- ✅ CORS configured for frontend origin only
- ✅ Input validation with Zod schemas

---

## 🚧 Future Roadmap

- [ ] PWA support for full offline installation
- [ ] Multi-language support (Hindi, Tamil, Bengali)
- [ ] Integration with DigiLocker for document verification
- [ ] Hospital empanelment database lookup
- [ ] WhatsApp bot interface

---

## 👥 Team

**Team HereWeGo** - AfterMath Civic Hackathon 2026

---

## 📄 License

This project was built for the HereWeGo Civic Hackathon 2026.

---

<p align="center">
  <strong>🏥 ClaimMax — Healthcare Claims Made Simple</strong><br>
  <em>Helping every Indian access their rightful health benefits</em>
</p>
