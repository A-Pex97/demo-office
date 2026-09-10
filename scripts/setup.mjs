// יצירת המשתמשים, הפרופילים וזריעת 6 הלקוחות (דורש service_role)
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("חסר SUPABASE_URL או SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const USERS = [
  {
    email: "manager@demo-office.co.il",
    password: "Demo1234!",
    full_name: 'רו"ח דנה לוי',
    role: "manager",
  },
  {
    email: "employee@demo-office.co.il",
    password: "Demo1234!",
    full_name: "יוסי כהן",
    role: "employee",
  },
];

async function ensureUser({ email, password, full_name, role }) {
  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  let id = created?.user?.id;

  if (error) {
    // המשתמש כבר קיים - נאתר אותו ונאפס סיסמה
    const { data: list } = await admin.auth.admin.listUsers({ perPage: 200 });
    const existing = list?.users?.find((u) => u.email === email);
    if (!existing) throw error;
    id = existing.id;
    await admin.auth.admin.updateUserById(id, {
      password,
      email_confirm: true,
    });
  }

  const { error: profileError } = await admin
    .from("profiles")
    .upsert({ id, full_name, role });
  if (profileError) throw profileError;

  console.log(`משתמש מוכן: ${email} (${role}) -> ${id}`);
  return id;
}

const managerId = await ensureUser(USERS[0]);
const employeeId = await ensureUser(USERS[1]);

const CLIENTS = [
  {
    name: "מסעדת הגן",
    status: "בטיפול",
    missing_docs: "חשבוניות ספקים 08/2026",
    due_date: "2026-09-15",
    assigned_to: managerId,
  },
  {
    name: 'אלקטרו-דן בע"מ',
    status: "ממתין ללקוח",
    missing_docs: "דפי בנק, אישור ניכוי מס",
    due_date: "2026-09-18",
    assigned_to: managerId,
  },
  {
    name: "קליניקת שיר",
    status: "הושלם",
    missing_docs: null,
    due_date: "2026-09-10",
    assigned_to: employeeId,
  },
  {
    name: 'צביקה הובלות בע"מ',
    status: "בטיפול",
    missing_docs: "קבלות דלק, טופס 856",
    due_date: "2026-09-22",
    assigned_to: employeeId,
  },
  {
    name: "בוטיק לירז",
    status: "ממתין ללקוח",
    missing_docs: "ספירת מלאי לסוף החודש",
    due_date: "2026-09-25",
    assigned_to: managerId,
  },
  {
    name: 'מרכז הדפוס אורן בע"מ',
    status: "בטיפול",
    missing_docs: "חשבוניות רכש, דוח שכר",
    due_date: "2026-09-30",
    assigned_to: managerId,
  },
];

await admin.from("clients").delete().neq("id", "00000000-0000-0000-0000-000000000000");
const { error: seedError } = await admin.from("clients").insert(CLIENTS);
if (seedError) throw seedError;

console.log(`נזרעו ${CLIENTS.length} לקוחות (4 למנהל, 2 לעובד).`);
