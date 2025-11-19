Keep Testing Me! — Log Reports

This file is a chronological, numbered log of debugging, fixes and notes for the "Keep Testing Me!" demo project.

Format:
- Date (YYYY-MM-DD)
- Debug #N: short title
- Details: what was observed, files changed, how fixed, validation steps


2025-11-19

Debug #1: Duplicate static HTML / CSS / JS caused UI confusion
- Observed: `quiz.html` and `results.html` each contained two concatenated HTML documents. There were duplicate/legacy static files (`/quiz.js`, `/styles.css`, `/js/app.js`) that conflicted with the intended assets.
- Files inspected:
  - `src/main/resources/static/index.html`
  - `src/main/resources/static/quiz.html`
  - `src/main/resources/static/results.html`
  - `src/main/resources/static/css/style.css`
  - `src/main/resources/static/styles.css` (legacy)
  - `src/main/resources/static/quiz.js` (legacy)
  - `src/main/resources/static/js/app.js` (legacy)
- Fix applied:
  - Removed the duplicate second HTML blocks from `quiz.html` and `results.html` so each file has a single valid document.
  - Consolidated the black & gold theme into `src/main/resources/static/css/style.css` and removed the light-theme `styles.css` legacy file.
  - Removed legacy root-level `quiz.js` and `js/app.js` to avoid accidental loading.
- Validation:
  - Repackaged app and launched (jar). Verified `http://localhost:8080/` returns the cleaned `index.html` and CSS served from `/css/style.css`.

Debug #2: `results.js` runtime error and demo infinite loop
- Observed: `results.js` redeclared `params` and produced a runtime SyntaxError. Demo auto-correct attempted to resubmit answers and could loop infinitely if something failed.
- Files inspected: `src/main/resources/static/js/results.js`
- Fix applied:
  - Removed duplicate `params` declaration earlier in the session (fix done previously).
  - Added demo-safety counters (`demoAutoCorrectRetry-<quizId>`) to limit auto-correct attempts to 3. On exhaustion, the demo stops and shows a short message.
  - Added user-visible short messages for failures in fetching answer keys or auto-correct submission errors.
- Validation:
  - Fetched `http://localhost:8080/js/results.js` to confirm patch.

Debug #3: Ambiguous Spring mapping for `/api/quizzes/{id}/submit`
- Observed: Two controllers mapped to the same submit endpoint, causing a 500 Ambiguous mapping error when POSTing.
- Files inspected:
  - `src/main/java/com/studybuddy/quiz_system/QuizController.java`
  - `src/main/java/com/studybuddy/quiz_system/QuizManagementController.java`
- Fix applied:
  - Renamed legacy controller mapping in `QuizManagementController` from `/api/quizzes/{quizId}/submit` to `/api/quizzes/{quizId}/submit-list` (explicitly avoids collision).
- Validation:
  - Repackaged and ran the jar; POST to `/api/quizzes/1/submit` now dispatches to `QuizController` and returns valid JSON.

Debug #4: Demo celebration and loop UX
- Observed: When demo auto-corrected to perfect score, celebration did not animate as desired and the demo loop sometimes felt abrupt.
- Fix applied:
  - Implemented a celebration runner animation in `results.js` that creates a circular runner element and animates it from bottom to -110vh; when animation finishes the app redirects to `/` to restart the demo.
  - The runner cleanup also resets the demo retry counter.
- Validation:
  - Manual POST and flow testing showed `showCelebration()` now appends the large percent and starts a runner animation; after animation finishes the page redirects to the start screen.

Notes and recommended follow-ups
- Add a small integration test exercising: GET questions -> POST submit (wrong) -> GET answers -> POST correct -> expect perfect score and redirection. This will prevent regressions in the demo flow.
- Consider removing the legacy `/quizzes/{quizId}/submit-list` endpoint entirely if unused; keep codebase lean.
- Keep `Log Reports.md` updated for each debug session; the repository now contains this file at root.

End of log (most recent entries first).
