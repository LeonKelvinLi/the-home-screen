/*
  Is it actually working on beastypages.com?

  Not "did the string ship" — tools/live-check.mjs answers that, and it is not
  the same question. Glenn's drop-down bug would have passed a string check
  every day it was broken: the code was all there, it just remounted itself.

  So this drives the real site in a real browser and checks the behaviour he
  reported, plus the pages added with it. It creates NOTHING: no sign-in, no
  member row, no SMS. Everything here is reachable signed out, which is why the
  membership screen is checked by the strings in its bundle rather than by
  opening it — the alternative is a real account and a real text message.

      node tools/live-verify.mjs [--url https://...]
*/
import { chromium } from 'playwright'

const args = process.argv.slice(2)
const i = args.indexOf('--url')
const base = i !== -1 ? args[i + 1] : 'https://beastypages.com'

const fails = []
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 })

// ---- Glenn's bug, on the live site --------------------------------------
await p.goto(base + '/', { waitUntil: 'networkidle', timeout: 60000 })
await p.click('[aria-label="1"]').catch(() => {})
await p.waitForSelector('[aria-label="1. ABOUT"]', { timeout: 20000 }).catch(() => {})
await p.click('[aria-label="1. ABOUT"]').catch(() => {})
const chapters = await p.waitForSelector('.panel-chapter-head', { timeout: 20000 }).then(() => true).catch(() => false)
if (!chapters) fails.push('the About panel never opened')
else {
  await p.evaluate(() => document.querySelector('.panel-chapter-head')?.click())
  await p.waitForTimeout(300)
  const opened = await p.evaluate(() => document.querySelectorAll('.panel-chapter-body').length)
  const was = await p.evaluate(() => document.querySelector('.dialer')?.className ?? '')
  /* Wait for the photo to actually swap — that re-render is what used to close
     the chapter. If it never comes, say so rather than calling it a pass. */
  const moved = await p.waitForFunction(
    (w) => ((document.querySelector('.dialer')?.className ?? '').includes('is-photo')) !== w.includes('is-photo'),
    was, { timeout: 12000 },
  ).then(() => true).catch(() => false)
  const still = await p.evaluate(() => ({
    bodies: document.querySelectorAll('.panel-chapter-body').length,
    expanded: [...document.querySelectorAll('.panel-chapter-head')].filter((h) => h.getAttribute('aria-expanded') === 'true').length,
  }))
  console.log('about         : opened', opened, '| re-rendered', moved, '| still open', still.expanded)
  if (opened !== 1) fails.push(`tapping a chapter opened ${opened} bodies, expected 1`)
  if (!moved) fails.push('the landing photo never swapped, so the stays-open check proved nothing')
  else if (still.expanded !== 1 || still.bodies !== 1) fails.push('A CHAPTER CLOSED ITSELF ON RE-RENDER — Glenn’s glitch is still live')
}

// ---- the pages added with it --------------------------------------------
for (const [id, want] of [
  ['b_pinkonion', 'Pink Onion'],
  ['b_alorasocial', 'Alora Social'],
  ['b_napapedalcrusher', 'Napa Pedal Crusher'],
]) {
  await p.goto(`${base}/?b=${id}`, { waitUntil: 'networkidle', timeout: 45000 })
  await p.waitForTimeout(600)
  const title = await p.evaluate(() => document.querySelector('h1')?.textContent?.trim() ?? null)
  console.log(`${id.padEnd(22)}: ${title}`)
  if (title !== want) fails.push(`${id} shows "${title}", expected "${want}"`)
}

