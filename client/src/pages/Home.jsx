import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProducts } from '../context/ProductsContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { textures, categories } from '../data/content.js';
import { money } from '../lib/format.js';
import { ImagePlaceholder, ProductImage } from '../components/Placeholder.jsx';
import { priceRange, defaultVariant, cartLineFor } from '../lib/variants.js';
import Testimonials from '../components/Testimonials.jsx';
import Newsletter from '../components/Newsletter.jsx';

// Real IBCOCO campaign photography supplied by the client (client/public/hero/).
// Each slide ships a 1920w desktop file plus an 800w mobile file (served via srcSet)
// so phones aren't downloading a full desktop-sized image.
const HERO = [
  {
    eyebrow: 'We Style, You Smile · Essex Wig Vendor',
    title: (
      <>
        Pure
        <br />
        <em>Luxury.</em>
      </>
    ),
    text: 'IBCOCO is handpicked human hair for women who refuse to be ordinary. Every unit selected for texture, density and finish.',
    primary: { label: 'Shop The Collection', to: '/shop' },
    secondary: { label: 'Our Story', to: '/about' },
    chip: { strong: '100%', text: 'human hair, worldwide shipping' },
    image: '/hero/hero-1.jpg',
    imageMobile: '/hero/hero-1-mobile.jpg',
    alt: 'Two women wearing sleek IBCOCO straight and side-part units',
  },
  {
    eyebrow: 'New In · Limited Restock',
    title: (
      <>
        The Deep Curl
        <br />
        <em>Edit Has Landed</em>
      </>
    ),
    text: 'Full, defined coils with real bounce — hand-selected for volume and worn straight out of the pack. Only a few units per length.',
    primary: { label: 'Shop Deep Curl', to: `/shop?texture=curly&category=${textures.curly.category}` },
    secondary: { label: 'Find Your Texture', anchor: 'finder' },
    chip: { strong: 'New', text: 'restocked regularly' },
    image: '/hero/hero-2.jpg',
    imageMobile: '/hero/hero-2-mobile.jpg',
    alt: 'Woman wearing a soft wavy IBCOCO unit, hand at her chin',
  },
  {
    eyebrow: 'Not Just Hair · A Standard',
    title: (
      <>
        The Right Hair
        <br />
        <em>Changes Everything</em>
      </>
    ),
    text: 'Not just how you look. How you walk. How you enter. How you leave. We curate premium human hair for women who understand that luxury is a feeling, not a price point.',
    primary: { label: 'Shop The Edit', to: '/shop' },
    secondary: { label: 'Get In Touch', to: '/contact' },
    chip: { strong: '4+', text: 'collections, worldwide shipping' },
    image: '/hero/hero-3.jpg',
    imageMobile: '/hero/hero-3-mobile.jpg',
    alt: 'Three women wearing different IBCOCO units, styled together',
  },
];

function HeroCTA({ btn, className }) {
  const navigate = useNavigate();
  const { setBookOpen } = useUI();
  if (btn.to) return <Link className={className} to={btn.to}>{btn.label}</Link>;
  if (btn.action === 'book')
    return (
      <button className={className} onClick={() => setBookOpen(true)}>
        {btn.label}
      </button>
    );
  return (
    <button className={className} onClick={() => document.getElementById(btn.anchor)?.scrollIntoView({ behavior: 'smooth' })}>
      {btn.label}
    </button>
  );
}

