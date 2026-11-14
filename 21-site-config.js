/* ============================================================
   WILLI'S PERFUME — SITE CONFIG (single source of truth)
   ------------------------------------------------------------
   Edit ONLY this file to set your real launch values.
   Every page reads these values at runtime (window.SITE_CONFIG),
   and the page generator (tools/generate-pages.js) reads them at
   build time — so after editing, run the generator again:
       node tools/generate-pages.js

   siteUrl  : your real domain, no trailing slash
              e.g. "https://www.yourdomain.com"
   ga4Id    : Google Analytics 4 Measurement ID
              e.g. "G-ABCDE12345"   (keep "G-XXXXXXXXXX" until you have it)
   pixelId  : Meta (Facebook) Pixel ID
              e.g. "1234567890123456"  (keep placeholder until you have it)
   whatsapp : WhatsApp number, international format, NO "+", NO spaces
              e.g. "201012345678"
   ============================================================ */
window.SITE_CONFIG = {
  siteUrl: "https://willis-perfume-one.vercel.app",
  ga4Id: "G-XXXXXXXXXX",
  pixelId: "1234567890123456",
  whatsapp: "201272566695"
};

/* Guard helper — every page skips loading trackers while the IDs are still
   placeholders, so no bogus analytics/pixel requests fire before launch:
   - GA4: keep "G-XXXXXXXXXX" (or anything containing XXXX) until ready.
   - Pixel: "1234567890123456" is the built-in placeholder — treat it as
     NOT configured. A real Meta Pixel ID is 15-16 digits and won't match. */

/* ============================================================
   OCCASION MAP — homepage "Choose your occasion" cards
   ------------------------------------------------------------
   Keyed by product id. A product may belong to "everyday",
   "evening", or both. Every current catalogue product is
   listed. A future product NOT listed here is unclassified:
   it stays visible under All but appears in neither
   occasion-specific view until it is classified here.
   Derived per perfume from its own catalogue data (season and
   style tags, fragrance family, scent profile): clean/fresh/
   formal profiles lean Work & Everyday; Night tag, warm/sweet/
   oud/heavy profiles lean Outings & Evening; versatile ones
   stay in both. Reviewed with the site owner.
   ============================================================ */
window.SITE_CONFIG.occasions = {
    "almond-praline": ["evening"],
    "amber-petal": ["evening"],
    "amber-ray": ["everyday", "evening"],
    "aqua-drive": ["everyday"],
    "basil-mist": ["everyday"],
    "berry-cloud": ["everyday", "evening"],
    "birch-peak": ["everyday", "evening"],
    "black-jasmine": ["evening"],
    "blue-temptation": ["evening"],
    "blush-aura": ["everyday", "evening"],
    "bourbon-plush": ["evening"],
    "candy-pop": ["everyday", "evening"],
    "caramel-cognac": ["evening"],
    "cedar-way": ["everyday"],
    "cherry-glaze": ["evening"],
    "chestnut-dream": ["evening"],
    "chocolate-shadow": ["evening"],
    "cinnamon-apple": ["evening"],
    "citrus-ink": ["everyday"],
    "coco-blossom": ["everyday", "evening"],
    "coconut-milk": ["everyday", "evening"],
    "cool-mint": ["evening"],
    "crimson-bloom": ["evening"],
    "dark-wood": ["evening"],
    "desert-wind": ["everyday", "evening"],
    "dew-field": ["everyday"],
    "ebony-gold": ["evening"],
    "evening-zest": ["everyday", "evening"],
    "fortune-rush": ["evening"],
    "fresh-orchard": ["everyday"],
    "frozen-oak": ["evening"],
    "ginger-fire": ["evening"],
    "golden-bloom": ["everyday", "evening"],
    "golden-heat": ["evening"],
    "green-pine": ["everyday"],
    "green-sprint": ["everyday"],
    "heavenly-bloom": ["everyday", "evening"],
    "honey-tobacco": ["evening"],
    "incense-crown": ["evening"],
    "iris-noir": ["everyday"],
    "lavender-hush": ["everyday", "evening"],
    "lotus-breeze": ["everyday"],
    "love-potion": ["everyday", "evening"],
    "mandarin-sky": ["evening"],
    "marshmallow-whip": ["everyday", "evening"],
    "midnight-blaze": ["evening"],
    "milky-amber": ["evening"],
    "mocha-night": ["everyday", "evening"],
    "musk-aura": ["everyday"],
    "noir-reserve": ["everyday", "evening"],
    "obsidian-amber": ["evening"],
    "ocean-fruit": ["everyday", "evening"],
    "orange-sun": ["everyday", "evening"],
    "oud-crown": ["evening"],
    "passion-oud": ["evening"],
    "peach-garden": ["everyday", "evening"],
    "pear-drop": ["everyday", "evening"],
    "peony-charm": ["everyday", "evening"],
    "pineapple-king": ["evening"],
    "pink-cream": ["everyday", "evening"],
    "pink-crush": ["evening"],
    "pure-orchid": ["everyday", "evening"],
    "raspberry-moon": ["everyday", "evening"],
    "rosemary-hill": ["everyday"],
    "royal-ember": ["evening"],
    "ruby-dune": ["evening"],
    "rum-leather": ["evening"],
    "saffron-flame": ["evening"],
    "sandal-rush": ["evening"],
    "scarlet-whisper": ["everyday", "evening"],
    "silk-veil": ["evening"],
    "silver-sage": ["everyday", "evening"],
    "smoke-nectar": ["evening"],
    "smoked-code": ["evening"],
    "smooth-vetiver": ["evening"],
    "snow-flower": ["everyday"],
    "solar-glow": ["evening"],
    "spice-leaf": ["evening"],
    "star-anise": ["everyday", "evening"],
    "sugar-lily": ["evening"],
    "sunset-cask": ["evening"],
    "sweet-rose": ["everyday", "evening"],
    "toffee-suede": ["evening"],
    "tonka-spell": ["evening"],
    "tropical-veil": ["everyday"],
    "tuberose-rain": ["evening"],
    "twilight-knight": ["evening"],
    "urban-pulse": ["everyday", "evening"],
    "vanilla-haze": ["everyday", "evening"],
    "velvet-muse": ["everyday", "evening"],
    "verbena-trail": ["everyday", "evening"],
    "violet-pepper": ["evening"],
    "whiskey-cacao": ["evening"],
    "white-code": ["everyday"],
    "wild-magnolia": ["everyday", "evening"],
    "woody-pulse": ["everyday"]
};

window.SITE_CONFIG.isAnalyticsReady = function (kind) {
  var id = this[kind];
  if (!id || typeof id !== "string") return false;
  if (kind === "ga4Id") return /^G-[A-Z0-9]{4,}$/i.test(id) && id.indexOf("XXXX") === -1;
  if (kind === "pixelId") return /^[0-9]{15,16}$/.test(id) && id !== "1234567890123456";
  return false;
};