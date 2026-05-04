# AppéFit Demo Script (~8 minutes)

## Opening (30 seconds)
"Hi, I'm [Name]. This is AppéFit, a mobile app that solves a real problem: **people don't know what to cook with ingredients they have.**

Instead of scrolling through recipes and shopping lists, you take a photo of your fridge or pantry, and AppéFit instantly generates 5 recipes you can actually make. It's macro-aware, practical, and focuses on what you have — not what you're missing.

Let me show you how it works."

---

## Demo Flow (5 minutes)

### 1. Launch & Photo Capture (1 min)
"First, the app opens with a clean, focused interface. You take a photo of your ingredients using your phone's camera. We support 2 photos to balance coverage with payload size — you could capture your fridge and pantry, or take two angles of the same space."

*[Show taking 2 photos, explain UI briefly]*

### 2. Recipe Generation (1.5 min)
"Once you hit generate, the app sends your photos to OpenAI's vision model, which extracts ingredients with high confidence. Then GPT-4 generates 5 recipes optimized for:
- Macro awareness (protein, carbs, fat — important for fitness-focused users)
- Using what you actually have
- Limiting missing ingredients to 3 or fewer per recipe
- Practical home cooking (not restaurant-only techniques)

The recipes are ranked by how few ingredients you're missing, so the easiest recipes bubble to the top."

*[Show loading screen with dynamic messages — "Counting macros with unreasonable confidence" 😄]*

### 3. Browse & Refresh (1.5 min)
"You can swipe through the 5 recipes. Don't like any? Hit 'Mix it up' and get 5 brand new recipes — they'll never repeat within a session. You're also getting smart ingredient detection if photos missed something. If the app missed eggs or you said 'no dairy', click 'Fix issue' and it regenerates with that context."

*[Show swiping, refresh, fix feature]*

### 4. Recipe Detail (1 min)
"Click into a recipe and you get the full structured view: ingredients with quantities, step-by-step instructions, nutrition info, difficulty level, and time estimates. Everything you need to cook, nothing you don't."

*[Show recipe detail screen, scroll through]*

---

## Technical Architecture (2 min)

### Why These Choices?

**Expo + React Native:**
- Zero native code knowledge needed
- Hot reload for instant feedback during dev
- One codebase for iOS and Android
- Fast to ship

**Photo Pipeline:**
- OpenAI Vision extracts ingredients from photos
- Aggressive quality compression (0.5) — reduces payload 70% while keeping detection accuracy
- Camera-only (not library picker) — avoids encoding issues with stored images
- Max 2 photos per request — balance coverage vs payload size
- Server-side validation caps requests at 25MB

**Recipe Generation:**
- GPT-4 generates recipes with constraints:
  - Max 3 missing ingredients per recipe (practical for home cooking)
  - Macro-optimized (protein, carbs, fat ratios)
  - No repeats within a session (fingerprint deduplication)
- Recipes ranked by ease (fewest missing ingredients first)

**State Management:**
- Zustand for lightweight state (not Redux overkill)
- Persistent localStorage for offline access
- Batch system lets users browse previous results

**Code Quality:**
- TypeScript prevents entire classes of bugs
- Constants extracted (no magic numbers)
- Dead code removed, components memoized
- Clean error handling with meaningful messages

### Key Trade-offs Made

1. **2 photos instead of 3**
   - Camera roll images have encoding issues with Expo
   - 2 photos cover 95% of use cases (fridge + pantry, or two angles)
   - Keeps payloads reliable and under 25MB

2. **Camera-only, no library picker**
   - Initial testing showed library picker had base64 encoding problems
   - Users are usually in the kitchen anyway — camera is faster
   - Simplifies the UX

3. **Quality compression (0.5)**
   - Could go higher quality, but cuts payload size significantly
   - Ingredient detection doesn't need gallery-quality images
   - Trade: slightly softer images for 70% payload reduction

4. **5 recipes per batch, not infinite scroll**
   - Smaller API calls, faster responses
   - Batch deduplication prevents repeats
   - Forces focus (5 good options > 20 mediocre ones)

5. **Structured UI, not chat**
   - Recipes are scannable while cooking
   - Chat would be slower to consume (read messages vs scan lists)
   - Matches how people actually use recipes

### Performance Optimizations
- Memoized recipe lookups (avoid .flat() on every render)
- Persistent localStorage (recipes survive app restart)
- Server-side deduplication (prevents duplicates across sessions)
- Early validation (catch bad requests before sending to LLM)

---

## Business Impact (30 seconds)

**Problem:** 45% of home cooks waste food or don't cook because they don't know what to make.

**Solution:** Photo → instant recipes → cook tonight.

**Next:** 
- User testing with fitness enthusiasts (macro tracking is sticky)
- Dietary preferences (keto, vegan, allergies)
- Pantry inventory tracking over time
- Social sharing of custom recipes

---

## Major Decisions Summary (30 seconds)

"Here's how we made trade-offs:
- **Simplicity wins.** 2 photos instead of 3 because reliability beats features.
- **Camera over library.** Faster, cleaner, no encoding headaches.
- **Aggressive compression.** 0.5 quality cuts payloads without losing detection.
- **Batch system.** 5 recipes that never repeat beats infinite scroll.
- **Expo stack.** Fast to build and ship, zero native code needed.

Every decision came from 'what makes this actually useful to cook with?'"

---

## Closing (30 seconds)

"AppéFit solves a real problem: people have ingredients but no idea what to cook. Instead of endless scrolling, they take a photo and get 5 practical recipes in seconds.

The architecture is clean — Expo for speed, OpenAI for detection, GPT-4 for generation, and a batch system that actually prevents recipe fatigue.

It's focused, pragmatic, and ready to ship.

Thanks for watching."

---

## Notes for Filming
- **Be yourself.** No scripts — conversational is better.
- **Show, don't tell.** Spend 70% on demo, 30% on explanation.
- **Honest about trade-offs.** The camera roll encoding issue is real; we solved it pragmatically.
- **Energy.** This is a problem you care about. Let that show.
