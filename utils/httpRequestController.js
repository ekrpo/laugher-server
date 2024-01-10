import pool from "../config/database.config.js";
import { errorHandler } from "../middlewares/error.middleware.js";

export async function executeQuery(query, params, release = true) {
    const client = await pool.connect();
    try {
      const result = await client.query(query, params);
      return result.rows;
    } finally {
      if (release) {
        await client.release();
      }
    }
  }
  
export async function handleDbOperation(req, res, operation) {
    try {
      const result = await operation(req);
      res.json(result);
    } catch (error) {
      req.error = error;
      errorHandler(req, res);
    }
  }
  
export async function executeRequestOperation(query, params, release = true) {
    return executeQuery(query, params, release);
  }