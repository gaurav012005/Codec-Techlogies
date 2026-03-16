// ============================================
// Database Seed — Create Default Admin User
// ============================================

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...\n');

    // Create Admin
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@examguard.com' },
        update: {},
        create: {
            name: 'Super Admin',
            email: 'admin@examguard.com',
            passwordHash: adminPassword,
            role: 'ADMIN',
        },
    });
    console.log(`✅ Admin created: ${admin.email} (password: admin123)`);

    // Create Examiner
    const examinerPassword = await bcrypt.hash('examiner123', 12);
    const examiner = await prisma.user.upsert({
        where: { email: 'examiner@examguard.com' },
        update: {},
        create: {
            name: 'John Examiner',
            email: 'examiner@examguard.com',
            passwordHash: examinerPassword,
            role: 'EXAMINER',
        },
    });
    console.log(`✅ Examiner created: ${examiner.email} (password: examiner123)`);

    // Create Student
    const studentPassword = await bcrypt.hash('student123', 12);
    const student = await prisma.user.upsert({
        where: { email: 'student@examguard.com' },
        update: {},
        create: {
            name: 'Alice Student',
            email: 'student@examguard.com',
            passwordHash: studentPassword,
            role: 'STUDENT',
        },
    });
    console.log(`✅ Student created: ${student.email} (password: student123)`);

    console.log('\n🎉 Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