// ---- the roster research, on the pages it filled ------------------------
/*
  Eighty-eight roster seats were filled from the businesses' own sites on
  2026-09-01 — hours, menus, quote lists, contact-only notes. A title check
  proves the page exists; this proves the facts reached it: hours under the
  address, a priced menu or a quote group, or the contact card with a number.
  And the quote note is styled — it ran edge to edge, unstyled, from Aug 5.
*/
for (const [id, want, expect] of [
  ['b_soltaqueria', 'Sol Taqueria', { hours: 'Mon-Thu 10am-9pm', rows: 4 }],
  ['b_jdiautodetailing', 'JDI Auto Detailing', { hours: 'Mon-Sat 8am-6pm', rows: 8, quote: true }],
  ['b_kababburger', 'Kabab Burger', { hours: 'Mon-Thu 11am-8pm', rows: 4 }],
  ['b_eaglepetgrooming', 'Eagle Pet Grooming', { call: '(650) 278-3611' }],
  ['b_shakashack', 'Shaka Shack', { hours: 'Mon-Tue, Thu-Sun 8:30am-3pm', rows: 4 }],
  ['b_baysidefencing', 'Bay Side Fencing Co', { hours: 'Mon-Fri 9am-4pm', call: '925-420-6268' }],
  ['b_sincitypits', 'Sin City Pits', { photos: 2 }],
  /* The 2026-09-02 sweep of the whole thread: two he sent and nobody seated. */
  ['b_houseofwings', 'House of Wings California', { hours: 'Daily 11am-10pm' }],
  ['b_empirestatepizza', 'Empire State Pizza', { hours: 'Daily 11am-9pm', rows: 4, photos: 1 }],
  /* 2026-09-03 overnight batch */
  ['b_rubenhibachigrill', 'Ruben Hibachi Grill', { hours: 'Wed-Fri 3pm-10pm' }],
  ['b_gourmetburritos', 'Gourmet Burritos', { hours: 'Open 24 hours' }],
  ['b_thetoxalamo', 'The Tox Alamo', {}],
  ['b_loveburn', 'Love Burn Hot Chicken', { hours: 'Mon-Fri 11:30am-7pm' }],
  ['b_phonationnewark', 'Pho Nation', { hours: 'Daily 11am-9pm', call: '(510) 894-2584' }],
  ['b_phonationalameda', 'Pho Nation', { hours: 'Daily 5pm-2am', rows: 4 }],
  ['b_chikindripunioncity', 'Chikin Drip', { hours: 'Sun-Thu 11am-1am', rows: 4 }],
  ['b_calipartybus', 'Cali Party Bus', { hours: 'Mon-Fri 8am-7pm', rows: 8, quote: true }],
  ['b_pijjaparadiselivermore', 'Pijja Paradise', {}],
  ['b_elranchogrande', 'Rancho Grande Taqueria', { hours: 'Mon-Thu and Sat 8am-9pm', call: '(925) 600-8620' }],
  /* 2026-09-05: the four from the thread, and the full menus with their own
     photos — a row count well under what each publishes, so a trimmed offer
     cannot pass for the menu. */
  ['b_dadsbbq', "Dad's BBQ", { hours: 'Every day 11am-8:30pm', rows: 20 }],
  ['b_tonysstyle', "Tony's Style", { call: '917-244-4797' }],
  ['b_caitlynssweets', "Caitlyn's Sweets", {}],
  ['b_armentalandscape', 'Armenta Landscape Co.', { call: '(925) 481-0609' }],
  ['b_phonationnewark', 'Pho Nation', { rows: 40 }],
  ['b_greatimpasta', 'Great Impasta', { rows: 80 }],
  ['b_pippal', 'Pipp\u0101l', { rows: 60 }],
  ['b_jackiesplace', "Jackie's Place", { rows: 60 }],
  ['b_kaisendon', 'Kaisen Don', { rows: 150 }],
  ['b_1upretro', '1-Up Retro', { rows: 4 }],
  ['b_walkfree', 'Walk Free', { photos: 3 }],
  ['b_lushspaw', 'Lush Spaw', { rows: 8, quote: true, call: '(833) 279-5874' }],
  ['b_russfamkitchen', 'Russ Fam Kitchen', { hours: 'Tue-Sun 8:30am-12pm', rows: 20, call: '510-691-3658' }],
  ['b_tastinpeachy', 'Tastin Peachy', { call: '510-685-7876' }],
  /* 2026-09-08: the batch he sent on the night of the 7th and the weekend's
     five. Row counts sit under what each publishes, as above. */
  ['b_sushinaloa', 'Sushinaloa', { hours: 'Wed-Mon 10am-10pm', rows: 40, call: '(650) 771-1620' }],
  ['b_kusanbazaarmilpitas', 'Kusan Bazaar', { hours: 'Mon-Thu 11am-2:30pm', rows: 40, call: '(408) 549-2078' }],
  ['b_kusanuyghurcuisinesanjose', 'Kusan Uyghur Cuisine', { call: '(650) 899-0210' }],
  ['b_varnishnailboutiquewalnutcreek', 'Varnish Nail Boutique', { hours: 'Mon-Sat 9:30am-7pm', rows: 40, quote: true, call: '(925) 506-3101' }],
  ['b_bodyrokberkeley', 'BODYROK East Bay', { rows: 20, quote: true }],
  ['b_bhanmaevane', 'Bhan Mae Vane', { hours: 'Tue-Sun 11am-3pm', rows: 38, call: '510-227-5197' }],
  ['b_jollyrogerland', 'Jolly Roger Land', { hours: 'Mon-Wed 10am-7:30pm', rows: 25, quote: true, call: '510-362-7996' }],
  ['b_paradanewperu', 'Parada New Peru', { hours: 'Mon-Thu 11am-9pm', call: '925-448-8118' }],
  ['b_goodcompenny', 'Good Compenny', {}],
  ['b_bobaclub', 'Boba Club', { hours: 'Daily 11am-7:59pm', rows: 25, call: '(510) 999-2687' }],
  ['b_doodlecakes', 'Doodle Cakes', { hours: 'Wed-Sat 11am-3pm', rows: 20 }],
  ['b_housingauthority', 'Housing Authority', {}],
  ['b_chipcookies', 'Chip Cookies', { hours: 'Sun-Thu 10am-10pm' }],
  ['b_moxiesteakhouse', 'Moxie Steak House', { hours: 'Wed-Fri 2pm-9pm', rows: 35, call: '(510) 671-2890' }],
  ['b_7milehouse', '7 Mile House', { hours: 'Mon 11:30am-9pm', call: '(415) 467-2343' }],
  ['b_belly', 'Belly', { rows: 80, call: '(510) 350-8799' }],
  ['b_wowmiapizza', 'Wow Mia Pizza', { rows: 60, call: '(408) 676-3030' }],
  ['b_saladmakers', 'Salad Makers', { rows: 60, call: '(925) 634-0718' }],
  ['b_streetsocial', 'Street Social', { call: '(707) 774-6185', free: true }],
  ['b_alivekitchen', 'Alive Kitchen', { call: '(561) 909-5062', free: true }],
  ['b_baithak', 'Baithak', { rows: 100, call: '(925) 361-0862' }],
  /* 2026-09-10. Chef Jeff's took the home screen's seat 18 with the icon glow;
     Bay Area Event Lights had been missing since 29 August. */
  ['b_chefjeffssmashburger', "Chef Jeff's Smash Burger", { call: '(925) 732-7625', rows: 20 }],
  /* 2026-09-13 night: front-page kitchens that opened without a menu. */
  ['b_hotboyschicken', 'World Famous Hotboys', { rows: 55 }],
  ['b_winkydinkydogs', 'Winky Dinky Dogs', { rows: 65, call: '(510) 817-4673' }],
  ['b_gumbosocial', 'Gumbo Social', { free: true, call: '(415) 655-9195' }],
  /* 2026-09-14. */
  ['b_sushiuma', 'Sushi Uma', { rows: 100, call: '(415) 968-9933', hours: 'Daily 11:00 am' }],
  ['b_acekingbbq', 'Ace King BBQ', { free: true, call: '510-323-4987' }],
  ['b_harborviewsf', 'Harborview Restaurant & Bar', { free: true, call: '(415) 399-1200' }],
  ['b_theseabyash', "The Sea by Alexander's Steakhouse", { free: true, call: '(650) 213-1111' }],
  ['b_looki', 'Looki', { quote: true, photos: 1 }],
  ['b_bayareaeventlights', 'Bay Area Event Lights', { call: '(408) 502-7229', free: true }],
  /* The 2026-09-09 menu sweep: fifteen menus read from the businesses' own pages. */
  ['b_islafilipino', 'Isla Filipino Restaurant', { rows: 90, call: '(925) 849-6255' }],
  ['b_pinkonion', 'Pink Onion', { rows: 60, call: '(415) 529-2635' }],
  ['b_elranchogrande', 'Rancho Grande Taqueria', { rows: 90 }],
  ['b_onehousebistro', 'One House Bistro', { rows: 110, call: '(925) 235-8888' }],
  ['b_phodenguyen', 'Pho De Nguyen', { rows: 100 }],
  ['b_pijjaparadisepittsburg', 'Pijja Paradise', { rows: 80 }],
  ['b_pijjaparadiselivermore', 'Pijja Paradise', { rows: 80 }],
  ['b_kusanbazaarmountainview', 'Kusan Bazaar', { rows: 30 }],
  ['b_kusanuyghurcuisinesanjose', 'Kusan Uyghur Cuisine', { rows: 30 }],
  ['b_hellagoodburger', 'HELLA GOOD BURGER', { rows: 20 }],
  ['b_firebunz', 'Firebunz', { rows: 8 }],
  ['b_portofperiperisf', 'The Port of Peri Peri', { rows: 70, call: '(415) 340-7373' }],
  /* 2026-09-10 evening to 09-12. */
  ['b_bratpakdogkamp', 'BratPak Dog Kamp', { call: '(925) 980-2742' }],
  ['b_sliceitpizza', 'Sliceit Pizza', { hours: 'Daily 11am-10pm', rows: 60, call: '(925) 288-0588' }],
  ['b_doghausberkeley', 'Dog Haus Biergarten', { rows: 70 }],
  ['b_piwings', 'P.I. Wings', { hours: 'Wed-Sun 12pm-8pm', call: '(415) 322-9469' }],
  ['b_pizzaponte', 'Pizza Ponte', { free: true, call: '(510) 658-7788' }],
  ['b_claireandersonhomes', 'Claire Anderson', { call: '(510) 435-7822' }],
  /* 2026-09-13 morning. */
  /* Whole page since 2026-10-05: Glenn sent a film for it (the yellow-sheet film rule). */
  ['b_daughterthai', 'Daughter Thai Kitchen', { call: '(510) 823-2354' }],
  ['b_mexihibachi', 'MexiHibachi', { call: '415.604.7135' }],
  /* 2026-09-15 and 16: thirty-two city seats and PupCup. */
  ['b_marymar', 'Mar Y Mar', {  }],
  ['b_tacosmireynitasanlorenzo', 'Tacos Mi Reynita', { rows: 33, hours: "Every day", call: "(510) 971-0014" }],
  ['b_tacosmireynitahayward', 'Tacos Mi Reynita', { rows: 28, hours: "Tue-Sun", call: "(510) 434-8039" }],
  ['b_tacosmireynitasanjose', 'Tacos Mi Reynita', { rows: 31, hours: "Tue-Sun", call: "(408) 592-9231" }],
  ['b_tacosmireynitafremont', 'Tacos Mi Reynita', { rows: 39, call: "(510) 542-7320" }],
  ['b_turtletower', 'Turtle Tower', { free: true, call: "(415) 298-0897" }],
  ['b_plazacafepleasanthill', 'Plaza Cafe', { rows: 124, hours: "Daily 7:30am-2:30pm", call: "(925) 827-2811" }],
  ['b_honepiercing', 'Hone Piercing', { quote: true, call: "(669) 699-8822" }],
  ['b_cyclebarberkeley', 'CycleBar Berkeley', { free: true, call: "(510) 529-4881" }],
  ['b_rumbleboxingsanramon', 'Rumble Boxing San Ramon', { quote: true, call: "(925) 302-5996" }],
  ['b_trufflepokebelmont', 'Truffle Poke Bar', { rows: 35, hours: "Mon-Fri 10am-9pm", call: "(650) 622-4581" }],
  ['b_trufflepokeburlingame', 'Truffle Poke Bar', { rows: 35, hours: "Mon-Fri 10am-9pm", call: "(650) 699-4107" }],
  ['b_trufflepokessf', 'Truffle Poke Bar', { rows: 35, hours: "Mon-Fri 10am-9pm", call: "(650) 741-6180" }],
  ['b_trufflepokesanmateo', 'Truffle Poke Bar', { rows: 35, hours: "Mon-Fri 10am-9pm", call: "(650) 573-6425" }],
  ['b_balompie', 'Balompié Sports Bar & Grill', { free: true, call: "(510) 243-5275" }],
  ['b_paperplanesj', 'Paper Plane', { free: true, call: "(408) 713-2625" }],
  ['b_benchmarkclimbingberkeley', 'Benchmark Climbing', { free: true, call: "(510) 973-0335" }],
  ['b_benchmarkclimbingsf', 'Benchmark Climbing', { free: true, call: "(415) 913-7490" }],
  ['b_deliboard', 'Deli Board', { rows: 13, hours: "Tue-Sun 11am-3pm" }],
  ['b_brazucaacai', 'Brazuca Açaí', { free: true, call: "(415) 240-1178" }],
  ['b_gravityvaultmarin', 'The Gravity Vault Marin', { quote: true, call: "(415) 472-9344" }],
  ['b_batchandbrine', 'Batch & Brine', { free: true, call: "(925) 298-5687" }],
  ['b_thaithanioishi', 'Thai Thani and Oishi', { rows: 225, hours: "Sun-Thu 11am-9pm", call: "(925) 954-8385" }],
  ['b_brewandbanhmi', 'Brew & Banh Mi Cafe', { rows: 16, hours: "Sun-Thu 7am-8pm", call: "(408) 649-3006" }],
  ['b_delageoakland', 'Delage', { rows: 32, hours: "Mon-Sat: lunch 11am-3pm", call: "(510) 823-2050" }],
  ['b_tajmahallivermore', 'Taj Mahal', { free: true, call: "(925) 533-8057" }],
  ['b_shodaisf', 'Yakiniku Shodai', { free: true, call: "(415) 757-0201" }],
  ['b_thirsteasanleandro', 'ThirsTea', { rows: 147, call: "(510) 567-3014" }],
  ['b_zandypekingduck', 'Z & Y Peking Duck', { free: true, call: "(415) 986-1899" }],
  ['b_bibosalon', 'BIBO Salon', { quote: true, call: "(510) 838-2426" }],
  ['b_pizzadeliandgrill', 'Pizza Deli & Grill', { free: true, call: "(510) 343-5336" }],
  ['b_calburger', 'Cal Burger & More', { free: true }],
  ['b_pupcup', 'PupCup', { quote: true }],
  /* 2026-09-17: eight more, two of them with a film. */
  ['b_roasteateryco', 'Roast Eatery Co.', { free: true }],
  ['b_dimsumbasket', 'Dim Sum Basket', { free: true, call: "(925) 418-4142" }],
  ['b_brentwoodrehabpt', 'Brentwood Rehab & Performance PT', { free: true, call: "(925) 466-5550" }],
  ['b_doublerainbowcafe', 'Double Rainbow Cafe', { rows: 50, hours: "Mon-Thu 9am-9pm", call: "(415) 457-0803" }],
  ['b_studiofloras', "Studio Flora's", { free: true, call: "(650) 889-6075" }],
  ['b_thelocalpetaluma', 'The Local', { rows: 18, hours: "Mon-Sat 10:30am-3:30pm", photos: 1, call: "(707) 981-7100" }],
  ['b_milelimitberkeley', 'Mile Limit', { rows: 17, hours: "Wed-Thu 4-9pm", photos: 3, call: "(510) 833-2687" }],
  ['b_dumontlivermore', 'Dumont Creamery & Cafe', {  }],
  /* 2026-09-17 to 21: the batch of forty-odd, Janelle's page and five HL rooms. */
  ['b_realcutiepies', 'Real Cutie Pies', { hours: 'Tue-Sat 12-5pm' }],
  /* Re-read 2026-10-05: brunch and dinner menus, one hours line. */
  ['b_kankiin', 'Kan Kiin', { rows: 60, hours: 'Mon-Fri 11am-2pm', call: '(650) 755-8749' }],
  ['b_lovelysburgerssf', "Lovely's Burgers", { rows: 10, quote: true }],
  ['b_lovelysburgersoakland', "Lovely's Burgers", { free: true }],
  ['b_whackdonuts', 'Whack Donuts!', { call: '(415) 754-8451' }],
  ['b_mochicasf', 'Mochica Kitchen & Bar', { free: true, call: '(415) 278-0480' }],
  ['b_taqueriaaztecadublin', 'Taqueria Azteca', { call: '(925) 833-0888' }],
  ['b_lachicharronadacolombiana', 'La Chicharronada Colombiana', { free: true, call: '(408) 509-4458' }],
  ['b_goldpiepizza', 'Goldpie Pizza', { hours: 'Sun and Mon', call: '(510) 529-5007' }],
  ['b_goldengatemarketdeli', 'Golden Gate Market & Deli', { rows: 55, hours: 'Deli daily', call: '(415) 346-6052' }],
  ['b_tadaramen', 'Tada Ramen & Yakitori', { free: true }],
  ['b_eastbaybuffet', 'East Bay Buffet', { rows: 12, quote: true, call: '(925) 361-7429' }],
  ['b_barsprezzatura', 'Bar Sprezzatura', { free: true }],
  ['b_poorhousebistro', 'Poor House Bistro', { free: true, call: '(408) 292-5837' }],
  ['b_sakanasushialbany', 'Sakana Sushi & Roll', { rows: 170, call: '(510) 634-7447' }],
  ['b_pizzagallery', 'Pizza Gallery', { rows: 17, hours: 'Sun-Wed 11am-9pm', call: '(510) 607-8778' }],
  ['b_napayard', 'Napa Yard & Beer Garden', { rows: 23, hours: 'Mon-Thu 4-10pm', call: '(707) 815-0398' }],
  ['b_mimosaswillowglen', 'Mimosas of Willow Glen', { free: true, call: '(408) 352-5015' }],
  ['b_dreamlandartplay', 'Dreamland Art & Play', { free: true, call: '(415) 686-4748' }],
  ['b_cajunbowlsanbruno', 'Cajun Bowl', { free: true, call: '(650) 636-4550' }],
  ['b_cajunbowlsanmateo', 'Cajun Bowl', { free: true, call: '(650) 445-7248' }],
  ['b_okepokewalnutcreek', 'Oke Poke Walnut Creek', { rows: 25, hours: 'Daily 11am-8pm' }],
  ['b_sanaacafe', "Sana'a Cafe", { hours: 'Sun-Thu 7am-10pm' }],
  ['b_pastapelican', 'Pasta Pelican', { rows: 60, hours: 'Mon-Thu 11:30am', call: '(510) 864-7427' }],
  ['b_almadessert', 'Alma Dessert', { rows: 19 }],
  ['b_brezoalbany', 'Brezo Restaurant', { free: true, call: '(510) 705-1897' }],
  ['b_tacoswalnutcreek', 'Tacos Walnut Creek', { hours: 'Daily 10am-10pm', call: '(925) 464-7489' }],
  ['b_yummyyummyhibachisanleandro', 'Yummy Yummy Hibachi', { call: '(510) 488-8738' }],
  ['b_yummyyummyhibachi73rd', 'Yummy Yummy Hibachi', { call: '(510) 626-6724' }],
  ['b_yummyyummyhibachipiedmont', 'Yummy Yummy Hibachi', { call: '(510) 907-3904' }],
  ['b_toastintown', 'Toast In Town', { free: true, call: '(650) 389-7618' }],
  ['b_barrebeat', 'BARREbeat Fitness', { rows: 6, quote: true, call: '(925) 679-4428' }],
  /* On BEASTY • Eats since 2026-10-05, a whole page. */
  ['b_nossooakland', 'Nosso', { call: '(510) 207-1008' }],
  /* BEASTY • Foodies, 2026-10-05: a foodie's own page. */
  ['b_foodiefestusfeasts', 'Festus Ezeli', {}],
  ['b_elportalsanleandro', 'El Portal Mexican Restaurant', { rows: 150, hours: 'Mon-Fri 9am-10pm' }],
  ['b_kitavasf', 'Kitava', { free: true, call: '(415) 780-1661' }],
  ['b_kitavaoakland', 'Kitava', { free: true, call: '(510) 496-4055' }],
  ['b_kitavaalbany', 'Kitava', { free: true, call: '(510) 725-6097' }],
  ['b_kitavawalnutcreek', 'Kitava', { free: true, call: '(925) 430-2901' }],
  ['b_betweentheplants', 'Between The Plants', { rows: 3, quote: true, call: '(510) 690-7143' }],
  ['b_pampasvacaville', 'PAMPAS Brazilian Steakhouse', { free: true, call: '(707) 514-7228' }],
  ['b_essencebjj', 'Essence Jiu Jitsu', { free: true, call: '(925) 404-9876' }],
  ['b_dripdesserthouse', 'Drip Dessert House', { rows: 9 }],
  ['b_regentthaimassage', 'Regent Thai Massage', { rows: 9, quote: true, hours: 'Daily 10am-9pm', call: '(415) 465-3604' }],
  ['b_holbrookhouse', 'The Holbrook House', { free: true, call: '(415) 515-6444' }],
  ['b_seoultotokyokitchen', 'Seoul to Tokyo Kitchen', { hours: 'Mon-Sat 11am-3pm', call: '(707) 919-3014' }],
  ['b_bustdownco', 'Bust Down & Co.', { free: true, call: '(510) 586-9228' }],
  ['b_bustdowncobeasty', 'Bust Down & Co.', { hours: 'Mon-Fri 11am-5pm', call: '(510) 586-9228' }],
  ['b_jazzbraids', 'Jazz Braids', { rows: 10, quote: true, hours: 'Wed-Thu 10:30am', call: '(510) 894-3975' }],
  ['b_caballerosbarberlounge', 'Caballeros BarberLounge', { rows: 6, quote: true, call: '(925) 444-5024' }],
  ['b_moaeventsrentals', 'MOA Events & Rentals', { rows: 3, quote: true, call: '(925) 502-6384' }],
  ['b_hlpeninsulasouthsf', 'HL Peninsula Restaurant', { hours: 'Mon-Fri 10:30am', call: '(650) 616-8168' }],
  ['b_hlpeninsulapearl', 'HL Peninsula Pearl', { call: '(650) 697-1288' }],
  ['b_hlpeninsulacastrovalley', 'HL Peninsula Restaurant', { call: '(510) 999-3838' }],
  ['b_hlpeninsulagarden', 'HL Peninsula Garden', { free: true, call: '(650) 692-8888' }],
  ['b_hlpeninsulamilpitas', 'HL Peninsula Restaurant', { free: true, call: '(408) 262-3988' }],
  ['b_thehalalcartel', 'The Halal Cartel', { hours: 'Daily 11am-11pm' }],
  ['b_thecozyoven', 'The Cozy Oven', { free: true }],
  ['b_chutneys', 'Chutneys', { hours: 'Mon-Fri 11am-9pm', call: '(925) 434-5555' }],
  /* 2026-09-21 evening: Vending Enterprise on BEASTY • Services 16, and Dr.
     Comics on the yellow sheet behind it with its own site's facts. */
  ['b_vendingenterprise', 'Vending Enterprise', { hours: 'Mon-Sat 8am-5pm', call: '415-523-5963' }],
  ['b_drcomicsmrgames', 'Dr. Comics and Mr. Games', { hours: 'Mon 11am-6pm', call: '(510) 601-7800' }],
  /* 2026-09-21, late evening: Penelope's five shops, Catch, Brasil Bistro,
     MYO and The Hub. */
  ['b_penelopescoffeeberkeley', "Penelope's Coffee & Tea", { rows: 80, call: '(510) 229-3768' }],
  ['b_penelopescoffeefostercity', "Penelope's Coffee & Tea", { rows: 80, call: '(650) 393-4035' }],
  ['b_penelopescoffeesanmateo', "Penelope's Coffee & Tea", { rows: 80, call: '(650) 212-6049' }],
  ['b_penelopescoffeedalycity', "Penelope's Coffee & Tea", { rows: 80, call: '(415) 347-7298' }],
  ['b_penelopescoffeesf', "Penelope's Coffee & Tea", { free: true, call: '(415) 735-7537' }],
  ['b_catchsf', 'Catch SF', { free: true, call: '(415) 431-5000' }],
  ['b_brasilbistro', 'Brasil Bistro', { free: true, call: '(510) 680-5192' }],
  ['b_myofrozenyogurtwalnutcreek', 'MYO Pure Frozen Yogurt', { free: true, call: '(925) 977-9111' }],
  ['b_thehubpackanimals', 'The Hub by Pack Animals', { rows: 13, quote: true, hours: 'Mon 9am-3pm', call: '(828) 482-7225' }],
  /* 2026-09-21, 10:39 pm: "Gotta make a page for E-40." */
  ['b_e40', 'E-40', {}],
  /* 2026-09-21, 10:43 pm: "Grando1k", straight after E-40. */
  ['b_grando', 'Grand-O', {}],
  /* 2026-09-22, 4:35 am: Yo Sushi & Ramen, "Vacaville • Goods". */
  ['b_yosushivacaville', 'Yo Sushi & Ramen', { rows: 182, hours: 'Sun-Thu 11am-9pm', call: '(707) 474-9320' }],
  /* 2026-09-24, 7:46 am: Yank Sing, "San Francisco • Goods", with Sherry Shi's reel. */
  ['b_yanksing', 'Yank Sing', { rows: 59, hours: 'Tue–Fri 11am–3pm', call: '(415) 541-4949' }],
  /* 2026-09-24, 7:14 and 9:52 pm: Demitri's Taverna (Livermore) and Cherie's Southern Kitchen (Dublin). */
  ['b_demitristaverna', "Demitri's Taverna", { rows: 102, hours: 'Tue–Thu 11am–9pm', call: '(925) 373-0306' }],
  ['b_cheriessouthernkitchen', "Cherie's Southern Kitchen", { rows: 32, call: '(925) 361-5725' }],
  /* 2026-09-25 to 27: Glenn's twelve links from the weekend, and Kaisen Don's logo. */
  ['b_woofgangbakeryoakley', 'Woof Gang Bakery & Grooming', { rows: 8, hours: 'Mon-Sat 9am-7pm', call: '(949) 298-6370' }],
  ['b_oldcrowtattoo', 'Old Crow Tattoo', { call: '510-834-2769' }],
  ['b_rakanitattoo', 'Rakani Tattoo', { hours: 'By appointment', call: '(213) 200-7438' }],
  ['b_hungrycow', 'Hungry Cow', { rows: 2, hours: 'Mon-Fri 11:30am-11pm', call: '(510) 573-8200' }],
  ['b_longbridgepizza', 'Long Bridge Pizza Co.', { free: true, hours: 'Tue-Sun 11am-9pm', call: '415-829-8999' }],
  ['b_maverickjacksburlingame', "Maverick Jack's", { rows: 90, hours: 'Daily 11am-8pm', call: '(650) 436-5825' }],
  ['b_maverickjackssanmateo', "Maverick Jack's", { rows: 89, hours: 'Daily 11am-8pm', call: '(650) 638-1479' }],
  ['b_losagavesdalycity', 'Taqueria Los Agaves', { rows: 68, hours: 'Mon–Tue 9am–9:30pm', call: '415-769-5055' }],
  ['b_alushecoffee', 'Alushe Coffee Bar', { free: true, hours: 'Mon–Fri 7am–3pm', call: '(415) 571-8492' }],
  ['b_fourchairs', 'Four Chairs', { free: true, call: '(415) 400-4788' }],
  ['b_napavalleyburgersausalito', 'Napa Valley Burger Company', { rows: 10, hours: 'Daily 11:30am-6pm', call: '(415) 332-1454' }],
  ['b_narrestaurant', 'NAR Restaurant', { rows: 130, hours: 'Mon–Fri 11:30am–2pm', call: '(650) 705-2007' }],
  /* 2026-09-27 evening to 28 September morning: Glenn's twelve. */
  ['b_peachespatties', 'Peaches Patties', { free: true, hours: 'Mon-Fri 9am-8pm', call: '(415) 562-7589' }],
  ['b_theshishgrill', 'Shish Grill', { free: true, hours: 'Mon-Thu 11am-8pm', call: '(925) 415-3270' }],
  ['b_sandbaroakland', 'Sandbar Oakland', { free: true }],
  ['b_mattahn', 'Matt Ahn', { free: true, hours: 'Open 7 days', call: '(415) 872-9242' }],
  ['b_inkfromtatooine', 'Ink From Tatooine', {}],
  ['b_pauldomingo', 'Paul Domingo', { call: '(510) 210-6729' }],
  ['b_twodollarcowboy', '2$CWBY Tattoo', { call: '(925) 533-8071' }],
  ['b_aberrationstudio', 'Aberration Studio', { free: true, hours: 'Daily 9am-5pm', call: '(707) 372-4295' }],
  ['b_impowersportsperformance', 'Impower Sports Performance & Rehab', { free: true, hours: 'Mon 2pm-7pm', call: '(925) 322-2002' }],
  ['b_naileditstudio', 'The Nail Edit Studio', { free: true, hours: 'Mon-Sun 9am-7pm', call: '(925) 262-5518' }],
  ['b_corenestpilates', 'CoreNest Pilates', { free: true, call: '(510) 880-9486' }],
  ['b_contracostafitness', 'Contra Costa Fitness', { free: true, call: '(925) 940-4223' }],
  /* 2026-09-28, afternoon and evening: Carlyle's with its reel, Curio and Bascota. */
  ['b_carlyleschickenwings', "Carlyle's Chicken Wings", { rows: 12, hours: 'Tue-Sun 11:30am-8pm', call: '510-600-2239' }],
  ['b_curiobar', 'Curio', { free: true, hours: 'Brunch Sat-Sun', call: '(415) 551-7306' }],
  ['b_bascotacafe', 'Bascota Café', { free: true, call: '(510) 953-9510' }],
  /* 2026-09-28, 9:21 to 9:25 pm: the wagyu places. */
  ['b_wagyugrillmilpitas', 'Wagyu Grill', { rows: 14, hours: 'Mon-Thu 11am-9:30pm', call: '(408) 649-3106' }],
  ['b_meattimeyakiniku', 'Meat Time Yakiniku', { rows: 67, hours: 'Mon-Thu 5:30pm-9pm', call: '(669) 263-6152' }],
  ['b_wagyumastersanjose', 'Wagyu Master', { free: true, hours: 'Mon-Thu 11:30am-3pm', call: '(408) 549-7891' }],
  /* 2026-09-29 and 30. */
  ['b_kingkatsulandnewark', 'King Katsu Land', { rows: 29, hours: 'Sun-Thu 11am-9pm', call: '(510) 838-5449' }],
  ['b_littlesheepnewark', 'Little Sheep', {}],
  ['b_bollywoodpizzasf', 'Bollywood Pizza', { rows: 54, hours: 'Daily 10am-4am', call: '(415) 869-6617' }],
  ['b_bollywoodpizzalivermore', 'Bollywood Pizza', { free: true }],
  ['b_basqhaus', 'Basq Haus', { rows: 13, hours: 'Pre-order only', call: '415-988-2528' }],
]) {
  await p.goto(`${base}/?b=${id}`, { waitUntil: 'networkidle', timeout: 45000 })
  await p.waitForTimeout(600)
  /* The whole menu sits behind a bar since 2026-09-09; the rows are counted
     with it open, which is how a customer counts them too. */
  await p.locator('.brand-menu-drop .menu-picks-bar').first().click({ timeout: 2500 }).catch(() => {})
  await p.waitForTimeout(250)
  const got = await p.evaluate(() => {
    const txt = (sel) => document.querySelector(sel)?.textContent?.replace(/\s+/g, ' ').trim() ?? ''
    const q = document.querySelector('.brand-quote-note')
    return {
      title: txt('h1'),
      hours: txt('.brand-hours'),
      rows: document.querySelectorAll('.menu-row').length,
      quotePad: q ? Math.round(q.getBoundingClientRect().left) : null,
      /* A page with a full menu draws no contact block — the number sits in
         its own row under the address — so the check reads the whole page. */
      call: txt('.brand-contact') + ' ' + (document.body?.innerText || '').replace(/\s+/g, ' '),
      photos: document.querySelectorAll('.brand-photos-track img').length,
      /* The free listing, Tier 1: the note is there and the menu is not. */
      free: !!document.querySelector('.brand-free'),
      menuBar: !!document.querySelector('.brand-menu-drop'),
    }
  })
  console.log(`${id.padEnd(22)}: ${got.title} | ${got.hours || '-'} | ${got.rows} rows${got.quotePad !== null ? ` | note at x=${got.quotePad}` : ''}`)
  if (got.title !== want) fails.push(`${id} shows "${got.title}", expected "${want}"`)
  if (expect.hours && !got.hours.startsWith(expect.hours)) fails.push(`${id} hours read "${got.hours}", expected "${expect.hours}…"`)
  if (expect.rows && got.rows < expect.rows) fails.push(`${id} shows ${got.rows} rows, expected ${expect.rows}`)
  if (expect.quote && (got.quotePad === null || got.quotePad < 12)) fails.push(`${id}: the quote note is ${got.quotePad === null ? 'missing' : 'unstyled, at x=' + got.quotePad}`)
  if (expect.call && !got.call.includes(expect.call)) fails.push(`${id}: the contact card does not carry ${expect.call}`)
  if (expect.photos && got.photos < expect.photos) fails.push(`${id}: ${got.photos} pictures in the strip, expected ${expect.photos}`)
  if (expect.free && !got.free) fails.push(`${id}: a yellow-sheet spot should be drawn as the free Tier 1 listing`)
  if (expect.free && got.menuBar) fails.push(`${id}: the free listing must not carry the menu`)
}

