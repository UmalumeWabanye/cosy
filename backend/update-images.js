/**
 * Updates all properties with curated Unsplash images + adds 4 more demo properties
 * Run: node update-images.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Property = require('./models/Property');

// ── Curated Unsplash image sets per style ────────────────────────────────────
const IMG = {
  modern_studio: [
    { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&q=85' },
    { url: 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=900&q=85' },
    { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=85' },
  ],
  cozy_single: [
    { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&q=85' },
    { url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=900&q=85' },
    { url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=900&q=85' },
  ],
  ensuite_modern: [
    { url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&q=85' },
    { url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&q=85' },
    { url: 'https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=900&q=85' },
  ],
  shared_house: [
    { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&q=85' },
    { url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=900&q=85' },
    { url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=900&q=85' },
  ],
  apartment_bright: [
    { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=85' },
    { url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=900&q=85' },
    { url: 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=900&q=85' },
  ],
  bachelor_flat: [
    { url: 'https://images.unsplash.com/photo-1512918728675-ed5a585ecca5?w=900&q=85' },
    { url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=900&q=85' },
    { url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=900&q=85' },
  ],
  luxury_residence: [
    { url: 'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=900&q=85' },
    { url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=85' },
    { url: 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=900&q=85' },
  ],
};

// ── Updated existing + new properties ────────────────────────────────────────
const UPDATES = [
  {
    propertyName: 'Stellenbosch Student Loft',
    images: IMG.cozy_single,
  },
  {
    propertyName: 'Cape Town CBD Ensuite',
    images: IMG.ensuite_modern,
  },
  {
    propertyName: 'Hatfield Budget Sharing',
    images: IMG.shared_house,
  },
];

const NEW_PROPERTIES = [
  {
    propertyName: 'Braamfontein Modern Studio',
    city: 'Johannesburg',
    address: '54 Juta Street, Braamfontein, Johannesburg, 2001',
    universityNearby: 'University of the Witwatersrand',
    nsfasAccredited: false,
    price: 5800,
    roomType: 'Single',
    description:
      'Sleek, self-contained studio in the heart of Braamfontein — Joburg\'s student precinct. Open-plan layout with a kitchenette, high-speed fibre, air conditioning and a private balcony. Walking distance to Wits and the Gautrain bus route.',
    amenities: ['Fibre Wi-Fi', 'Air Conditioning', 'Kitchenette', 'Balcony', 'Gym', '24hr Security', 'CCTV'],
    distanceFromCampus: 0.4,
    images: IMG.modern_studio,
    isAvailable: true,
  },
  {
    propertyName: 'Hatfield Heights Bachelor Flat',
    city: 'Pretoria',
    address: '7 Burnett Street, Hatfield, Pretoria, 0083',
    universityNearby: 'University of Pretoria',
    nsfasAccredited: true,
    price: 3400,
    roomType: 'Bachelor',
    description:
      'Bright bachelor flat ideal for first-year students. Comes fully furnished with a private bathroom, study desk and secure parking. Utilities included. 10-minute walk to UP gates. NSFAS accredited — paperwork assistance available.',
    amenities: ['Wi-Fi', 'Private Bathroom', 'Study Desk', 'Parking', 'Laundry', 'Water & Lights Included'],
    distanceFromCampus: 1.0,
    images: IMG.bachelor_flat,
    isAvailable: true,
  },
  {
    propertyName: 'Observatory Apartment Cape Town',
    city: 'Cape Town',
    address: '23 Lower Main Road, Observatory, Cape Town, 7925',
    universityNearby: 'University of Cape Town',
    nsfasAccredited: false,
    price: 7200,
    roomType: 'Ensuite',
    description:
      'Bright, airy ensuite apartment in Observatory — Cape Town\'s most vibrant student neighbourhood. Fully furnished with modern finishes, private en-suite bathroom, fibre internet and mountain views from the lounge. Close to UCT Groote Schuur campus and the MyCiTi bus.',
    amenities: ['Fibre Wi-Fi', 'Private Bathroom', 'Mountain Views', 'Furnished', 'DSTV', 'Parking', 'Intercom'],
    distanceFromCampus: 1.8,
    images: IMG.apartment_bright,
    isAvailable: true,
  },
  {
    propertyName: 'Durban North Luxury Residence',
    city: 'Durban',
    address: '15 Ridge Road, Durban North, 4051',
    universityNearby: 'University of KwaZulu-Natal',
    nsfasAccredited: false,
    price: 6900,
    roomType: 'Single',
    description:
      'Upmarket student residence in Durban North offering premium single rooms with en-suite bathrooms, a rooftop pool, gym, and 24-hour security. Shuttle service to UKZN Howard College campus daily. Perfect for students seeking a premium living experience.',
    amenities: ['Fibre Wi-Fi', 'Pool', 'Gym', 'Shuttle to Campus', 'Rooftop Terrace', '24hr Security', 'Concierge', 'DSTV'],
    distanceFromCampus: 3.5,
    images: IMG.luxury_residence,
    isAvailable: true,
  },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const admin = await User.findOne({ email: 'umalumewabanye@gmail.com' });
  if (!admin) { console.error('❌ Admin user not found'); process.exit(1); }

  // Update existing property images
  for (const upd of UPDATES) {
    const result = await Property.findOneAndUpdate(
      { propertyName: upd.propertyName },
      { $set: { images: upd.images } },
      { new: true }
    );
    if (result) {
      console.log(`🖼️  Updated images: ${upd.propertyName}`);
    } else {
      console.log(`⚠️  Not found: ${upd.propertyName}`);
    }
  }

  // Add new properties (skip if exists)
  for (const prop of NEW_PROPERTIES) {
    const exists = await Property.findOne({ propertyName: prop.propertyName });
    if (exists) {
      console.log(`⏭️  Skipping "${prop.propertyName}" — already exists`);
      continue;
    }
    await Property.create({ ...prop, createdBy: admin._id });
    console.log(`✅ Created: ${prop.propertyName}`);
  }

  console.log('\n🎉 Done!');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
