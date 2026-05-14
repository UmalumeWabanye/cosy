/**
 * Seed script — creates 3 sample properties under umalumewabanye@gmail.com
 * Run: node seed-properties.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Property = require('./models/Property');

const SAMPLE_PROPERTIES = [
  {
    propertyName: 'Stellenbosch Student Loft',
    city: 'Stellenbosch',
    address: '14 Bird Street, Stellenbosch, 7600',
    universityNearby: 'Stellenbosch University',
    nsfasAccredited: true,
    price: 4200,
    roomType: 'Single',
    description:
      'Modern, fully furnished single room in a secure complex just 5 minutes from Stellenbosch University main campus. High-speed Wi-Fi, DSTV and all utilities included. Communal kitchen, study lounge and braai area on site.',
    amenities: ['Wi-Fi', 'DSTV', 'Laundry', 'Study Room', 'Braai Area', 'Parking', '24hr Security'],
    distanceFromCampus: 0.5,
    nsfasAccredited: true,
    images: [
      { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80' },
      { url: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&q=80' },
    ],
    isAvailable: true,
  },
  {
    propertyName: 'Cape Town CBD Ensuite',
    city: 'Cape Town',
    address: '88 Loop Street, Cape Town City Bowl, 8001',
    universityNearby: 'University of Cape Town',
    nsfasAccredited: false,
    price: 6500,
    roomType: 'Ensuite',
    description:
      'Premium ensuite room in a modern student residence in the heart of Cape Town CBD. Private bathroom, fibre internet and a rooftop terrace with mountain views. Minutes from UCT\'s Hiddingh Campus and major bus routes.',
    amenities: ['Fibre Wi-Fi', 'Private Bathroom', 'Rooftop Terrace', 'Gym', 'Concierge', 'CCTV'],
    distanceFromCampus: 1.2,
    images: [
      { url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80' },
      { url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80' },
    ],
    isAvailable: true,
  },
  {
    propertyName: 'Hatfield Budget Sharing',
    city: 'Pretoria',
    address: '32 Festival Street, Hatfield, Pretoria, 0083',
    universityNearby: 'University of Pretoria',
    nsfasAccredited: true,
    price: 2800,
    roomType: 'Sharing',
    description:
      'Affordable sharing room in a well-maintained house in Hatfield, one of Pretoria\'s top student areas. Shared with one other student, with a fully equipped kitchen, fast Wi-Fi and secure parking. Walking distance to UP main campus and Hatfield Plaza.',
    amenities: ['Wi-Fi', 'Fully Equipped Kitchen', 'Secure Parking', 'Garden', 'Water & Lights Included'],
    distanceFromCampus: 0.8,
    images: [
      { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80' },
      { url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80' },
    ],
    isAvailable: true,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Find the admin user
  const admin = await User.findOne({ email: 'umalumewabanye@gmail.com' });
  if (!admin) {
    console.error('❌ User umalumewabanye@gmail.com not found. Make sure the account exists first.');
    process.exit(1);
  }
  console.log(`✅ Found admin: ${admin.name} (${admin._id})`);

  // Insert properties
  let created = 0;
  for (const data of SAMPLE_PROPERTIES) {
    // Skip if already exists with same name
    const exists = await Property.findOne({ propertyName: data.propertyName });
    if (exists) {
      console.log(`⏭️  Skipping "${data.propertyName}" — already exists`);
      continue;
    }
    await Property.create({ ...data, createdBy: admin._id });
    console.log(`✅ Created: ${data.propertyName}`);
    created++;
  }

  console.log(`\n🎉 Done — ${created} propert${created === 1 ? 'y' : 'ies'} created.`);
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
