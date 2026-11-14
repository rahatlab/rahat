const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const p = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15000 });

(async () => {
  try {
    const v = await p.query(
      'select identifier, left(value, 80) as value_head, expires_at, created_at from verification order by created_at desc limit 3'
    );
    console.log("VERIFICATION ROWS:", JSON.stringify(v.rows, null, 1));

    const u = await p.query('select email, email_verified, created_at from "user"');
    console.log("USERS:", JSON.stringify(u.rows));

    await p.end();
  } catch (e) {
    console.log("ERR:", e.message);
    process.exit(1);
  }
})();
