const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function checkCategories() {
  try {
    const dbPath = path.join(process.cwd(), 'wedding_album.db');
    console.log('Database path:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Check categories and their counts
    const categories = await db.all(`
      SELECT 
        category,
        COUNT(*) as count,
        COUNT(CASE WHEN filetype = 'image' THEN 1 END) as image_count,
        COUNT(CASE WHEN filetype = 'video' THEN 1 END) as video_count
      FROM media_items 
      WHERE category IS NOT NULL AND category != ''
      GROUP BY category
      ORDER BY count DESC
    `);

    console.log('\n=== Categories Found ===');
    if (categories.length === 0) {
      console.log('No categories found!');
    } else {
      categories.forEach(cat => {
        console.log(`Category: "${cat.category}"`);
        console.log(`  Total items: ${cat.count}`);
        console.log(`  Images: ${cat.image_count}`);
        console.log(`  Videos: ${cat.video_count}`);
        console.log('---');
      });
    }

    // Check for items without categories
    const uncategorized = await db.get(`
      SELECT COUNT(*) as count 
      FROM media_items 
      WHERE category IS NULL OR category = ''
    `);
    console.log(`\nUncategorized items: ${uncategorized.count}`);

    // Check total count
    const totalCount = await db.get('SELECT COUNT(*) as count FROM media_items');
    console.log(`Total media items: ${totalCount.count}`);

    // Show sample entries with their categories
    const sampleEntries = await db.all(`
      SELECT filename, filetype, category 
      FROM media_items 
      WHERE category IS NOT NULL AND category != ''
      LIMIT 10
    `);
    
    console.log('\n=== Sample Entries with Categories ===');
    sampleEntries.forEach(entry => {
      console.log(`${entry.filename} (${entry.filetype}) -> Category: "${entry.category}"`);
    });

    await db.close();
  } catch (error) {
    console.error('Error checking categories:', error);
  }
}

checkCategories();
