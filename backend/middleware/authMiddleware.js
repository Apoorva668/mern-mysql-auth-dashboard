import jwt from "jsonwebtoken";
import pool from "../config/db.js";

export async function protect(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const [, token] = auth.split(" ");
    if (!token) {
      res.status(401);
      throw new Error("Not authorized, no token");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.execute(
      "SELECT id, name, email, phone, created_at, updated_at FROM users WHERE id = ? LIMIT 1",
      [decoded.id],
    );

    if (!rows.length) {
      res.status(401);
      throw new Error("Not authorized, user not found");
    }

    req.user = rows[0];
    next();
  } catch (err) {
    res.status(res.statusCode !== 200 ? res.statusCode : 401);
    next(err);
  }
}

