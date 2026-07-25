/**
 * Seed script — creates the initial admin user.
 *
 * Usage:  npm run seed
 *
 * Reads credentials from .env:
 *   ADMIN_EMAIL    (default: admin@leaddesk.com)
 *   ADMIN_PASSWORD (default: Admin@1234)
 *
 * The plaintext password is NEVER stored — only its bcrypt hash.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose  = require('mongoose');
const bcrypt    = require('bcryptjs');
const AdminUser = require('../models/AdminUser');

async function seed() {
  if (!process.env.MONGO_URI) {
    console.error('❌  MONGO_URI is not set. Check your .env file.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, { dbName: 'leaddesk' });
  console.log('✅  Connected to MongoDB');

  const email    = (process.env.ADMIN_EMAIL    || 'admin@leaddesk.com').toLowerCase().trim();
  const password =  process.env.ADMIN_PASSWORD  || 'Admin@1234';

  const existing = await AdminUser.findOne({ email });
  if (existing) {
    console.log(`ℹ️   Admin account already exists for: ${email}`);
    console.log('    Delete the document in MongoDB and re-run to reset.');
    await mongoose.disconnect();
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await AdminUser.create({ email, passwordHash });

  console.log('\n✅  Admin user created!\n');
  console.log('  📧  Email   :', email);
  console.log('  🔑  Password:', password);
  console.log('\n⚠️   Keep these credentials safe and out of version control.\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
