const mongoose = require('mongoose');
require('dotenv').config();

const Property = require('./models/Property');

async function migrateRatings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all properties to set default rating and reviewCount
    const result = await Property.updateMany(
      {},
      {
        rating: 0,
        reviewCount: 0,
        reviews: []
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} properties with rating fields`);
    console.log('All properties now have:');
    console.log('  - rating: 0');
    console.log('  - reviewCount: 0');
    console.log('  - reviews: []');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

migrateRatings();
