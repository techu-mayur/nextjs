const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function checkDatabase() {
  try {
    const dbPath = path.join(process.cwd(), 'wedding_album.db');
    console.log('Database path:', dbPath);
    
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Check for invalid filenames
    const invalidEntries = await db.all(`
      SELECT id, filename, filepath, filetype, category 
      FROM media_items 
      WHERE filename LIKE '._%' 
         OR filename LIKE '._%' 
         OR filename LIKE '%DJG00212%'
         OR filename LIKE '%.DS_Store%'
         OR filename LIKE '%Thumbs.db%'
         OR filename LIKE '%desktop.ini%'
      LIMIT 20
    `);

    console.log('\n=== Invalid Entries Found ===');
    if (invalidEntries.length === 0) {
      console.log('No invalid entries found!');
    } else {
      invalidEntries.forEach(entry => {
        console.log(`ID: ${entry.id}`);
        console.log(`Filename: ${entry.filename}`);
        console.log(`Filepath: ${entry.filepath}`);
        console.log(`Type: ${entry.filetype}`);
        console.log(`Category: ${entry.category}`);
        console.log('---');
      });
    }

    // Check total count
    const totalCount = await db.get('SELECT COUNT(*) as count FROM media_items');
    console.log(`\nTotal media items: ${totalCount.count}`);

    // Check for any files that might not exist
    const allMedia = await db.all('SELECT id, filename, filepath FROM media_items LIMIT 10');
    console.log('\n=== Sample Entries ===');
    allMedia.forEach(entry => {
      console.log(`${entry.filename} -> ${entry.filepath}`);
    });

    await db.close();
  } catch (error) {
    console.error('Error checking database:', error);
  }
}

checkDatabase();
