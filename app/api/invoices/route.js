import { supabase } from "@/lib/supabase";
import { requireApiKey } from "@/lib/apiAuth";
import { NextResponse } from "next/server";

export async function GET(request) {
  const denied = requireApiKey(request);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  let query = supabase.from("invoices").select("*", { count: "exact" });

  if (type) query = query.eq("type", type);
  if (status) query = query.eq("status", status);
  if (search) {
    query = query.or(`number.ilike.%${search}%,client_name.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invoices: data, total: count, page, limit });
}

export async function POST(request) {
  const denied = requireApiKey(request);
  if (denied) return denied;

  const body = await request.json();

  // Idempotence : un appelant externe peut réessayer (bouton tapé deux fois,
  // relance après timeout). Avec external_ref, on renvoie le document existant
  // au lieu d'en créer un doublon.
  if (body.external_ref) {
    const { data: existing } = await supabase
      .from("invoices").select("*").eq("external_ref", body.external_ref).maybeSingle();
    if (existing) return NextResponse.json(existing, { status: 200 });
  }

  const { data, error } = await supabase.from("invoices").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
