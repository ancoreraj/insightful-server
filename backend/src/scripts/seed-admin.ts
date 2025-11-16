import dotenv from 'dotenv';
import { connectDatabase } from '../config/database';
import User from '../models/User';
import Organization from '../models/Organization';
import logger from '../utils/logger';

dotenv.config();

async function seedAdmin() {
  try {
    await connectDatabase();
    
    console.log('🔍 Checking for existing admin user...');

    const existingAdmin = await User.findOne({ 
      email: 'admin@company.com' 
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', existingAdmin.name);
      console.log('🔑 Type:', existingAdmin.type);
      process.exit(0);
    }

    console.log('📝 Creating default organization...');

    let organization = await Organization.findOne({ name: 'Default Organization' });
    
    if (!organization) {
      organization = await Organization.create({
        name: 'Default Organization',
        settings: {
          timezone: 'UTC',
          dateFormat: 'YYYY-MM-DD',
          timeFormat: '24h'
        }
      });
      console.log('✅ Organization created:', organization.name);
    } else {
      console.log('✅ Organization already exists:', organization.name);
    }

    console.log('👤 Creating admin user...');

    await User.create({
      email: 'admin@company.com',
      password: 'SecurePassword123!',
      name: 'Admin User',
      type: 'admin',
      identifier: 'admin',
      organizationId: organization._id.toString(),
      projects: [],
      deactivated: false,
      invited: 1
    });

    console.log('\n✅ Admin user created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    admin@company.com');
    console.log('🔒 Password: SecurePassword123!');
    console.log('👤 Name:     Admin User');
    console.log('🔑 Type:     admin');
    console.log('🏢 Org ID:   ' + organization._id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🚀 You can now login with these credentials!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin user:', error);
    logger.error('Seed admin error:', error);
    process.exit(1);
  }
}

// Run seed script
seedAdmin();
