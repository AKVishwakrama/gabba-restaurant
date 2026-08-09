// Seeds the menu_items table with Gabba's starting menu.
require("dotenv").config();
const pool = require("./db");

const items = [
  // Burgers (main focus)
  ["Gabba Smash Burger", "Double smashed beef patty, cheddar, house sauce, brioche bun", "Burger", 189, "/menu-images/menu-01.jpeg", false, true, true],
  ["Spicy Paneer Blast Burger", "Crispy paneer patty, jalapenos, spicy mayo", "Burger", 159, "https://images.unsplash.com/photo-1550317138-10000687a72b?w=600", true, true, true],
  ["Classic Chicken Zinger", "Crispy fried chicken, lettuce, tangy mayo", "Burger", 179, "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600", false, true, true],
  ["Cheese Overload Burger", "4 cheese layers, beef patty, caramelized onions", "Burger", 209, "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600", false, true, false],
  ["Cheese Overload Burger", "4 cheese layers, beef patty, caramelized onions", "Burger", 209, "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600", false, true, false]

  // Pizza
  ["Margherita Fireball", "Mozzarella, basil, tomato, chilli oil", "Pizza", 249, "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600", true, true, true],
  ["Pepperoni Storm", "Double pepperoni, mozzarella, oregano", "Pizza", 329, "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600", false, true, true],
  ["Tandoori Paneer Pizza", "Tandoori paneer, onions, capsicum, mint mayo", "Pizza", 289, "https://images.unsplash.com/photo-1600628421066-f6bda6a7b976?w=600", true, true, false],

  // Fries
  ["Peri Peri Fries", "Crispy fries tossed in peri peri masala", "Fries", 99, "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600", true, true, true],
  ["Cheesy Loaded Fries", "Fries loaded with cheese sauce and jalapenos", "Fries", 139, "https://images.unsplash.com/photo-1518013431117-eb44f1c6a897?w=600", true, true, false],

  // Momo
  ["Chicken Momo (8pc)", "Steamed chicken momo with Gabba spicy chutney", "Momo", 129, "https://images.unsplash.com/photo-1541599468348-e96984315921?w=600", false, true, true],
  ["Veg Momo (8pc)", "Steamed veg momo with Gabba spicy chutney", "Momo", 109, "https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=600", true, true, false],
  ["Pan Fried Momo (8pc)", "Crispy pan-seared momo, schezwan drizzle", "Momo", 149, "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600", false, true, true],

  // Drinks
  ["Cold Coffee Shake", "Classic thick cold coffee shake", "Drinks", 99, "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600", true, true, false],
  ["Masala Lemonade", "Fresh lime with Gabba masala twist", "Drinks", 69, "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600", true, true, false],
    ["Masala chut", "Fresh lime with Gabba masala twist", "Drinks", 69, "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600", true, true, false]

];

async function seed() {
  console.log("Seeding menu_items...");
  await pool.query("DELETE FROM menu_items");
  for (const [name, description, category, price, image_url, is_veg, is_available, is_bestseller] of items) {
    await pool.query(
      `INSERT INTO menu_items (name, description, category, price, image_url, is_veg, is_available, is_bestseller)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [name, description, category, price, image_url, is_veg, is_available, is_bestseller]
    );
  }
  console.log(`Seeded ${items.length} menu items.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
