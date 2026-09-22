import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.BRIGHT_DATA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: "BRIGHT_DATA_API_KEY não encontrada.",
        },
        { status: 500 }
      );
    }

    const instagramUrl =
      "https://www.instagram.com/victormiranda_mkt/";

    const resposta = await fetch(
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
      }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
      return NextResponse.json(
        {
          sucesso: false,
          erro: "Erro ao solicitar dados para a Bright Data.",
          detalhes: dados,
        },
        { status: resposta.status }
      );
    }

    return NextResponse.json({
      sucesso: true,
      mensagem: "Coleta iniciada na Bright Data.",
      brightData: dados,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        sucesso: false,
        erro: "Erro ao conectar com a Bright Data.",
      },
      { status: 500 }
    );
  }
}