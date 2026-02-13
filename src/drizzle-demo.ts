import { eq } from 'drizzle-orm';
import { db } from './db/index.js';
import { departments, subjects } from './db/schema/index.js';

async function main() {
    try {
        console.log('🚀 Starting CRUD operations with Departments and Subjects...\n');

        // ========================================
        // CREATE: Insert departments
        // ========================================
        console.log('📝 CREATE: Inserting departments...');

        const [csDept] = await db
            .insert(departments)
            .values({
                code: 'CS',
                name: 'Computer Science',
                description: 'Study of computation, information, and automation'
            })
            .returning();

        const [mathDept] = await db
            .insert(departments)
            .values({
                code: 'MATH',
                name: 'Mathematics',
                description: 'Study of numbers, quantity, structure, and space'
            })
            .returning();

        const [physDept] = await db
            .insert(departments)
            .values({
                code: 'PHYS',
                name: 'Physics',
                description: 'Study of matter, energy, and their interactions'
            })
            .returning();

        console.log('✅ Created 3 departments:', [csDept.name, mathDept.name, physDept.name]);
        console.log('');

        // ========================================
        // CREATE: Insert subjects
        // ========================================
        console.log('📝 CREATE: Inserting subjects...');

        const csSubjects = await db
            .insert(subjects)
            .values([
                {
                    departmentId: csDept.id,
                    code: 'CS101',
                    name: 'Introduction to Programming',
                    description: 'Basics of programming using Python'
                },
                {
                    departmentId: csDept.id,
                    code: 'CS201',
                    name: 'Data Structures',
                    description: 'Fundamental data structures and algorithms'
                },
                {
                    departmentId: csDept.id,
                    code: 'CS301',
                    name: 'Database Systems',
                    description: 'Relational databases and SQL'
                }
            ])
            .returning();

        const mathSubjects = await db
            .insert(subjects)
            .values([
                {
                    departmentId: mathDept.id,
                    code: 'MATH101',
                    name: 'Calculus I',
                    description: 'Differential and integral calculus'
                },
                {
                    departmentId: mathDept.id,
                    code: 'MATH201',
                    name: 'Linear Algebra',
                    description: 'Vectors, matrices, and transformations'
                }
            ])
            .returning();

        console.log(`✅ Created ${csSubjects.length} CS subjects and ${mathSubjects.length} Math subjects`);
        console.log('');

        // ========================================
        // READ: Query all departments
        // ========================================
        console.log('📖 READ: Fetching all departments...');
        const allDepts = await db.select().from(departments);
        console.log(`✅ Found ${allDepts.length} departments:`);
        allDepts.forEach(dept => {
            console.log(`   - ${dept.code}: ${dept.name}`);
        });
        console.log('');

        // ========================================
        // READ: Query subjects by department
        // ========================================
        console.log('📖 READ: Fetching CS department subjects...');
        const csSubjectsQuery = await db
            .select()
            .from(subjects)
            .where(eq(subjects.departmentId, csDept.id));

        console.log(`✅ Found ${csSubjectsQuery.length} CS subjects:`);
        csSubjectsQuery.forEach(subject => {
            console.log(`   - ${subject.code}: ${subject.name}`);
        });
        console.log('');

        // ========================================
        // READ: Query specific subject
        // ========================================
        console.log('📖 READ: Fetching specific subject (CS101)...');
        const [cs101] = await db
            .select()
            .from(subjects)
            .where(eq(subjects.code, 'CS101'));

        console.log('✅ Found subject:');
        console.log(`   ID: ${cs101.id}`);
        console.log(`   Code: ${cs101.code}`);
        console.log(`   Name: ${cs101.name}`);
        console.log(`   Description: ${cs101.description}`);
        console.log('');

        // ========================================
        // UPDATE: Modify department
        // ========================================
        console.log('✏️  UPDATE: Updating CS department description...');
        const [updatedDept] = await db
            .update(departments)
            .set({
                description: 'Advanced study of computing, algorithms, and software engineering'
            })
            .where(eq(departments.id, csDept.id))
            .returning();

        console.log('✅ Updated department:');
        console.log(`   ${updatedDept.name}: ${updatedDept.description}`);
        console.log('');

        // ========================================
        // UPDATE: Modify subject
        // ========================================
        console.log('✏️  UPDATE: Updating CS301 subject name...');
        const [updatedSubject] = await db
            .update(subjects)
            .set({
                name: 'Advanced Database Systems',
                description: 'Relational databases, NoSQL, and distributed systems'
            })
            .where(eq(subjects.code, 'CS301'))
            .returning();

        console.log('✅ Updated subject:');
        console.log(`   ${updatedSubject.code}: ${updatedSubject.name}`);
        console.log('');

        // ========================================
        // DELETE: Remove a subject
        // ========================================
        console.log('🗑️  DELETE: Removing MATH201 subject...');
        await db
            .delete(subjects)
            .where(eq(subjects.code, 'MATH201'));

        console.log('✅ Subject deleted successfully');
        console.log('');

        // ========================================
        // DELETE: Remove a department (THIS WILL FAIL due to FK constraint)
        // ========================================
        console.log('🗑️  DELETE: Attempting to delete Physics department...');
        await db
            .delete(departments)
            .where(eq(departments.id, physDept.id));

        console.log('✅ Department deleted successfully (had no subjects)');
        console.log('');

        // ========================================
        // Final verification
        // ========================================
        console.log('📊 FINAL STATE: Checking remaining data...');
        const finalDepts = await db.select().from(departments);
        const finalSubjects = await db.select().from(subjects);

        console.log(`✅ Remaining departments: ${finalDepts.length}`);
        finalDepts.forEach(dept => {
            console.log(`   - ${dept.code}: ${dept.name}`);
        });

        console.log(`✅ Remaining subjects: ${finalSubjects.length}`);
        console.log('');

        // ========================================
        // CLEANUP: Delete all test data
        // ========================================
        console.log('🧹 CLEANUP: Removing all test data...');
        await db.delete(subjects);
        await db.delete(departments);
        console.log('✅ All test data removed');
        console.log('');

        console.log('🎉 CRUD operations completed successfully!\n');

    } catch (error) {
        console.error('❌ Error performing CRUD operations:', error);
        process.exit(1);
    }
}

main();
