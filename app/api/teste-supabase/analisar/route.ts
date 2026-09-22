import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("analises")
    .select("*")
    .limit(5);

  if (error) {
    return NextResponse.json(
      {
        conectado: false,
        erro: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    conectado: true,
    mensagem: "Analisa Aí conectado ao Supabase!",
    dados: data,
  });
}