// File: setup-test-data.js

// Run this file with: node setup-test-data.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// REPLACE WITH YOUR MONGODB_URI
const MONGODB_URI = 'mongodb+srv://thiroshmadhusha0520_db_user:2057060%2A%23Tm@cluster0.oqqnqgb.mongodb.net/hireflow?retryWrites=true&w=majority&appName=Cluster0';

// Organization Schema
const OrganizationSchema = new mongoose.Schema({
  name: String,
  orgCode: String,
  status: String,
  settings: {
    defaultPickupLocations: [String],
    defaultDropLocations: [String],
    autoAssignment: Boolean
  }
}, { timestamps: true });

// User Schema
const UserSchema = new mongoose.Schema({
  organizationId: mongoose.Schema.Types.ObjectId,
  name: String,
  email: String,
  username: String,
  password: String,
  role: String,
  status: String
}, { timestamps: true });

// Vehicle Schema
const VehicleSchema = new mongoose.Schema({
  organizationId: mongoose.Schema.Types.ObjectId,
  vehicleNumber: String,
  vehicleType: String,
  driverName: String,
  driverPhone: String,
  status: String
}, { timestamps: true });

const Organization = mongoose.model('Organization', OrganizationSchema);
const User = mongoose.model('User', UserSchema);
const Vehicle = mongoose.model('Vehicle', VehicleSchema);

async function setupTestData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create Organization
    const org = await Organization.create({
      name: 'Sunrise Hotel',
      orgCode: 'SUNRISE01',
      status: 'active',
      settings: {
        defaultPickupLocations: ['Airport', 'City Center', 'Railway Station'],
        defaultDropLocations: ['Airport', 'City Center', 'Railway Station'],
        autoAssignment: true
      }
    });
    console.log('✅ Created organization:', org.name, '(Code:', org.orgCode + ')');

    // Create Admin User
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      organizationId: org._id,
      name: 'Admin User',
      email: 'admin@sunrise.com',
      username: 'admin',
      password: hashedPassword,
      role: 'super_admin',
      status: 'active'
    });
    console.log('✅ Created admin user - Username: admin, Password: admin123');

    // Create Hire Manager
    const managerPassword = await bcrypt.hash('manager123', 10);
    const manager = await User.create({
      organizationId: org._id,
      name: 'Hire Manager',
      email: 'manager@sunrise.com',
      username: 'manager',
      password: managerPassword,
      role: 'hire_manager',
      status: 'active'
    });
    console.log('✅ Created hire manager - Username: manager, Password: manager123');

    // Create Sample Vehicles
    const vehicles = [
      {
        organizationId: org._id,
        vehicleNumber: 'CAR-001',
        vehicleType: 'Car',
        driverName: 'John Driver',
        driverPhone: '+94771234567',
        status: 'available'
      },
      {
        organizationId: org._id,
        vehicleNumber: 'VAN-001',
        vehicleType: 'Van',
        driverName: 'Mike Wilson',
        driverPhone: '+94777654321',
        status: 'available'
      },
      {
        organizationId: org._id,
        vehicleNumber: 'SUV-001',
        vehicleType: 'SUV',
        driverName: 'Sarah Johnson',
        driverPhone: '+94779876543',
        status: 'available'
      }
    ];

    await Vehicle.insertMany(vehicles);
    console.log('✅ Created 3 sample vehicles');

    console.log('\n🎉 Test data setup complete!');
    console.log('\n📝 Login Credentials:');
    console.log('Organization Code: SUNRISE01');
    console.log('\nAdmin Login:');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('\nManager Login:');
    console.log('Username: manager');
    console.log('Password: manager123');

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupTestData();