export type Measurement = { id: string; label: string; price: number };
export type Product = {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  available: boolean;
  measurements: Measurement[];
};
export type Shop = {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  rating: number;
  reviews: number;
  distanceKm: number;
  etaMin: number;
  open: boolean;
  hours: string;
  hue: string;
  area: string;
  products: Product[];
};

export const shops: Shop[] = [
  {
    id: "mama-tee",
    name: "Mama Tee's Foodstuff",
    emoji: "🥬",
    tagline: "Fresh from Oja-Oba market, daily.",
    rating: 4.8,
    reviews: 312,
    distanceKm: 0.4,
    etaMin: 18,
    open: true,
    hours: "7:00 — 21:00",
    hue: "from-[oklch(0.94_0.06_148)] to-[oklch(0.95_0.05_65)]",
    area: "Ekosodin",
    products: [
      {
        id: "rice",
        name: "Local Rice (Ofada)",
        emoji: "🍚",
        category: "Grains",
        description: "Stone-free, parboiled. Sold by your preferred measure.",
        available: true,
        measurements: [
          { id: "m1", label: "1 paint bucket", price: 8500 },
          { id: "m2", label: "Half paint", price: 4400 },
          { id: "m3", label: "1 milk cup", price: 650 },
          { id: "m4", label: "Small bowl", price: 1200 },
        ],
      },
      {
        id: "beans",
        name: "Honey Beans",
        emoji: "🫘",
        category: "Grains",
        description: "Clean, no weevils. Cooks soft.",
        available: true,
        measurements: [
          { id: "m1", label: "1 cup", price: 800 },
          { id: "m2", label: "1 derica", price: 2200 },
          { id: "m3", label: "Half paint", price: 5200 },
        ],
      },
      {
        id: "garri",
        name: "Yellow Garri",
        emoji: "🌽",
        category: "Grains",
        description: "Fine ijebu garri, perfectly fermented.",
        available: true,
        measurements: [
          { id: "m1", label: "1 cup", price: 350 },
          { id: "m2", label: "Big bowl", price: 1500 },
        ],
      },
      {
        id: "pepper",
        name: "Fresh Pepper Mix",
        emoji: "🌶️",
        category: "Vegetables",
        description: "Rodo + tatashe + tomato. Already blended option.",
        available: true,
        measurements: [
          { id: "m1", label: "Per handful", price: 500 },
          { id: "m2", label: "Small bowl", price: 1800 },
          { id: "m3", label: "Blended (sachet)", price: 700 },
        ],
      },
    ],
  },
  {
    id: "brother-k",
    name: "Brother K Provisions",
    emoji: "🛒",
    tagline: "Snacks, noodles, and everything sachet.",
    rating: 4.6,
    reviews: 187,
    distanceKm: 0.8,
    etaMin: 22,
    open: true,
    hours: "8:00 — 23:00",
    hue: "from-[oklch(0.95_0.05_65)] to-[oklch(0.95_0.04_100)]",
    area: "Ekosodin",
    products: [
      {
        id: "indomie",
        name: "Indomie Noodles",
        emoji: "🍜",
        category: "Packaged",
        description: "Chicken flavour. Hot pack & belle ful options.",
        available: true,
        measurements: [
          { id: "m1", label: "Per sachet", price: 450 },
          { id: "m2", label: "Pack of 5", price: 2100 },
          { id: "m3", label: "Carton (40)", price: 16500 },
        ],
      },
      {
        id: "egg",
        name: "Fresh Eggs",
        emoji: "🥚",
        category: "Protein",
        description: "Farm crate, daily delivery.",
        available: true,
        measurements: [
          { id: "m1", label: "Per piece", price: 220 },
          { id: "m2", label: "Half crate", price: 3100 },
          { id: "m3", label: "Full crate", price: 6000 },
        ],
      },
      {
        id: "milo",
        name: "Milo Sachet",
        emoji: "🥤",
        category: "Drinks",
        description: "Pre-mixed chocolate energy drink.",
        available: false,
        measurements: [{ id: "m1", label: "Per sachet", price: 150 }],
      },
    ],
  },
  {
    id: "iya-bunmi",
    name: "Iya Bunmi Vegetables",
    emoji: "🥕",
    tagline: "Tubers, leafy greens, and proteins.",
    rating: 4.9,
    reviews: 421,
    distanceKm: 0.6,
    etaMin: 20,
    open: true,
    hours: "6:30 — 19:00",
    hue: "from-[oklch(0.94_0.06_148)] to-[oklch(0.94_0.05_100)]",
    area: "Ekosodin",
    products: [
      {
        id: "yam",
        name: "Puna Yam",
        emoji: "🍠",
        category: "Tubers",
        description: "Big tubers, fluffy when boiled.",
        available: true,
        measurements: [
          { id: "m1", label: "Per tuber", price: 4500 },
          { id: "m2", label: "Half tuber", price: 2400 },
        ],
      },
      {
        id: "ugu",
        name: "Ugu Leaves",
        emoji: "🥬",
        category: "Vegetables",
        description: "Fresh, washed, ready to chop.",
        available: true,
        measurements: [
          { id: "m1", label: "Per bunch", price: 700 },
          { id: "m2", label: "Per bag", price: 2500 },
        ],
      },
      {
        id: "chicken",
        name: "Raw Chicken",
        emoji: "🍗",
        category: "Protein",
        description: "Cleaned and portioned on request.",
        available: true,
        measurements: [
          { id: "m1", label: "Per kg", price: 5200 },
          { id: "m2", label: "Half kg", price: 2700 },
          { id: "m3", label: "Per piece", price: 1500 },
        ],
      },
    ],
  },
  {
    id: "shopgate",
    name: "Shopgate Mini Mart",
    emoji: "🏪",
    tagline: "Open till late. Right by the campus gate.",
    rating: 4.4,
    reviews: 96,
    distanceKm: 1.2,
    etaMin: 28,
    open: false,
    hours: "9:00 — 02:00",
    hue: "from-[oklch(0.94_0.04_100)] to-[oklch(0.95_0.05_65)]",
    area: "Ekosodin",
    products: [],
  },
  {
    id: "nselu-fresh",
    name: "Nselu Fresh Market",
    emoji: "🥭",
    tagline: "Mainland produce, bulk-friendly prices.",
    rating: 4.5,
    reviews: 142,
    distanceKm: 18,
    etaMin: 55,
    open: true,
    hours: "7:00 — 20:00",
    hue: "from-[oklch(0.94_0.07_60)] to-[oklch(0.95_0.05_30)]",
    area: "Nselu",
    products: [
      {
        id: "tomato",
        name: "Basket of Tomatoes",
        emoji: "🍅",
        category: "Vegetables",
        description: "Fresh from farm, mainland prices.",
        available: true,
        measurements: [
          { id: "m1", label: "Small basket", price: 4500 },
          { id: "m2", label: "Big basket", price: 9000 },
        ],
      },
      {
        id: "onion",
        name: "Red Onions",
        emoji: "🧅",
        category: "Vegetables",
        description: "Crisp, long shelf life.",
        available: true,
        measurements: [
          { id: "m1", label: "Per bulb", price: 250 },
          { id: "m2", label: "Bag", price: 6500 },
        ],
      },
    ],
  },
  {
    id: "ringroad-mart",
    name: "Ring Road SuperMart",
    emoji: "🏬",
    tagline: "City center hypermart with everything.",
    rating: 4.3,
    reviews: 88,
    distanceKm: 22,
    etaMin: 65,
    open: true,
    hours: "8:00 — 22:00",
    hue: "from-[oklch(0.93_0.05_240)] to-[oklch(0.94_0.05_200)]",
    area: "Ring Road",
    products: [
      {
        id: "oil",
        name: "Groundnut Oil",
        emoji: "🛢️",
        category: "Packaged",
        description: "Pure, golden cooking oil.",
        available: true,
        measurements: [
          { id: "m1", label: "1 litre", price: 3200 },
          { id: "m2", label: "5 litres", price: 14500 },
        ],
      },
    ],
  },
  {
    id: "newbenin-stop",
    name: "New Benin Pit Stop",
    emoji: "🍞",
    tagline: "Bakery & provisions across the bridge.",
    rating: 4.2,
    reviews: 51,
    distanceKm: 28,
    etaMin: 80,
    open: true,
    hours: "6:00 — 21:00",
    hue: "from-[oklch(0.94_0.05_330)] to-[oklch(0.95_0.04_300)]",
    area: "New Benin",
    products: [
      {
        id: "bread",
        name: "Family Loaf",
        emoji: "🍞",
        category: "Packaged",
        description: "Soft, baked this morning.",
        available: true,
        measurements: [
          { id: "m1", label: "Per loaf", price: 1200 },
        ],
      },
    ],
  },
];

