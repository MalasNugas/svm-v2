import type { NextFunction, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.warn("[auth] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY tidak di-set — auth akan menolak semua request.");
}

const admin = createClient(SUPABASE_URL ?? "", SERVICE_KEY ?? "");

export interface AuthedRequest extends Request {
  user?: { id: string; email?: string };
  roles?: string[];
}

/** Verifikasi JWT Supabase via `auth.getUser` (paling reliable; tidak perlu JWKS manual). */
export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const h = req.headers.authorization ?? "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : "";
    if (!token) return res.status(401).json({ error: "missing bearer token" });

    const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user) return res.status(401).json({ error: "invalid token" });

    req.user = { id: data.user.id, email: data.user.email ?? undefined };

    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", data.user.id);
    req.roles = (roles ?? []).map((r: any) => r.role);
    next();
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "auth failed" });
  }
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (!req.roles?.includes("admin")) return res.status(403).json({ error: "admin role required" });
  next();
}

export { admin as supabaseAdmin };
