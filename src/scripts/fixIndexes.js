const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

async function fixIndexes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get current indexes
    const indexes = await usersCollection.indexes();
    console.log('Current indexes:', indexes);

    // Drop the old 'username_1' index if it exists
    try {
      await usersCollection.dropIndex('username_1');
      console.log('✅ Dropped old "username_1" index');
    } catch (err) {
      console.log('Index "username_1" does not exist or already dropped');
    }

    // Delete any users with null userName
    const deleteResult = await usersCollection.deleteMany({ userName: null });
    console.log(`✅ Deleted ${deleteResult.deletedCount} users with null userName`);

    // Create new index on 'userName' (camelCase)
    await usersCollection.createIndex({ userName: 1 }, { unique: true });
    console.log('✅ Created new "userName_1" index');

    // Verify new indexes
    const newIndexes = await usersCollection.indexes();
    console.log('New indexes:', newIndexes);

    console.log('\n✅ Index fix completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error fixing indexes:', err);
    process.exit(1);
  }
}

fixIndexes();