// ---- the reviewer's film, his 2026-09-09 protocol ----------------------
await p.goto(`${base}/?b=b_belly`, { waitUntil: 'networkidle', timeout: 45000 })
await p.waitForTimeout(600)
const review = await p.evaluate(() => {
  const bar = document.querySelector('.brand-clip-drop .menu-picks-bar')
  return { bar: bar?.textContent?.replace(/\s+/g, ' ').trim() ?? '' }
})
await p.locator('.brand-clip-drop .menu-picks-bar').first().click({ timeout: 2500 }).catch(() => {})
await p.waitForTimeout(400)
const credit = await p.evaluate(() => {
  const a = document.querySelector('.brand-clip-credit a')
  const offers = document.querySelector('.brand-offers')?.textContent?.replace(/\s+/g, ' ') ?? ''
  return { href: a?.getAttribute('href') ?? null, sound: !!document.querySelector('.brand-clip-sound'), mockOffer: /Example only/.test(offers) && /fries or kimchi/i.test(offers) }
})
console.log('review clip   :', JSON.stringify({ ...review, ...credit }))
if (!review.bar.startsWith('Watch a review by @antoinetterzz')) fails.push(`Belly's clip bar reads "${review.bar}", expected "Watch a review by @antoinetterzz"`)
if (credit.href !== 'https://www.instagram.com/antoinetterzz/') fails.push(`Belly's credit links to ${credit.href}, expected her Instagram`)
if (!credit.sound) fails.push('the clip has no sound button')
if (!credit.mockOffer) fails.push("Belly's page does not show his example offer, labelled as an example")

