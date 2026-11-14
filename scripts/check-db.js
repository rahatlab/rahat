const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const p = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    // Check settings
    const settings = await p.query("SELECT * FROM settings WHERE key = 'site'");
    console.log('SETTINGS:', JSON.stringify(settings.rows[0]?.value, null, 2));
    
    // Check projects
    const projects = await p.query("SELECT title, slug FROM projects ORDER BY created_at DESC LIMIT 5");
    console.log('PROJECTS:', JSON.stringify(projects.rows, null, 2));
    
    // Check posts
    const posts = await p.query("SELECT title, slug FROM posts ORDER BY created_at DESC LIMIT 5");
    console.log('POSTS:', JSON.stringify(posts.rows, null, 2));
    
    await p.end();
  } catch (e) {
    console.log('ERROR:', e.message);
    process.exit(1);
  }
})();