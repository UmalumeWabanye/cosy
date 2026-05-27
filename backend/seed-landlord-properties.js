/**
 * Seed script — creates 16 sample properties owned by landlord users.
 * Run: node seed-landlord-properties.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Property = require('./models/Property');

const IMAGE_POOL = [
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80',
  'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=1200&q=80',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80',
  'https://images.unsplash.com/photo-1486304873000-235643847519?w=1200&q=80',
  'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=1200&q=80',
  'https://images.unsplash.com/photo-1616594039964-3c4d6f0f6d0b?w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
  'https://images.unsplash.com/photo-1560185127-6ed189bf02f4?w=1200&q=80',
];

const BASE_RULES = ['No smoking indoors', 'Quiet hours after 22:00', 'No pets without approval'];
const BASE_UTILITIES = ['Water included', 'Electricity prepaid'];

const SAMPLE_PROPERTIES = [
  {
    propertyName: 'Rondebosch Scholar House A',
    city: 'Cape Town',
    address: '15 Belmont Road, Rondebosch, Cape Town, 7700',
    universityNearby: 'University of Cape Town',
    nsfasAccredited: true,
    price: 3900,
    roomType: 'Sharing',
    totalRooms: 18,
    availableRooms: 7,
    distanceFromCampus: 1.1,
    amenities: ['Fibre Wi-Fi', 'Laundry', 'Study Lounge', '24hr Security', 'Backup Power'],
    description: 'Affordable sharing rooms with strong transport links to UCT and supervised study zones.',
  },
  {
    propertyName: 'Mowbray Studio Court B',
    city: 'Cape Town',
    address: '27 Main Road, Mowbray, Cape Town, 7705',
    universityNearby: 'University of Cape Town',
    nsfasAccredited: false,
    price: 6100,
    roomType: 'Bachelor',
    totalRooms: 24,
    availableRooms: 6,
    distanceFromCampus: 2.3,
    amenities: ['Fibre Wi-Fi', 'Gym', 'Rooftop Braai Area', 'Biometric Access'],
    description: 'Private bachelor units with modern finishes and quick Jammie Shuttle access.',
  },
  {
    propertyName: 'Hatfield Residence C',
    city: 'Pretoria',
    address: '8 Burnett Street, Hatfield, Pretoria, 0083',
    universityNearby: 'University of Pretoria',
    nsfasAccredited: true,
    price: 3200,
    roomType: 'Sharing',
    totalRooms: 30,
    availableRooms: 10,
    distanceFromCampus: 0.7,
    amenities: ['Wi-Fi', 'Parking', '24hr Security', 'Communal Kitchen'],
    description: 'Budget-friendly shared student living in Hatfield close to UP and Gautrain.',
  },
  {
    propertyName: 'Brooklyn Ensuite Hub D',
    city: 'Pretoria',
    address: '41 Duxbury Road, Brooklyn, Pretoria, 0181',
    universityNearby: 'University of Pretoria',
    nsfasAccredited: false,
    price: 6700,
    roomType: 'Ensuite',
    totalRooms: 20,
    availableRooms: 5,
    distanceFromCampus: 1.9,
    amenities: ['Fibre Wi-Fi', 'Cleaning Service', 'Study Pods', 'CCTV'],
    description: 'Ensuite rooms for students seeking premium privacy and dedicated study spaces.',
  },
  {
    propertyName: 'Braamfontein Lofts E',
    city: 'Johannesburg',
    address: '102 Jorissen Street, Braamfontein, Johannesburg, 2001',
    universityNearby: 'University of the Witwatersrand',
    nsfasAccredited: true,
    price: 4300,
    roomType: 'Single',
    totalRooms: 28,
    availableRooms: 9,
    distanceFromCampus: 0.9,
    amenities: ['Wi-Fi', 'Computer Lab', '24hr Security', 'Laundry'],
    description: 'Single rooms near Wits with practical amenities for focused study routines.',
  },
  {
    propertyName: 'Auckland Park Commons F',
    city: 'Johannesburg',
    address: '54 Kingsway Avenue, Auckland Park, Johannesburg, 2092',
    universityNearby: 'University of Johannesburg',
    nsfasAccredited: true,
    price: 3600,
    roomType: 'Sharing',
    totalRooms: 34,
    availableRooms: 14,
    distanceFromCampus: 1.4,
    amenities: ['Wi-Fi', 'Shuttle Service', 'Courtyard', 'Access Control'],
    description: 'Large student community close to UJ with free shuttle and affordable rates.',
  },
  {
    propertyName: 'Doornfontein Student Court G',
    city: 'Johannesburg',
    address: '17 Siemert Road, Doornfontein, Johannesburg, 2094',
    universityNearby: 'University of Johannesburg',
    nsfasAccredited: false,
    price: 5200,
    roomType: 'Bachelor',
    totalRooms: 22,
    availableRooms: 7,
    distanceFromCampus: 3.1,
    amenities: ['Fibre Wi-Fi', 'Smart Access', 'On-site Manager'],
    description: 'Compact bachelor units suited for independent students and interns.',
  },
  {
    propertyName: 'Stellenbosch Village H',
    city: 'Stellenbosch',
    address: '6 Andringa Street, Stellenbosch, 7600',
    universityNearby: 'Stellenbosch University',
    nsfasAccredited: true,
    price: 4700,
    roomType: 'Single',
    totalRooms: 26,
    availableRooms: 8,
    distanceFromCampus: 0.6,
    amenities: ['Wi-Fi', 'Study Centre', 'Braai Area', 'Laundry'],
    description: 'Central Stellenbosch student housing with secure access and strong campus proximity.',
  },
  {
    propertyName: 'Matieland Residence I',
    city: 'Stellenbosch',
    address: '22 Merriman Avenue, Stellenbosch, 7600',
    universityNearby: 'Stellenbosch University',
    nsfasAccredited: false,
    price: 7200,
    roomType: 'Ensuite',
    totalRooms: 16,
    availableRooms: 4,
    distanceFromCampus: 1.8,
    amenities: ['Fibre Wi-Fi', 'Gym', 'Private Bathrooms', '24hr Security'],
    description: 'High-end ensuite residence aimed at final-year and postgraduate students.',
  },
  {
    propertyName: 'Hatfield Square Living J',
    city: 'Pretoria',
    address: '75 Hilda Street, Hatfield, Pretoria, 0083',
    universityNearby: 'University of Pretoria',
    nsfasAccredited: true,
    price: 2950,
    roomType: 'Sharing',
    totalRooms: 40,
    availableRooms: 16,
    distanceFromCampus: 0.5,
    amenities: ['Wi-Fi', 'Security', 'Common Room', 'Laundry'],
    description: 'Cost-effective sharing setup near UP with high occupancy and social common areas.',
  },
  {
    propertyName: 'Sunnyside Bachelor Point K',
    city: 'Pretoria',
    address: '119 Justice Mahomed Street, Sunnyside, Pretoria, 0002',
    universityNearby: 'University of Pretoria',
    nsfasAccredited: false,
    price: 4100,
    roomType: 'Bachelor',
    totalRooms: 25,
    availableRooms: 11,
    distanceFromCampus: 3.7,
    amenities: ['Wi-Fi', 'CCTV', 'Prepaid Electricity'],
    description: 'Independent bachelor rooms for students preferring self-contained accommodation.',
  },
  {
    propertyName: 'Durban Point Student Hub L',
    city: 'Durban',
    address: '33 Mahatma Gandhi Road, Durban Central, 4001',
    universityNearby: 'University of KwaZulu-Natal',
    nsfasAccredited: true,
    price: 3400,
    roomType: 'Sharing',
    totalRooms: 36,
    availableRooms: 12,
    distanceFromCampus: 2.9,
    amenities: ['Wi-Fi', 'Security', 'Study Rooms', 'Shuttle Stop Nearby'],
    description: 'Well-managed shared accommodation serving UKZN students in Durban.',
  },
  {
    propertyName: 'Glenwood Singles M',
    city: 'Durban',
    address: '58 Lena Ahrens Road, Glenwood, Durban, 4001',
    universityNearby: 'University of KwaZulu-Natal',
    nsfasAccredited: false,
    price: 5100,
    roomType: 'Single',
    totalRooms: 18,
    availableRooms: 5,
    distanceFromCampus: 4.5,
    amenities: ['Fibre Wi-Fi', 'Parking', 'Garden'],
    description: 'Quiet single rooms in Glenwood for students who prefer low-noise environments.',
  },
  {
    propertyName: 'Parktown Academic House N',
    city: 'Johannesburg',
    address: '12 Jan Smuts Avenue, Parktown, Johannesburg, 2193',
    universityNearby: 'University of the Witwatersrand',
    nsfasAccredited: true,
    price: 4500,
    roomType: 'Single',
    totalRooms: 21,
    availableRooms: 6,
    distanceFromCampus: 1.6,
    amenities: ['Wi-Fi', 'Study Hall', '24hr Security', 'Laundry'],
    description: 'Academic-focused housing near Wits with secure entry and designated study areas.',
  },
  {
    propertyName: 'Claremont Metro Studios O',
    city: 'Cape Town',
    address: '5 Main Road, Claremont, Cape Town, 7708',
    universityNearby: 'University of Cape Town',
    nsfasAccredited: false,
    price: 6400,
    roomType: 'Bachelor',
    totalRooms: 19,
    availableRooms: 4,
    distanceFromCampus: 3.4,
    amenities: ['Fibre Wi-Fi', 'Gym Access', 'Transport Nearby'],
    description: 'Modern bachelor units with excellent access to campus and city transport routes.',
  },
  {
    propertyName: 'Bellville Student Quarters P',
    city: 'Cape Town',
    address: '81 Voortrekker Road, Bellville, Cape Town, 7530',
    universityNearby: 'Cape Peninsula University of Technology',
    nsfasAccredited: true,
    price: 3000,
    roomType: 'Sharing',
    totalRooms: 32,
    availableRooms: 15,
    distanceFromCampus: 1.3,
    amenities: ['Wi-Fi', 'Laundry', 'Security', 'Communal Kitchen'],
    description: 'High-capacity student accommodation for CPUT students with practical monthly rates.',
  },
];

function imagesFor(index) {
  const first = IMAGE_POOL[index % IMAGE_POOL.length];
  const second = IMAGE_POOL[(index + 3) % IMAGE_POOL.length];
  return [{ url: first }, { url: second }];
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const landlords = await User.find({ role: 'landlord' }).select('_id name email').lean();
  if (!landlords.length) {
    console.error('No landlord users found. Create at least one landlord account first.');
    await mongoose.disconnect();
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < SAMPLE_PROPERTIES.length; i += 1) {
    const landlord = landlords[i % landlords.length];
    const data = SAMPLE_PROPERTIES[i];

    const exists = await Property.findOne({
      propertyName: data.propertyName,
      createdBy: landlord._id,
    }).select('_id');

    if (exists) {
      skipped += 1;
      continue;
    }

    await Property.create({
      ...data,
      images: imagesFor(i),
      rules: BASE_RULES,
      utilities: BASE_UTILITIES,
      createdBy: landlord._id,
      isAvailable: true,
    });
    created += 1;
  }

  console.log(`Seed complete: created=${created}, skipped=${skipped}, landlordsUsed=${landlords.length}`);
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error('Seed failed:', error.message);
  try {
    await mongoose.disconnect();
  } catch (_) {
    // noop
  }
  process.exit(1);
});