/* The films of 2026-09-17: a creator's on The Local, the shop's own on Mile Limit. */
for (const [id, want] of [['b_thelocalpetaluma', 'Watch a review by @thespoonlist'], ['b_milelimitberkeley', 'Watch their video']]) {
  await p.goto(`${base}/?b=${id}`, { waitUntil: 'networkidle', timeout: 45000 })
  await p.waitForTimeout(600)
  const bar = await p.evaluate(() => document.querySelector('.brand-clip-drop .menu-picks-bar')?.textContent?.replace(/\s+/g, ' ').trim() ?? '')
  console.log(`${id.padEnd(22)}: ${bar}`)
  if (!bar.startsWith(want)) fails.push(`${id}'s clip bar reads "${bar}", expected "${want}"`)
}

/* The films of 2026-09-17 to 21: three by creators, three the businesses' own. */
for (const [id, want] of [
  ['b_goldengatemarketdeli', 'Watch a review by @thesnacksensei'],
  ['b_lovelysburgerssf', 'Watch a review by @samserved'],
  ['b_jonnysitalianice', 'Watch a review by @peggy_shoo'],
  ['b_realcutiepies', 'Watch their video'],
  ['b_yummyyummyhibachi73rd', 'Watch their video'],
  ['b_jazzbraids', 'Watch their video'],
]) {
  await p.goto(`${base}/?b=${id}`, { waitUntil: 'networkidle', timeout: 45000 })
  await p.waitForTimeout(600)
  const bar = await p.evaluate(() => document.querySelector('.brand-clip-drop .menu-picks-bar')?.textContent?.replace(/\s+/g, ' ').trim() ?? '')
  console.log(`${id.padEnd(22)}: ${bar}`)
  if (!bar.startsWith(want)) fails.push(`${id}'s clip bar reads "${bar}", expected "${want}"`)
}

/* Janelle's own page, Nana Casas on BEASTY · Individuals (2026-09-21): the
   first paragraph of her bio shows, the rest and "Affiliations" drop down. */
await p.goto(`${base}/?b=b_nanacasas`, { waitUntil: 'networkidle', timeout: 45000 })
await p.waitForTimeout(600)
const nana = await p.evaluate(() => ({
  lead: /quintessential Bay Area native/.test(document.body.innerText),
  panels: [...document.querySelectorAll('.brand-panel-head')].map((b) => b.textContent.trim()),
  claimLine: /this spot is hers to claim/.test(document.body.innerText),
  /* 2026-09-21 evening: Vending Enterprise off her page ("remove the vending
     enterprise and give it its own spot"), and the portrait under a new file
     name so no cache can go on serving the old one. */
  vending: /Vending Enterprise/i.test(document.body.innerText) || !!document.querySelector('a[href*="vendingenterprise"]'),
  icon: [...document.querySelectorAll('.brand-body image, .brand-body img')].map((x) => x.getAttribute('href') || x.getAttribute('src') || '').find((u) => u.includes('nana-casas')) ?? '',
}))
console.log('nana casas    :', JSON.stringify(nana))
if (!nana.lead) fails.push("Nana Casas' page does not open on her bio's first paragraph")
if (!(nana.panels.includes('Her story') && nana.panels.includes('Affiliations'))) fails.push("Nana Casas' page is missing the Her story or Affiliations drop-down")
if (nana.claimLine) fails.push('Nana Casas\' page still says the spot is "hers to claim"')
if (nana.vending) fails.push("Nana Casas' page still links or names Vending Enterprise")
if (nana.icon !== '/icons/nana-casas-3.webp') fails.push(`Nana Casas' page draws "${nana.icon}", expected /icons/nana-casas-3.webp`)
const nanaIcon = await fetch(`${base}/icons/nana-casas-3.webp`).then((r) => `${r.status} ${r.headers.get('content-type')}`).catch(() => 'no answer')
if (nanaIcon !== '200 image/webp') fails.push(`/icons/nana-casas-3.webp answered ${nanaIcon}`)

