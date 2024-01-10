import pg from "pg";
import dotenv from "dotenv"
dotenv.config()

const pool = new pg.Pool ({
    connectionString: "postgres://laugher:RJ0agIx2U6MllWkkDxLHcLwFKHfiRLKd@dpg-cmfh3lfqd2ns73a31ii0-a/laugher"
})

export default pool;

