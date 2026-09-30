import { useEffect, useRef, useState } from 'react'
import { AppChrome } from './AppChrome'
import { ItemSheet } from './ItemSheet'
import { BrandLogo } from '../ios/BrandLogo'
import { HalalMark, isHalal } from '../ios/HalalMark'
import { BrandClip } from './BrandClip'
import { ItemThumb } from '../ios/ItemThumb'
import { brandById } from '../data/brands'
import { citiesOf, seatsOf } from '../data/seats'
import { Symbol } from '../ios/ui/Symbol'
import { takeOrigin, track } from '../lib/track'
import { useInPreview } from '../ios/preview'
import { readableOn } from '../ios/contrast'
import { isFavorite, toggleFavorite } from '../lib/favorites'
import { EMPTY_SIGNALS, formatCount, readSignals, sendSignal } from '../lib/signals'
import type { SignalKind, Signals } from '../lib/signals'
import type { MenuItem } from '../data/brands'
import type { BrandPanel } from '../data/localBrands'
import { money, useCart } from '../store/cart'
import type { ShellApi } from '../ios/Device'

/** What a kitchen, a café or a bar sells — pages where "consultation" is the wrong word.
    "bar" is bounded on both sides so CycleBar, a cycling studio, is not a bar. */
const FOOD_RX =
  /coffee|caf[eé]|\btea\b|boba|chicken|wing|burger|pizza|taco|taquer|thai|ramen|pho\b|sushi|bakery|bake|pastr|dessert|ice cream|grill|kitchen|restaurant|\bfood|bbq|barbecue|brunch|breakfast|lunch|dinner|deli|sandwich|catering|winery|\bwine|beer|brew|\bbar\b|lounge|juice|smoothie|yogurt|cookie|donut|pie\b|noodle|dumpling|seafood|steak|meat|butcher|market|grocer|vietnam|indian|greek|persian|mediterranean|hot pot|californian|chinese|cantonese|japanese|korean|mexican|italian|filipino|peruvian|distiller|bottle shop|charcuterie|grazing/i
/* What an online shop sells: goods posted from their own store, not booked. */
const SHOP_RX = /jumpsuit|swimwear|life jacket|supplement|dog bed|boots|camera|drying bag|backpack|travel bottle|clothing|streetwear|pet goods|apparel/i
import { Gem } from './MembersApp'
import { FREE_SPOT_MONTHS } from '../data/affiliateTiers'

/** One restaurant's menu — the screen an icon tap actually lands on. */
/**
 * A drop-down on a business's page: its heading, and what is under it.
 *
 * His ask for Butter Pecan, 2026-08-30: "get the top 3 cookies pictures to
 * drop down when you press the button. No need for price or anything." The
 * pictures are the business's own product photographs, so they are shown at
 * the size those files actually are — theirs are cut-outs about 250px across,
 * and blowing one up to fill a phone is how a real photo starts looking fake.
 *
 * DECLARED AT MODULE SCOPE. A component declared inside a render body is a new
 * function every render, so React remounts it and its state resets — that was
 * the About-page glitch, and tools/audit-nested-components.mjs fails the build
 * over it now.
 */
