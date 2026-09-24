// `category` scopes "Shop This Texture" to the Wigs category (rather than mixing in
// care products / closures) — the current catalogue's texture tagging is mostly
// unconfirmed per-product (see server/data/db.json), so this keeps results relevant
// until real per-product textures are supplied and the texture filter alone can do it.
export const textures = {
  straight: {
    title: 'Silk Straight',
    sub: 'Sleek, glass-like finish',
    text: 'Bone-straight, low-maintenance wear that holds through humidity. Every unit is 100% raw human hair, hand-finished for a natural glass-like finish.',
    category: 'wigs',
  },
  wavy: {
    title: 'Body Wave',
    sub: 'Soft, bouncy movement',
    text: 'Soft, natural movement that layers beautifully and blends easily with most natural hair textures. Low upkeep, holds a curl if you want more definition.',
    category: 'wigs',
  },
  curly: {
    title: 'Deep Curl',
    sub: 'Full, defined coils',
    text: 'Full, defined coils with real bounce and volume — a favourite for special occasions and clients wanting maximum texture without daily styling.',
    category: 'wigs',
  },
};

// "from" prices are derived from the current catalogue in server/data/db.json.
// Each entry filters the shop either by `category` (the product's main category)
// or by `tag` (a cross-cutting grouping — see the `tags` array on each product).
// "New In" and the three groupings below (Donor Units / Bob Wigs / Fringe Units) are
// real groupings pulled from the actual product names/upload dates, not fabricated
// marketing categories — recheck against server/data/db.json if the catalogue changes.
export const categories = [
  { key: 'new', label: 'New In', from: 155, filter: 'tag' },
  { key: 'wigs', label: 'Wigs', from: 150, filter: 'category' },
  { key: 'closures', label: 'Lace Fronts', from: 120, filter: 'category' },
  { key: 'bundles', label: 'Hair Bundles', from: 135, filter: 'category' },
  { key: 'care', label: 'Hair Products', from: 10, filter: 'category' },
  { key: 'donor-unit', label: 'Donor Units', from: 135, filter: 'tag' },
  { key: 'bob', label: 'Bob Wigs', from: 150, filter: 'tag' },
  { key: 'fringe', label: 'Fringe Units', from: 165, filter: 'tag' },
];