export type OrderStatus =
  | "Placed"
  | "Vendor confirmed"
  | "Rider en route to shop"
  | "Picking items"
  | "Delivering"
  | "Delivered";

export const orderStages: OrderStatus[] = [
  "Placed",
  "Vendor confirmed",
  "Rider en route to shop",
  "Picking items",
  "Delivering",
  "Delivered",
];

export const sampleOrders = [
  {
    id: "CB-1042",
    shop: "Mama Tee's Foodstuff",
    items: 4,
    total: 6900,
    status: "Delivering" as OrderStatus,
    placedAt: "Today, 13:24",
    rider: "Tunde A.",
  },
  {
    id: "CB-1031",
    shop: "Iya Bunmi Vegetables",
    items: 2,
    total: 3200,
    status: "Delivered" as OrderStatus,
    placedAt: "Yesterday, 19:02",
    rider: "Mary E.",
  },
];

export type RiderRequest = {
  id: string;
  shop: string;
  shopPhone: string;
  pickup: string;
  student: string;
  studentPhone: string;
  drop: string;
  distanceKm: number;
  payout: number;
  items: number;
  bundle?: boolean;
  pickups?: { shop: string; phone: string; address: string; items: number }[];
};

export const riderRequests: RiderRequest[] = [
  {
    id: "REQ-771",
    shop: "Mama Tee's Foodstuff",
    shopPhone: "+234 802 990 1245",
    pickup: "Block 4, North Gate Market",
    student: "Adaeze O.",
    studentPhone: "+234 805 221 8890",
    drop: "Indep. Hall, Rm 214",
    distanceKm: 1.2,
    payout: 850,
    items: 4,
  },
  {
    id: "REQ-773",
    shop: "Bundle · 3 shops",
    shopPhone: "+234 802 990 1245",
    pickup: "Multi-stop route",
    student: "Funmi A.",
    studentPhone: "+234 809 442 1170",
    drop: "Mellanby Hall, Rm 7",
    distanceKm: 2.4,
    payout: 1450,
    items: 6,
    bundle: true,
    pickups: [
      { shop: "Mama Tee's Foodstuff", phone: "+234 802 990 1245", address: "Block 4, North Gate Market", items: 2 },
      { shop: "Brother K Provisions", phone: "+234 803 220 1188", address: "Stall 9, Campus Gate", items: 3 },
      { shop: "Iya Bunmi Vegetables", phone: "+234 803 117 6620", address: "Stall 12, South Market", items: 1 },
    ],
  },
  {
    id: "REQ-772",
    shop: "Iya Bunmi Vegetables",
    shopPhone: "+234 803 117 6620",
    pickup: "Stall 12, South Market",
    student: "Chidi M.",
    studentPhone: "+234 807 554 3321",
    drop: "Queens Hall, Rm 18",
    distanceKm: 0.9,
    payout: 700,
    items: 2,
  },
];

export const formatNaira = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
