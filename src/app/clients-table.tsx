"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const STATUSES = ["בטיפול", "ממתין ללקוח", "הושלם"];

export type ClientRow = {
  id: string;
  name: string;
  status: string;
  missing_docs: string | null;
  due_date: string | null;
  assigned_to: string | null;
  assignee_name: string;
};

function formatDate(value: string | null) {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  return `${d}/${m}/${y}`;
}

export default function ClientsTable({ rows }: { rows: ClientRow[] }) {
  const [clients, setClients] = useState(rows);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(id: string, status: string) {
    const previous = clients;
    setClients((c) => c.map((r) => (r.id === id ? { ...r, status } : r)));
    setSavingId(id);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("clients")
      .update({ status })
      .eq("id", id);

    setSavingId(null);

    if (error) {
      setClients(previous);
      setError("העדכון נכשל. ייתכן שאין לך הרשאה לעדכן לקוח זה.");
    }
  }

  return (
    <>
      {error && (
        <p className="mb-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-right text-sm">
          <thead className="border-b border-gray-200 bg-gray-100">
            <tr>
              <th className="px-4 py-3 font-medium">שם הלקוח</th>
              <th className="px-4 py-3 font-medium">סטטוס</th>
              <th className="px-4 py-3 font-medium">מסמכים חסרים</th>
              <th className="px-4 py-3 font-medium">תאריך יעד</th>
              <th className="px-4 py-3 font-medium">אחראי</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((row) => (
              <tr key={row.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3">
                  <select
                    value={row.status}
                    disabled={savingId === row.id}
                    onChange={(e) => updateStatus(row.id, e.target.value)}
                    className="rounded border border-gray-300 bg-white px-2 py-1 text-sm disabled:opacity-50"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {row.missing_docs || "—"}
                </td>
                <td className="px-4 py-3">{formatDate(row.due_date)}</td>
                <td className="px-4 py-3 text-gray-700">{row.assignee_name}</td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  אין לקוחות להצגה
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
