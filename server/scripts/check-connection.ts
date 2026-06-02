// Verifikasi koneksi server Express ↔ Supabase Lovable Cloud.
// Jalankan: npm run check
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function fail(msg: string): never {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

if (!URL) fail("SUPABASE_URL belum di-set di server/.env");
if (!KEY || KEY.includes("paste_service_role_key")) {
  fail("SUPABASE_SERVICE_ROLE_KEY belum di-set di server/.env.\n   Ambil dari Lovable: Backend → Project Settings → API keys → service_role.");
}

console.log("→ SUPABASE_URL:", URL);
console.log("→ SERVICE_ROLE_KEY:", KEY!.slice(0, 12) + "…" + KEY!.slice(-6));

const admin = createClient(URL!, KEY!);

const { count, error } = await admin
  .from("tweets")
  .select("*", { count: "exact", head: true });

if (error) fail(`Query tweets gagal: ${error.message}`);

console.log(`\n✅ Koneksi OK. Jumlah baris di tabel 'tweets': ${count ?? 0}`);
console.log("   Server siap di-jalankan dengan: npm run dev\n");
