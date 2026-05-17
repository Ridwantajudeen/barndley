export type CatalogCategory = { id: string; name: string; items: string[] };

export const catalog: CatalogCategory[] = [
  {
    id: "grains",
    name: "Grains & Cereals",
    items: [
      "Rice (Imported)", "Rice (Local)", "Rice (Ofada)", "Brown Beans", "White Beans",
      "Oloyin Beans", "Black-eyed Beans", "White Garri", "Yellow Garri", "Corn (Dry)",
      "Maize", "Millet", "Sorghum", "Wheat", "Guinea Corn", "Semovita", "Semolina", "Oatmeal",
    ],
  },
  {
    id: "tubers",
    name: "Tubers & Root Crops",
    items: ["Yam", "Half Yam", "Sweet Potato", "Irish Potato", "Cassava", "Cocoyam", "Plantain (Ripe)", "Plantain (Unripe)"],
  },
  {
    id: "vegetables",
    name: "Vegetables & Leafy Greens",
    items: ["Ugu", "Spinach", "Waterleaf", "Bitter Leaf", "Scent Leaf", "Curry Leaf", "Lettuce", "Cabbage", "Okra", "Green Beans", "Carrot", "Cucumber"],
  },
  {
    id: "pepper",
    name: "Pepper, Tomatoes & Fresh Produce",
    items: ["Tomatoes", "Fresh Pepper", "Scotch Bonnet (Rodo)", "Tatashe", "Bell Pepper", "Onion", "Garlic", "Ginger", "Garden Egg", "Avocado", "Lemon", "Lime", "Banana", "Orange", "Pineapple", "Watermelon"],
  },
  {
    id: "protein",
    name: "Meat, Fish & Proteins",
    items: ["Beef", "Goat Meat", "Chicken", "Turkey", "Fresh Fish", "Catfish", "Tilapia", "Stockfish", "Dry Fish", "Smoked Fish", "Crayfish", "Snail", "Prawns", "Crab", "Eggs", "Ponmo"],
  },
  {
    id: "frozen",
    name: "Frozen Foods",
    items: ["Frozen Chicken", "Frozen Turkey", "Frozen Fish", "Sausage", "Nuggets", "Shrimp"],
  },
  {
    id: "soup",
    name: "Soup Ingredients & Local Cooking Essentials",
    items: ["Egusi", "Ogbono", "Ground Crayfish", "Palm Oil", "Locust Beans (Iru)", "Dry Pepper", "Ground Pepper", "Groundnut Paste", "Palm Kernel"],
  },
  {
    id: "spices",
    name: "Spices & Seasonings",
    items: ["Salt", "Curry Powder", "Thyme", "Ginger Powder", "Garlic Powder", "Maggi Cubes", "Knorr Cubes", "Black Pepper"],
  },
  {
    id: "oils",
    name: "Oils & Condiments",
    items: ["Palm Oil", "Vegetable Oil", "Groundnut Oil", "Coconut Oil", "Butter", "Margarine", "Mayonnaise", "Ketchup", "Tomato Paste"],
  },
  {
    id: "pantry",
    name: "Packaged & Pantry Foods",
    items: ["Indomie", "Spaghetti", "Macaroni", "Sardines", "Corned Beef", "Baked Beans", "Sachet Milk", "Custard", "Pap (Ogi)", "Flour"],
  },
  {
    id: "bread",
    name: "Bread, Breakfast & Dairy",
    items: ["Bread", "Milk", "Yogurt", "Cheese", "Tea", "Coffee", "Sugar", "Cornflakes", "Golden Morn", "Peanut Butter", "Jam"],
  },
  {
    id: "snacks",
    name: "Snacks & Quick Foods",
    items: ["Biscuit", "Chin Chin", "Plantain Chips", "Popcorn", "Cup Noodles"],
  },
  {
    id: "drinks",
    name: "Drinks & Beverages",
    items: ["Water", "Soft Drinks", "Juice", "Malt", "Energy Drink"],
  },
  {
    id: "household",
    name: "Household Cooking Essentials",
    items: ["Nylon Bag", "Foil Paper", "Food Wrap", "Storage Bowl", "Disposable Plate", "Paper Towel", "Gas Lighter"],
  },
];
