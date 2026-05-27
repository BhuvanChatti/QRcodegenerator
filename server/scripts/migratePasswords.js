import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, conndb } from '../database.js';

const migrate = async () => {
    await conndb();

    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    let migrated = 0;
    let skipped = 0;

    for (const user of users) {
        const alreadyHashed = user.password?.startsWith('$2b$') || user.password?.startsWith('$2a$');
        if (alreadyHashed) {
            skipped++;
            continue;
        }
        const hash = await bcrypt.hash(user.password, 12);
        await User.updateOne({ _id: user._id }, { $set: { password: hash } });
        console.log(`  Migrated: ${user.email}`);
        migrated++;
    }

    console.log(`\nDone — migrated: ${migrated}, already hashed: ${skipped}`);
    await mongoose.disconnect();
};

migrate().catch(err => { console.error(err); process.exit(1); });
