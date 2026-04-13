import { useEffect, useMemo, useState } from "react";
import http from "../api/http";
import Alert from "../components/Alert";
import Button from "../components/Button";
import TextField from "../components/TextField";

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function StatusPill({ status }) {
  const cls =
    status === "completed"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : status === "pending"
        ? "bg-amber-50 text-amber-900 border-amber-200"
        : "bg-sky-50 text-sky-900 border-sky-200";
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${cls}`}>{status}</span>;
}

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("active");

  const sortedItems = useMemo(() => items, [items]);

  async function fetchAll() {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const [itemsRes, statsRes] = await Promise.all([http.get("/api/items"), http.get("/api/stats")]);
      setItems(itemsRes.data.items || []);
      setStats(statsRes.data.stats || { total: 0, active: 0, pending: 0, completed: 0 });
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  async function onCreate(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setMutating(true);
    try {
      await http.post("/api/items", { title: title.trim(), description: description.trim() });
      setTitle("");
      setDescription("");
      setSuccess("Item created");
      await fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Create failed");
    } finally {
      setMutating(false);
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditTitle(item.title || "");
    setEditDescription(item.description || "");
    setEditStatus(item.status || "active");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    setEditStatus("active");
  }

  async function saveEdit() {
    setError("");
    setSuccess("");
    if (!editTitle.trim()) {
      setError("Title is required");
      return;
    }
    setMutating(true);
    try {
      await http.put(`/api/items/${editingId}`, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        status: editStatus,
      });
      setSuccess("Item updated");
      cancelEdit();
      await fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Update failed");
    } finally {
      setMutating(false);
    }
  }

  async function onDelete(id) {
    setError("");
    setSuccess("");
    setMutating(true);
    try {
      await http.delete(`/api/items/${id}`);
      setSuccess("Item deleted");
      await fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Delete failed");
    } finally {
      setMutating(false);
    }
  }

  async function quickStatus(id, status) {
    setError("");
    setSuccess("");
    setMutating(true);
    try {
      await http.put(`/api/items/${id}`, { status });
      await fetchAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Update failed");
    } finally {
      setMutating(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">Manage your items and track progress.</p>
        </div>
        <Button variant="ghost" onClick={fetchAll} disabled={loading || mutating}>
          Refresh
        </Button>
      </div>

      <div className="mt-4 space-y-3">
        <Alert type="error">{error}</Alert>
        <Alert type="success">{success}</Alert>
      </div>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Active" value={stats.active} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Completed" value={stats.completed} />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
        <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Add item</h2>
          <form className="mt-3 space-y-3" onSubmit={onCreate}>
            <TextField label="Title" value={title} onChange={setTitle} required />
            <label className="block">
              <div className="text-sm font-medium text-slate-700">Description (optional)</div>
              <textarea
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 min-h-[96px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this item about?"
              />
            </label>
            <Button type="submit" disabled={mutating}>
              {mutating ? "Saving..." : "Create"}
            </Button>
          </form>
        </div>

        <div className="md:col-span-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Your items</h2>
            <div className="text-xs text-slate-500">{loading ? "Loading..." : `${items.length} items`}</div>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {sortedItems.length === 0 && !loading ? (
              <div className="py-8 text-center text-sm text-slate-600">No items yet. Create your first one.</div>
            ) : (
              sortedItems.map((it) => (
                <div key={it.id} className="py-3">
                  {editingId === it.id ? (
                    <div className="space-y-3">
                      <TextField label="Title" value={editTitle} onChange={setEditTitle} required />
                      <label className="block">
                        <div className="text-sm font-medium text-slate-700">Description</div>
                        <textarea
                          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900 min-h-[96px]"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                        />
                      </label>
                      <label className="block">
                        <div className="text-sm font-medium text-slate-700">Status</div>
                        <select
                          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-900"
                          value={editStatus}
                          onChange={(e) => setEditStatus(e.target.value)}
                        >
                          <option value="active">active</option>
                          <option value="pending">pending</option>
                          <option value="completed">completed</option>
                        </select>
                      </label>

                      <div className="flex gap-2">
                        <Button onClick={saveEdit} disabled={mutating} type="button">
                          {mutating ? "Saving..." : "Save"}
                        </Button>
                        <Button onClick={cancelEdit} disabled={mutating} type="button" variant="ghost">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-slate-900 truncate">{it.title}</div>
                          <StatusPill status={it.status} />
                        </div>
                        {it.description ? (
                          <div className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{it.description}</div>
                        ) : null}
                        <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                          <span>Quick status:</span>
                          <button
                            className="underline text-slate-700"
                            disabled={mutating}
                            onClick={() => quickStatus(it.id, "active")}
                          >
                            active
                          </button>
                          <button
                            className="underline text-slate-700"
                            disabled={mutating}
                            onClick={() => quickStatus(it.id, "pending")}
                          >
                            pending
                          </button>
                          <button
                            className="underline text-slate-700"
                            disabled={mutating}
                            onClick={() => quickStatus(it.id, "completed")}
                          >
                            completed
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="ghost" type="button" disabled={mutating} onClick={() => startEdit(it)}>
                          Edit
                        </Button>
                        <Button variant="ghost" type="button" disabled={mutating} onClick={() => onDelete(it.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

