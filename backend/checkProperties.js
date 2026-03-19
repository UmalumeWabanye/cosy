const mongoose = require('mongoose');
require('dotenv').config();

const Property = require('./models/Property');

async function checkAndPublish() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all properties
    const properties = await Property.find({}, { _id: 1, name: 1, published: 1, isActive: 1 });
    
    console.log('\n📋 Current Properties:');
    console.log('================================');
    properties.forEach(prop => {
      console.log(`ID: ${prop._id}`);
      console.log(`Name: ${prop.name}`);
      console.log(`Published: ${prop.published}`);
      console.log(`Active: ${prop.isActive}`);
      console.log('---');
    });

    // Update all to published and active
    const result = await Property.updateMany(
      {},
      { published: true, isActive: true }
    );

    console.log(`\n✅ Updated ${result.modifiedCount} properties`);
    console.log('All properties are now published and active!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAndPublish();
