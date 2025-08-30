const { Client } = require('@notionhq/client');

// Test script for Notion API integration
async function testNotionIntegration() {
    console.log('🔍 Testing Notion API Integration...\n');
    
    const token = process.env.NOTION_TOKEN || 'your-notion-token-here';
    const tasksDbId = process.env.NOTION_TASKS_DB || 'your-tasks-database-id';
    const metricsDbId = process.env.NOTION_METRICS_DB || 'your-metrics-database-id';
    const sprintsDbId = process.env.NOTION_SPRINTS_DB || 'your-sprints-database-id';
    
    const notion = new Client({ auth: token });
    
    try {
        // Test 1: Verify token and access
        console.log('1️⃣ Testing Notion API token...');
        const user = await notion.users.me();
        console.log(`   ✅ Token valid - User: ${user.name || 'Unknown'}`);
        
        // Test 2: Check Tasks Database
        console.log('\n2️⃣ Testing Tasks Database access...');
        try {
            const tasksDb = await notion.databases.retrieve({
                database_id: tasksDbId
            });
            console.log(`   ✅ Tasks DB accessible - Title: ${tasksDb.title?.[0]?.plain_text || 'Untitled'}`);
            
            // Test query
            const tasksQuery = await notion.databases.query({
                database_id: tasksDbId,
                page_size: 3
            });
            console.log(`   📊 Found ${tasksQuery.results.length} tasks in database`);
            
        } catch (error) {
            console.log(`   ❌ Tasks DB error: ${error.message}`);
        }
        
        // Test 3: Check Metrics Database
        console.log('\n3️⃣ Testing Metrics Database access...');
        try {
            const metricsDb = await notion.databases.retrieve({
                database_id: metricsDbId
            });
            console.log(`   ✅ Metrics DB accessible - Title: ${metricsDb.title?.[0]?.plain_text || 'Untitled'}`);
            
            const metricsQuery = await notion.databases.query({
                database_id: metricsDbId,
                page_size: 3
            });
            console.log(`   📊 Found ${metricsQuery.results.length} metrics in database`);
            
        } catch (error) {
            console.log(`   ❌ Metrics DB error: ${error.message}`);
        }
        
        // Test 4: Check Sprints Database
        console.log('\n4️⃣ Testing Sprints Database access...');
        try {
            const sprintsDb = await notion.databases.retrieve({
                database_id: sprintsDbId
            });
            console.log(`   ✅ Sprints DB accessible - Title: ${sprintsDb.title?.[0]?.plain_text || 'Untitled'}`);
            
        } catch (error) {
            console.log(`   ❌ Sprints DB error: ${error.message}`);
        }
        
        // Test 5: Create a test task
        console.log('\n5️⃣ Testing task creation...');
        try {
            const testTask = await notion.pages.create({
                parent: { database_id: tasksDbId },
                properties: {
                    'Task': {
                        title: [{ text: { content: 'Test Task - Integration Check' } }]
                    },
                    'Status': {
                        select: { name: '📋 To Do' }
                    },
                    'Priority': {
                        select: { name: '📊 Medium' }
                    },
                    'Team': {
                        select: { name: 'Backend' }
                    },
                    'Notes': {
                        rich_text: [{
                            text: { content: 'Auto-created test task from integration script' }
                        }]
                    }
                }
            });
            console.log(`   ✅ Test task created successfully - ID: ${testTask.id}`);
            
            // Clean up - delete test task
            await notion.pages.update({
                page_id: testTask.id,
                archived: true
            });
            console.log(`   🗑️ Test task cleaned up`);
            
        } catch (error) {
            console.log(`   ❌ Task creation error: ${error.message}`);
        }
        
        console.log('\n🎉 Notion integration test completed!');
        
    } catch (error) {
        console.error(`❌ Integration test failed: ${error.message}`);
        process.exit(1);
    }
}

// Run the test
testNotionIntegration().catch(console.error);
