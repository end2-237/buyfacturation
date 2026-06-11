import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET(_, { params }) {
  const { data, error } = await supabase.from("invoices").select("*").eq("id", params.id).single();
  if (error || !data) return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(request, { params }) {
  const body = await request.json();
  const { data, error } = await supabase
    .from("invoices")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", params.id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(_, { params }) {
  const { error } = await supabase.from("invoices").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ message: "Facture supprimée" });
}