// Shared product-rail block used by the Bestsellers and New In sections below.
function ProductRail({ id, eyebrow, heading, note, products, addToBag }) {
  if (!products.length) return null;
  return (
    <section className="products section tight" id={id}>
      <div className="wrap">
        <div className="rail-head">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2>{heading}</h2>
          </div>
          <p>{note}</p>
        </div>
        <div className="prod-scroll">
          {products.map((p, i) => {
            const range = priceRange(p);
            return (
              <article className="prod-card" key={p.id}>
                <Link to={`/product/${p.id}`} className={'prod-thumb p' + (i % 4)}>
                  <ProductImage product={p} className="bg" />
                  {p.badge && <span className="prod-badge">{p.badge}</span>}
                </Link>
                <div className="prod-info">
                  <Link to={`/product/${p.id}`}><h4>{p.name}</h4></Link>
                  <div className="prod-stars">★★★★★</div>
                  <div className="prod-price">
                    {p.oldPrice && <span className="was">{money(p.oldPrice)}</span>}
                    {range.min !== range.max ? `From ${money(range.min)}` : money(range.min)}
                  </div>
                  <button className="quick quick-static" onClick={() => addToBag(p)}>Add to Bag</button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// Shared category-tile rail used by "Shop By Category" and the smaller category
// spotlight further down the page.
function CategoryRail({ id, eyebrow, heading, note, items, images }) {
  if (!items.length) return null;
  return (
    <section className="section cat-section" id={id}>
      <div className="wrap">
        <div className="rail-head">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h2>{heading}</h2>
          </div>
          <p>{note}</p>
        </div>
        <div className="cat-scroll">
          {items.map((c, i) => (
            <Link key={c.key} to={`/shop?category=${c.key}`} className={'cat-card cc' + (i % 4)}>
              {images?.[c.key] ? (
                <img className="bg" src={images[c.key]} alt={c.label} />
              ) : (
                <ImagePlaceholder className="bg" label={`${c.label} — category photo`} />
              )}
              <div className="cat-label">
                <span className="eyebrow">From {money(c.from)}</span>
                <h3>{c.label}</h3>
                <span>Shop {c.label.split(' ')[0]} →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const coreCategories = categories.filter((c) => c.filter === 'category');
const spotlightCategories = categories.filter((c) => ['donor-unit', 'bob', 'fringe'].includes(c.key));

export default function Home() {
  const settings = useSettings();
  const [slide, setSlide] = useState(0);
  const [texture, setTexture] = useState('straight');
  const { products } = useProducts();
  const { add } = useCart();
  const setToast = useToast();

  useEffect(() => {
    const t = setInterval(() => setSlide((x) => (x + 1) % HERO.length), 6500);
    return () => clearInterval(t);
  }, []);

  const addToBag = (p) => {
    const variant = defaultVariant(p);
    add(cartLineFor(p, variant));
    setToast(variant ? `${p.name} (${variant.length || ''} ${variant.color || ''}) added to your bag`.replace(/\s+/g, ' ') : `${p.name} added to your bag`);
  };

  const h = HERO[slide];
  // An admin-uploaded replacement (Settings → Homepage Hero Slides) overrides the shipped
  // photo for that slide. It's used for both the desktop and mobile <img> sources since we
  // don't generate a separate compressed mobile copy of whatever gets uploaded there — only
  // the original 3 shipped photos have that dedicated small mobile file.
  const heroOverride = settings.heroImages?.[slide];
  const heroImg = heroOverride || h.image;
  const heroImgMobile = heroOverride || h.imageMobile;
  // "Bestseller" here is an editorial pick, not a sales-ranked claim — there's no real
  // order history yet to rank by. Swap the `bestseller` tags in server/data/db.json for
  // real top sellers once you have sales data.
  const bestsellers = products.filter((p) => (p.tags || []).includes('bestseller'));
  const newIn = products.filter((p) => (p.tags || []).includes('new'));

  return (
    <>
      <section className="hero-slider" id="hero">
        <div className="hero-media">
          <img
            className="hero-photo"
            src={heroImg}
            srcSet={`${heroImgMobile} 800w, ${heroImg} 1920w`}
            sizes="(min-width: 980px) 58vw, 100vw"
            alt={h.alt}
            loading="eager"
            fetchpriority="high"
          />
        </div>
        <div className="hero-panel">
          <span className="eyebrow">{h.eyebrow}</span>
          <h1>{h.title}</h1>
          <p>{h.text}</p>
          <div className="hero-btns">
            <HeroCTA btn={h.primary} className="btn gold" />
            <HeroCTA btn={h.secondary} className="btn light" />
          </div>
          <div className="hero-chip">
            <strong>{h.chip.strong}</strong> — {h.chip.text}
          </div>
          <div className="hero-controls">
            <div className="hero-arrows">
              <button aria-label="Previous slide" onClick={() => setSlide((slide + HERO.length - 1) % HERO.length)}><ChevronLeft /></button>
              <button aria-label="Next slide" onClick={() => setSlide((slide + 1) % HERO.length)}><ChevronRight /></button>
            </div>
            <div className="hero-dots">
              {HERO.map((_, i) => (
                <button key={i} aria-label={`Go to slide ${i + 1}`} className={slide === i ? 'active' : ''} onClick={() => setSlide(i)} />
              ))}
            </div>
            <span className="hero-count">
              <strong>{String(slide + 1).padStart(2, '0')}</strong> / 0{HERO.length}
            </span>
          </div>
        </div>
      </section>

      <ProductRail
        id="bestsellers-top"
        eyebrow="Bestsellers"
        heading="The Most Requested"
        note="Editor picks across the collection — a mix worth starting with."
        products={bestsellers}
        addToBag={addToBag}
      />

      <CategoryRail
        id="categories"
        eyebrow="Shop By Category"
        heading="Curated For Every Crown"
        note={`${coreCategories.length} edits, each hand-finished before it ever reaches your door.`}
        items={coreCategories}
        images={settings.categoryImages}
      />

      <ProductRail
        id="new-in"
        eyebrow="New In"
        heading="Just Landed"
        note="The latest additions to the edit — restocked and freshly listed."
        products={newIn}
        addToBag={addToBag}
      />

      <section className="finder section tight" id="finder">
        <div className="wrap finder-grid">
          <div className="finder-copy">
            <span className="eyebrow">Not Sure Where To Start?</span>
            <h2>Find Your Texture Match</h2>
            <p>Every head of hair is different. Pick the texture closest to your own, or the one you're dreaming of, and we'll point you to the right edit.</p>
            <div className="swatches">
              {Object.entries(textures).map(([k, v]) => (
                <button key={k} className={'swatch ' + (texture === k ? 'active' : '')} onClick={() => setTexture(k)}>
                  <span className={'swatch-dot ' + k} />
                  <div>
                    <strong>{v.title}</strong>
                    <span>{v.sub}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="finder-result">
            <span className="eyebrow">Your Match</span>
            <h3>{textures[texture].title}</h3>
            <p>{textures[texture].text}</p>
            <Link className="btn gold" to={`/shop?texture=${texture}&category=${textures[texture].category}`}>Shop This Texture</Link>
          </div>
        </div>
      </section>

      <CategoryRail
        id="more-categories"
        eyebrow="More To Explore"
        heading="The Specialist Edit"
        note="Donor units, bobs and fringes — grouped from the current catalogue."
        items={spotlightCategories}
        images={settings.categoryImages}
      />

      <section className="editorial" id="editorial">
        <div className="wrap ed-grid">
          <div className="ed-quote">
            <span className="eyebrow">The IBCOCO Philosophy</span>
            <p>
              <span className="dropcap">N</span>ot just how your hair looks. <em>How you feel</em> the moment you put it on — how you walk, how you enter a room, how you leave it.
            </p>
            <div className="ed-sig">— IBCOCO</div>
          </div>
          <div className="ed-stat">
            <strong>100%</strong>
            <span>Human Hair, Handpicked</span>
          </div>
        </div>
      </section>

      <section className="about section" id="about-teaser">
        <div className="wrap about-grid">
          <div className="about-media"><ImagePlaceholder label="IBCOCO Quality Hairs atelier — photo" src={settings.siteImages?.homeAtelier} /></div>
          <div className="about-copy">
            <span className="eyebrow">Our Story</span>
            <h2>Not Just Hair. A Standard.</h2>
            {/* Placeholder narrative built from IBCOCO's own live-site copy — confirm the exact founding story with the client before launch. */}
            <p>We curate premium human hair for women who understand that luxury is a feeling, not a price point. Every unit is handpicked for texture, density and finish — IBCOCO delivers the same standard of excellence to your door.</p>
            <Link className="btn ghost" to="/about">Read Our Story</Link>
            <div className="about-stats">
              <div><strong>100%</strong><span>Human Hair</span></div>
              <div><strong>4+</strong><span>Collections</span></div>
              <div><strong>Worldwide</strong><span>Shipping</span></div>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />

      <section className="section ig-feed" id="instagram">
        <div className="wrap">
          <div className="rail-head">
            <div>
              <span className="eyebrow">Follow Along</span>
              <h2>@imbycoco on Instagram</h2>
            </div>
            <a className="btn ghost" href="https://instagram.com/imbycoco" target="_blank" rel="noreferrer">Follow Us</a>
          </div>
          {/* Live Elfsight Instagram Feed widget — configured at elfsight.com, script loaded in index.html */}
          <div className="elfsight-app-7c7176ff-a523-4218-a810-35ab372943bd" data-elfsight-app-lazy></div>
        </div>
      </section>

      <Newsletter id="join" />
    </>
  );
}