/* The halal mark (2026-09-18) and the red collab line on the example offers
   (2026-09-19). */
await p.goto(`${base}/?b=b_pizzagallery`, { waitUntil: 'networkidle', timeout: 45000 })
await p.waitForTimeout(500)
const halal = await p.evaluate(() => !!document.querySelector('.chip-halal .halal-mark'))
for (const [id, who] of [['b_jojoshotchicken', 'Jojo’s HC x @TheSnackSensei'], ['b_theyardbrentwood', 'The Yard x @TheSnackSensei']]) {
  await p.goto(`${base}/?b=${id}`, { waitUntil: 'networkidle', timeout: 45000 })
  await p.waitForTimeout(500)
  const tag = await p.evaluate(() => document.querySelector('.brand-offer-collab')?.textContent?.trim() ?? '')
  console.log(`collab ${id.padEnd(15)}: ${tag}`)
  if (tag !== who) fails.push(`${id}: the welcome offer's collab line reads "${tag}", expected "${who}"`)
}
console.log('halal mark    :', halal)
if (!halal) fails.push("Pizza Gallery's page does not carry the halal mark")

/* Deli Board's film is @antoinetterzz's too, sent with the listing on 2026-09-16. */
await p.goto(`${base}/?b=b_deliboard`, { waitUntil: 'networkidle', timeout: 45000 })
await p.waitForTimeout(600)
const deliBar = await p.evaluate(() => document.querySelector('.brand-clip-drop .menu-picks-bar')?.textContent?.replace(/\s+/g, ' ').trim() ?? '')
console.log('deli review   :', deliBar)
if (!deliBar.startsWith('Watch a review by @antoinetterzz')) fails.push(`Deli Board's clip bar reads "${deliBar}", expected "Watch a review by @antoinetterzz"`)

// ---- the Instagram button ------------------------------------------------
await p.goto(`${base}/?b=b_baymemoriesbooth`, { waitUntil: 'networkidle', timeout: 45000 })
await p.waitForTimeout(600)
const ig = await p.evaluate(() => {
  const a = document.querySelector('.brand-ig')
  return a ? { href: a.getAttribute('href'), h: Math.round(a.getBoundingClientRect().height) } : null
})
console.log('instagram     :', JSON.stringify(ig))
if (!ig) fails.push('the Instagram button is not on the live Bay Memories page')
else if (ig.href !== 'https://www.instagram.com/baymemories_booth/') fails.push(`the Instagram button points at ${ig.href}`)

// ---- the way in, which was dead for two days -----------------------------
/*
  READ-ONLY ON PURPOSE. Nothing here submits the form: a real submission on
  beastypages.com creates a member row and sends a real person's address a real
  code. So this asks the server which channels work and checks the form is
  asking for the one that does — which is exactly the mismatch that stranded
  Glenn's nephew.
*/
const chans = await (await fetch(base + '/api/members/channels')).json().catch(() => null)
console.log('channels      :', JSON.stringify(chans))
if (!chans) fails.push('/api/members/channels did not answer — the form cannot know what works')
else if (!chans.sms && !chans.email) fails.push('NEITHER texting nor email is configured live — nobody can sign in at all')

await p.goto(base + '/', { waitUntil: 'networkidle', timeout: 60000 })
const enter = p.locator('[aria-label="Enter BEASTY"]').first()
try { await enter.waitFor({ state: 'visible', timeout: 15000 }); await enter.click(); await p.waitForTimeout(2600) } catch { await p.waitForTimeout(1200) }
if (await p.locator('[aria-label="Enter BEASTY"]').count()) { await enter.click().catch(() => {}); await p.waitForTimeout(2600) }
/* 2026-09-30: the swipe is BEASTY's nine category pages and the yellow sheets,
   no cities ("You won't be able to scroll for cities unless you just search
   for that city"). Read from the page dots, which name every page. */
const swipe = await p.evaluate(() => [...document.querySelectorAll('.page-dots .dot')].map((d) => d.getAttribute('aria-label') ?? ''))
const swipeTotal = Number(/ of (\d+)/.exec(swipe[0] ?? '')?.[1] ?? 0)
const nine = swipe.map((l) => l.replace(/^Page \d+ of \d+, BEASTY, /, '')).filter((x, i, a) => x !== a[i - 1]).slice(0, 11)
console.log('home swipe    :', JSON.stringify({ pages: swipeTotal, first: nine }))
/* 2026-10-05: BEASTY • Pages first, then the nine. */
if (nine.join(',') !== 'Pages,More pages,Eats,Sweets,AYCE,Goods,Services,Online,Individuals,Tattoo,Automotive') fails.push(`the home screen's first pages read ${nine.join(', ')}`)
if (!swipeTotal || swipeTotal > 20) fails.push(`the home screen swipe is ${swipeTotal} pages long; the cities should only come from Search`)
/* A Foodies review's own copy is served (its name is built in code, so it is not in the bundle). */
{
  const r = await fetch(`${base}/clips/review-DduKTl4hokY.mp4`, { method: 'HEAD' }).catch(() => null)
  if (!r?.ok || !/video\/mp4/.test(r.headers.get('content-type') ?? '')) fails.push('/clips/review-DduKTl4hokY.mp4 is not served as a video')
}
for (const w of ['cat-tattoo.webp', 'cat-realtors-thumb.webp', 'cat-beasty-thumb.webp']) {
  const r = await fetch(`${base}/wallpapers/${w}`).catch(() => null)
  if (!r?.ok || !/image\/webp/.test(r.headers.get('content-type') ?? '')) fails.push(`/wallpapers/${w} is not served as an image`)
}
await p.evaluate(() => window.dispatchEvent(new CustomEvent('beasty:join')))
await p.waitForSelector('.join', { timeout: 20000 }).catch(() => {})
const form = await p.evaluate(() => ({
  tel: document.querySelector('.join input[type=tel]')?.required ?? null,
  email: document.querySelector('.join input[type=email]')?.required ?? null,
  lead: document.querySelector('.join-lead')?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 90) ?? '',
}))
console.log('join form     :', JSON.stringify(form))
if (form.tel === null) fails.push('the sign-in form did not render')
else if (chans) {
  if (chans.sms && form.tel !== true) fails.push('texting works live but the form does not require a number')
  if (!chans.sms && form.email !== true) fails.push('texting does NOT work live and the form does not require an email — this is the bug that stranded Glenn’s nephew')
  if (!chans.sms && form.tel === true) fails.push('the form still insists on a number that nothing can text')
  const promises = form.lead.includes('We text you')
  if (promises !== !!chans.sms) fails.push(`the form promises ${promises ? 'a text' : 'an email'} and the server can only send ${chans.sms ? 'a text' : 'an email'}`)
}

