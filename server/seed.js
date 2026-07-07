const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');

const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@rentease.com',
      password: 'admin123',
      phone: '9999999999',
      role: 'admin',
      address: {
        street: '123 Admin Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      }
    });

    // Create demo user
    const user = await User.create({
      name: 'John Doe',
      email: 'user@rentease.com',
      password: 'user123',
      phone: '9876543210',
      role: 'user',
      address: {
        street: '456 User Lane',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001'
      }
    });

    console.log('👤 Created admin and demo users');

    // Seed Products
    const products = [
      // Furniture
      {
        name: 'Queen Size Bed with Mattress',
        category: 'furniture',
        subcategory: 'Bed',
        description: 'Premium queen size wooden bed frame with a comfortable orthopedic mattress. Perfect for a good night\'s sleep in your rented apartment. Dimensions: 6.5ft x 5ft. Includes headboard and slats.',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600',
        monthlyRent: 899,
        securityDeposit: 2000,
        tenureOptions: [
          { months: 3, discount: 0 },
          { months: 6, discount: 5 },
          { months: 9, discount: 8 },
          { months: 12, discount: 12 }
        ],
        specifications: new Map([
          ['Material', 'Sheesham Wood'],
          ['Size', 'Queen (6.5ft x 5ft)'],
          ['Mattress', 'High-density Foam'],
          ['Weight Capacity', '250 kg'],
          ['Color', 'Walnut Brown']
        ]),
        stock: 15,
        condition: 'new',
        rating: 4.7,
        totalRentals: 142,
        vendor: admin._id
      },
      {
        name: '3-Seater Fabric Sofa',
        category: 'furniture',
        subcategory: 'Sofa',
        description: 'Elegant 3-seater fabric sofa with plush cushions and sturdy hardwood frame. Features premium upholstery fabric that is easy to clean and maintain. Ideal for living rooms in rented homes.',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
        monthlyRent: 699,
        securityDeposit: 1500,
        tenureOptions: [
          { months: 3, discount: 0 },
          { months: 6, discount: 5 },
          { months: 9, discount: 8 },
          { months: 12, discount: 12 }
        ],
        specifications: new Map([
          ['Material', 'Fabric + Hardwood'],
          ['Seating', '3 Persons'],
          ['Cushion', 'High-resilience Foam'],
          ['Dimensions', '78 x 32 x 33 inches'],
          ['Color', 'Steel Grey']
        ]),
        stock: 12,
        condition: 'new',
        rating: 4.5,
        totalRentals: 198,
        vendor: admin._id
      },
      {
        name: 'Study Table with Ergonomic Chair',
        category: 'furniture',
        subcategory: 'Table',
        description: 'Complete study setup with a spacious engineered wood table and ergonomic mesh chair. Features cable management holes, drawer storage, and adjustable chair height. Perfect for students and remote workers.',
        image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600',
        monthlyRent: 499,
        securityDeposit: 1000,
        tenureOptions: [
          { months: 3, discount: 0 },
          { months: 6, discount: 5 },
          { months: 9, discount: 8 },
          { months: 12, discount: 12 }
        ],
        specifications: new Map([
          ['Table Material', 'Engineered Wood'],
          ['Table Size', '48 x 24 inches'],
          ['Chair Type', 'Ergonomic Mesh'],
          ['Chair Adjustable', 'Yes'],
          ['Includes', 'Table + Chair + Drawer']
        ]),
        stock: 20,
        condition: 'new',
        rating: 4.6,
        totalRentals: 256,
        vendor: admin._id
      },
      {
        name: '4-Seater Dining Table Set',
        category: 'furniture',
        subcategory: 'Table',
        description: 'Beautiful 4-seater dining table set in solid rubber wood with a natural finish. Includes 4 matching chairs with cushioned seats. Compact design ideal for apartments and small dining areas.',
        image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600',
        monthlyRent: 799,
        securityDeposit: 2000,
        tenureOptions: [
          { months: 3, discount: 0 },
          { months: 6, discount: 5 },
          { months: 9, discount: 8 },
          { months: 12, discount: 12 }
        ],
        specifications: new Map([
          ['Material', 'Solid Rubber Wood'],
          ['Seating', '4 Persons'],
          ['Table Shape', 'Rectangular'],
          ['Dimensions', '47 x 30 x 30 inches'],
          ['Finish', 'Natural Teak']
        ]),
        stock: 10,
        condition: 'new',
        rating: 4.4,
        totalRentals: 87,
        vendor: admin._id
      },
      {
        name: '3-Door Wardrobe',
        category: 'furniture',
        subcategory: 'Wardrobe',
        description: 'Spacious 3-door wardrobe with mirror, multiple shelves, hanging space, and drawer. Engineered wood construction with laminate finish. Ample storage for all your clothing needs.',
        image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=600',
        monthlyRent: 599,
        securityDeposit: 1500,
        tenureOptions: [
          { months: 3, discount: 0 },
          { months: 6, discount: 5 },
          { months: 9, discount: 8 },
          { months: 12, discount: 12 }
        ],
        specifications: new Map([
          ['Material', 'Engineered Wood'],
          ['Doors', '3 with Mirror'],
          ['Shelves', '6 + Hanging Space'],
          ['Dimensions', '63 x 47 x 20 inches'],
          ['Color', 'Classic Walnut']
        ]),
        stock: 8,
        condition: 'new',
        rating: 4.3,
        totalRentals: 64,
        vendor: admin._id
      },
      {
        name: 'Modern Bookshelf',
        category: 'furniture',
        subcategory: 'Bookshelf',
        description: 'Contemporary 5-tier open bookshelf with a ladder design. Engineered wood with matte finish. Perfect for books, decor, and storage. Adds a modern touch to any room.',
        image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=600',
        monthlyRent: 349,
        securityDeposit: 800,
        tenureOptions: [
          { months: 3, discount: 0 },
          { months: 6, discount: 5 },
          { months: 9, discount: 8 },
          { months: 12, discount: 12 }
        ],
        specifications: new Map([
          ['Material', 'Engineered Wood'],
          ['Tiers', '5'],
          ['Style', 'Ladder Design'],
          ['Dimensions', '60 x 24 x 12 inches'],
          ['Color', 'Matte White & Oak']
        ]),
        stock: 14,
        condition: 'new',
        rating: 4.5,
        totalRentals: 93,
        vendor: admin._id
      },
      // Appliances
      {
        name: '250L Double Door Refrigerator',
        category: 'appliance',
        subcategory: 'Refrigerator',
        description: 'Energy-efficient 250-liter double door refrigerator with frost-free technology. Features vegetable crisper, bottle guard, and adjustable shelves. 3-star energy rating for lower power consumption.',
        image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600',
        monthlyRent: 799,
        securityDeposit: 2500,
        tenureOptions: [
          { months: 3, discount: 0 },
          { months: 6, discount: 5 },
          { months: 9, discount: 8 },
          { months: 12, discount: 12 }
        ],
        specifications: new Map([
          ['Capacity', '250 Liters'],
          ['Type', 'Double Door, Frost Free'],
          ['Energy Rating', '3 Star'],
          ['Compressor', 'Inverter'],
          ['Color', 'Silver Steel']
        ]),
        stock: 12,
        condition: 'new',
        rating: 4.6,
        totalRentals: 178,
        vendor: admin._id
      },
      {
        name: 'Front Load Washing Machine 7kg',
        category: 'appliance',
        subcategory: 'Washing Machine',
        description: 'Fully automatic front load washing machine with 7kg capacity. Features multiple wash programs, in-built heater, and child lock. Energy-efficient with quiet operation.',
        image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600',
        monthlyRent: 699,
        securityDeposit: 2000,
        tenureOptions: [
          { months: 3, discount: 0 },
          { months: 6, discount: 5 },
          { months: 9, discount: 8 },
          { months: 12, discount: 12 }
        ],
        specifications: new Map([
          ['Capacity', '7 kg'],
          ['Type', 'Front Load, Fully Automatic'],
          ['Programs', '15 Wash Programs'],
          ['Spin Speed', '1200 RPM'],
          ['Energy Rating', '4 Star']
        ]),
        stock: 10,
        condition: 'new',
        rating: 4.5,
        totalRentals: 134,
        vendor: admin._id
      },
      {
        name: '43-inch Smart LED TV',
        category: 'appliance',
        subcategory: 'Television',
        description: 'Full HD 43-inch Smart LED TV with built-in WiFi, streaming apps, and crystal-clear display. Slim bezel design with powerful stereo speakers. Includes wall mount bracket and remote.',
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600',
        monthlyRent: 899,
        securityDeposit: 3000,
        tenureOptions: [
          { months: 3, discount: 0 },
          { months: 6, discount: 5 },
          { months: 9, discount: 8 },
          { months: 12, discount: 12 }
        ],
        specifications: new Map([
          ['Screen Size', '43 inches'],
          ['Resolution', 'Full HD (1920x1080)'],
          ['Type', 'Smart LED'],
          ['Connectivity', 'WiFi, HDMI x3, USB x2'],
          ['Audio', '20W Stereo Speakers']
        ]),
        stock: 8,
        condition: 'new',
        rating: 4.7,
        totalRentals: 156,
        vendor: admin._id
      },
      {
        name: 'Convection Microwave Oven 28L',
        category: 'appliance',
        subcategory: 'Microwave',
        description: 'Versatile 28-liter convection microwave oven for reheating, cooking, baking, and grilling. Features auto-cook menus, child lock, and stainless steel cavity for easy cleaning.',
        image: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=600',
        monthlyRent: 349,
        securityDeposit: 1000,
        tenureOptions: [
          { months: 3, discount: 0 },
          { months: 6, discount: 5 },
          { months: 9, discount: 8 },
          { months: 12, discount: 12 }
        ],
        specifications: new Map([
          ['Capacity', '28 Liters'],
          ['Type', 'Convection'],
          ['Auto Menus', '301 Recipes'],
          ['Cavity', 'Stainless Steel'],
          ['Power', '900W Microwave + 1400W Convection']
        ]),
        stock: 16,
        condition: 'new',
        rating: 4.4,
        totalRentals: 89,
        vendor: admin._id
      },
      {
        name: 'Split Air Conditioner 1.5 Ton',
        category: 'appliance',
        subcategory: 'Air Conditioner',
        description: 'Powerful 1.5-ton split AC with inverter compressor for energy-efficient cooling. Features turbo cool, sleep mode, and anti-bacterial filter. 5-star energy rating. Installation included.',
        image: 'https://daikinacsolutionsplaza.com/blog/wp-content/uploads/2023/04/image-6.png',
        monthlyRent: 1299,
        securityDeposit: 3500,
        tenureOptions: [
          { months: 3, discount: 0 },
          { months: 6, discount: 5 },
          { months: 9, discount: 8 },
          { months: 12, discount: 12 }
        ],
        specifications: new Map([
          ['Capacity', '1.5 Ton'],
          ['Type', 'Split, Inverter'],
          ['Energy Rating', '5 Star'],
          ['Cooling Area', 'Up to 180 sq ft'],
          ['Features', 'Turbo Cool, Sleep Mode, Timer']
        ]),
        stock: 6,
        condition: 'new',
        rating: 4.8,
        totalRentals: 203,
        vendor: admin._id
      },
      {
        name: 'RO+UV Water Purifier',
        category: 'appliance',
        subcategory: 'Water Purifier',
        description: 'Advanced RO+UV water purifier with 8-liter storage tank. Multi-stage purification with mineral enrichment. Suitable for all water sources including borewell and municipal supply.',
        image: 'https://images.unsplash.com/photo-1624958723474-15e0256eb812?w=600',
        monthlyRent: 299,
        securityDeposit: 800,
        tenureOptions: [
          { months: 3, discount: 0 },
          { months: 6, discount: 5 },
          { months: 9, discount: 8 },
          { months: 12, discount: 12 }
        ],
        specifications: new Map([
          ['Purification', 'RO + UV + UF + TDS Control'],
          ['Storage', '8 Liters'],
          ['Input TDS', 'Up to 2000 ppm'],
          ['Purification Rate', '20 L/hr'],
          ['Filter Life', '6000 Liters']
        ]),
        stock: 18,
        condition: 'new',
        rating: 4.3,
        totalRentals: 112,
        vendor: admin._id
      }
    ];

    await Product.insertMany(products);

    console.log(`📦 Seeded ${products.length} products`);
    console.log('');
    console.log('═══════════════════════════════════════');
    console.log('  ✅ Database seeded successfully!');
    console.log('═══════════════════════════════════════');
    console.log('');
    console.log('  Demo Accounts:');
    console.log('  ─────────────');
    console.log('  Admin: admin@rentease.com / admin123');
    console.log('  User:  user@rentease.com  / user123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();
