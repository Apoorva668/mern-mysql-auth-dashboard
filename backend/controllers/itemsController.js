import pool from "../config/db.js";

const VALID_STATUSES = new Set(["active", "pending", "completed"]);

export async function getItems(req, res) {
  const [rows] = await pool.execute(
    "SELECT id, user_id, title, description, status, created_at, updated_at FROM items WHERE user_id = ? ORDER BY created_at DESC",
    [req.user.id],
  );
  res.json({ items: rows });
}

export async function getItem(req, res) {
  const id = Number(req.params.id);
  const [rows] = await pool.execute(
    "SELECT id, user_id, title, description, status, created_at, updated_at FROM items WHERE id = ? AND user_id = ? LIMIT 1",
    [id, req.user.id],
  );
  if (!rows.length) {
    res.status(404);
    throw new Error("Item not found");
  }
  res.json({ item: rows[0] });
}

export async function createItem(req, res) {
  const { title, description, status } = req.body || {};
  if (!title) {
    res.status(400);
    throw new Error("title is required");
  }
  const nextStatus = status && VALID_STATUSES.has(status) ? status : "active";
  const [result] = await pool.execute(
    "INSERT INTO items (user_id, title, description, status) VALUES (?, ?, ?, ?)",
    [req.user.id, title, description || null, nextStatus],
  );
  const [rows] = await pool.execute(
    "SELECT id, user_id, title, description, status, created_at, updated_at FROM items WHERE id = ? LIMIT 1",
    [result.insertId],
  );
  res.status(201).json({ item: rows[0] });
}

export async function updateItem(req, res) {
  const id = Number(req.params.id);
  const { title, description, status } = req.body || {};

  const fields = [];
  const values = [];

  if (typeof title === "string") {
    fields.push("title = ?");
    values.push(title);
  }
  if (typeof description === "string" || description === null) {
    fields.push("description = ?");
    values.push(description);
  }
  if (typeof status === "string") {
    if (!VALID_STATUSES.has(status)) {
      res.status(400);
      throw new Error("Invalid status");
    }
    fields.push("status = ?");
    values.push(status);
  }

  if (!fields.length) {
    res.status(400);
    throw new Error("No fields to update");
  }

  values.push(id, req.user.id);
  const [result] = await pool.execute(
    `UPDATE items SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`,
    values,
  );
  if (result.affectedRows === 0) {
    res.status(404);
    throw new Error("Item not found");
  }
  const [rows] = await pool.execute(
    "SELECT id, user_id, title, description, status, created_at, updated_at FROM items WHERE id = ? AND user_id = ? LIMIT 1",
    [id, req.user.id],
  );
  res.json({ item: rows[0] });
}

export async function deleteItem(req, res) {
  const id = Number(req.params.id);
  const [result] = await pool.execute("DELETE FROM items WHERE id = ? AND user_id = ?", [
    id,
    req.user.id,
  ]);
  if (result.affectedRows === 0) {
    res.status(404);
    throw new Error("Item not found");
  }
  res.json({ message: "Item deleted" });
}

export async function stats(req, res) {
  const [rows] = await pool.execute(
    `SELECT 
      COUNT(*) as total,
      SUM(status = 'active') as active,
      SUM(status = 'pending') as pending,
      SUM(status = 'completed') as completed
    FROM items
    WHERE user_id = ?`,
    [req.user.id],
  );

  const s = rows[0] || { total: 0, active: 0, pending: 0, completed: 0 };
  res.json({
    stats: {
      total: Number(s.total || 0),
      active: Number(s.active || 0),
      pending: Number(s.pending || 0),
      completed: Number(s.completed || 0),
    },
  });
}

