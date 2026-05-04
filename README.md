# 🫒 AppéFit

Take a photo of ingredients you already have. Get 5 quality, macro-conscious recipes you actually want to eat.

## Quick Start

### Requirements

- Node.js 18+
- OpenAI API key
- Expo CLI: `npm install -g expo-cli`

### Setup

1. Clone repo and install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and add your OpenAI API key:

```bash
cp .env.example .env
```

3. Start the backend:

```bash
npm run server
```

**Or** use the production backend at `https://appefit-production.up.railway.app` by setting `EXPO_PUBLIC_API_BASE_URL` in your `.env`.

4. Start the app:

```bash
npm run dev
```

5. Scan the QR code with Expo Go (iOS/Android) or press `i`/`a` for simulators.

## How It Works

1. Take a photo of your ingredients
2. App detects ingredients using OpenAI Vision
3. Fix issues with detection if needed
4. GPT-4 generates 5 recipes you can make
5. Browse recipes, refresh for new ones
6. Click a recipe to see full details