// ---- the membership copy, in whichever chunk carries it ------------------
const html = await (await fetch(base + '/')).text()
const seen = new Set()
/*
  THE STYLESHEET COUNTS TOO. This crawled only .js, so a rule that ships
  purely in CSS — a keyframe name, a class that nothing in JS spells out —
  read as "not in any deployed chunk" on a deploy that was serving it. That
  is the same blind spot as the relative-import one below, one file type
  further along.
*/
const queue = [...new Set([...html.matchAll(/assets\/[A-Za-z0-9_-]+\.(?:js|css)/g)].map((m) => m[0]))]
let bundles = ''
while (queue.length) {
  const f = queue.shift()
  if (seen.has(f)) continue
  seen.add(f)
  const t = await (await fetch(`${base}/${f}`)).text()
  bundles += t
  for (const m of t.matchAll(/assets\/[A-Za-z0-9_-]+\.(?:js|css)/g)) if (!seen.has(m[0])) queue.push(m[0])
  /*
    A CHUNK IMPORTS ITS SIBLINGS RELATIVELY — `import("./Shell-IfFj92Yv.js")`,
    no "assets/" in front — so the crawl above stopped at the entry chunk and
    every string that lives in the Shell (the whole app UI) read as "not in
    any deployed chunk". That is the false negative tools/live-check.mjs was
    written about; this follows the relative form too.
  */
  for (const m of t.matchAll(/["'`]\.\/([A-Za-z0-9_-]+\.js)["'`]/g)) { const f2 = `assets/${m[1]}`; if (!seen.has(f2)) queue.push(f2) }
}
console.log(`bundles       : ${seen.size} file(s), ${Math.round(bundles.length / 1024)}kb`)
for (const s of [
  'Unlimited Loyalty and Welcome offers', 'members-perk-head', 'Tickets keep for any monthly raffle',
  /* 2026-09-02: his domain address on Contacts, Leon's on Designs and MAKE $, his
     sentence where Richmond was, the two-sided Members page, the Designs form. */
  'glenn@beastypages.com', 'designs@beastypages.com',
  /* 2026-09-21: his revision of Contacts — the owners' line, both owners and
     the call-or-text sheet. Signed out, the dock is behind the gate, so the
     card is proved from the bundle rather than by opening it. */
  'Get in touch directly with the owners for any questions', 'Co-CEO/Co-Founder', '510-674-8011', 'calltext-sheet', 'sms:',
  /* 2026-09-21 evening: "Text or email is preferred" in bold on its own line. */
  'Text or email is preferred', 'operator-note-preferred',
  /* 2026-09-22: Contacts gets a drop-down per letter, its Share button and
     link, Janelle's mailbox, and Leon's line under his title. */
  'contacts-letter', 'BEASTY contacts', 'janellenicole@beastypages.com', 'CTO/Co-Founder', '& growing', 'the-beaudega-by-maine', 'is-sweep',
  /* 2026-09-22, 9:15 pm: Reserve a Spot in his words, with his boxes. */
  'Business information', 'List your hours', 'Business description', 'Add a web link and/or IG handle',
  'BEASTY Affiliate Member', 'Affiliate tiers', 'Get in touch', 'Referral Klub (BARK)',
  'sin-city-pits-breeder', 'brand-photos-track',
  /* The four reels the sweep found never attached. */
  'DaBs4utDZXb', 'DYI6AJgIFII', 'DYlU7BcoAMi', 'DcHlbGcBBX2',
  /* The Contacts list reads real members (2026-09-02). */
  'api/members/directory', 'members so far',
  'san-lorenzo', 'Initiation and annual fees', 'point-richmond', 'hercules',
  'is-glow', 'icon-glow',
  /* The screens that were showing account data without reading the account. */
  'joinedAt', 'raffle tickets', 'Open the whole directory and earn rewards',
  /* 2026-09-06: the rotating pass on the member card, a member's page from
     Contacts, the numbered tickets on Rewards, and the yearly switch's style
     (the switch itself stays hidden until a yearly price exists). */
  'api/members/pass', 'Refreshes in', 'single scan', 'api/members/', '/profile', 'Nothing liked yet',
  'api/members/tickets', 'ticket-stub', 'members-interval',
  /* 2026-09-30: the BEASTY category pages and Search's Categories and Cities drop-downs. */
  'search-drop-categories', 'search-drop-cities', 'search-cat-thumb', 'category_opened', '/wallpapers/cat-', 'Barbers, cuts and shaves',
  /* 2026-10-05: BEASTY • Pages tiles, Sweets and AYCE, the reels bubble, button counts, Search's share link. */
  /* 2026-10-05, later: BEASTY • Foodies pages and the review lists. */
  'foodie-reviews', 'Their reviews', 'Foodie reviews', '/clips/review-',
  /* B•P and the yellow More pages sheet, the bubble on the reels button (2026-10-05, evening). */
  'spotlight-pages', 'spotlight-watch-wrap', 'A new BEASTY category, coming soon',
  'cat-icon', 'Watch foodie reviews here to discover new gems.', 'button_tapped', 'Search BEASTY pages', 'Barbers, cuts and shaves', 'Shaved ice', 'Chicken sandwich', 'brand-panel-link',
]) {
  if (!bundles.includes(s)) fails.push(`"${s}" is not in any deployed chunk`)
}
/* And what he asked to have taken off: the old addresses, the city line, the
   $20 holding card, Leon's number, the old acronym. A deploy that still ships
   one of these is the old build. */
for (const s of ['Glennmalicdem78', 'leondragon3798', 'splk3798', 'Richmond, California', 'Holding your spot', '5108267735', 'BARP', 'What you cook', 'A shared cart']) {
  if (bundles.includes(s)) fails.push(`"${s}" is still in a deployed chunk`)
}
/* 2026-09-21 evening, read from the data in the bundle because signed out
   only the first two flagship pages can be swiped to: Vending Enterprise is
   BEASTY • Services 16 between Pet Show and Rosebary, Dr. Comics is on the
   yellow sheet, the Online seat is empty again, and Janelle's tile carries
   the pink glow and the owner's exemption from the red ring. */
for (const [s, what] of [
  ['"b_petshowgrooming","b_vendingenterprise","b_rosebarycarcare"', 'Vending Enterprise in BEASTY • Services 16'],
  ['"beasty-services2-21":"b_drcomicsmrgames"', 'Dr. Comics on the BEASTY services yellow sheet'],
  /* 2026-09-22, 9:28 pm: ABVE the Basics beside Bay Area Event Lights. */
  ['"san-jose-services2-3":"b_abvethebasics"', "ABVE the Basics on San Jose's yellow Services sheet"],
  /* 2026-09-22, 9:54 to 10:10 pm: Black Crown in Pittsburg, Cravingz in
     Redwood City and on BEASTY • Goods 10, SIA moved to BEASTY • Online. */
  ['"pittsburg-services-3":"b_blackcrowntattoo"', 'Black Crown on Pittsburg Services'],
  ['"redwood-city-goods-11":"b_cravingz"', 'Cravingz on Redwood City Goods'],
  /* 2026-10-05: BEASTY • Eats by cuisine; Cravingz moved to Sweets. */
  ['"b_downtownbbq","b_belly",null,"b_harumiayce"', 'BEASTY • Eats in cuisine order'],
  ['"beasty-online-3":"b_siacollective"', 'SIA Collective on BEASTY • Online'],
  ['icon:"black-crown-tattoo"', "Black Crown's crest"],
  ['icon:"cravingz"', "Cravingz's logo"],
  /* 10:16 pm: "Can you add her ig plz Janelle asked". */
  ['instagram:"thebeaudegabymaine"', "The BeauDega by Maine's Instagram button"],
  /* 2026-09-23, morning: Janelle's friends with their glows, The Yakitori
     Bar, Gold Bean's four shops, and the green glow. */
  ['"fremont-goods-0":"b_billyroysburgerco"', "Billy Roy's on Fremont Burgers"],
  ['"fremont-goods-13":"b_skilletzcafe"', "Skillet'z on Fremont's coffee seat"],
  ['"hayward-services-7":"b_garageworks"', 'Garageworks on Hayward Services'],
  ['"newark-goods-13":"b_thebreezecafe"', "The Breeze on Newark's coffee seat"],
  ['"union-city-goods-10":"b_macsbyicky"', 'Macs by Icky on Union City Filipino food'],
  ['"union-city-goods-2":"b_theune"', 'The Une on Union City Asian food'],
  ['"fremont-goods2-0":"b_theyakitoribar"', "The Yakitori Bar on Fremont's yellow sheet"],
  ['"san-leandro-goods-13":"b_goldbeansanleandro"', 'Gold Bean San Leandro'],
  ['"pleasanton-goods-13":"b_goldbeanpleasanton"', 'Gold Bean Pleasanton'],
  ['"berkeley-goods2-2":"b_goldbeandurant"', 'Gold Bean Durant on the Berkeley yellow sheet'],
  ['icon-glow-green', 'the green glow keyframes'],
  ['Eligible to earn money', 'the BEASTY PASS row'],
  /* 2026-09-23, evening: the way back to a business's city, @grubwitmike's
     Cravingz review, and The Company Barber's seal and Union City page. */
  ['"More in ",', "the city rows on a business page"],
  ['brand-city-mark', "the city row's pin"],
  ['/clips/cravingz.mp4', "@grubwitmike's review on Cravingz's page"],
  ['/clips/yank-sing.mp4', "@sherryeatworld's review on Yank Sing's page"],
  ['icon:"the-company-barber-seal"', "The Company Barber's stained-glass seal"],
  ['"union-city-services-0":"b_thecompanybarberunioncity"', "The Company Barber's Whipple Rd shop on Union City Services"],
  /* 2026-09-23, afternoon: most of Union City from Janelle, and San Jose,
     Belmont, Hayward, Fremont, Castro Valley, Redwood City, YAYOI's three
     shops, Petaluma, Walnut Creek and Santa Rosa. */
  ['"san-jose-goods-11":"b_paletaplaneta"', 'Paleta Planeta on San Jose Ice cream'],
  ['"san-jose-goods-4":"b_mazasanjose"', 'Maza on San Jose Sushi'],
  ['"belmont-goods-5":"b_divinoristorante"', 'Divino on Belmont Italian'],
  ['"hayward-goods-3":"b_favoriteindianrestaurant"', 'Favorite Indian on Hayward Indian'],
  ['"fremont-goods-8":"b_portofperiperifremont"', 'The Port of Peri Peri on Fremont Wings'],
  ['"castro-valley-services-4":"b_domartialarts"', 'DO Martial Arts on Castro Valley Gym'],
  ['"redwood-city-goods-9":"b_zadnagrill"', 'Zadna Grill on Redwood City Mediterranean'],
  ['"palo-alto-goods-2":"b_yayoipaloalto"', 'YAYOI Palo Alto'],
  ['"cupertino-goods-2":"b_yayoicupertino"', 'YAYOI Cupertino'],
  ['"san-mateo-goods-7":"b_yayoisanmateo"', 'YAYOI Hillsdale on San Mateo Korean and ramen'],
  ['"union-city-goods-1":"b_tacospapo"', 'Tacos Papo on Union City Mexican'],
  ['"union-city-goods-12":"b_doughweime"', 'DoughWeiMe on Union City Bakery'],
  ['"union-city-goods-13":"b_konthegounioncity"', 'K On The Go on Union City Coffee'],
  ['"union-city-goods2-1":"b_goldenbayseafoodharbor"', 'Golden Bay on the Union City yellow sheet'],
  ['"union-city-services-1":"b_themoonnails"', 'The Moon Nails on Union City Nails'],
  ['"union-city-services2-3":"b_jasnailspa"', 'JAS Nail Spa on the Union City yellow sheet'],
  ['"petaluma-goods-11":"b_honeypotgelato"', 'Honey Pot Gelato on Petaluma Ice cream'],
  ['"walnut-creek-goods-5":"b_northitaliawalnutcreek"', 'North Italia on Walnut Creek Italian'],
  ['"walnut-creek-goods2-8":"b_litawalnutcreek"', 'LITA on the Walnut Creek yellow sheet'],
  ['"santa-rosa-goods2-0":"b_shadyoakbrewing"', 'Shady Oak on the Santa Rosa yellow sheet'],
  ['icon:"honey-pot-gelato"', "Honey Pot Gelato's pot"],
  ['icon:"yayoi"', "YAYOI's mark"],
  /* 8:13 pm: Glenn's mockup, "Union City • Goods >" opposite Home. */
  ['nav-place', "the button to the page a business's tile is on"],
  ['brand-body>.brand-call', 'the phone pill inset like the address card'],
  /* 2026-09-24: the iPhone grid with room, Home to BEASTY • Goods, TAP HERE
     every time in yellow capitals, Ezra, 1850 Properties and the white glow. */
  ['icon-glow-white', 'the white glow keyframes'],
  ['"beasty-services2-24":"b_1850properties"', '1850 Properties on BEASTY More services'],
  ['"beasty-services2-23":"b_georgeprolandscape"', 'George Landscape moved to the yellow sheet'],
  ['"b_ezraluzjohns"', 'Ezra Luz Johns on BEASTY • Services #23'],
  ['"san-francisco-goods2-22":"b_yanksing"', 'Yank Sing on San Francisco More goods'],
  /* 2026-09-25: Top 3 friends, the MySpace way, and the two new pages. */
  ['Top 3 friends', "the Top 3 friends row on Profile and member pages"],
  ['/api/friends/requests', 'friend requests from a member page'],
  ['"livermore-goods-9":"b_demitristaverna"', "Demitri's Taverna on Livermore Mediterranean"],
  ['"dublin-goods-8":"b_cheriessouthernkitchen"', "Cherie's Southern Kitchen on Dublin Chicken wings"],
  ['icon:"demitris-taverna-mark"', "Demitri's laurel wreath"],
  /* 2026-09-26 to 27: Profile in Glenn's order, then slimmed to his mockup. */
  ['prof-share-btn', 'the share arrow at the top of Profile'],
  ['Add a line about you', 'the line of your own under the name'],
  ['/api/members/me/bio', 'saving that line'],
  /* 2026-09-25 to 27: the weekend's twelve pages and Kaisen Don's logo. */
  ['"oakley-services-14":"b_woofgangbakeryoakley"', 'Woof Gang on Oakley Grooming'],
  ['"berkeley-services-3":"b_oldcrowtattoo"', 'Old Crow on Berkeley Tattoo'],
  ['"san-francisco-services-3":"b_rakanitattoo"', 'Rakani on San Francisco Tattoo'],
  ['"fremont-goods-7":"b_hungrycow"', 'Hungry Cow on Fremont Korean'],
  ['"san-francisco-goods2-23":"b_longbridgepizza"', 'Long Bridge on San Francisco More goods'],
  ['"burlingame-goods-0":"b_maverickjacksburlingame"', "Maverick Jack's on Burlingame Burgers"],
  ['"san-mateo-goods-0":"b_maverickjackssanmateo"', "Maverick Jack's on San Mateo Burgers"],
  ['"daly-city-goods-1":"b_losagavesdalycity"', 'Los Agaves on Daly City Mexican'],
  ['"san-francisco-goods2-24":"b_alushecoffee"', 'Alushe on San Francisco More goods'],
  ['"san-francisco-goods2-25":"b_fourchairs"', 'Four Chairs on San Francisco More goods'],
  ['"sausalito-goods-0":"b_napavalleyburgersausalito"', 'Napa Valley Burger on Sausalito Burgers'],
  ['"mountain-view-goods-9":"b_narrestaurant"', 'NAR on Mountain View Mediterranean'],
  ['icon:"kaisen-don-mark"', "Kaisen Don's logo from Glenn's resend"],
  /* 2026-09-27 evening to 28 September morning: Glenn's twelve. */
  ['"san-francisco-goods2-26":"b_peachespatties"', 'Peaches Patties on San Francisco More goods'],
  ['"san-ramon-goods2-0":"b_theshishgrill"', 'Shish Grill on San Ramon More goods'],
  ['"oakland-goods2-14":"b_sandbaroakland"', 'Sandbar on Oakland More goods'],
  ['"san-francisco-services2-11":"b_mattahn"', 'Matt Ahn on San Francisco More services'],
  ['"walnut-creek-services-3":"b_inkfromtatooine"', 'Ink From Tatooine on Walnut Creek Tattoo'],
  ['"richmond-services-3":"b_pauldomingo"', 'Paul Domingo on Richmond Tattoo'],
  ['"livermore-services-3":"b_twodollarcowboy"', '2$CWBY on Livermore Tattoo'],
  ['"san-francisco-services2-12":"b_aberrationstudio"', 'Aberration Studio on San Francisco More services'],
  ['"walnut-creek-services2-3":"b_impowersportsperformance"', 'Impower on Walnut Creek More services'],
  ['"walnut-creek-services2-4":"b_naileditstudio"', 'The Nail Edit on Walnut Creek More services'],
  ['"concord-services2-1":"b_corenestpilates"', 'CoreNest on Concord More services'],
  ['"concord-services2-2":"b_contracostafitness"', 'Contra Costa Fitness on Concord More services'],
  /* 2026-09-28, 1:14 pm: Carlyle's, with @booziebrunch's reel. */
  ['"oakland-goods2-15":"b_carlyleschickenwings"', "Carlyle's Chicken Wings on Oakland More goods"],
  ['/clips/carlyles-chicken-wings.mp4', "@booziebrunch's reel on Carlyle's page"],
  ['"san-francisco-goods2-27":"b_curiobar"', 'Curio on San Francisco More goods'],
  ['"berkeley-services2-2":"b_bascotacafe"', 'Bascota on Berkeley More services'],
  ['"milpitas-goods-4":"b_wagyugrillmilpitas"', 'Wagyu Grill on Milpitas Sushi'],
  ['"milpitas-goods-7":"b_meattimeyakiniku"', 'Meat Time on Milpitas Korean'],
  ['"san-jose-goods2-6":"b_wagyumastersanjose"', 'Wagyu Master on San Jose More goods'],
  ['"newark-goods-7":"b_kingkatsulandnewark"', 'King Katsu Land on Newark Korean'],
  ['"newark-goods2-1":"b_littlesheepnewark"', 'Little Sheep on Newark More goods'],
  ['"san-francisco-goods-3":"b_bollywoodpizzasf"', 'Bollywood Pizza on San Francisco Indian'],
  ['"livermore-goods2-1":"b_bollywoodpizzalivermore"', 'Bollywood Pizza on Livermore More goods'],
  ['"santa-clara-goods2-0":"b_basqhaus"', 'Basq Haus on Santa Clara More goods'],
  ['"beasty-goods2-17":"b_veganmob"', 'Vegan Mob bumped to BEASTY More goods'],
  ['/clips/king-katsu-land.mp4', "@kimjsseats's review on King Katsu Land's page"],
  ['/clips/house-of-silog.mp4', "@justmostie's review on House of Silog's page"],
  ['/clips/basq-haus.mp4', "@hungrydanz's review on Basq Haus's page"],
  ['/clips/little-sheep-newark.mp4', "@iamnikkieg's review on Little Sheep's page"],
  ['/clips/bollywood-pizza-sf.mp4', "Bollywood Pizza's own film"],
  ['/api/affiliate/me', 'the affiliate dashboard'],
  ['/clips/chef-jeffs-smash-burger.mp4', "@takeoutwithtuck's review on Chef Jeff's page"],
  ['instagram:"peezycasso"', "Paul Domingo's Instagram button, on Glenn's say-so"],
  ['prof-tabs', "Profile's My page and Earn tabs"],
  ['Purple Ribbon Foundation', 'the foundation line on Earn and the dashboard'],
  /* 2026-09-30, 12:12 pm: BEASTY • Goods is Eats, and a new Goods sheet for boutiques follows it. */
  ['heading:"Eats"', 'BEASTY \u2022 Eats, the first sheet'],
  ['kind:"boutiques",heading:"Goods"', 'the new BEASTY \u2022 Goods sheet'],
  ['"beasty-boutiques-9":"b_elemonkey"', 'Elemonkey in the centre of BEASTY \u2022 Goods'],
  ['"beasty-services2-25":"b_frankjrenglish"', 'Frank Jr. English to the BEASTY Services yellow sheet'],
  /* 2026-09-25 afternoon: Glenn's four landing and home-screen asks. */
  ['dialer-key-flip', 'the Sign in key flipping to SIGN UP'],
  ['spotlight-sweep', 'the moving glow on Search'],
  ['Just Tap Away', "the first-visit bubble, in Glenn's words"],
  ['members-perk.has-link', 'the earning row in yellow capitals'],
  ['Do they come back?', 'plain words for cohorts in the CRM'],
  ['icon:"nana-casas-3"', "Janelle's headshot of 21 September, evening"],
  ['glow:"blue",beastyOwner:!0', "the Nipsey blue glow and the owner flag on Janelle's page"],
  ['icon:"p-lo-2"', "P-Lo's headshot"],
  ['icon-glow-blue', 'the Nipsey blue keyframes'],
  /* 2026-09-21, 10:17 to 10:40 pm: headshots for seven more Individuals, and
     E-40's page on seat 18 of the sheet. */
  ['icon:"larry-june-2"', "Larry June's headshot"],
  ['icon:"al-freshko-2"', "Al Freshko's headshot"],
  ['icon:"show-banga-2"', "Show Banga's headshot"],
  ['icon:"nicky-diamonds-2"', "Nicky Diamonds' headshot"],
  ['icon:"lloyd-de-vera-2"', "Lloyd de Vera's headshot"],
  ['icon:"lyrics-born-2"', "Lyrics Born's headshot"],
  ['icon:"richie-rich-2"', "Richie Rich's headshot"],
  ['icon:"e-40"', "E-40's headshot"],
  ['"beasty-individuals-17":"b_e40"', 'E-40 on BEASTY • Individuals 18'],
  /* 2026-09-21, 10:31 to 11:02 pm: Marshawn's and Crayone's headshots, and
     Grand-O's page on seat 19. */
  ['icon:"beastmode-2"', "Marshawn Lynch's headshot on BEASTMODE"],
  ['icon:"crayone"', "Crayone's headshot"],
  ['icon:"grand-o"', "Grand-O's headshot"],
  ['"beasty-individuals-18":"b_grando"', 'Grand-O on BEASTY • Individuals 19'],
  ['BEASTY has not spoken to Grand-O yet', "Grand-O's page naming Grand-O rather than guessing a pronoun"],
  /* 2026-09-22: Glenn's revised bio for Lloyd, and Yo Sushi's seat. */
  ['Art is Life', "Lloyd's revised bio and its last line"],
  ['"vacaville-goods-4":"b_yosushivacaville"', 'Yo Sushi on Vacaville Goods 5'],
]) {
  if (!bundles.includes(s)) fails.push(`${what} is not in any deployed chunk (${s})`)
}
/* And the files themselves: a name in the bundle with no file behind it draws
   a broken image on the sheet. */
for (const n of ['larry-june-2', 'al-freshko-2', 'show-banga-2', 'nicky-diamonds-2', 'lloyd-de-vera-2', 'lyrics-born-2', 'richie-rich-2', 'e-40', 'beastmode-2', 'crayone', 'grand-o', 'yo-sushi-vacaville',
  'woof-gang-bakery', 'old-crow-tattoo', 'rakani-tattoo', 'hungry-cow', 'long-bridge-pizza', 'maverick-jacks', 'los-agaves-taqueria',
  'alushe-coffee', 'four-chairs', 'napa-valley-burger', 'nar-restaurant', 'kaisen-don-mark',
  'peaches-patties', 'shish-grill', 'sandbar-oakland', 'golden-star-tattoo', 'ink-from-tatooine', 'two-dollar-cowboy',
  'aberration-studio', 'impower-sports', 'nail-edit-studio', 'corenest-pilates', 'contra-costa-fitness', 'carlyles-chicken-wings', 'curio-bar', 'bascota-cafe', 'wagyu-grill', 'meat-time', 'wagyu-master',
  'king-katsu-land', 'little-sheep', 'bollywood-pizza', 'basq-haus',
  'hakashi-sushi-bar', 'ginza-sushi', 'tacos-don-chai', 'kiyomi-ca-phe', 'vostok-shawarma', 'snatched-by-chinita', 'sidewalk-juice', 'kung-fu-mala-2',
  'the-tastebud', 'gada']) {
  const got = await fetch(`${base}/icons/${n}.webp`).then((r) => `${r.status} ${r.headers.get('content-type')}`).catch(() => 'no answer')
  if (got !== '200 image/webp') fails.push(`/icons/${n}.webp answered ${got}`)
}
/* The seat itself is Sandiwa Collection's since 2026-10-05; only Vending Enterprise in it is wrong. */
if (bundles.includes('"beasty-online-10":"b_vendingenterprise"')) fails.push('Vending Enterprise still holds BEASTY • Online 11')
/* Whips from the centre out, Glenn 2026-10-05: MeterSF in the centre, MrCheeze408 beside it. */
if (!bundles.includes('"beasty-whips-9":"b_metersf"')) fails.push('MeterSF is not in the centre of BEASTY • Whips')
if (!bundles.includes('"beasty-whips-10":"b_mrcheeze408"')) fails.push('MrCheeze408 is not beside MeterSF on BEASTY • Whips')
/* Batch 43, 2026-10-06: the new seats, and the three category spots pinned so the newcomers land after them. */
for (const [seat, id] of [['martinez-goods-1', 'b_tacosdonchai'], ['hayward-services-2', 'b_snatchedbychinita'], ['san-francisco-goods2-35', 'b_sidewalkjuice'], ['beasty-coffee-9', 'b_grindcafe707'], ['beasty-foodtrucks-0', 'b_ofieskitchen'],
  ['beasty-cooks-8', 'b_thetastebud'], ['san-francisco-goods2-36', 'b_gada'], ['beasty-coffee-2', 'b_sanaacafehayward'], ['hayward-goods-13', 'b_sanaacafehayward']]) {
  if (!bundles.includes(`"${seat}":"${id}"`)) fails.push(`${seat} does not hold ${id}`)
}
for (const f of ['/clips/mrcheeze408.mp4', '/photos/mrcheeze408-1.webp', '/icons/mrcheeze408.webp']) {
  const st = await fetch(base + f, { method: 'HEAD' }).then((r) => r.status).catch(() => 0)
  if (st !== 200) fails.push(`${f} answered ${st}`)
}
/* The Instagram button is a paid feature Glenn approves page by page; E-40's
   went up without his say-so on 2026-09-21 and came off the same night. */
if (bundles.includes('instagram:"e40"')) fails.push("E-40's page still carries an Instagram button Glenn has not approved")

/* The pass and the till, from outside: no session means no pass, and no vendor
   or operator token means no scan. Both are the doors that must be shut on the
   live site; neither creates anything. */
const passOut = await fetch(base + '/api/members/pass').then((r) => r.status).catch(() => 0)
const scanOut = await fetch(base + '/api/pass/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"token":"bp1.x.1.y"}' }).then((r) => r.status).catch(() => 0)
console.log(`pass          : signed out ${passOut} | scan without a token ${scanOut}`)
if (passOut !== 401) fails.push(`/api/members/pass answered ${passOut} signed out, expected 401`)
if (scanOut !== 401) fails.push(`/api/pass/verify answered ${scanOut} with no vendor or operator token, expected 401`)

/* ---- 2026-09-13: the kitchen screen, the Scan tab, cancelling, the count ----
   Still read-only. No key is issued, no camera is started, no order is placed:
   each door is checked from the outside, where it must be shut. */
const status = (path, init) => fetch(base + path, init).then((r) => r.status).catch(() => 0)
const doors = {
  kitchenMe: await status('/api/kitchen/me'),
  queue: await status('/api/orders'),
  issue: await status('/api/vendors/v_belly/tokens', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }),
  keys: await status('/api/vendors/v_belly/tokens'),
  revoke: await status('/api/vendor-tokens/vk_0000000000000000', { method: 'DELETE' }),
  signups: await status('/api/register-signups'),
  cancel: await status('/api/orders/o_no_such_order/cancel', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }),
  mine: await status('/api/members/orders'),
  /* Friends are for signed-in members only (2026-09-25). */
  friends: await status('/api/friends'),
  befriend: await status('/api/friends/requests', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"to":"mb_nobody"}' }),
}
console.log('doors         :', JSON.stringify(doors))
for (const [k, want] of Object.entries({ kitchenMe: 401, queue: 401, issue: 401, keys: 401, revoke: 401, signups: 401, cancel: 404, mine: 401, friends: 401, befriend: 401 })) {
  if (doors[k] !== want) fails.push(`${k} answered ${doors[k]} from outside, expected ${want}`)
}
const count = await fetch(base + '/api/members/count').then((r) => r.json()).catch(() => null)
console.log('member count  :', JSON.stringify(count))
if (!count || !Number.isInteger(count.count) || count.count < 1) fails.push('/api/members/count did not answer with a real number')

