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
    products: [],
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

export const riderRequests = [
  {
    id: "REQ-771",
    shop: "Mama Tee's Foodstuff",
    pickup: "Block 4, North Gate Market",
    drop: "Indep. Hall, Rm 214",
    distanceKm: 1.2,
    payout: 850,
    items: 4,
  },
  {
    id: "REQ-772",
    shop: "Iya Bunmi Vegetables",
    pickup: "Stall 12, South Market",
    drop: "Queens Hall, Rm 18",
    distanceKm: 0.9,
    payout: 700,
    items: 2,
  },
];

export const formatNaira = (n: number) =>
  "₦" + n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
