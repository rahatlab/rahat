const { Pool } = require("pg");
require("dotenv").config({ path: ".env.local" });

const p = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 15000 });

(async () => {
  try {
    const cur = await p.query('select value from settings where key = $1', ["site"]);
    const value = cur.rows.length ? cur.rows[0].value : {};
    console.log("BEFORE:", JSON.stringify({ name: value.name, initials: value.initials }));

    const updated = {
      ...value,
      name: "Rahat",
      initials: "RA",
    };

    await p.query(
      `insert into settings (key, value) values ($1, $2)
       on conflict (key) do update set value = $2`,
      ["site", JSON.stringify(updated)]
    );

    const after = await p.query('select value from settings where key = $1', ["site"]);
    console.log("AFTER:", JSON.stringify({ name: after.rows[0].value.name, initials: after.rows[0].value.initials }));

    await p.end();
  } catch (e) {
    console.log("ERR:", e.message);
    process.exit(1);
  }
})();