function BrandPanels({ panels }: { panels?: BrandPanel[] }) {
  const [open, setOpen] = useState<string | null>(null)
  if (!panels?.length) return null
  return (
    <div className="brand-panels">
      {panels.map((p) => {
        const isOpen = open === p.head
        return (
          <div className={`brand-panel${isOpen ? ' is-open' : ''}`} key={p.head}>
            <button
              type="button"
              className="brand-panel-head"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : p.head)}
            >
              <span>{p.head}</span>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="brand-panel-chev">
                <path d="M7 10l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {isOpen && (
              <div className="brand-panel-body">
                {p.photos && (
                  <ul className="brand-panel-photos">
                    {p.photos.map((ph) => (
                      <li key={ph.src}>
                        <img src={`/food/${ph.src}`} alt={ph.alt} loading="lazy" />
                        {ph.caption && <span>{ph.caption}</span>}
                      </li>
                    ))}
                  </ul>
                )}
                {p.body?.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function BrandApp({ brandId, api }: { brandId: string; api: ShellApi }) {
  const brand = brandById(brandId)
  const cart = useCart()
  const [sheetItem, setSheetItem] = useState<MenuItem | null>(null)
  const [shared, setShared] = useState(false)
  /*
    Read once at mount rather than on every render: localStorage is synchronous
    and this screen re-renders on every scroll of the menu below it.
  */
  /* brand?.id, not brand.id — brandById can return undefined and the guard for
     that is below these hooks, which cannot move above them. */
  const [starred, setStarred] = useState(() => isFavorite(brand?.id ?? ''))
  /*
    The counts the operator asked for, three times. They come from the server
    because a favourite used to be localStorage — real for the one phone that
    set it and meaningless to the business being shown the number.

    `null` until the first read lands, so a page never flashes a zero it has not
    actually checked.
  */
  const [signals, setSignals] = useState<Signals | null>(null)
  useEffect(() => {
    let live = true
    if (!brand?.id) return
    void readSignals(brand.id).then((s) => { if (live) setSignals(s) })
    return () => { live = false }
  }, [brand?.id])

  /*
    WHAT PEOPLE DO HERE (src/lib/track.ts): the open, with where it came from
    (a tile, a search result, a shared link), how long they stayed, and every
    way out: a call, directions, their site, their ordering, their Instagram.
    Never from a card in the app switcher, which is a picture of the page.
  */
  const preview = useInPreview()
  useEffect(() => {
    if (preview || !brand?.id) return
    const id = brand.id
    track('business_opened', { brand: id, ...takeOrigin(id) })
    const opened = Date.now()
    return () => track('business_closed', { brand: id, dwell_ms: Date.now() - opened })
  }, [brand?.id, preview])
  const out = (kind: string) => () => {
    if (!preview && brand?.id) track('outbound_clicked', { brand: brand.id, kind })
  }
  /* What the site button is for, by what it says: "Order online", "Book", or their site. */
  const siteKind = /order/i.test(brand?.siteCta ?? '') ? 'order' : /book|reserve|appoint/i.test(brand?.siteCta ?? '') ? 'booking' : 'website'

  const tap = async (kind: SignalKind) => {
    if (!brand?.id) return
    // Optimistic, then corrected by the server's own answer: a tap that waits on
    // a round trip feels broken on a phone.
    setSignals((prev) => {
      const base = prev ?? EMPTY_SIGNALS
      if (kind === 'share' && base.mine.share) return base
      const on = kind !== 'share' && base.mine[kind]
      return {
        counts: { ...base.counts, [kind]: Math.max(0, base.counts[kind] + (on ? -1 : 1)) },
        mine: { ...base.mine, [kind]: !on },
      }
    })
    const fresh = await sendSignal(brand.id, kind)
    if (fresh) setSignals(fresh)
  }
  /** The week's picks, collapsed by default. See the bar below. */
  const [picksOpen, setPicksOpen] = useState(false)
  /** Their video, behind a bar — see the clip block below. */
  const [clipOpen, setClipOpen] = useState(false)
  /** The whole menu, behind a bar — his ask of 2026-09-09. See below. */
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeCat, setActiveCat] = useState(0)
  const bodyRef = useRef<HTMLDivElement>(null)

  if (!brand) return null

  /*
    WHICH TIER THIS PAGE IS DRAWN AT. See Brand.tier for his rule. Unset is
    the whole page; 1 is the free listing — name, address and contact details,
    the link — and everything below that reads the tier before it renders.
  */
  const tier = brand.tier ?? 3
  const film = tier >= 3 ? brand.clip?.src : undefined
  /* The pages its tile is on: the first is the button at the top right, and a
     business in several cities also gets a row per city below. See seats.ts. */
  const place = seatsOf(brand.id)[0]
  const cities = citiesOf(brand.id)
  const menuCount = brand.menu.reduce((n, c) => n + c.items.length, 0)

  const inCart = cart.countForBrand(brand.id)
  /*
    The week's three, taken from the MENU rather than from a new field.

    `offer` on a seed is already the operator's stocked subset — it is the
    filter that decides which of a partner's items are carried at all, which is
    exactly the list he means by "top 3 favorites of the week". Reading the
    built menu means the bar can never disagree with the prices under it, and
    his lists (Bula's mince, pot roast and brisket; any 3 cookies) need no
    second place to live.
  */
  const picks = brand.menu.flatMap((c) => c.items).slice(0, 3)
  // Header text must be chosen from the tint, not assumed white — several
  // brands use light plates and were rendering white-on-white.
  const ink = readableOn(brand.logo.bg)

  const jump = (i: number) => {
    setActiveCat(i)
    const el = bodyRef.current?.querySelector(`#cat-${brand.menu[i].id}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <AppChrome
        title={brand.name}
        /*
          HOME IS BEASTY • GOODS. Glenn, 2026-09-24: "when you tap HOME on
          anyone's page it goes directly to BEASTY • Goods as the HOME page".
          It used to return to whichever page the home screen was on, so from a
          city tile it went back to that city. The button opposite now covers
          "the page this business is on"; Home always means the front page.
        */
        onBack={() => api.goToCity('BEASTY')}
        tint={brand.logo.bg.split('|')[0]}
        className={place ? 'has-place' : undefined}
        right={
          <>
            {/*
              TO THE PAGE ITS TILE IS ON, opposite Home. Glenn's mockup of
              2026-09-23: "Union City • Goods >" at the top right of The Une's
              page. Home returns to wherever the home screen was, which from
              Search is BEASTY • Goods; this closes the page and lands on the
              page with the tile, so the rest of that city is one tap away.
            */}
            {place && (
              <button
                className="nav-place"
                onClick={() => {
                  if (!preview) track('place_navigated', { brand: brand.id, city: place.city, page_kind: place.kind, surface: 'nav_place' })
                  api.goToCity(place.city, brand.id)
                }}
                aria-label={`Go to the ${place.city} ${place.page} page`}
              >
                <span className="nav-place-text">
                  {place.city} • {place.page}
                </span>
                <Symbol name="chevron.right" size={15} weight={2.6} />
              </button>
            )}
            {inCart > 0 && (
              <button className="chrome-pill" onClick={() => api.openApp('sys.cart')}>
                {inCart}
              </button>
            )}
          </>
        }
        footer={
          cart.count > 0 ? (
            <button className="cartbar" onClick={() => api.openApp('sys.cart')}>
              <span className="cartbar-count">{cart.count}</span>
              <span className="cartbar-label">
                View cart
                {cart.brandCount > 1 && <em> · {cart.brandCount} kitchens</em>}
              </span>
              <span className="cartbar-total">{money(cart.totals.subtotal)}</span>
            </button>
          ) : null
        }
      >
        <div className="brand-body" ref={bodyRef}>
          <div
            className={`brand-hero${film ? ' has-film' : ''}`}
            style={{ background: heroBg(brand.logo.bg), color: ink.fg }}
          >
            {/*
              THEIR OWN FOOTAGE, BEHIND THE MARK.

              The operator asked "is it possible to add this video too?" and it
              first shipped as a card that opened Instagram. His follow-up is
              the better idea: play it here, instead of the flat colour.

              Muted, looping, playsinline, autoplay — the only combination iOS
              and Android will start without a tap, and the right one anyway: a
              band behind a logo that started making noise would be a fault.
              The poster paints first so the band is never briefly empty on a
              slow connection, and the whole thing is aria-hidden because it is
              decoration; the reel a customer can actually watch, with sound, is
              still the card further down.

              preload="none" would save bytes but defeat the point — the band
              would stay flat until the file arrived. "metadata" gets the poster
              and the first frames without pulling the whole clip up front.
            */}
            {film && (
              <div className="brand-film" aria-hidden="true">
                {/*
                  The poster is a real <img> UNDER the video, not the video's
                  own poster attribute. Two reasons: it paints while the clip is
                  still arriving, and it is what remains when prefers-reduced-
                  motion hides the video — that rule first shipped hiding the
                  film and leaving an empty band, because the fallback was a CSS
                  background nothing ever set.
                */}
                {brand.clip?.poster && <img className="brand-film-still" src={brand.clip.poster} alt="" />}
                <video
                  src={film}
                  poster={brand.clip?.poster}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  tabIndex={-1}
                />
                {/*
                  A scrim, not an opacity on the video. Dimming the film itself
                  would also dim it toward the page behind rather than toward
                  black, and the mark and tagline on top need a predictable
                  floor to stay legible against whatever frame is showing.
                */}
                <span className="brand-film-scrim" />
              </div>
            )}
            {/*
              STAR, beside Share — the operator's ask, and it closes a loop that
              already half existed: Recent fills itself from what you open and a
              star promotes a place into Favorites, which is how the two tabs on
              the landing screen differ. Until now the only way to star anything
              was from a Recent row, so a business you opened from search could
              not be kept at all.
            */}
            {/*
              One row, not three absolutely-positioned circles.

              The counts made the old layout impossible: each control was pinned
              to its own `right:` offset, and a number that grows from 0 to 1.2k
              changes the width of the thing it sits in. A flex row lets them size
              themselves and keeps the gaps even whatever the numbers say.
            */}
            <div className="brand-acts">
              {/*
                THE HEART, and the numbers beside all three.

                Both are his asks — "can you add a 🤍 button so users can like?"
                and "add the numerical count for all these buttons" — and he left
                the placement to me: "I'm not sure where you wanna put the ❤️.
                Use your best judgment."

                Heart, star, share, in that order, because that is the order of
                commitment: like it, keep it, send it to somebody. The heart goes
                first because it is the cheapest tap and the one most people will
                make, and putting the cheapest action nearest the thumb is what
                every app he is comparing this to does.
              */}
              <button
                className={`brand-like${signals?.mine.like ? ' is-on' : ''}`}
                onClick={() => void tap('like')}
                aria-pressed={!!signals?.mine.like}
                aria-label={signals?.mine.like ? `Unlike ${brand.name}` : `Like ${brand.name}`}
                style={{ color: ink.fg }}
              >
                <svg viewBox="0 0 24 24" width="19" height="19" fill={signals?.mine.like ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 20.3 4.7 13a4.6 4.6 0 0 1 0-6.5 4.6 4.6 0 0 1 6.5 0l.8.8.8-.8a4.6 4.6 0 0 1 6.5 0 4.6 4.6 0 0 1 0 6.5Z" />
                </svg>
                {signals && <span className="brand-act-n">{formatCount(signals.counts.like)}</span>}
              </button>
              <button
                className={`brand-star${starred ? ' is-on' : ''}`}
                onClick={() => {
                  /* Two things now: the server-side count an affiliate is shown,
                     and the local Favorites list the landing screen draws from.
                     They are deliberately separate — the list has to work with no
                     network, and the count has to be true across every device. */
                  void tap('favourite')
                  setStarred(
                    toggleFavorite({
                      brandId: brand.id,
                      name: brand.name,
                      cuisine: brand.cuisine,
                      /* The snapshot stores a COLOUR, not the logo object — see
                         favorites.ts: the landing screen draws this list and
                         pulling brand art in there would drag the whole catalogue
                         into the first chunk a customer downloads. */
                      color: brand.logo.bg.split('|')[0],
                    }),
                  )
                }}
                aria-pressed={starred}
                aria-label={starred ? `Remove ${brand.name} from favourites` : `Save ${brand.name} to favourites`}
                style={{ color: ink.fg }}
              >
                <svg viewBox="0 0 24 24" width="19" height="19" fill={starred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8Z" />
                </svg>
                {signals && <span className="brand-act-n">{formatCount(signals.counts.favourite)}</span>}
              </button>
              {/*
                Share, where a customer already is when they decide someone else
                needs to see this. Top-right of the hero rather than the foot of
                the menu: the moment you want to send a place to somebody is the
                moment you arrive, not after scrolling past nine prices.

                Web Share gives the real iOS sheet; the clipboard is the fallback
                on a desktop browser that has none.
              */}
              <button
                className="brand-share"
                onClick={async () => {
                  const url = `${location.origin}/?b=${encodeURIComponent(brand.id)}`
                  /* Counted before the sheet opens: iOS never tells the page
                     whether somebody actually sent it, so the honest thing to
                     count is the intent, once per person. */
                  void tap('share')
                  if (!preview) track('share_clicked', { brand: brand.id, surface: 'business_page' })
                  try {
                    if (navigator.share) await navigator.share({ title: brand.name, url })
                    else {
                      await navigator.clipboard.writeText(url)
                      setShared(true)
                      window.setTimeout(() => setShared(false), 2000)
                    }
                  } catch {
                    /* Sheet dismissed. Not an error worth a message. */
                  }
                }}
                aria-label={`Share ${brand.name}`}
                style={{ color: ink.fg }}
              >
                <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 15V3M12 3 8 7M12 3l4 4" />
                  <path d="M4 13v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
                </svg>
                {signals && <span className="brand-act-n">{formatCount(signals.counts.share)}</span>}
              </button>
            </div>
            {shared && (
              <span className="brand-share-toast" role="status">
                Link copied
              </span>
            )}
            <div className={`brand-hero-mark${brand.pageMark ? ' is-wordmark' : ''}`}>
              {/*
                A WIDE LOCKUP GETS TO BE WIDE. Where a business has given us
                their full wordmark, the page shows that rather than the square
                tile — see Brand.pageMark. The tile still exists and is still
                the icon on the home screen; this is the one place with room
                for the whole thing.
              */}
              {brand.pageMark ? (
                <img className="brand-hero-wordmark" src={brand.pageMark} alt={brand.name} />
              ) : (
                <BrandLogo logo={brand.logo} size={78} />
              )}
            </div>
            {/* No <h1> here: the nav large title already states the name, and
                two headings is the thing that reads as a web page. */}
            <p className="brand-tagline" style={{ color: ink.dim }}>
              {brand.tagline}
            </p>
            <div className="brand-meta" style={{ color: ink.dim }}>
              <span>{brand.cuisine}</span>
            </div>
            {/* prepMinutes is an estimate by category, not sourced, so it is
                hedged — and suppressed entirely where there is nothing to cook. */}
            {((brand.prepMinutes > 0 && !brand.contactOnly) || brand.dietary?.length) && (
              <div className="brand-chips">
                {brand.dietary?.map((d) => (
                  <span
                    className={isHalal([d]) ? 'chip chip-halal' : 'chip'}
                    key={d}
                    style={{
                      background: ink.isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)',
                      color: ink.fg,
                    }}
                  >
                    {/* The standard mark for every business that says it
                        serves halal — his ask of 2026-09-18. */}
                    {isHalal([d]) && <HalalMark size={15} />}
                    {d}
                  </span>
                ))}
                {brand.prepMinutes > 0 && !brand.contactOnly && (
                <span
                  className="chip"
                  style={{
                    background: ink.isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.08)',
                    color: ink.fg,
                  }}
                >
                  usually ~{brand.prepMinutes} min
                </span>
                )}
              </div>
            )}
          </div>

          {/*
            Where they are, and one tap to get there — the operator's ask, and
            the address was not on this page at all before it.

            Only when there IS a published address. A mobile business has no
            fixed place to be, and sending someone to navigate to a groomer who
            drives to them would be worse than showing nothing: the button is
            absent rather than disabled, because a greyed-out Directions button
            reads as a bug in the app rather than a fact about the business.
          */}
          {/*
            The other half of the mobile ring on the home screen: the ring says
            "this one is different", this says how. It stands in for the address
            block below rather than sitting beside it — a business that travels
            has no address to show and no directions to give, and saying so is
            more useful than an empty space where other pages have a map link.
          */}
          {!brand.address && /\bmobile\b/i.test(brand.cuisine) && (
            <p className="brand-mobile">
              <span className="brand-mobile-dot" aria-hidden="true" />
              Mobile — they come to you, so there is no shop to visit.
            </p>
          )}

          {brand.address && (
            <div className="brand-where">
              <p className="brand-address">{brand.address}</p>
              {tier >= 2 && (
              <a
                className="btn-secondary brand-directions"
                href={mapsHref(brand.address, brand.name)}
                target="_blank"
                rel="noreferrer"
                onClick={out('directions')}
                aria-label={`Directions to ${brand.name}`}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 21s7-6.4 7-11a7 7 0 1 0-14 0c0 4.6 7 11 7 11Z" />
                  <circle cx="12" cy="10" r="2.6" />
                </svg>
                Directions
              </a>
              )}
            </div>
          )}

          {/*
            HOURS, WHERE THEY PUBLISH ONE SCHEDULE. Directly under the address,
            because the two questions a person has about a place they are about
            to drive to are where it is and whether it is open. Never shown for
            a business whose own site disagrees with itself about them.
          */}
          {brand.hours && (
            <p className="brand-hours">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3.2 2" />
              </svg>
              {brand.hours}
            </p>
          )}

          {/*
            A PHONE NUMBER, WHEREVER THEY PUBLISH ONE.

            This used to appear only inside the contact block, which renders for
            a business with no menu or one whose work is quoted. So a restaurant
            with a full price list and a published telephone number had no way
            to be telephoned — Vegan Mob publishes (415) 513-5120 and the page
            showed it nowhere. A directory exists to connect somebody to a
            business; the number is the oldest way that happens.

            Not repeated for the two kinds that already carry it below.
          */}
          {brand.phone && !brand.contactOnly && !brand.quoteOnly && tier >= 3 && (
            <a
              className="brand-call"
              href={`tel:${brand.phone.replace(/[^0-9+]/g, '')}`}
              onClick={out('call')}
              aria-label={`Call ${brand.name}`}
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 3h3.5l1.8 4.4-2.2 1.6a12 12 0 0 0 5.9 5.9l1.6-2.2L20 14.5V18a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 3 5.2 2 2 0 0 1 5 3Z" />
              </svg>
              {brand.phone}
            </a>
          )}
          {/* The number as text, not a button: "direct-call phone button" is
              the Tier 3 perk, "contact information" is Tier 1. Tier 1 prints
              it in its own block further down. */}
          {brand.phone && !brand.contactOnly && !brand.quoteOnly && tier === 2 && (
            <p className="brand-call is-text">{brand.phone}</p>
          )}

          {/*
            A ROW PER CITY, for a business seated in more than one. Glenn,
            2026-09-23: from Search, Home went to BEASTY · Goods, and "it would
            work best if you had the option to go back to where that city of
            the business is". The button at the top right names one page; a
            business in several cities (Butter Pecan is in seven) lists them
            all here, in his city order, each landing on the page its tile is
            on. With one city the button says it all, so there are no rows.
          */}
          {cities.length > 1 && (
            <div className="brand-cities">
              {cities.map((c) => (
                <button
                  className="brand-city"
                  key={c}
                  onClick={() => {
                    if (!preview) track('place_navigated', { brand: brand.id, city: c, surface: 'city_row' })
                    api.goToCity(c, brand.id)
                  }}
                >
                  <span className="brand-city-mark" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M12 2.2a7.2 7.2 0 0 1 7.2 7.2c0 4.9-5.4 11-6.6 12.3a.8.8 0 0 1-1.2 0C10.2 20.4 4.8 14.3 4.8 9.4A7.2 7.2 0 0 1 12 2.2Zm0 4.4a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Z" />
                    </svg>
                  </span>
                  <span className="brand-city-text">
                    <strong>More in {c}</strong>
                    <em>Go to the {c} page</em>
                  </span>
                  <svg className="brand-city-chev" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m9 5 7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}

          {brand.pricesEstimated && (
            <p className="brand-review-flag">Prices need confirming — {brand.pricesEstimated}</p>
          )}
          {/*
            Above the menu, not below it.

            This flag used to render after the entire item list, so on the one
            brand whose menu is admittedly invented a customer read four prices
            first and the warning last. A caveat that arrives after the decision
            is decoration.
          */}
          {brand.needsOwnerReview && (
            <p className="brand-review-flag">
              Menu needs owner confirmation — {brand.needsOwnerReview}
            </p>
          )}

          {/*
            Their clip sits above the menu, under the caveats.

            It is the business showing you their own room and their own food,
            which is the thing a list of names and prices cannot do — but it
            goes after anything that qualifies the prices, because a caveat that
            arrives after the video is a caveat nobody read.
          */}
          {/*
            COLLAPSED, on his instruction: "the video clip would be a drop down
            to view the video so it doesn't take up the whole page."

            He is right about the cost. The clip renders as a full-bleed poster
            and on a phone it took most of a screen, which pushed the menu of
            the business it belongs to below the fold. Behind a bar it is one
            line until somebody wants it, and the bar says there is a video
            rather than making them scroll to find out.
          */}
          {brand.clip && tier >= 3 && (
            <div className="menu-picks brand-clip-drop">
              <button
                className={`menu-picks-bar${clipOpen ? ' is-open' : ''}`}
                onClick={() => setClipOpen((o) => !o)}
                aria-expanded={clipOpen}
              >
                {/* A reviewer's film says so on the bar — his 2026-09-09
                    protocol for "other food reviewers' videos". */}
                <span>{brand.clip.by ? `Watch a review by @${brand.clip.by}` : 'Watch their video'}</span>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {clipOpen && <BrandClip clip={brand.clip} logo={brand.logo} brand={brand.id} />}
            </div>
          )}

          {/*
            One photograph of the place, same slot and same reasoning as the
            clip: it shows the room, which a name and a price list cannot, and
            it sits after anything that qualifies what is above it.

            The credit is drawn, not hidden in a title attribute — it is their
            photograph. `alt` is real text rather than an empty decorative one,
            because this picture is carrying information about the business.
          */}
          {/*
            SEVERAL PICTURES, ONE AT A TIME. Glenn sent both slides of a Sin
            City Pits post: "post this on Sin City Pits page" for the first,
            and for the second "crop this and put it when you scroll to the
            right on their page." So this is a strip that snaps a picture at a
            time, the way the post he was looking at does, rather than a grid
            that shrinks both to thumbnails. Square, not 5:4: their posts are
            square and a 5:4 cover crop takes the flyer's headline off.
          */}
          {tier >= 2 && brand.photos?.length ? (
            <div className="brand-photos">
              <ul
                className="brand-photos-track"
                aria-label={`${brand.photos.length} pictures from ${brand.name}. Swipe sideways for the next.`}
              >
                {brand.photos.map((ph) => (
                  <li key={ph.src}>
                    <figure className="brand-photo is-square">
                      <img src={ph.src} alt={ph.alt} loading="lazy" decoding="async" />
                      <figcaption>{ph.credit}</figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
              {brand.photos.length > 1 && (
                <p className="brand-photos-hint">
                  {brand.photos.length} pictures. Swipe for the next.
                </p>
              )}
            </div>
          ) : (
            tier >= 2 && brand.photo && (
              <figure className="brand-photo">
                <img src={brand.photo.src} alt={brand.photo.alt} loading="lazy" decoding="async" />
                <figcaption>{brand.photo.credit}</figcaption>
              </figure>
            )
          )}

          {/* Says plainly that this is a selection, not their whole menu —
              which it is not, for every partner but top dog. */}
          {/*
            A BAR THAT DROPS DOWN, not a line of text — "make that 'Choose
            from…' a bar that drops down the top 3 favorites, so it can be out
            of the way." What it is getting out of the way OF is the offers
            below it, which are the reason a member opened this page.

            Collapsed by default and it names the count, so the bar says what is
            behind it rather than making anyone open it to find out. When a
            brand has no picks listed it stays the plain line it always was —
            there is nothing to drop down.
          */}
          {tier >= 2 && brand.menuNote &&
            (picks.length ? (
              <div className="menu-picks">
                <button
                  className={`menu-picks-bar${picksOpen ? ' is-open' : ''}`}
                  onClick={() => setPicksOpen((o) => !o)}
                  aria-expanded={picksOpen}
                >
                  <span>{brand.menuNote}</span>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {/*
                  THE ITEMS, NOT JUST THEIR NAMES. His instruction: "include
                  these menu items on the drop-down for the top three favorites
                  as a standard." A list of three bare names is a teaser for a
                  menu that is already on the same page; with the price beside
                  each one the bar is worth opening on its own.

                  A brand that quotes rather than sells shows no figure, the
                  same as its rows further down — priceLabel carries the range
                  where there is one.
                */}
                {picksOpen && (
                  <ul className="menu-picks-list">
                    {picks.map((it) => (
                      <li key={it.id}>
                        <span className="menu-picks-name">{it.name}</span>
                        {!brand.quoteOnly && (
                          <span className="menu-picks-price">
                            {it.priceLabel ?? money(it.price)}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="menu-note">{brand.menuNote}</p>
            ))}

          {/*
            What this business gives BEASTY members.

            OVER THE MENU, ON HIS INSTRUCTION AND AGAINST THE EARLIER ONE. It
            sat under the menu on the argument that someone who opened a
            kitchen came for the food. He overruled it with a reason about the
            business rather than the page: "as soon as they enter the page the
            first thing they see will be the welcome offers without having to
            scroll down… I imagine users will skim through everyone's page just
            to view the offers with their low attention span."

            That is what the membership is sold on, so it goes first.
          */}
          {tier >= 2 && (brand.offers?.welcome || brand.offers?.loyalty) && (
            <div className={`brand-offers${brand.offers.mock ? ' is-mock' : ''}`}>
              {/*
                A mockup says so, at the top, before the terms it is mocking.

                The operator asks to see what an offer would look like on a new
                partner's page. Rendered identically to an agreed one, that
                design is how a customer ends up asking a counter to honour
                something the business never promised — so it is labelled, and
                the label is the first thing in the block rather than a footnote
                under it.
              */}
              {brand.offers.mock && (
                <p className="brand-offer-mock">
                  Example only — {brand.name} has not agreed these. This is what an offer would
                  look like here.
                </p>
              )}
              {brand.offers.welcome && (
                <div className="brand-offer">
                  <span className="brand-offer-head">
                    <Gem size={15} />
                    <span className="brand-offer-title">Welcome offer</span>
                    {/* "Jojo's HC x @TheSnackSensei" — in red, where his
                        markup put it. */}
                    {brand.offers.collab && (
                      <span className="brand-offer-collab">{brand.offers.collab}</span>
                    )}
                  </span>
                  <span className="brand-offer-body">{brand.offers.welcome}</span>
                  <span className="brand-offer-when">First visit, once.</span>
                </div>
              )}
              {brand.offers.loyalty && (
                <div className="brand-offer">
                  <span className="brand-offer-head">
                    <Gem size={15} />
                    Loyalty offer
                  </span>
                  <span className="brand-offer-body">{brand.offers.loyalty}</span>
                  <span className="brand-offer-when">
                    Active BEASTY members only, every visit.
                  </span>
                </div>
              )}
              {!brand.offers.mock && (
                <button className="brand-offer-cta" onClick={() => api.openApp('sys.members')}>
                  About BEASTY members
                </button>
              )}
            </div>
          )}

          {/* How to actually start, stated before the prices rather than under
              them, because "these are quotes" changes how the list is read. */}
          {tier >= 3 && brand.quoteOnly && <p className="brand-quote-note">{brand.quoteOnly}</p>}

          {/* A single-category menu needs no tab bar — one lone pill that
              repeats the section heading below it is pure noise. */}
          {/*
            THE WHOLE MENU BEHIND ONE BAR, his ask of 2026-09-09: "Can we make
            the entire menu as a drop-down button? This will simplify their
            page when users view them." Collapsed until asked for, and the bar
            names the count so it says what is behind it. A quoted price list
            drops down the same way. Tier 3 only — "menu list" is a premium
            feature from the same note; see data/affiliateTiers.ts.
          */}
          {tier >= 3 && menuCount > 0 && (
            <div className="menu-picks brand-menu-drop">
              <button
                className={`menu-picks-bar${menuOpen ? ' is-open' : ''}`}
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
              >
                <span>
                  {brand.quoteOnly ? 'Price list' : 'Menu'} · {menuCount} {menuCount === 1 ? 'item' : 'items'}
                </span>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {menuOpen && (
                <div className="brand-menu-body">
          {brand.menu.length > 1 && (
          <nav className="cat-tabs">
            {brand.menu.map((c, i) => (
              <button
                key={c.id}
                className={`cat-tab${i === activeCat ? ' is-on' : ''}`}
                onClick={() => jump(i)}
              >
                {c.name}
              </button>
            ))}
          </nav>
          )}

          {brand.menu.map((cat) => (
            <section className="menu-cat" id={`cat-${cat.id}`} key={cat.id}>
              {brand.menu.length > 1 && <h2>{cat.name}</h2>}
              {cat.items.map((item) => {
                /*
                  Quoted work is a PRICE LIST, not a menu. No add button, no
                  item sheet, and nothing that could put a $650 website in a
                  cart next to a hot dog.
                */
                const Row = brand.quoteOnly ? 'div' : 'button'
                return (
                <Row
                  className={`menu-row${brand.quoteOnly ? ' is-quote' : ''}`}
                  key={item.id}
                  {...(brand.quoteOnly ? {} : { onClick: () => setSheetItem(item) })}
                >
                  <span className="menu-row-text">
                    <span className="menu-row-name">
                      {item.name}
                      {item.popular && <em className="tag-pop">Popular</em>}
                      {item.tags?.map((t) => (
                        <em className="tag-diet" key={t}>
                          {t}
                        </em>
                      ))}
                    </span>
                    <span className="menu-row-desc">{item.desc}</span>
                    {item.imageIsIllustration && (
                      <span className="menu-row-illus">Illustration, not their photo</span>
                    )}
                    {/* A range, where a range is what is actually quoted. */}
                    <span className="menu-row-price">{item.priceLabel ?? money(item.price)}</span>
                  </span>
                  {!brand.quoteOnly && (
                    <span className="menu-row-thumb">
                      <ItemThumb
                        name={item.name}
                        desc={item.desc}
                        bg={brand.logo.bg}
                        fg={brand.logo.fg}
                        cuisine={brand.cuisine}
                        imageUrl={item.imageUrl}
                      />
                      <span className="menu-row-add">+</span>
                    </span>
                  )}
                </Row>
                )
              })}
            </section>
          ))}
                </div>
              )}
            </div>
          )}


          {/* A discount the partner honours at their own counter. Sits above
              the contact block because for a service partner it is the whole
              reason the tile was opened. */}
          {tier >= 2 && brand.perk && (
            <div className="brand-perk">
              <strong>{brand.perk.headline}</strong>
              <span>{brand.perk.detail}</span>
            </div>
          )}

          {/*
            How to actually reach them.

            Two cases, not one: a business with no published menu, and a
            business whose work is quoted rather than ordered. Both need a real
            route out of the app, and the quoted one needs it MOST — the whole
            screen is a price list with no way to buy anything.
          */}
          {tier >= 2 && (brand.contactOnly || brand.quoteOnly) && (
            <div className="brand-contact">
              {brand.contactOnly && <p>{brand.contactOnly}</p>}
              {/*
                THE LINE ABOVE THE CALL BUTTON depends on what they sell. A
                kitchen is called to order from; an online shop is bought from
                on its own store; everything else is booked or asked.

                It said "Start with a free consultation" for everything that was
                not food, which on 2026-09-14 put that line on Greek, Indian,
                Persian and Vietnamese restaurants, on online shops and on
                rappers — and a free consultation is a promise about a
                business's terms that almost none of them has made.
              */}
              {brand.quoteOnly && (
                <p>
                  {FOOD_RX.test(`${brand.cuisine} ${brand.name}`)
                    ? 'Call or message them to order or ask.'
                    : SHOP_RX.test(`${brand.cuisine} ${brand.name}`)
                      ? 'Buy from their own store.'
                      : 'Call or message them to book or ask.'}
                </p>
              )}
              {brand.phone && (
                <a className="btn-primary" href={`tel:${brand.phone.replace(/[^0-9+]/g, '')}`} onClick={out('call')}>
                  Call {brand.phone}
                </a>
              )}
              {brand.email && (
                <a className="btn-secondary" href={`mailto:${brand.email}`} onClick={out('email')}>
                  Email {brand.email}
                </a>
              )}
              {brand.site && (
                <a className="btn-secondary" href={brand.site} target="_blank" rel="noreferrer" onClick={out(siteKind)}>
                  {brand.siteCta ?? 'Open their page'}
                </a>
              )}
            </div>
          )}

          {/*
            THE FREE LISTING, Tier 1, his rule of 2026-09-09 for the yellow
            sheets: the name, the address, the contact details and the link —
            the Tier 1 perks on the Members page, and nothing from the tiers
            above. Said on the page, because the point of a free spot is that
            its owner is shown it: "they will see they are on our pages as a
            Free member but will hopefully be interested in upgrading."
          */}
          {tier === 1 && (
            <div className="brand-contact brand-free">
              {brand.phone && <p className="brand-free-line">Phone {brand.phone}</p>}
              {brand.email && <p className="brand-free-line">Email {brand.email}</p>}
              {brand.site && (
                <a className="btn-secondary" href={brand.site} target="_blank" rel="noreferrer" onClick={out(siteKind)}>
                  {brand.siteCta ?? 'Open their page'}
                </a>
              )}
              <p className="brand-free-note">
                Listed free as a BEASTY Affiliate. A free spot is held for {FREE_SPOT_MONTHS} months. The
                full page — a bio, featured items, the menu, a video and member offers — comes with
                membership.
              </p>
              {/* btn-primary, not the offers block's white-on-dark pill, which
                  is invisible on this white card. */}
              <button className="btn-primary" onClick={() => api.openApp('sys.members')}>
                See the affiliate tiers
              </button>
            </div>
          )}

          {tier >= 2 && <BrandPanels panels={brand.panels} />}

          {/*
            A DIRECT LINE TO THEIR INSTAGRAM, where he has sold one.

            His ask, 2026-08-29: "do you think these pages should have a direct
            Instagram link? If so, we can make it an extra feature on a higher
            tier membership... put it on a few good ones as an example."

            OUTSIDE the contact block on purpose. That block only renders for a
            business with no menu or with quoted work, and a kitchen with a
            price list is exactly the kind of page whose Instagram is worth
            following. So this stands on its own and appears on any page that
            carries a handle.
          */}
          {tier >= 3 && brand.instagram && (
            <a
              className="brand-ig"
              href={`https://www.instagram.com/${brand.instagram}/`}
              target="_blank"
              rel="noreferrer"
              onClick={out('instagram')}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="brand-ig-mark">
                <rect x="3" y="3" width="18" height="18" rx="5.4" fill="none" stroke="currentColor" strokeWidth="1.9" />
                <circle cx="12" cy="12" r="4.1" fill="none" stroke="currentColor" strokeWidth="1.9" />
                <circle cx="17.4" cy="6.6" r="1.25" fill="currentColor" />
              </svg>
              <span>
                {brand.name} on Instagram
                <em>@{brand.instagram}</em>
              </span>
            </a>
          )}

          {/* A partner-specific reason to visit their own site. Falls back to
              naming the destination honestly when there is nothing to add. */}
          {tier >= 2 && brand.siteNote && !brand.contactOnly ? (
            <p className="brand-foot">
              <a href={brand.site ?? brand.orderUrl} target="_blank" rel="noreferrer" onClick={out(brand.site ? siteKind : 'order')}>
                {brand.siteNote}
              </a>
            </p>
          ) : tier >= 2 && brand.orderUrl && !brand.contactOnly ? (
            <p className="brand-foot">
              <a href={brand.orderUrl} target="_blank" rel="noreferrer" onClick={out('order')}>
                They also take orders on {orderHost(brand.orderUrl)}
              </a>
            </p>
          ) : null}

          {/* Do not claim the kitchen set these prices on the brands whose own
              data says they came off a delivery platform with a markup. */}
          <p className="brand-foot">
            {brand.name} is operated independently.{' '}
            {/* Four of these are not kitchens and have no prices at all — a dog
                walker, a garage, a print shop and an iOS app. "Prices set by the
                kitchen" sat two sentences under "there is nothing to order
                here". */}
            {brand.contactOnly || tier === 1
              ? 'Contact them directly.'
              : brand.quoteOnly
                ? 'Ranges are indicative; the quote is what counts.'
                : brand.pricesEstimated || brand.needsOwnerReview
                  ? 'Prices here still need confirming with them.'
                  : 'Prices set by the kitchen.'}
          </p>
        </div>
      </AppChrome>

      {sheetItem && <ItemSheet brand={brand} item={sheetItem} onClose={() => setSheetItem(null)} />}
    </>
  )
}

/**
 * A directions link the customer's own phone will open in its own map.
 *
 * The operator asked for Apple Maps, and on an iPhone that is exactly what
 * maps.apple.com does — the OS hands the URL straight to the Maps app rather
 * than opening a web page. It is the RIGHT answer only on Apple platforms
 * though: the same link on Android renders Apple's web map, which cannot hand
 * off to the navigation app that phone actually has. So the platform picks.
 *
 * The name rides along with the address because an address alone can land on
 * the wrong side of a building; with the business name attached, Maps resolves
 * to the business's own pin where it knows it. Both are encoded — an
 * unencoded "2190 Contra Costa Blvd, Pleasant Hill" breaks on its comma.
 */
function mapsHref(address: string, name: string): string {
  const q = encodeURIComponent(`${name}, ${address}`)
  const apple =
    typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)
  return apple ? `https://maps.apple.com/?q=${q}` : `https://www.google.com/maps/search/?api=1&query=${q}`
}

/** Name the destination honestly — a DoorDash link is not "their own site". */
function orderHost(url: string): string {
  const host = url.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '')
  const known: Record<string, string> = {
    'doordash.com': 'DoorDash',
    'order.toasttab.com': 'Toast',
    'ubereats.com': 'Uber Eats',
    'postmates.com': 'Postmates',
    'instagram.com': 'Instagram',
  }
  return known[host] ?? `their own site (${host})`
}

/** Hero uses the logo's own colours so every brand page feels like its own app. */
function heroBg(bg: string): string {
  const [a, b] = bg.split('|')
  return `linear-gradient(160deg, ${a}, ${b ?? a})`
}
