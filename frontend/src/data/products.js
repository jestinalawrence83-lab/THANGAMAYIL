
const image = (photoId) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=700&q=85`;

const catalogue = [
  // WOMEN — GOLD
  ["Women", "Gold", "Antique Temple Necklace", "Necklaces", 4899, "photo-1599643478518-a784e5dc4c8f"],
  ["Women", "Gold", "Traditional Lakshmi Haram", "Haram", 12500, "photo-1611652022419-a9419f74343d"],
  ["Women", "Gold", "Classic Gold Jhumkas", "Earrings", 4200, "photo-1535632066927-ab7c9ab60908"],
  ["Women", "Gold", "Bridal Gold Bangles", "Bangles", 6500, "photo-1617038220319-276d3cfab638"],
  ["Women", "Gold", "Traditional Kasu Mala", "Kasu Mala", 9800, "photo-1611652022419-a9419f74343d"],
  ["Women", "Gold", "Antique Gold Choker", "Chokers", 7200, "photo-1599643478518-a784e5dc4c8f"],
  ["Women", "Gold", "Everyday Gold Chain", "Chains", 3200, "photo-1617038220319-276d3cfab638"],
  ["Women", "Gold", "Classic Gold Ring", "Rings", 2100, "photo-1605100804763-247f67b3557e"],
  ["Women", "Gold", "Bridal Jewellery Set", "Bridal Sets", 14900, "photo-1599643478518-a784e5dc4c8f"],
  ["Women", "Gold", "Gold Pendant Set", "Pendant Sets", 3900, "photo-1617038220319-276d3cfab638"],
  ["Women", "Gold", "Traditional Gold Studs", "Stud Earrings", 1800, "photo-1535632066927-ab7c9ab60908"],
  ["Women", "Gold", "Gold Floral Bracelet", "Bracelets", 3500, "photo-1611591437281-460bfbe1220a"],
  ["Women", "Gold", "Gold Anklet Design", "Anklets", 2800, "photo-1617038220319-276d3cfab638"],

  // WOMEN — SILVER
  ["Women", "Silver", "Silver Floral Necklace", "Necklaces", 1800, "photo-1599643478518-a784e5dc4c8f"],
  ["Women", "Silver", "Silver Drop Earrings", "Earrings", 950, "photo-1535632066927-ab7c9ab60908"],
  ["Women", "Silver", "Silver Charm Bracelet", "Bracelets", 1250, "photo-1611591437281-460bfbe1220a"],
  ["Women", "Silver", "Silver Classic Ring", "Rings", 850, "photo-1605100804763-247f67b3557e"],
  ["Women", "Silver", "Silver Traditional Anklet", "Anklets", 1450, "photo-1617038220319-276d3cfab638"],
  ["Women", "Silver", "Silver Pendant", "Pendants", 1100, "photo-1617038220319-276d3cfab638"],
  ["Women", "Silver", "Silver Kada Pair", "Kadas", 1650, "photo-1611591437281-460bfbe1220a"],

  // WOMEN — DIAMOND
  ["Women", "Diamond", "Diamond Style Pendant", "Pendants", 5600, "photo-1599643478518-a784e5dc4c8f"],
  ["Women", "Diamond", "Diamond Style Studs", "Stud Earrings", 4200, "photo-1535632066927-ab7c9ab60908"],
  ["Women", "Diamond", "Diamond Style Ring", "Rings", 4900, "photo-1605100804763-247f67b3557e"],
  ["Women", "Diamond", "Diamond Style Necklace", "Necklaces", 7900, "photo-1599643478518-a784e5dc4c8f"],
  ["Women", "Diamond", "Diamond Style Bracelet", "Bracelets", 6300, "photo-1611591437281-460bfbe1220a"],

  // WOMEN — PLATINUM
  ["Women", "Platinum", "Platinum Style Band", "Rings", 7200, "photo-1605100804763-247f67b3557e"],
  ["Women", "Platinum", "Platinum Style Pendant", "Pendants", 6500, "photo-1617038220319-276d3cfab638"],
  ["Women", "Platinum", "Platinum Style Earrings", "Earrings", 5800, "photo-1535632066927-ab7c9ab60908"],
  ["Women", "Platinum", "Platinum Style Chain", "Chains", 8500, "photo-1599643478518-a784e5dc4c8f"],
  ["Women", "Platinum", "Platinum Style Bracelet", "Bracelets", 7600, "photo-1611591437281-460bfbe1220a"],

  // KIDS — GOLD
  ["Kids", "Gold", "Kids Floral Gold Studs", "Stud Earrings", 2200, "photo-1535632066927-ab7c9ab60908"],
  ["Kids", "Gold", "Kids Gold Bracelet", "Bracelets", 2800, "photo-1611591437281-460bfbe1220a"],
  ["Kids", "Gold", "Kids Gold Chain", "Chains", 3500, "photo-1617038220319-276d3cfab638"],
  ["Kids", "Gold", "Kids Gold Ring", "Rings", 1200, "photo-1605100804763-247f67b3557e"],
  ["Kids", "Gold", "Kids Gold Anklet", "Anklets", 2400, "photo-1617038220319-276d3cfab638"],
  ["Kids", "Gold", "Kids Tiny Pendant", "Pendants", 1500, "photo-1599643478518-a784e5dc4c8f"],

  // KIDS — SILVER
  ["Kids", "Silver", "Kids Silver Heart Bracelet", "Bracelets", 950, "photo-1611591437281-460bfbe1220a"],
  ["Kids", "Silver", "Kids Silver Anklet", "Anklets", 750, "photo-1617038220319-276d3cfab638"],
  ["Kids", "Silver", "Kids Silver Studs", "Stud Earrings", 550, "photo-1535632066927-ab7c9ab60908"],
  ["Kids", "Silver", "Kids Silver Pendant", "Pendants", 650, "photo-1599643478518-a784e5dc4c8f"],
  ["Kids", "Silver", "Kids Silver Ring", "Rings", 450, "photo-1605100804763-247f67b3557e"],

  // KIDS — DIAMOND
  ["Kids", "Diamond", "Kids Sparkle Pendant", "Pendants", 1600, "photo-1599643478518-a784e5dc4c8f"],
  ["Kids", "Diamond", "Kids Sparkle Studs", "Stud Earrings", 1800, "photo-1535632066927-ab7c9ab60908"],

  // KIDS — PLATINUM
  ["Kids", "Platinum", "Kids Platinum Style Ring", "Rings", 1900, "photo-1605100804763-247f67b3557e"],
  ["Kids", "Platinum", "Kids Platinum Style Pendant", "Pendants", 2100, "photo-1617038220319-276d3cfab638"],

  // MEN — GOLD
  ["Men", "Gold", "Men Classic Gold Chain", "Chains", 8900, "photo-1611652022419-a9419f74343d"],
  ["Men", "Gold", "Men Traditional Kada", "Kadas", 6800, "photo-1611591437281-460bfbe1220a"],
  ["Men", "Gold", "Men Gold Ring", "Rings", 4200, "photo-1605100804763-247f67b3557e"],
  ["Men", "Gold", "Men Gold Bracelet", "Bracelets", 5500, "photo-1611591437281-460bfbe1220a"],
  ["Men", "Gold", "Men Gold Pendant", "Pendants", 3600, "photo-1617038220319-276d3cfab638"],
  ["Men", "Gold", "Men Classic Chain Pendant", "Pendant Sets", 7200, "photo-1599643478518-a784e5dc4c8f"],

  // MEN — SILVER
  ["Men", "Silver", "Men Silver Kada", "Kadas", 2400, "photo-1611591437281-460bfbe1220a"],
  ["Men", "Silver", "Men Silver Chain", "Chains", 1800, "photo-1617038220319-276d3cfab638"],
  ["Men", "Silver", "Men Silver Ring", "Rings", 1250, "photo-1605100804763-247f67b3557e"],
  ["Men", "Silver", "Men Silver Bracelet", "Bracelets", 1650, "photo-1611591437281-460bfbe1220a"],
  ["Men", "Silver", "Men Silver Pendant", "Pendants", 1100, "photo-1599643478518-a784e5dc4c8f"],

  // MEN — DIAMOND
  ["Men", "Diamond", "Men Diamond Style Ring", "Rings", 4900, "photo-1605100804763-247f67b3557e"],
  ["Men", "Diamond", "Men Diamond Style Studs", "Stud Earrings", 3500, "photo-1535632066927-ab7c9ab60908"],

  // MEN — PLATINUM
  ["Men", "Platinum", "Men Platinum Style Band", "Rings", 6900, "photo-1605100804763-247f67b3557e"],
  ["Men", "Platinum", "Men Platinum Style Chain", "Chains", 8200, "photo-1617038220319-276d3cfab638"],
];

const products = catalogue.map((item, index) => ({
  id: index + 1,
  sku: `TM-${String(index + 1).padStart(4, "0")}`,
  audience: item[0],
  material: item[1],
  name: item[2],
  category: item[3],
  price: item[4],
  priceType: "DEMO",
  image: image(item[5]),
  description: `${item[2]} inspired by Indian jewellery traditions. Verify actual specifications before purchase.`,
  stock: 10,
  finish: `${item[1]} style`,
  featured: index < 8,
  rating: 4.5,
  currency: "INR",
  specifications: {
    purity: null,
    netWeightGrams: null,
    grossWeightGrams: null,
    makingCharges: null,
    gstRate: null,
    stoneDetails: null,
    hallmark: null,
    huid: null,
    certification: null,
  },
}));

export default products;
