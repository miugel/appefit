# Major Technical Decisions

Summary of key choices made during AppéFit development and why.

## Architecture Decisions

### React Native + Expo
**Decision:** Use Expo instead of native iOS/Android development
**Why:** 
- Fast iteration (hot reload, no build step)
- One codebase for iOS & Android
- No native code knowledge required
- Perfect for rapid prototyping

### OpenAI Vision + GPT-4
**Decision:** Use OpenAI models, not Claude Vision
**Why:**
- OpenAI Vision is battle-tested for image analysis
- GPT-4 is best-in-class for recipe generation
- Consistent API, good documentation
- Reliable LLM pipeline (detection → generation)

### Zustand for State Management
**Decision:** Lightweight state store, not Redux
**Why:**
- Minimal boilerplate
- Persistent state (localStorage integration)
- Performant even with large recipe batches
- Easy to test

## Photo & Payload Decisions

### 2 Photos Max
**Decision:** Support up to 2 photos per request
**Why:**
- Initial testing with 3 photos hit payload limits (>25MB)
- 2 photos cover 95% of real use cases (fridge + pantry)
- Reliable under all network conditions
- Camera roll images had encoding issues → focus on camera capture

### Camera-Only Input
**Decision:** Remove library picker, camera capture only
**Why:**
- Camera roll images failed base64 encoding in Expo ImagePicker
- Users are usually in the kitchen anyway
- Faster interaction (no file browsing)
- Simpler UX

### Quality Compression (0.5)
**Decision:** Reduce image quality from 0.75 to 0.5
**Why:**
- Cuts payload size ~70% (critical for 2-3 photo requests)
- Ingredient detection doesn't need gallery-quality images
- Still passes OpenAI Vision confidence thresholds (0.45+)
- Maintains reliability across networks

### 25MB Request Limit
**Decision:** Cap requests at 25MB on client + server
**Why:**
- Safety valve for oversized requests
- Client-side validation prevents wasted API calls
- Server validation catches edge cases
- Friendly error message guides users to fix

## Recipe Generation Decisions

### Max 3 Missing Ingredients
**Decision:** Recipes require ≤3 missing ingredients
**Why:**
- Practical for home cooking (not exotic specialty items)
- Prevents recipes that are 80% shopping list
- Enforced both in LLM prompt + server validation
- Improves user satisfaction (actually makeable recipes)

### 5 Recipes Per Batch
**Decision:** Show 5 recipes, let users refresh for 5 more
**Why:**
- Fewer options = faster decision making
- Batch deduplication prevents fatigue
- Smaller API calls = faster responses
- Focuses user attention (not overwhelming choice)

### Fingerprint Deduplication
**Decision:** Track seen recipes across batches
**Why:**
- Users never see the same recipe twice in a session
- Server-side fingerprinting (hash of title + key ingredients)
- Reduces API calls (exclude fingerprints from future requests)
- Improves refresh experience

## Code Quality Decisions

### Full TypeScript
**Decision:** Strict TypeScript throughout client + server
**Why:**
- Prevents entire classes of bugs at compile time
- Better IDE autocomplete and refactoring
- Self-documenting code (types are documentation)
- Safer refactors

### Constants File
**Decision:** Extract all magic numbers to `src/constants/messages.ts`
**Why:**
- Single source of truth for config
- Error messages never duplicate
- Timing values consistent across app
- Easy to test/tune

### Dead Code Removal
**Decision:** Remove unused components, utilities, and code
**Why:**
- Reduces cognitive load on reviewers
- Prevents confusion about what's actually used
- Smaller codebase = easier to maintain
- Removed: ErrorState, LoadingState, voice.ts, mock data

### Component Memoization
**Decision:** Memoize expensive calculations
**Why:**
- Recipe detail lookup uses .flat() on recipe batches
- Sorting recipes is O(n log n), happens on every render
- Prevents unnecessary re-renders
- Performance visible on slower devices

## UX/Product Decisions

### Ingredient Detection Correction
**Decision:** Let users fix detection issues on-demand
**Why:**
- Photos aren't perfect (lighting, angles, etc.)
- Users know what they actually have
- Correction + regen gives better results than try again
- Max 500 char limit keeps feedback actionable

### Structured Recipe UI
**Decision:** No chat interface, fully structured recipes
**Why:**
- Faster to scan while cooking (not reading paragraphs)
- Consistent format across all recipes
- Easy to extract specific info (time, ingredients, steps)
- Better UX while hands are full/dirty

### Ingredients Open by Default on First Batch Only
**Decision:** Show detected ingredients only on initial results
**Why:**
- Helps users understand what was detected
- On subsequent batches, they know the ingredients already
- Reduces visual clutter

## Deployment Decisions

### Port 3000 (not 3001)
**Decision:** Use standard Node.js port
**Why:**
- 3000 is convention (Next.js, CRA, etc.)
- What developers expect
- No special reason for 3001
- Easier for reviewers to run

### No Web Version for Submission
**Decision:** Mobile app only (Expo)
**Why:**
- Tenex assignment is for mobile development
- Web adds complexity without demonstrating mobile skills
- APK + video demo is sufficient
- Can add web later if needed

### Async Review Strategy
**Decision:** Deploy backend + build APK instead of keeping dev server running
**Why:**
- Expo Go requires dev server to run 24/7 (impractical)
- APK works anytime, anywhere
- Deployed backend lets reviewers test whenever
- Professional, doesn't require user assistance

## What Didn't Make It

### Claude Vision
- Started with plan to use Claude Vision
- Realized OpenAI Vision was better fit
- Switched early

### 3 Photos
- Initial goal was 3 photos
- Payload issues forced reduction to 2
- Pragmatic: reliability > feature count

### Voice Input
- Had commented-out code for voice recognition
- Removed entirely (dead code cleanup)
- Text + photos sufficient for MVP

### Web Version
- Considered React Native Web or Next.js
- Decided not worth complexity for this submission
- Mobile app is the focus

### Chat Interface
- Considered recipe chat (like ChatGPT)
- Realized structured UI is faster while cooking
- Product fit better with scannable format

---

**Philosophy:** Every decision prioritized usefulness over ambition. A 2-photo, camera-only app that works reliably beats a feature-rich app that times out.
