require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.useDb('test');
  const User = db.collection('users');
  await User.updateOne(
    { email: 'test@example.com' },
    { $set: { password: bcrypt.hashSync('password123', 10), name: 'Test', provider: 'credentials' } },
    { upsert: true }
  );
  console.log('Test user created');
  process.exit(0);
}).catch(console.error);
