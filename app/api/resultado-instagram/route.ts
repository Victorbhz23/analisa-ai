import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
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

    const { searchParams } = new URL(request.url);
    const snapshotId = searchParams.get("snapshot_id");

    if (!snapshotId) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: "Informe o snapshot_id.",
        },
        { status: 400 }
      );
    }

    // 1. Busca o resultado da coleta na Bright Data
    const resposta = await fetch(
      `https://api.brightdata.com/datasets/v3/snapshot/${snapshotId}?format=json`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        cache: "no-store",
      }
    );

    const texto = await resposta.text();

    let dados;

    try {
      dados = JSON.parse(texto);
    } catch {
      dados = texto;
    }

    // 2. Verifica se a Bright Data ainda está processando
    if (
      resposta.status === 202 ||
      dados?.status === "running" ||
      dados?.status === "collecting"
    ) {
      return NextResponse.json({
        sucesso: true,
        pronto: false,
        snapshot_id: snapshotId,
        mensagem:
          dados?.message ||
          "A coleta ainda está sendo processada.",
      });
    }

    // 3. Trata erros reais da Bright Data
    if (!resposta.ok) {
      return NextResponse.json(
        {
          sucesso: false,
          pronto: false,
          status: resposta.status,
          erro: dados,
        },
        { status: resposta.status }
      );
    }

    // 4. Pega o perfil retornado
    const perfil = Array.isArray(dados) ? dados[0] : dados;

    if (!perfil || typeof perfil !== "object") {
      return NextResponse.json({
        sucesso: true,
        pronto: false,
        snapshot_id: snapshotId,
        mensagem: "A coleta ainda está sendo processada.",
      });
    }

    // Segurança extra:
    // não considera mensagens de processamento como perfil pronto
    if (
      perfil?.status === "running" ||
      perfil?.status === "collecting"
    ) {
      return NextResponse.json({
        sucesso: true,
        pronto: false,
        snapshot_id: snapshotId,
        mensagem:
          perfil?.message ||
          "A coleta ainda está sendo processada.",
      });
    }

    // 5. Salva os dados reais no Supabase
    const { error } = await supabase
      .from("analises")
      .update({
        dados_perfil: {
          status: "concluido",
          snapshot_id: snapshotId,
          perfil: perfil,
        },
      })
      .eq("dados_perfil->>snapshot_id", snapshotId);

    if (error) {
      console.error("Erro ao atualizar Supabase:", error);

      return NextResponse.json(
        {
          sucesso: false,
          erro:
            "Os dados foram coletados, mas não foi possível salvar no Supabase.",
          detalhes: error.message,
        },
        { status: 500 }
      );
    }

    // 6. Retorna os dados reais para o site
    return NextResponse.json({
      sucesso: true,
      pronto: true,
      snapshot_id: snapshotId,
      dados: perfil,
    });
  } catch (error) {
    console.error(
      "Erro ao buscar resultado da Bright Data:",
      error
    );

    return NextResponse.json(
      {
        sucesso: false,
        pronto: false,
        erro: "Não foi possível buscar o resultado do Instagram.",
      },
      { status: 500 }
    );
  }
}