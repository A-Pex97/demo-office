import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ClientsTable, { type ClientRow } from "./clients-table";
import LogoutButton from "./logout-button";

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<string, string> = {
  manager: "מנהל",
  employee: "עובד",
};

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, status, missing_docs, due_date, assigned_to")
    .eq("archived", false)
    .order("due_date", { ascending: true });

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name");

  const nameById = new Map(
    (profiles ?? []).map((p) => [p.id as string, p.full_name as string])
  );

  const rows: ClientRow[] = (clients ?? []).map((c) => ({
    id: c.id as string,
    name: c.name as string,
    status: c.status as string,
    missing_docs: c.missing_docs as string | null,
    due_date: c.due_date as string | null,
    assigned_to: c.assigned_to as string | null,
    assignee_name: nameById.get(c.assigned_to as string) ?? "לא משויך",
  }));

  return (
    <main className="mx-auto max-w-5xl p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-xl font-semibold">לוח מעקב סגירת חודש</h1>
          <p className="mt-1 text-sm text-gray-600">
            {profile?.full_name ?? user.email} ·{" "}
            {ROLE_LABELS[profile?.role ?? ""] ?? profile?.role ?? ""}
          </p>
        </div>
        <LogoutButton />
      </header>

      <ClientsTable rows={rows} />
    </main>
  );
}
