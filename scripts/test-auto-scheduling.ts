// Test script untuk Automatic Scheduling Feature
// Run dengan: npx tsx scripts/test-auto-scheduling.ts

import { reportService } from '../lib/services/reports/report-service';
import { db } from '../db';

async function testAutomaticScheduling() {
  try {
    console.log('🧪 Testing Automatic Scheduling Feature...\n');

    // 1. Test getSchedulingStats
    console.log('📊 Testing getSchedulingStats()...');
    const stats = await reportService.getSchedulingStats();
    console.log('Current scheduling stats:', stats);
    console.log('✅ getSchedulingStats() working\n');

    // 2. Test getInProgressReportsNeedingSchedule
    console.log('📋 Testing getInProgressReportsNeedingSchedule()...');
    const inProgressReports = await reportService.getInProgressReportsNeedingSchedule();
    console.log(`Found ${inProgressReports.length} reports needing scheduling`);
    if (inProgressReports.length > 0) {
      console.log('Sample report:', {
        id: inProgressReports[0].id,
        reportNumber: inProgressReports[0].reportNumber,
        title: inProgressReports[0].title,
        reporter: inProgressReports[0].reporter
      });
    }
    console.log('✅ getInProgressReportsNeedingSchedule() working\n');

    // 3. Test getNextAvailableScheduleSlot
    console.log('🕒 Testing getNextAvailableScheduleSlot()...');
    const nextSlot = await reportService.getNextAvailableScheduleSlot();
    console.log('Next available slot:', nextSlot.toISOString());
    console.log('✅ getNextAvailableScheduleSlot() working\n');

    // 4. Simulate auto-scheduling (dengan user ID dummy)
    if (inProgressReports.length > 0) {
      console.log('🔄 Testing autoScheduleInProgressReports()...');
      const result = await reportService.autoScheduleInProgressReports(
        'test-user-id', // dummy user ID
        {
          defaultLocation: 'Test Location',
          defaultDuration: 2,
          autoAssignTeam: false
        }
      );
      console.log('Auto-schedule result:', result);
      console.log(`✅ Successfully scheduled ${result.scheduledCount} reports\n`);
    } else {
      console.log('⚠️  No reports to schedule - skipping auto-schedule test');
    }

    // 5. Final stats check
    console.log('📈 Final stats after testing...');
    const finalStats = await reportService.getSchedulingStats();
    console.log('Updated scheduling stats:', finalStats);

    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Setup test data helper function
async function setupTestData() {
  console.log('🔧 Setting up test data...\n');

  try {
    // Check if we have users to work with
    const users = await db.user.findMany({
      where: { role: 'USER' },
      take: 5
    });

    if (users.length === 0) {
      console.log('⚠️  No test users found. Creating a test user...');
      const testUser = await db.user.create({
        data: {
          email: 'test@example.com',
          password: 'hashedpassword',
          name: 'Test User',
          role: 'USER'
        }
      });
      console.log('✅ Created test user:', testUser.id);
    }

    // Create some test reports with IN_PROGRESS status
    const testUsers = await db.user.findMany({ where: { role: 'USER' }, take: 2 });
    
    if (testUsers.length > 0) {
      console.log('📝 Creating test reports with IN_PROGRESS status...');
      
      for (let i = 0; i < 3; i++) {
        const testReport = await db.report.create({
          data: {
            reportNumber: `TEST-${Date.now()}-${i}`,
            title: `Test Report ${i + 1} - Auto Scheduling`,
            description: `This is a test report for automatic scheduling feature ${i + 1}`,
            status: 'IN_PROGRESS',
            reporterId: testUsers[0].id,
            scheduledDate: null // This ensures it needs scheduling
          }
        });
        console.log(`✅ Created test report: ${testReport.reportNumber}`);
      }
    }

    console.log('✅ Test data setup completed\n');
    
  } catch (error) {
    console.error('❌ Test data setup failed:', error);
    throw error;
  }
}

// Cleanup test data
async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...\n');

  try {
    // Delete test reports
    const testReports = await db.report.findMany({
      where: {
        reportNumber: {
          startsWith: 'TEST-'
        }
      }
    });

    for (const report of testReports) {
      await db.report.delete({ where: { id: report.id } });
      console.log(`✅ Deleted test report: ${report.reportNumber}`);
    }

    // Optionally delete test users (be careful!)
    // const testUsers = await db.user.findMany({
    //   where: {
    //     email: 'test@example.com'
    //   }
    // });
    // 
    // for (const user of testUsers) {
    //   await db.user.delete({ where: { id: user.id } });
    //   console.log(`✅ Deleted test user: ${user.email}`);
    // }

    console.log('✅ Cleanup completed\n');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Automatic Scheduling Tests\n');
  
  const args = process.argv.slice(2);
  const shouldSetup = args.includes('--setup');
  const shouldCleanup = args.includes('--cleanup');
  const shouldRunTests = !args.includes('--setup-only');

  try {
    if (shouldSetup) {
      await setupTestData();
    }

    if (shouldRunTests) {
      await testAutomaticScheduling();
    }

    if (shouldCleanup) {
      await cleanupTestData();
    }

    console.log('🏁 All operations completed successfully!');
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await db.$disconnect();
  }
}

// Execute if called directly
if (require.main === module) {
  main().catch(console.error);
}

export {
  testAutomaticScheduling,
  setupTestData,
  cleanupTestData
};