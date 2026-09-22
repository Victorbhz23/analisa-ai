import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let instagramUsername = body.instagram_username?.trim();

    if (!instagramUsername) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: "Informe um usuário ou link do Instagram.",
        },
        { status: 400 }
      );
    }

    // Aceita tanto @usuario quanto URL completa do Instagram
    instagramUsername = instagramUsername
      .replace("https://www.instagram.com/", "")
      .replace("https://instagram.com/", "")
      .replace("@", "")
      .split("?")[0]
      .replaceAll("/", "")
      .trim();

    if (!instagramUsername) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: "Usuário do Instagram inválido.",
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.BRIGHT_DATA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: "BRIGHT_DATA_API_KEY não configurada.",
        },
        { status: 500 }
      );
    }

    const instagramUrl = `https://www.instagram.com/${instagramUsername}/`;

    // 1. Inicia a coleta do perfil na Bright Data
    const brightResponse = await fetch(
      "https://api.brightdata.com/datasets/v3/trigger?dataset_id=gd_l1vikfch901nx3by4&include_errors=true",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            url: instagramUrl,
          },
        ]),
        cache: "no-store",
      }
    );

    const brightText = await brightResponse.text();

    let brightData;

    try {
      brightData = JSON.parse(brightText);
    } catch {
      brightData = brightText;
    }

    if (!brightResponse.ok) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: "Erro ao iniciar coleta do Instagram.",
          detalhes: brightData,
        },
        { status: brightResponse.status }
      );
    }

    const snapshotId = brightData?.snapshot_id;

    if (!snapshotId) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: "A Bright Data não retornou um snapshot_id.",
          detalhes: brightData,
        },
        { status: 500 }
      );
    }

    // 2. Registra a solicitação no Supabase
    const { error } = await supabase.from("analises").insert({
      instagram_username: instagramUsername,
      dados_perfil: {
        status: "coletando",
        snapshot_id: snapshotId,
        instagram_url: instagramUrl,
      },
    });

    if (error) {
      console.error("Erro Supabase:", error);
    }

    // 3. Retorna o snapshot para o site consultar o resultado
    return NextResponse.json({
      sucesso: true,
      mensagem: "Análise iniciada.",
      instagram_username: instagramUsername,
      instagram_url: instagramUrl,
      snapshot_id: snapshotId,
      status: "coletando",
    });
  } catch (error) {
    console.error("Erro na análise:", error);

    return NextResponse.json(
      {
        sucesso: false,
        erro: "Não foi possível iniciar a análise.",
      },
      { status: 500 }
    );
  }
}