const kr = await fetch(base + '/kitchen')
const policy = kr.headers.get('permissions-policy') || ''
if (!/camera=\(self\)/.test(policy)) fails.push(`the camera is still blocked by the live Permissions-Policy: "${policy}"`)
await p.goto(base + '/kitchen', { waitUntil: 'networkidle', timeout: 45000 })
const kitchen = await p.waitForSelector('.kitchen-signin h1', { timeout: 20000 }).then(async () => ({
  title: await p.textContent('.kitchen-signin h1'),
  robots: await p.evaluate(() => document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null),
  shell: await p.locator('.dialer, .device').count(),
})).catch(() => null)
console.log('kitchen       :', JSON.stringify(kitchen))
if (!kitchen) fails.push('/kitchen did not draw its sign-in screen')
else {
  if (kitchen.title !== 'BEASTY kitchen') fails.push(`/kitchen is titled "${kitchen.title}"`)
  if (kitchen.robots !== 'noindex, nofollow') fails.push('/kitchen does not ask search engines to stay away')
  if (kitchen.shell) fails.push('the customer app loaded behind the kitchen screen')
}

await p.goto(base + '/', { waitUntil: 'networkidle', timeout: 60000 })
await p.locator('[aria-label="Enter BEASTY"]').first().waitFor({ state: 'visible', timeout: 30000 }).catch(() => {})
await p.locator('[aria-label="Scan"]').first().click({ timeout: 10000 }).catch(() => {})
const scanTab = await p.getByRole('button', { name: 'Start the camera' }).isVisible({ timeout: 10000 }).catch(() => false)
console.log('scan tab      :', scanTab ? 'Start the camera is offered' : 'no camera button')
if (!scanTab) fails.push('the landing Scan tab does not offer to start the camera')

