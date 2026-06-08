# Post-Launch Checklist — Rank #1 for "Julianna Head"

The code changes (copy + schema) are only half the job. These are the steps that actually get you found, indexed, and ranked. Work top to bottom; the early items unlock the later ones.

---

## Phase 1 — Before / right after you deploy

- [ ] **Confirm the site is live and indexable.** Visit juliannahead.com and view source. Make sure there's no `<meta name="robots" content="noindex">` anywhere, and that robots.txt isn't blocking the homepage.
- [ ] **Pick one canonical URL.** Decide on `https://juliannahead.com` (no www) or `https://www.juliannahead.com` — not both. Set up a 301 redirect from the version you don't use, and confirm your canonical tags point to the chosen one. Two competing versions split your ranking signal.
- [ ] **Validate the schema.** Run the homepage through https://validator.schema.org and https://search.google.com/test/rich-results. Fix any errors before moving on.
- [ ] **Confirm the visible FAQ is on the page** (not just in the schema). Google ignores FAQ schema that has no matching visible content.

---

## Phase 2 — Tell Google you exist (this is what triggers ranking)

- [ ] **Set up Google Search Console** at https://search.google.com/search-console. Add juliannahead.com as a property and verify ownership (DNS verification is the most durable method).
- [ ] **Submit your sitemap** (`https://juliannahead.com/sitemap.xml`) under the Sitemaps section.
- [ ] **Use URL Inspection → Request Indexing** on your homepage. This pushes Google to crawl it now instead of waiting.
- [ ] **Set up Bing Webmaster Tools** at https://www.bing.com/webmasters too. Bing powers some AI answer engines, so it matters more than its market share suggests. You can import directly from Search Console.

> Reality check: a brand-new domain can take anywhere from a few days to a few weeks to index and start ranking. Don't panic if you're not #1 on day one.

---

## Phase 3 — Lock in your identity (the entity signal)

This is the single biggest lever for ranking on your own name. Google needs to see one consistent "Julianna Head" across the web.

- [ ] **Make your social links reciprocal.** Your schema's `sameAs` already points to:
  - https://www.linkedin.com/in/juliannahead
  - https://github.com/juliannahead

  Now go to each profile and make sure it **links back to juliannahead.com** (LinkedIn → Contact info / Website field; GitHub → profile bio + website field). The two-way link is what confirms you're a single entity.
- [ ] **Use the exact same name and title everywhere.** "Julianna Head" and "Digital Operations & Growth Architect" on the site, LinkedIn headline, and GitHub bio. Consistency builds the entity; variation dilutes it.
- [ ] **Add a profile photo when you have one.** Use the *same* headshot on the site, LinkedIn, and GitHub. Then add it to the schema (`image` property in the Person and ProfessionalService blocks). A consistent face across profiles is a strong entity signal and helps qualify you for a Google Knowledge Panel.

---

## Phase 4 — AEO / GEO (show up in AI answers)

- [ ] **Confirm AI crawlers are allowed** in robots.txt: GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot should NOT be disallowed. If they're blocked, you can't appear in AI answers.
- [ ] **Confirm `llms.txt` is live** at `https://juliannahead.com/llms.txt`.
- [ ] **Test it.** After a week or two of being indexed, ask ChatGPT, Perplexity, and Google ("Who is Julianna Head?" / "Julianna Head Digital Operations") and see what comes back. Note what's wrong or missing — that tells you what content to strengthen.
- [ ] **Earn a few inbound links.** Even 2–3 links from your socials, a client site, a directory, or a guest post meaningfully speed up both ranking and AI visibility. Quality over quantity.

---

## Phase 5 — Monitor (set a recurring reminder)

- [ ] **Week 1–2:** Check Search Console → Pages to confirm the homepage is indexed ("Crawled" → "Indexed").
- [ ] **Week 2–4:** Search "Julianna Head" in an incognito window and note your position. Repeat weekly.
- [ ] **Ongoing:** In Search Console → Performance, watch which queries bring people in. If you're getting impressions for "Julianna Head" but not clicks, your title/meta description needs to be more compelling.
- [ ] **If something else outranks you for your name** (an old LinkedIn, a namesake): it usually resolves as your domain gains authority and links. Reciprocal social links + a couple of inbound links accelerate it.

---

## What success looks like

- Within a few weeks: juliannahead.com is indexed and appears on page one for "Julianna Head."
- Within 1–3 months: you're the #1 result for your name, with your socials filling out the rest of the first page.
- Bonus: a Google Knowledge Panel may appear once your entity (name + photo + consistent profiles + schema) is strong enough.

The honest part: the code and schema get you *eligible* to rank. Indexing, consistent profiles, and a little time are what get you *there*. Phases 2 and 3 are the ones that actually move the needle — don't skip them.
