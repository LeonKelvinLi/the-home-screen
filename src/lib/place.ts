/**
 * Which city the home screen says it is showing.
 *
 * ONE source. The label reads this and nothing else, so switching it later is
 * a one-line change wherever the value comes from.
 *
 * NOT fetched from the device yet, deliberately. Reading a real location takes
 * two things this does not have:
 *
 *   1. `navigator.geolocation`, which prompts EVERY visitor for their location
 *      the moment the page loads. A permission sheet before anyone has seen a
 *      menu costs more than a city name is worth, and it needs the operator's
 *      say-so rather than mine.
 *   2. A reverse-geocoding service to turn a latitude and longitude into
 *      "San Francisco". Coordinates alone cannot be turned into a city name in
 *      the browser, and guessing one from the nearest vendor would put a wrong
 *      city on the screen with total confidence.
 *
 * So the label is honest about being fixed until those two decisions are made.
 */
export const CITY = 'San Francisco'
