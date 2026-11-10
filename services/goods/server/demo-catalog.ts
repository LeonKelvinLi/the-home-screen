import { createHash } from "node:crypto";
import sharp from "sharp";
import type { Pool, PoolClient } from "pg";
import { codes, transaction } from "./common.js";
import type { createStorage } from "./storage.js";

/** Explicitly enabled public samples. This is unrelated to local demo logins. */
export const DEMO_CATALOG_KEY = "bsty-goods-sample-catalog-v1";
const fixedUuid = (key: string) => {
  const bytes = createHash("sha256")
    .update(DEMO_CATALOG_KEY + ":" + key)
    .digest()
    .subarray(0, 16);
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

export const DEMO_SELLERS = [
  "Streetwear Studio",
  "Everyday Objects",
  "Play Room",
  "Creative Shelf",
].map((label, index) => ({
  id: `bsty_demo_v1_seller_${String(index + 1).padStart(2, "0")}`,
  name: `Demo ${label}`,
  username: `bsty_demo_shelf_${index + 1}`,
  email: `sample-shelf-${index + 1}@demo.bsty.invalid`,
}));

type Kind =
  | "jacket"
  | "hoodie"
  | "shoe"
  | "bag"
  | "beanie"
  | "ceramic"
  | "planter"
  | "handheld"
  | "headphones"
  | "robot"
  | "figure"
  | "print"
  | "deck"
  | "notebook";
type Item = {
  title: string;
  category: string;
  condition: string;
  priceCents: number;
  kind: Kind;
  color: string;
  background: string;
  accent: string;
};
const items: Item[] = [
  {
    title: "Indigo utility jacket",
    category: "Clothing",
    condition: "Good",
    priceCents: 4800,
    kind: "jacket",
    color: "#405b88",
    background: "#e9edf5",
    accent: "#e4ac62",
  },
  {
    title: "Sunset cotton hoodie",
    category: "Clothing",
    condition: "Like new",
    priceCents: 3600,
    kind: "hoodie",
    color: "#d9805d",
    background: "#f7e9dd",
    accent: "#763f3a",
  },
  {
    title: "Cream canvas low-tops",
    category: "Sneakers",
    condition: "Good",
    priceCents: 4200,
    kind: "shoe",
    color: "#e6d5ad",
    background: "#f1eee6",
    accent: "#bb6f49",
  },
  {
    title: "Moss everyday runners",
    category: "Sneakers",
    condition: "Like new",
    priceCents: 6200,
    kind: "shoe",
    color: "#6d8268",
    background: "#e8ece3",
    accent: "#e5b950",
  },
  {
    title: "Mini crossbody bag",
    category: "Accessories",
    condition: "Like new",
    priceCents: 2800,
    kind: "bag",
    color: "#414c47",
    background: "#e4e9e4",
    accent: "#dcb471",
  },
  {
    title: "Amber knit beanie",
    category: "Accessories",
    condition: "New",
    priceCents: 1800,
    kind: "beanie",
    color: "#bd7937",
    background: "#f5e8d6",
    accent: "#704c35",
  },
  {
    title: "Ceramic desk set",
    category: "Home",
    condition: "Like new",
    priceCents: 3200,
    kind: "ceramic",
    color: "#dfc9b2",
    background: "#efebe6",
    accent: "#647f82",
  },
  {
    title: "Speckled plant pot",
    category: "Home",
    condition: "Good",
    priceCents: 2400,
    kind: "planter",
    color: "#cc9d80",
    background: "#f3e6dc",
    accent: "#658b62",
  },
  {
    title: "Retro pocket console",
    category: "Electronics",
    condition: "Good",
    priceCents: 8500,
    kind: "handheld",
    color: "#d3b6cd",
    background: "#ede5ef",
    accent: "#675174",
  },
  {
    title: "Slate wireless headphones",
    category: "Electronics",
    condition: "Like new",
    priceCents: 7800,
    kind: "headphones",
    color: "#48566b",
    background: "#e5eaf2",
    accent: "#a7b4c8",
  },
  {
    title: "Pocket robot figure",
    category: "Collectibles",
    condition: "New",
    priceCents: 2200,
    kind: "robot",
    color: "#ddae48",
    background: "#f5edd7",
    accent: "#627c83",
  },
  {
    title: "Weekend vinyl character",
    category: "Collectibles",
    condition: "Like new",
    priceCents: 3400,
    kind: "figure",
    color: "#ba8faf",
    background: "#f0e6ee",
    accent: "#6e667b",
  },
  {
    title: "Color study art print",
    category: "Art",
    condition: "New",
    priceCents: 2500,
    kind: "print",
    color: "#d68a5c",
    background: "#f4e9dc",
    accent: "#557878",
  },
  {
    title: "Geometric gallery print",
    category: "Art",
    condition: "New",
    priceCents: 3000,
    kind: "print",
    color: "#5e7b9c",
    background: "#e8edf1",
    accent: "#d2b24f",
  },
  {
    title: "Maple cruiser deck",
    category: "Other",
    condition: "Good",
    priceCents: 5500,
    kind: "deck",
    color: "#c9a26d",
    background: "#efe6d8",
    accent: "#597d74",
  },
  {
    title: "Yellow field notebook",
    category: "Other",
    condition: "New",
    priceCents: 1200,
    kind: "notebook",
    color: "#e2b93d",
    background: "#f5eed6",
    accent: "#706446",
  },
];
export const DEMO_ITEMS = items.map((item, index) => ({
  ...item,
  id: fixedUuid(`listing-${index + 1}`),
  photoId: fixedUuid(`photo-${index + 1}`),
  storageKey: fixedUuid(`photo-${index + 1}`) + ".webp",
  thumbnailKey: fixedUuid(`thumbnail-${index + 1}`) + ".webp",
  ownerId: DEMO_SELLERS[Math.floor(index / 4)].id,
  code: ["A-1", "A-2", "A-3", "B-1"][index % 4],
}));

function illustration(item: Item) {
  const c = item.color,
    a = item.accent;
  const art: Record<Kind, string> = {
    jacket: `<path d="M220 235 325 180H475L580 235 655 435 570 465 520 350V650H280V350L230 465 145 435Z" fill="${c}"/><path d="m325 180 75 82 75-82-28 124h-94Z" fill="${a}"/><path d="M400 262V650M300 365h70v75h-70m130-75h70v75h-70" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="5"/><path d="M280 615h240" stroke="#263345" stroke-width="28"/>`,
    hoodie: `<path d="M297 265q-70-150 103-150t103 150l76 42 64 208-88 27-47-131v239H292V411l-47 131-88-27 64-208Z" fill="${c}"/><path d="M297 265q103-117 206 0l-103 69Z" fill="${a}"/><path d="M325 505h150l20 84H305Z" fill="none" stroke="#fff" stroke-opacity=".42" stroke-width="5"/><path d="M375 317v95m50-95v95" stroke="#eee4d1" stroke-width="7"/>`,
    shoe: `<path d="M160 465q55-10 65-156l125 50 100 101 152 35q68 18 53 77H150q-35-37 10-107" fill="${c}"/><path d="M150 550h508v38H150q-38-20 0-38" fill="#fffaf0" stroke="#d0c9b9" stroke-width="4"/><path d="m278 367 102 90m-119-64 99 81m-114-51 91 67" stroke="#fff" stroke-width="12"/><path d="m410 486 154-18-64 62H385Z" fill="${a}"/><path d="M176 486h76" stroke="#fff" stroke-width="14"/>`,
    bag: `<path d="M245 285q-65-205 155-205t155 205" fill="none" stroke="${c}" stroke-width="32"/><rect x="200" y="275" width="400" height="320" rx="65" fill="${c}"/><path d="M230 300h340M250 420h300" stroke="#fff" stroke-opacity=".3" stroke-width="5"/><rect x="355" y="380" width="90" height="64" rx="12" fill="${a}"/><path d="M590 350q112-24 85 185" fill="none" stroke="${c}" stroke-width="24"/>`,
    beanie: `<path d="M230 485V370q0-180 170-180t170 180v115Z" fill="${c}"/><path d="M270 470V355m43 115V296m43 174V254m44 216V238m44 232V254m43 216V296m43 174V355" stroke="#fff" stroke-opacity=".22" stroke-width="9"/><rect x="205" y="448" width="390" height="128" rx="29" fill="${c}" stroke="${a}" stroke-width="5"/><path d="M229 470h340m-340 20h340m-340 20h340m-340 20h340m-340 20h340" stroke="${a}" stroke-opacity=".35" stroke-width="4"/><rect x="364" y="477" width="72" height="69" rx="4" fill="#eee6d8"/>`,
    ceramic: `<ellipse cx="285" cy="520" rx="120" ry="33" fill="${a}" opacity=".3"/><path d="M175 335h220l-22 185q-90 38-176 0Z" fill="${c}"/><ellipse cx="285" cy="335" rx="110" ry="30" fill="#f6eadb"/><path d="M397 365q110-38 102 57-8 70-112 55" fill="none" stroke="${c}" stroke-width="28"/><path d="M490 440h150l-13 125H505Z" fill="${a}"/><ellipse cx="565" cy="440" rx="75" ry="22" fill="#d7e3de"/><path d="M535 432v-129m35 130v-178m30 178v-134" stroke="#b7986d" stroke-width="12"/>`,
    planter: `<path d="M268 380h264l-38 235H306Z" fill="${c}"/><ellipse cx="400" cy="380" rx="132" ry="37" fill="#5d5344"/><path d="M400 389V185" stroke="${a}" stroke-width="13"/><path d="M398 270q-142-11-133-125 116 2 133 125m8 51q148-18 135-143-123 10-135 143m-10 43q-156 4-169-115 128-6 169 115" fill="${a}"/><g fill="#fff" opacity=".5"><circle cx="333" cy="438" r="5"/><circle cx="470" cy="473" r="5"/><circle cx="375" cy="565" r="5"/><circle cx="432" cy="423" r="5"/><circle cx="324" cy="531" r="4"/><circle cx="449" cy="564" r="4"/></g>`,
    handheld: `<rect x="242" y="135" width="316" height="493" rx="44" fill="${c}"/><rect x="272" y="178" width="256" height="224" rx="21" fill="${a}"/><rect x="297" y="204" width="206" height="170" rx="8" fill="#b4c3a0"/><path d="M318 251h46v45h47v-45h47v74H318Z" fill="#779675"/><path d="M298 486h90m-45-45v90" stroke="${a}" stroke-width="25"/><circle cx="472" cy="470" r="20" fill="${a}"/><circle cx="509" cy="517" r="20" fill="${a}"/><path d="m405 575 45-10m-104 19 37-8" stroke="${a}" stroke-width="10"/>`,
    headphones: `<path d="M245 456V345q0-171 155-171t155 171v111" fill="none" stroke="${c}" stroke-width="58"/><path d="M245 355q0-165 155-165t155 165" fill="none" stroke="${a}" stroke-width="20"/><rect x="192" y="380" width="114" height="207" rx="46" fill="${c}"/><rect x="494" y="380" width="114" height="207" rx="46" fill="${c}"/><rect x="214" y="402" width="65" height="164" rx="28" fill="${a}"/><rect x="521" y="402" width="65" height="164" rx="28" fill="${a}"/>`,
    robot: `<path d="M400 185v-48" stroke="${a}" stroke-width="12"/><circle cx="400" cy="128" r="20" fill="${c}"/><rect x="280" y="195" width="240" height="180" rx="36" fill="${c}"/><rect x="310" y="235" width="180" height="82" rx="20" fill="${a}"/><circle cx="357" cy="274" r="15" fill="#fff"/><circle cx="444" cy="274" r="15" fill="#fff"/><rect x="275" y="395" width="250" height="160" rx="31" fill="${c}"/><path d="M243 415v121m314-121v121M330 552v70m140-70v70" stroke="${a}" stroke-width="50"/><circle cx="400" cy="464" r="35" fill="${a}"/>`,
    figure: `<ellipse cx="400" cy="491" rx="128" ry="148" fill="${a}"/><circle cx="400" cy="276" r="139" fill="${c}"/><circle cx="290" cy="178" r="49" fill="${c}"/><circle cx="510" cy="178" r="49" fill="${c}"/><circle cx="354" cy="282" r="14" fill="#fff"/><circle cx="446" cy="282" r="14" fill="#fff"/><ellipse cx="400" cy="328" rx="30" ry="21" fill="${a}"/><path d="M286 430l-62 93m290-93 62 93M343 592l-10 49m124-49 10 49" stroke="${c}" stroke-width="56" stroke-linecap="round"/>`,
    print: `<path d="M230 151h340v500H230Z" fill="#c5aa81"/><path d="M247 168h306v466H247Z" fill="#fff9e9"/><path d="M276 205h248v352H276Z" fill="${c}"/><circle cx="400" cy="327" r="95" fill="${a}"/><path d="M276 557V391q120-115 248 0v166Z" fill="#efdfb6"/><path d="M276 557q124-195 248-30v30Z" fill="${a}"/><path d="M345 599h110" stroke="#b8aa8f" stroke-width="5"/>`,
    deck: `<g transform="rotate(27 400 400)"><rect x="303" y="110" width="194" height="550" rx="97" fill="${c}"/><path d="M322 180q78 185 156 0v312q-78-185-156 0Z" fill="${a}"/><path d="M342 220h116M342 550h116" stroke="#e7dfcb" stroke-width="9"/><g fill="#473d31"><circle cx="365" cy="210" r="5"/><circle cx="435" cy="210" r="5"/><circle cx="365" cy="555" r="5"/><circle cx="435" cy="555" r="5"/></g></g>`,
    notebook: `<g transform="rotate(-9 400 400)"><rect x="265" y="153" width="310" height="465" rx="21" fill="${a}"/><rect x="245" y="138" width="310" height="465" rx="19" fill="${c}"/><path d="M285 138v465" stroke="${a}" stroke-opacity=".4" stroke-width="5"/><rect x="326" y="285" width="150" height="95" rx="3" fill="#f7efcf"/><path d="M349 320h104m-104 23h76" stroke="${a}" stroke-width="5"/><path d="M513 138v465" stroke="${a}" stroke-width="15"/></g>`,
  };
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><rect width="800" height="800" fill="${item.background}"/><circle cx="687" cy="120" r="165" fill="#fff" opacity=".22"/><ellipse cx="400" cy="661" rx="235" ry="24" fill="#26271f" opacity=".08"/><text x="48" y="63" fill="#494940" font-family="sans-serif" font-size="15" font-weight="bold" letter-spacing="4">BSTY / SAMPLE STUDIO</text>${art[item.kind]}<rect x="0" y="711" width="800" height="89" fill="#fbf9f2"/><text x="400" y="750" text-anchor="middle" fill="#34342d" font-family="sans-serif" font-size="23" font-weight="bold" letter-spacing="6">DEMO SAMPLE</text><text x="400" y="778" text-anchor="middle" fill="#66665b" font-family="sans-serif" font-size="12" letter-spacing="2">ILLUSTRATION · NOT FOR SALE OR TRADE</text></svg>`,
  );
}

function collision(kind: string, id: string): never {
  throw new Error(
    `Demo catalog ${kind} collision (${id}); existing data was not changed.`,
  );
}
async function record(db: PoolClient, kind: string, id: string) {
  await db.query(
    "INSERT INTO goods_demo_catalog_records(entity_kind,entity_id,catalog_key) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
    [kind, id, DEMO_CATALOG_KEY],
  );
}

/**
 * Called after migrations. Strict opt-in; no passwords, sessions, account
 * credentials, messages, trades, payments or remote image downloads are made.
 */
export async function initializeDemoCatalog(
  pool: Pool,
  storage: ReturnType<typeof createStorage>,
  config: NodeJS.ProcessEnv,
) {
  return transaction(pool, async (db) => {
    await db.query("SELECT pg_advisory_xact_lock(946781239)");
    const records = (
      await db.query(
        "SELECT * FROM goods_demo_catalog_records WHERE catalog_key=$1",
        [DEMO_CATALOG_KEY],
      )
    ).rows;
    if (config.GOODS_DEMO_CATALOG !== "1") {
      await db.query(
        `UPDATE listings SET demo_disabled=true WHERE is_demo=true AND id=ANY($2::uuid[]) AND owner_id=ANY($3::text[]) AND id::text IN (SELECT entity_id FROM goods_demo_catalog_records WHERE catalog_key=$1 AND entity_kind='listing')`,
        [
          DEMO_CATALOG_KEY,
          DEMO_ITEMS.map((item) => item.id),
          DEMO_SELLERS.map((seller) => seller.id),
        ],
      );
      return { enabled: false, sellers: 0, listings: 0 };
    }
    const expectedIds = [
      ...DEMO_SELLERS.map((seller) => seller.id),
      ...DEMO_ITEMS.flatMap((item) => [item.id, item.photoId]),
    ];
    const foreignProvenance = await db.query(
      "SELECT 1 FROM goods_demo_catalog_records WHERE entity_id=ANY($1::text[]) AND catalog_key<>$2",
      [expectedIds, DEMO_CATALOG_KEY],
    );
    if (foreignProvenance.rowCount)
      collision("namespace provenance", DEMO_CATALOG_KEY);
    const owns = (kind: string, id: string) =>
      records.some((row) => row.entity_kind === kind && row.entity_id === id);
    // Validate the entire namespace before writing any row or object. A matching
    // public ID alone never grants permission to adopt somebody else's record.
    for (const seller of DEMO_SELLERS) {
      const existing = (
        await db.query(
          'SELECT u.*,p.username,p.is_demo FROM "user" u LEFT JOIN profiles p ON p.id=u.id WHERE u.id=$1 FOR UPDATE OF u',
          [seller.id],
        )
      ).rows[0];
      if (
        existing &&
        (!owns("seller", seller.id) ||
          existing.is_demo !== true ||
          existing.email !== seller.email ||
          existing.username !== seller.username)
      )
        collision("seller", seller.id);
      if (
        (
          await db.query(
            'SELECT 1 FROM "user" WHERE lower(email)=$1 AND id<>$2',
            [seller.email, seller.id],
          )
        ).rowCount ||
        (
          await db.query(
            "SELECT 1 FROM profiles WHERE username=$1 AND id<>$2",
            [seller.username, seller.id],
          )
        ).rowCount
      )
        collision("seller contact", seller.id);
      if (
        (await db.query('SELECT 1 FROM account WHERE "userId"=$1', [seller.id]))
          .rowCount
      )
        collision("seller credentials", seller.id);
    }
    for (const item of DEMO_ITEMS) {
      const existing = (
        await db.query("SELECT * FROM listings WHERE id=$1 FOR UPDATE", [
          item.id,
        ])
      ).rows[0];
      if (
        existing &&
        (!owns("listing", item.id) ||
          existing.is_demo !== true ||
          existing.owner_id !== item.ownerId ||
          existing.code !== item.code)
      )
        collision("listing", item.id);
      const occupied = (
        await db.query(
          "SELECT id FROM listings WHERE owner_id=$1 AND code=$2 AND status IN ('draft','active','reserved') AND id<>$3",
          [item.ownerId, item.code, item.id],
        )
      ).rows;
      if (occupied.length) collision("inventory slot", item.id);
      const photo = (
        await db.query("SELECT * FROM photos WHERE id=$1 FOR UPDATE", [
          item.photoId,
        ])
      ).rows[0];
      if (
        photo &&
        (!owns("photo", item.photoId) ||
          photo.owner_id !== item.ownerId ||
          photo.storage_key !== item.storageKey ||
          photo.thumbnail_storage_key !== item.thumbnailKey)
      )
        collision("photo", item.photoId);
      const conflictingKeys = (
        await db.query(
          "SELECT id FROM photos WHERE (storage_key=ANY($1::text[]) OR thumbnail_storage_key=ANY($1::text[])) AND id<>$2",
          [[item.storageKey, item.thumbnailKey], item.photoId],
        )
      ).rows;
      if (conflictingKeys.length) collision("photo storage key", item.photoId);
      const links = (
        await db.query(
          "SELECT photo_id,position FROM listing_photos WHERE listing_id=$1",
          [item.id],
        )
      ).rows;
      if (
        links.some(
          (link) => link.photo_id !== item.photoId || link.position !== 0,
        )
      )
        collision("photo assignment", item.id);
    }
    for (const seller of DEMO_SELLERS) {
      await db.query(
        'INSERT INTO "user"(id,name,email,"emailVerified","createdAt","updatedAt") VALUES($1,$2,$3,false,now(),now()) ON CONFLICT(id) DO NOTHING',
        [seller.id, seller.name, seller.email],
      );
      await db.query(
        "INSERT INTO profiles(id,username,name,bio,location,is_demo) VALUES($1,$2,$3,$4,$5,true) ON CONFLICT(id) DO NOTHING",
        [
          seller.id,
          seller.username,
          seller.name,
          "DEMO SAMPLE seller. This fictional shelf shows how BSTY Goods works. These illustrated items cannot be bought, traded or messaged about.",
          "Sample catalog",
        ],
      );
      await db.query(
        "INSERT INTO inventory_slots(owner_id,code) SELECT $1,unnest($2::text[]) ON CONFLICT DO NOTHING",
        [seller.id, codes],
      );
      await record(db, "seller", seller.id);
    }
    for (const [index, item] of DEMO_ITEMS.entries()) {
      const generated = await sharp(illustration(item))
        .webp({ quality: 88 })
        .toBuffer();
      const thumb = await sharp(generated)
        .resize({ width: 480, height: 480 })
        .webp({ quality: 80 })
        .toBuffer();
      const photoExists = !!(
        await db.query("SELECT 1 FROM photos WHERE id=$1", [item.photoId])
      ).rowCount;
      for (const [key, buffer] of [
        [item.storageKey, generated],
        [item.thumbnailKey, thumb],
      ] as const) {
        let existing: Buffer | null = null;
        try {
          existing = await storage.get(key);
        } catch (error) {
          const e = error as {
            code?: string;
            name?: string;
            $metadata?: { httpStatusCode?: number };
          };
          if (!(
            e.code === "ENOENT" ||
            e.name === "NoSuchKey" ||
            e.$metadata?.httpStatusCode === 404
          ))
            throw error;
        }
        if (existing && !photoExists && !existing.equals(buffer))
          collision("unregistered photo file", key);
        if (!existing) await storage.put(key, buffer);
      }
      await db.query(
        "INSERT INTO photos(id,owner_id,storage_key,width,height,bytes,thumbnail_storage_key) VALUES($1,$2,$3,800,800,$4,$5) ON CONFLICT(id) DO NOTHING",
        [
          item.photoId,
          item.ownerId,
          item.storageKey,
          generated.length,
          item.thumbnailKey,
        ],
      );
      await record(db, "photo", item.photoId);
      await db.query(
        `INSERT INTO listings(id,owner_id,code,title,description,category,condition,price_cents,trade_enabled,trade_preferences,status,is_demo,published_at,created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,false,$9,'active',true,now()-($10::integer*interval '38 minutes'),now()-($10::integer*interval '38 minutes')) ON CONFLICT(id) DO NOTHING`,
        [
          item.id,
          item.ownerId,
          item.code,
          item.title,
          "DEMO SAMPLE — An illustrated example, not a real seller's item. This sample is not for sale, shipping or trading. You can browse and save it while exploring BSTY Goods; messages and trade offers are disabled. Price and condition are examples only.",
          item.category,
          item.condition,
          item.priceCents,
          "Sample catalog item. No trade offers are accepted.",
          index,
        ],
      );
      await db.query(
        "INSERT INTO listing_photos(listing_id,photo_id,position) VALUES($1,$2,0) ON CONFLICT DO NOTHING",
        [item.id, item.photoId],
      );
      await record(db, "listing", item.id);
      await db.query(
        "UPDATE listings SET demo_disabled=false WHERE id=$1 AND is_demo=true",
        [item.id],
      );
    }
    return {
      enabled: true,
      sellers: DEMO_SELLERS.length,
      listings: DEMO_ITEMS.length,
    };
  });
}
