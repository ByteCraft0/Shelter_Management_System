const pool = require("./config/db");

async function testDatabase() {
    try {
        const [rows] = await pool.query("SELECT 1 AS result");

        console.log("MySQL connected successfully!");
        console.log(rows);

        process.exit(0);
    } catch (error) {
        console.error("MySQL connection failed!");
        console.error(error.message);

        process.exit(1);
    }
}

testDatabase();