# Executive Offsite (executiveoffsite.es)

A curated directory of offsite-ready masias, wine estates and boutique sanctuaries within 150 km of Barcelona. It is a lead-generation site for Kuma Partners. It takes no bookings and no payments.

## How it is built

- Next.js 15 (App Router) with Tailwind CSS 4, hosted on Netlify.
- Venues and photos are stored in Netlify Blobs. Nothing else needs to be set up or paid for.
- Availability requests and venue applications use Netlify Forms.
- No database and no third-party services.
- Locally, data is stored as plain files in the `.data` folder instead of Netlify Blobs.

## Run it on your computer

```
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Set `ADMIN_PASSWORD` and `SESSION_SECRET` in `.env.local` first, then sign in at http://localhost:3000/admin/login. Netlify Forms do not exist locally, so the request forms look successful but send nothing.

## Deploy on Netlify

1. Push this repository to GitHub.
2. In Netlify choose Add new site, Import an existing project, and pick the repository. The build settings in `netlify.toml` are picked up automatically.
3. Under Site configuration, Environment variables, add:
   - `NEXT_PUBLIC_SITE_URL` set to `https://executiveoffsite.es`
   - `ADMIN_PASSWORD` set to a long password
   - `SESSION_SECRET` set to a long random string (for example the output of `openssl rand -base64 48`)
   - `NEXT_PUBLIC_CONTACT_EMAIL` set to the address shown if a form fails (optional)
4. Deploy. After the first deploy, open the Forms tab. You should see `inquiry` and `venue-application`. Add an email notification for each under Forms, Form notifications.
5. Under Domain management add `executiveoffsite.es` and follow the DNS instructions.
6. Sign in at `/admin/login`.

## How you work with it

1. In Admin, create a venue (name and region). You can fill in the details yourself.
2. Under Owner access, create an owner link and send it to the owner. They fill in the details and upload their own photos, with no account. Photos are resized in their browser before upload.
3. The owner chooses Submit for review. The venue shows as Pending review in your list.
4. Check the figures and photos, tick Verified when you have checked them, tick Wi-Fi tested if you ran a speed test, then set the status to Published.
5. Once a venue is published the owner link becomes read-only. Edit it yourself in Admin, or set the status back to Draft to let the owner edit again.

Creating a new owner link switches off the previous one. Only a hash of the link is stored, so a lost link cannot be shown again.

## Commission and agreement fields

Each venue has a private record in Admin for the listing agreement status, the date it was signed, the commission rate (5% by default) and internal notes. None of this is ever sent to public pages.

## Things to do before launch

- Fill in the bracketed items on the privacy notice (`src/app/privacy/page.tsx`) and have it reviewed.
- Write the one-page listing agreement for venues (photo rights, data accuracy, 5% commission on confirmed corporate bookings, how bookings are reported).
- Confirm the contact email setting and the form notifications.

## Good to know

- The venue data lives in Netlify Blobs, not in Git. Deploying new code does not touch it. Netlify keeps no backup you can restore from, so consider exporting the data now and then.
- Public pages are cached for five minutes and refresh immediately when you save in Admin.
- Photo files have random, permanent addresses. A photo of an unpublished venue can be opened by anyone who has its exact address, which cannot be guessed.
- `llms.txt`, `sitemap.xml` and structured data are generated from the published venues so search engines and AI assistants can read them.
- The admin area has a single shared password. If more people need access later, move to individual accounts.

## Project layout

- `src/app` pages, server actions (`actions`), photo upload API (`api`) and image route (`media`)
- `src/components` interface components
- `src/lib` storage, venue model, validation, sessions and helpers
- `public/__forms.html` static copies of the forms so Netlify can detect them
