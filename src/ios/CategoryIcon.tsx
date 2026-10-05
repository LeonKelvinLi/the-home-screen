import { SQUIRCLE_100 } from './squircle'

/** One coherent set of pictograms for the category doors. Labels remain outside. */
const MARKS: Record<string, string> = {
  goods: 'M28 45h44M25 37c0-14 50-14 50 0ZM25 53h50l-5 12H30Z',
  boutiques: 'M30 34h40l5 39H25ZM40 35v-8a10 10 0 0 1 20 0v8',
  services: 'M61 25a15 15 0 0 0-19 19L24 64a8 8 0 0 0 12 12l20-19a15 15 0 0 0 19-19L63 49 52 38Z',
  sweets: 'M34 49l16 30 16-30ZM30 48a13 13 0 0 1 8-22 13 13 0 0 1 24 0 13 13 0 0 1 8 22Z',
  ayce: 'M25 52a25 25 0 0 1 50 0ZM20 58h60M50 27v-7M42 20h16M30 70h40',
  coffee: 'M27 38h35v23a14 14 0 0 1-28 0ZM62 42h8a9 9 0 0 1 0 18h-8M23 78h49M38 27v-8M51 27v-8',
  online: 'M21 25h58v39H21ZM40 75h20M50 64v11M27 33h46',
  individuals: 'M40 28a10 10 0 1 0 20 0 10 10 0 1 0-20 0ZM28 76v-8a22 22 0 0 1 44 0v8',
  tattoo: 'M37 27l13-10 13 10-5 17H42ZM50 44v33M43 58h14M46 77h8',
  automotive: 'M25 52l7-23h36l7 23v19H25ZM25 52h50M35 63h1M64 63h1M29 71v7M71 71v7',
  whips: 'M21 54l13-17h28l17 17v15H21ZM36 37l-5 17h42l-11-17M27 69v8M73 69v8M32 61h4M64 61h4',
  gyms: 'M20 36v28M29 30v40M71 30v40M80 36v28M29 50h42',
  salons: 'M26 28l48 46M28 73l46-46M23 65a9 9 0 1 0 13 13 9 9 0 1 0-13-13ZM23 22a9 9 0 1 0 13 13 9 9 0 1 0-13-13',
  barbershops: 'M36 24h28v52H36ZM36 42l28-16M36 60l28-16M36 75l28-16M32 19h36M32 81h36',
  foodies: 'M28 21v23M20 21v14a8 8 0 0 0 16 0V21M28 43v36M66 21v58M66 21c-17 13-16 30 0 30',
  cooks: 'M31 48a13 13 0 0 1 3-25 18 18 0 0 1 32 0 13 13 0 0 1 3 25v25H31ZM31 62h38',
  ai: 'M33 33h34v34H33ZM43 43h14v14H43ZM41 20v13M59 20v13M41 67v13M59 67v13M20 41h13M20 59h13M67 41h13M67 59h13',
  artists: 'M26 62c-9-22 12-43 35-37 26 7 18 27 5 25-12-2-17 10-6 17 8 9-25 17-34-5ZM35 41h1M50 33h1M64 39h1M32 57h1',
  athletes: 'M53 21a7 7 0 1 0 14 0 7 7 0 1 0-14 0ZM49 37l-15 13M49 37l17 9 11-8M49 37l-8 23 16 9-8 13M41 60l-20 14',
  dancers: 'M43 23a7 7 0 1 0 14 0 7 7 0 1 0-14 0ZM50 38v20M50 38L27 27M50 38l23-11M50 58L31 78M50 58l21 20',
  djs: 'M23 26h54v48H23ZM34 50a16 16 0 1 0 32 0 16 16 0 1 0-32 0ZM46 50a4 4 0 1 0 8 0 4 4 0 1 0-8 0ZM69 34v22l-8 8',
  realtors: 'M20 46l30-25 30 25M29 40v38h42V40M43 78V57h14v21',
  photographers: 'M22 34h17l6-9h14l6 9h13v40H22ZM39 53a13 13 0 1 0 26 0 13 13 0 1 0-26 0ZM29 42h2',
  meats: 'M27 39c11-18 40-20 49-5 11 18-10 42-32 42-18 0-29-19-17-37ZM39 44c6-11 23-14 27-7 6 10-7 25-20 25-11 0-14-10-7-18',
}
const COLORS: Record<string, string> = { goods:'#9C4B21', sweets:'#913D6A', coffee:'#81522E', ayce:'#236E74', automotive:'#22538A', whips:'#4D468F', foodies:'#A46620', ai:'#376B74', boutiques:'#824D69', cooks:'#617545' }
export function CategoryIcon({ kind }: { kind: string }) {
  return <svg className="category-door" viewBox="0 0 100 100" aria-hidden="true">
    <path d={SQUIRCLE_100} fill={COLORS[kind] ?? '#435767'} />
    <path d={MARKS[kind]} fill="none" stroke="#fff5dd" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
}
