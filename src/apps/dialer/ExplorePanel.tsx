import { LISTED_KITCHENS } from '../../data/brands'
import { CITY_PAGES } from '../../data/cities'

/**
 * BUILT AND PARKED — NOT WIRED TO ANYTHING.
 *
 * The operator considered this for the second tab and then chose Recent
 * instead, which was the better call: Recent keeps the stock clock icon doing
 * the stock thing, and it shows a customer their OWN places rather than a
 * directory they could already swipe to.
 *
 * Kept on his instruction because it is finished and the idea is still live.
 * It is not dead code — it is unrouted. Do not delete it as unused; wire it to
 * a panel page and a tab when he asks.
 *
 * Explore — the businesses actually on the app, in one list.
 *
 * Glenn's replacement for Careers in the tab bar, and the right call: Careers
 * was already key 9, and a tab bar slot is for something people open every
 * visit rather than once. This is the answer to "who is on here", which is the
 * question a new customer actually has.
 *
 * EVERY ROW IS A REAL, LISTED PARTNER. It reads LISTED_KITCHENS — the same
 * filtered list the landing page counts and the members screen quotes — so it
 * cannot drift from what the app will actually let you order from, and it
 * cannot quietly pick up the seventeen scaffold entries whose menus were never
 * sourced.
 */

export function ExplorePanel({
  onOpen,
  onCity,
}: {
  /** Enter the app on this business's page. */
  onOpen: (brandId: string) => void
  /** Enter the app on a city's page of open spots. */
  onCity: (city: string) => void
}) {
  /*
    Grouped by the city each business is actually in, read off its address
    rather than assigned — a business with no published address goes in the
    last group rather than being placed in a city on a guess.
  */
  const groups = new Map<string, typeof LISTED_KITCHENS>()
  for (const b of LISTED_KITCHENS) {
    const city = b.address?.split(',').pop()?.trim() || 'Elsewhere in the Bay'
    groups.set(city, [...(groups.get(city) ?? []), b])
  }
  const sorted = [...groups.entries()].sort((a, b) => b[1].length - a[1].length)

  return (
    <>
      <p>
        {LISTED_KITCHENS.length} businesses are on the home screen today. Every one set its own
        prices, and every one is somewhere you can actually walk into.
      </p>

      {sorted.map(([city, list]) => (
        <div className="explore-group" key={city}>
          <h3>{city}</h3>
          {list.map((b) => (
            <button className="explore-row" key={b.id} onClick={() => onOpen(b.id)}>
              <span className="explore-mark" style={{ background: b.logo.bg.split('|')[0] }} />
              <span className="explore-text">
                <strong>{b.name}</strong>
                <em>{b.cuisine}</em>
              </span>
            </button>
          ))}
        </div>
      ))}

      {/*
        The other half of the answer. A customer who has just read a short list
        should be told it is short on purpose, and given the thing to do about
        it — the empty spots are the pitch, not an omission.
      */}
      <div className="explore-more">
        <h3>Still filling up</h3>
        <p>
          {CITY_PAGES.length} cities have pages with open spots on them — twenty-four categories
          each, from burgers to barbers. Nobody has taken most of them yet.
        </p>
        <button className="dialer-panel-action" onClick={() => onCity(CITY_PAGES[0])}>
          See the open spots
        </button>
      </div>
    </>
  )
}
