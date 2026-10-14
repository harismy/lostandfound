import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  connectTimeout: 60000,
  // MYSQL_SSL=false untuk MySQL yang tidak mendukung SSL (mis. MySQL bawaan cPanel)
  ssl:
    process.env.MYSQL_SSL === "false"
      ? undefined
      : { rejectUnauthorized: false },
});

export default pool;