// The first 6 are verbatim from the live jeyharlem.com FAQ section (IBCOCO Quality
// Hairs), Sept 2026 — only the payment-methods answer was edited to match this build's
// Stripe checkout instead of the live site's Paystack/Verve setup. The remaining 9 are
// new, written for SEO/AEO/GEO (the phrasing matches real UK search & voice/AI-answer
// queries) but every fact in them is pulled from elsewhere in this codebase — Essex UK
// location and worldwide shipping (About/Contact/Footer), category "from" prices
// (data/content.js categories[]), texture names (textures{} above), and the texture
// finder / care guide / contact channels already built into the site. Nothing here is
// invented — confirm wording with IBCOCO before launch same as the original 6.
export const faqs = [
  {
    q: 'What types of hair do you sell?',
    a: 'At IBCOCO we offer a curated selection of premium human hair including full lace wigs, lace front wigs, hair bundles and closures. All units are available in a range of textures — straight, body wave, deep wave and curly — so every woman can find her perfect match.',
  },
  {
    q: 'Is the hair 100% human?',
    a: 'Absolutely. Every unit in the IBCOCO collection is crafted from 100% raw human hair — unprocessed, unblended and sourced to the highest quality standard. No synthetic fibres, no shortcuts. Just pure, premium hair that looks and feels completely natural.',
  },
  {
    q: 'Where is IBCOCO Quality Hairs based?',
    a: 'IBCOCO Quality Hairs is based in Essex, United Kingdom. We serve clients across the UK and ship worldwide, so you can shop the full collection online no matter where you are.',
  },
  {
    q: 'Do you ship UK-wide and internationally?',
    a: 'Yes. We ship across the whole of the UK and worldwide. Every order includes a tracking number as soon as it is confirmed, so you can follow your parcel from our Essex atelier to your door.',
  },
  {
    q: 'How long does UK delivery take?',
    a: 'Standard delivery typically takes 3–5 working days. Express options are available at checkout for faster dispatch. You will receive a tracking number as soon as your order is confirmed so you can follow your parcel every step of the way.',
  },
  {
    q: "What's the difference between Silk Straight, Body Wave and Deep Curl?",
    a: 'Silk Straight is a bone-straight, low-maintenance finish that holds through humidity. Body Wave gives soft, bouncy movement that blends easily with natural hair. Deep Curl is full, defined coils with real bounce for maximum texture. Use the "Find Your Texture Match" tool on our homepage to see which suits you.',
  },
  {
    q: 'What wig types and units do you offer?',
    a: 'Our range includes full lace wigs, lace front wigs, HD closures, donor units, bob wigs and fringe units — all crafted from 100% raw human hair across our Wigs, Lace Fronts and Hair Bundles categories.',
  },
  {
    q: 'What are Donor Units, Bob Wigs and Fringe Units?',
    a: 'Donor Units are single-donor human hair pieces prized for consistent texture and colour from one source. Bob Wigs are our shorter, chin-to-shoulder length units. Fringe Units come with a built-in fringe/bang for an instant, low-maintenance style change.',
  },
  {
    q: 'How much do IBCOCO wigs and hair bundles cost?',
    a: 'Prices start from £150 for wigs, £120 for lace fronts, £135 for hair bundles and donor units, £150 for bob wigs, £165 for fringe units, and £10 for hair care products — browse the full shop for current pricing on each unit.',
  },
  {
    q: 'How do I care for my wig?',
    a: 'To keep your IBCOCO unit looking its best, wash with a sulphate-free shampoo and condition regularly. Always detangle gently from ends to roots using a wide-tooth comb. Avoid excessive heat and store on a wig stand when not in use. With proper care your unit can last 12 months or more.',
  },
  {
    q: 'How long will my hair unit last with proper care?',
    a: 'With proper care — gentle detangling, sulphate-free washing and storage on a wig stand — an IBCOCO 100% raw human hair unit can last 12 months or more.',
  },
  {
    q: 'What is your return and refund policy?',
    a: 'We accept returns within 7 days of delivery provided the item is unworn, unaltered and in its original packaging. Due to hygiene reasons we are unable to accept returns on worn units. If you receive a damaged or incorrect item please contact us within 48 hours and we will make it right.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major debit and credit cards including Visa and Mastercard, processed securely through Stripe. All transactions are fully encrypted and secure. (Placeholder — the live site also offers Paystack/Verve; confirm with IBCOCO whether those should be added to this build.)',
  },
  {
    q: 'Can I pay by bank transfer?',
    a: "Card payment via Stripe is our standard checkout. Bank transfer is available on request where enabled — check the payment options at checkout or contact us to ask.",
  },
  {
    q: 'How do I contact IBCOCO Quality Hairs or book a consultation?',
    a: 'Message us on WhatsApp at +44 7506 297286, use the contact form on our Contact page, or find us on Instagram and TikTok @IBCOCO. You can also book a consultation directly through the site.',
  },
];

export const careGuides = [
  {
    title: 'Washing & Conditioning Your Wig',
    excerpt: 'Wash with a sulphate-free shampoo and condition regularly — detangle gently from ends to roots with a wide-tooth comb before you start.',
    video: true,
  },
  {
    title: 'Styling Without Heat Damage',
    excerpt: "Avoid excessive heat to protect your investment. Placeholder guide — replace with IBCOCO's full styling walkthrough.",
    video: false,
  },
  {
    title: 'Storing Your Hair Between Wears',
    excerpt: "Store on a wig stand when not in use. With proper care a unit can last 12 months or more. Placeholder guide — expand with IBCOCO's storage tips.",
    video: false,
  },
];
