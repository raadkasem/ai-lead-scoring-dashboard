# Lead Scoring Dashboard

AI-powered lead prioritization dashboard for car dealers. Analyzes call transcripts using LLM to extract insights and score leads based on deal potential.

## Features

- **AI-Powered Analysis** - Extracts insights from German call transcripts using any OpenAI-compatible API
- **Smart Scoring** - Scores leads 0-100 based on urgency, negotiation willingness, car condition, price gap, ownership history, and sentiment
- **File Upload** - Supports Excel (.xlsx, .xls) and JSON files
- **Auto Header Detection** - Automatically finds column headers in row 1 or 2
- **Cached Results** - Processed leads are stored locally, no re-processing on page reload
- **Filter & Sort** - Filter by Hot/Warm/Cold status, sort by score, price, or year
- **Photo Support** - Display car images with fallback placeholder
- **Mileage Display** - Show vehicle mileage when available
- **Scoring Explainer** - Visual breakdown of how lead scores are calculated

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **AI:** Any OpenAI-compatible API (OpenAI, Cerebras, Together AI, etc.)
- **Excel Parsing:** xlsx library

## Getting Started

### Prerequisites

- Node.js 18+
- API key for any OpenAI-compatible LLM provider

### Installation

```bash
# Clone the repository
git clone https://github.com/raadkasem/ai-lead-scoring-dashboard.git
cd ai-lead-scoring-dashboard

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
```

### Environment Variables

Create a `.env.local` file:

```env
LLM_API_KEY=your_api_key_here
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

Works with any OpenAI-compatible API provider (OpenAI, Azure OpenAI, Cerebras, Together AI, etc.).

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage

### Upload Leads

1. Click **Upload** button
2. Drag & drop or select an Excel/JSON file
3. Wait for AI analysis to complete
4. View scored and sorted leads

### Excel Format

| Column           | Required | Description           |
| ---------------- | -------- | --------------------- |
| ID               | Yes      | Unique identifier     |
| Name             | Yes      | First name            |
| Last Name        | No       | Last name             |
| Make             | Yes      | Car manufacturer      |
| Modell           | Yes      | Car model             |
| Year             | Yes      | Manufacturing year    |
| Mileage          | No       | Kilometers (km)       |
| Price Estimation | Yes      | Estimated price (EUR) |
| Status           | No       | Call status           |
| Transcript       | Yes      | Call transcript       |
| Call Successful  | No       | Boolean               |
| Photo            | No       | Car image URL         |

### JSON Format

```json
[
  {
    "id": 1,
    "name": "John",
    "lastName": "Doe",
    "make": "Tesla",
    "model": "Model 3",
    "year": 2023,
    "mileage": 45000,
    "priceEstimation": 35000,
    "transcript": "Call transcript here...",
    "callSuccessful": true,
    "photoUrl": "https://example.com/car.jpg"
  }
]
```

## Scoring Algorithm

| Factor        | Max Points | Description                      |
| ------------- | ---------- | -------------------------------- |
| Urgency       | 25         | How quickly seller can hand over |
| Negotiation   | 20         | Willingness to negotiate price   |
| Car Condition | 20         | Reported vehicle condition       |
| Price Gap     | 15         | Asking vs estimated price        |
| Ownership     | 10         | Number of previous owners        |
| Sentiment     | 10         | Conversation tone                |

**Score Ranges:**

- **Hot Lead:** 70+ points (green)
- **Warm Lead:** 40-69 points (yellow)
- **Cold Lead:** < 40 points (gray)

## API Endpoints

A Postman collection is included: `postman_collection.json`

### GET /api/leads

Returns cached/stored leads without reprocessing.

### POST /api/leads

Force reprocesses all leads with AI.

### POST /api/upload

Upload and process new Excel/JSON file.

### GET /api/upload

Returns column requirements and format documentation.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── leads/route.ts      # Leads API (GET cached, POST reprocess)
│   │   └── upload/route.ts     # Upload API (Excel/JSON)
│   ├── layout.tsx
│   ├── page.tsx                # Dashboard
│   └── globals.css
├── components/
│   ├── AuthorModal.tsx         # Author info floating button
│   ├── FilterBar.tsx           # Filter & sort controls
│   ├── LeadCard.tsx            # Lead card with photo
│   ├── ScoreBadge.tsx          # Score indicator
│   ├── ScoringModal.tsx        # Scoring explainer modal
│   ├── StatsHeader.tsx         # Dashboard stats
│   ├── UploadHint.tsx          # Column format guide
│   └── UploadPanel.tsx         # File upload with progress
├── lib/
│   ├── llm.ts                  # LLM integration (OpenAI-compatible)
│   ├── fileStorage.ts          # File management
│   ├── scoring.ts              # Scoring algorithm
│   └── types.ts                # TypeScript types
├── public/
│   └── images/
│       └── car-placeholder.jpg # Default car image
├── data/                       # Ignored in git
│   ├── uploads/                # Original uploaded files
│   ├── processed/              # Processed JSON files
│   └── current.json            # Active dataset
└── postman_collection.json     # API collection for Postman
```

## License

MIT

## Author

**Raad Kasem** - Senior Software Engineer

- Website: [raadkasem.dev](https://raadkasem.dev/)
- GitHub: [github.com/raadkasem](https://github.com/raadkasem)
