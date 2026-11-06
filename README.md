# Rebuild

Marketing site for Rebuild, the James Haskell training, nutrition and mindset app.

Static site. No build step, no dependencies, no framework. Open `index.html` and it runs.

## Structure

```
index.html                     the whole page
assets/
  css/styles.css               all styling
  js/main.js                   nav, scroll reveals, app showcase, quiz
  img/
    favicon.svg
    app/                       eight app screenshots
    photos/                    photography of James
    video/                     poster frames for the two videos
  video/                       the two James videos
```

## Running it locally

Open `index.html` in a browser, or serve it if you want clean paths:

```bash
python3 -m http.server 8000
```

## Deploying

**GitHub Pages:** Settings, Pages, deploy from branch, root folder. The `.nojekyll` file is already there so the `assets` folder is served as is.

**Cloudflare Pages:** connect the repo, leave the build command empty, set the output directory to `/`.

Either way there is nothing to compile.

## The two videos

Both are in the repo and already wired up. Nothing to configure.

| Slot | File | Poster | Length |
| --- | --- | --- | --- |
| `#hero-video` | `assets/video/why-i-built-rebuild.mp4` | `assets/img/video/poster-why-i-built-rebuild.jpg` | 1:32 |
| `#mind-video` | `assets/video/start-where-you-are.mp4` | `assets/img/video/poster-start-where-you-are.jpg` | 0:39 |

The source footage is portrait 9:16, so both slots are portrait rather than the landscape boxes the old design used.

The originals were 157MB and 67MB with uncompressed audio. They are transcoded to 720x1280 H.264 with AAC audio, which brings them to 15MB and 7MB, comfortably inside GitHub's limits. `preload="none"` means neither file is fetched until someone presses play, so the poster is all that loads with the page.

Each slot shows a poster with a play button over it. Pressing it hides the overlay, starts the video and reveals the native controls. Starting one pauses the other.

### Replacing a video

Drop the new MP4 in at the same path and swap the poster. To regenerate a poster from a frame:

```bash
ffmpeg -ss 62 -i source.mov -frames:v 1 -q:v 2 poster.jpg
```

The posters are graded to match the site and carry a gradient over the lower third, which knocks back the burned-in subtitles so the overlay title reads cleanly.

## Where the leads go

The quiz is the only conversion point on the page. There is no checkout.

Submissions post to the REPS dashboard and land in Leads under the **Rebuild** client:

```
POST https://repshealthgrowth.com/api/forms
```

The payload:

```json
{
  "client": "rebuild",
  "source": "quiz",
  "form": "Website check",
  "page": "/",
  "utm_campaign": "",
  "name": "",
  "email": "",
  "phone": "",
  "answers": {
    "Main goal": "",
    "Biggest struggle": "",
    "Support wanted": ""
  }
}
```

A new email creates a lead in New lead. A returning email adds to that lead's timeline rather than creating a duplicate.

**Support wanted** is the field that routes the lead. "Just the app, I will crack on" and "The app, plus other blokes doing the same" are membership leads. "I want a coach checking in on me" and "I want James in my corner directly" are one-to-one conversations and want a different follow-up.

The endpoint is set in `assets/js/main.js` as `LEADS_ENDPOINT`. If the request fails the person still sees the thank-you screen, so a network problem never strands them on the form. Failures are logged to the browser console.

## Editing content

Everything is plain HTML in `index.html`, in page order with commented section markers:

| Section | Marker |
| --- | --- |
| Hero | `1. HERO` |
| Value strip | `2. VALUE STRIP` |
| App showcase | `3. THE APP` |
| Programmes | `4. PROGRAMMES` |
| The mind | `5. THE MIND` |
| Meet James | `6. MEET JAMES` |
| One-to-one | `7. ONE TO ONE` |
| Quiz | `8. THE QUIZ` |
| FAQ | `9. FAQ` |
| Final CTA | `10. FINAL CTA` |

### Adding or changing an app feature

Each feature is one `article.ap-block` in the left column with a matching `img.ap-screen` in the phone and a `button.ap-dot` below it. All three share the same `data-ap` value. Add all three with a new matching value and the scroll sync picks it up with no JS changes.

### Adding or removing a quiz question

Each question is one `div.quiz-step` with a `data-step` number, holding a `div.quiz-opts` with a `data-q` name. The `data-q` becomes the field name in the payload. If you add or remove a step, renumber the `data-step` values in order, update the `data-goto` on each back button, add or remove a `span` in `.quiz-prog`, and change `LAST_Q` near the top of the quiz code in `main.js`.

## Assets still needed

- **App screenshots re-shot on a demo account.** Every current screenshot is the test account, so "Test User", "Test's Meal Plan" and "onboarding@repshealth.com" are visible, and most figures read zero. It shows prospects an app nobody uses.
- **Nothing blocking on photography.** Six images are in use: three programme covers, one for Meet James, the podium shot for one-to-one, and the wide gym shot behind the closing call to action.

## Conventions

- British English, GBP
- No em or en dashes in visible copy
- No gym jargon: no "ripped", "shredded", "macros", "progressive overload"
- Montserrat throughout, loaded from Google Fonts
