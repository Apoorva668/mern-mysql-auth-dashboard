import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";
import { sendMail } from "../utils/mail.js";

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

export async function register(req, res) {
  const { name, email, phone, password } = req.body || {};
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("name, email, password are required");
  }

  const [existing] = await pool.execute("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
  if (existing.length) {
    res.status(409);
    throw new Error("Email already registered");
  }

  const hashed = await bcrypt.hash(password, 12);
  const [result] = await pool.execute(
    "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)",
    [name, email, phone || null, hashed],
  );

  const token = signToken(result.insertId);
  res.status(201).json({
    token,
    user: { id: result.insertId, name, email, phone: phone || null },
  });
}

export async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    res.status(400);
    throw new Error("email and password are required");
  }

  const [rows] = await pool.execute("SELECT * FROM users WHERE email = ? LIMIT 1", [email]);
  if (!rows.length) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    res.status(401);
    throw new Error("Invalid credentials");
  }

  const token = signToken(user.id);
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
  });
}

export async function me(req, res) {
  res.json({ user: req.user });
}

export async function forgotPassword(req, res) {
  const { email } = req.body || {};
  if (!email) {
    res.status(400);
    throw new Error("email is required");
  }

  // Always return success to avoid account enumeration
  const [rows] = await pool.execute("SELECT id, email, name FROM users WHERE email = ? LIMIT 1", [
    email,
  ]);

  if (!rows.length) {
    return res.json({ message: "If that email exists, a reset link has been sent." });
  }

  const user = rows[0];
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1h

  await pool.execute("UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?", [
    tokenHash,
    expiry,
    user.id,
  ]);

  const origin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  const resetUrl = `${origin}/reset-password?token=${rawToken}&email=${encodeURIComponent(
    user.email,
  )}`;

  const subject = "Password reset";
  const text = `Reset your password using this link: ${resetUrl}`;
  const html = `<p>Hi ${user.name || ""},</p><p>Reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 1 hour.</p>`;

  await sendMail({ to: user.email, subject, text, html });
  res.json({ message: "If that email exists, a reset link has been sent." });
}

export async function resetPassword(req, res) {
  const { email, token, password } = req.body || {};
  if (!email || !token || !password) {
    res.status(400);
    throw new Error("email, token, password are required");
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const [rows] = await pool.execute(
    "SELECT id, reset_token_expiry FROM users WHERE email = ? AND reset_token = ? LIMIT 1",
    [email, tokenHash],
  );

  if (!rows.length) {
    res.status(400);
    throw new Error("Invalid token");
  }

  const user = rows[0];
  if (!user.reset_token_expiry || new Date(user.reset_token_expiry).getTime() < Date.now()) {
    res.status(400);
    throw new Error("Token expired");
  }

  const hashed = await bcrypt.hash(password, 12);
  await pool.execute(
    "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
    [hashed, user.id],
  );

  res.json({ message: "Password reset successful" });
}