for (const s of ['Sign in or join free', 'contacts-join', 'That code is not a BEASTY code', 'order-cancel-confirm', 'Cancel ticket', 'kitchenLive', 'Scan a member pass', 'register code']) {
  if (!bundles.includes(s)) fails.push(`"${s}" is not in any deployed chunk`)
}

/* ---- 2026-09-16: BEASTY Collab, his invitation and the creator form ----
   READ-ONLY: the form is opened and read, never sent. The endpoint is asked
   with an empty body, which it refuses before anything is written. */
await p.goto(base + '/', { waitUntil: 'networkidle', timeout: 60000 })
await p.locator('[aria-label="7"]').first().click({ timeout: 15000 }).catch(() => {})
await p.locator('[aria-label="7. COLLABS"]').first().click({ timeout: 15000 }).catch(() => {})
const collab = await p.waitForSelector('.dialer-panel .collab-form', { timeout: 15000 }).then(() => p.evaluate(() => ({
  title: document.querySelector('.dialer-panel h2')?.textContent?.trim(),
  sade: /Sade & Munchy/.test(document.querySelector('.dialer-panel-body')?.textContent ?? ''),
  fields: [...document.querySelectorAll('.collab-form .join-field > span')].map((s) => s.textContent?.trim()).join(', '),
}))).catch(() => null)
const collabApi = await fetch(base + '/api/collabs', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' }).then((r) => r.status).catch(() => 0)
console.log('collab        :', JSON.stringify({ ...collab, api: collabApi }))
if (!collab) fails.push('the Collab key does not open the creator form')
else {
  if (collab.title !== 'BEASTY Collab') fails.push(`the Collab panel is titled "${collab.title}"`)
  if (!collab.sade) fails.push('the Collab panel is missing his invitation')
  if (collab.fields !== 'Name, Phone number, Email address, Instagram handle') fails.push(`the Collab form asks for: ${collab.fields}`)
}
if (collabApi !== 400) fails.push(`/api/collabs answered ${collabApi} to an empty body, expected 400`)
/* The link Glenn sends to creators' DMs opens onto the invitation and its Share button. */
const collabHead = await fetch(base + '/collab').then((r) => r.text()).catch(() => '')
await p.goto(base + '/collab', { waitUntil: 'networkidle', timeout: 60000 })
const linked = await p.waitForSelector('.dialer-panel .collab-share', { timeout: 15000 }).then(() => true).catch(() => false)
console.log('collab link   :', JSON.stringify({ title: /<title>BEASTY Collab<\/title>/.test(collabHead), preview: /og:title/.test(collabHead), opens: linked }))
if (!/<title>BEASTY Collab<\/title>/.test(collabHead) || !/og:title/.test(collabHead)) fails.push('beastypages.com/collab does not carry its own title and preview')
if (!linked) fails.push('beastypages.com/collab does not open onto the invitation with its Share button')
/* The two pages he asked to share the next morning: MAKE $ and membership. */
for (const [slug, title, sel] of [['money', 'Make money with BEASTY', '.dialer-panel .dialer-panel-action.is-share'], ['members', 'BEASTY membership', '.chrome-pill.is-share']]) {
  const head = await fetch(`${base}/${slug}`).then((r) => r.text()).catch(() => '')
  await p.goto(`${base}/${slug}`, { waitUntil: 'networkidle', timeout: 60000 })
  const opens = await p.waitForSelector(sel, { timeout: 20000 }).then(() => true).catch(() => false)
  console.log(`collab ${slug.padEnd(8)}:`, JSON.stringify({ title: head.includes(`<title>${title}</title>`), opens }))
  if (!head.includes(`<title>${title}</title>`) || !/og:title/.test(head)) fails.push(`beastypages.com/${slug} does not carry its own title and preview`)
  if (!opens) fails.push(`beastypages.com/${slug} does not open its page with a Share button`)
}
/* The sample people Contacts showed before accounts existed, and Glenn's name,
   which BEASTY LLC keeps off the site (it captioned Chef Jeff's photos until
   their menu replaced them on 2026-09-13). */
for (const s of ['sample profile', 'Marisol R.', 'Terrell B.', 'Glenn Malicdem']) {
  if (bundles.includes(s)) fails.push(`"${s}" is still in a deployed chunk`)
}

/* 2026-09-19: the landing's count line is gone ("Could you remove this also
   when you can?"). The owners on Contacts are checked in the bundle list
   above: signed out, the dock that opens Contacts raises the sign-up prompt. */
await p.goto(base, { waitUntil: 'networkidle', timeout: 60000 })
await p.click('[aria-label="1"]', { timeout: 4000 }).catch(() => {})
await p.waitForTimeout(3200)
const landingLine = await p.evaluate(() => /local businesses\. Open tiles/.test(document.body.innerText))
console.log('landing line  :', landingLine ? 'still there' : 'gone')
if (landingLine) fails.push('the landing still prints the "local businesses. Open tiles" line')

await b.close()
if (fails.length) { console.log('\nFAIL: ' + fails.join('; ')); process.exit(1) }
console.log(`\nPASS on ${base}: the chapter stays open, the pages render, the roster facts show, the button links, the folded perks shipped.`)
