import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const perfil = body.perfil;
    const snapshotId = body.snapshot_id;

    if (!perfil || typeof perfil !== "object") {
      return NextResponse.json(
        {
          sucesso: false,
          erro: "Dados do perfil não informados.",
        },
        { status: 400 }
      );
    }

    // --------------------------------
    // DADOS BÁSICOS
    // --------------------------------

    const seguidores = Number(perfil.followers || 0);
    const seguindo = Number(perfil.following || 0);
    const totalPublicacoes = Number(
      perfil.posts_count || 0
    );

    const destaques = Number(
      perfil.highlights_count || 0
    );

    const bio =
      typeof perfil.biography === "string"
        ? perfil.biography.trim()
        : "";

    const posts = Array.isArray(perfil.posts)
      ? perfil.posts
      : [];

    // --------------------------------
    // LINKS EXTERNOS
    // --------------------------------

    let quantidadeLinks = 0;

    if (Array.isArray(perfil.external_urls)) {
      quantidadeLinks =
        perfil.external_urls.length;
    } else if (
      Array.isArray(perfil.external_url)
    ) {
      quantidadeLinks =
        perfil.external_url.length;
    } else if (perfil.external_url) {
      quantidadeLinks = 1;
    }

    // --------------------------------
    // FORMATOS
    // --------------------------------

    const formatos = posts.reduce(
      (
        acumulador: Record<string, number>,
        post: any
      ) => {
        const tipo =
          post?.content_type || "Outro";

        acumulador[tipo] =
          (acumulador[tipo] || 0) + 1;

        return acumulador;
      },
      {}
    );

    const videos = posts.filter(
      (post: any) =>
        post?.content_type === "Video"
    ).length;

    const carrosseis = posts.filter(
      (post: any) =>
        post?.content_type === "Carousel"
    ).length;

    const imagens = posts.filter(
      (post: any) =>
        post?.content_type === "Image"
    ).length;

    const percentualVideos =
      posts.length > 0
        ? Math.round(
            (videos / posts.length) * 100
          )
        : 0;

    const percentualCarrosseis =
      posts.length > 0
        ? Math.round(
            (carrosseis / posts.length) * 100
          )
        : 0;

    const percentualImagens =
      posts.length > 0
        ? Math.round(
            (imagens / posts.length) * 100
          )
        : 0;

    // --------------------------------
    // FORMATO PREDOMINANTE
    // --------------------------------

    const listaFormatos = [
      {
        nome: "Vídeos",
        quantidade: videos,
        percentual: percentualVideos,
      },
      {
        nome: "Carrosséis",
        quantidade: carrosseis,
        percentual: percentualCarrosseis,
      },
      {
        nome: "Imagens",
        quantidade: imagens,
        percentual: percentualImagens,
      },
    ];

    const formatoPredominante =
      [...listaFormatos].sort(
        (a, b) =>
          b.quantidade - a.quantidade
      )[0];

    // --------------------------------
    // HASHTAGS
    // --------------------------------

    const hashtags: string[] = [];

    posts.forEach((post: any) => {
      if (
        Array.isArray(
          post?.post_hashtags
        )
      ) {
        post.post_hashtags.forEach(
          (hashtag: any) => {
            if (
              typeof hashtag === "string"
            ) {
              const limpa = hashtag
                .trim()
                .toLowerCase()
                .replace(/^#/, "");

              if (limpa) {
                hashtags.push(limpa);
              }
            }
          }
        );
      }
    });

    const contagemHashtags =
      hashtags.reduce(
        (
          acumulador: Record<
            string,
            number
          >,
          hashtag: string
        ) => {
          acumulador[hashtag] =
            (acumulador[hashtag] || 0) +
            1;

          return acumulador;
        },
        {}
      );

    const hashtagsMaisUsadas =
      Object.entries(contagemHashtags)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(
          ([hashtag, quantidade]) => ({
            hashtag,
            quantidade,
          })
        );

    // --------------------------------
    // LEGENDAS
    // --------------------------------

    const legendas = posts
      .map(
        (post: any) =>
          post?.caption
      )
      .filter(
        (caption: any) =>
          typeof caption === "string" &&
          caption.trim().length > 0
      );

    const mediaCaracteresLegenda =
      legendas.length > 0
        ? Math.round(
            legendas.reduce(
              (
                total: number,
                legenda: string
              ) =>
                total + legenda.length,
              0
            ) / legendas.length
          )
        : 0;

    // --------------------------------
    // DATAS E FREQUÊNCIA
    // --------------------------------

    const datasValidas = posts
      .map((post: any) => {
        const data = new Date(
          post?.datetime
        );

        return Number.isNaN(
          data.getTime()
        )
          ? null
          : data;
      })
      .filter(
        (
          data: Date | null
        ): data is Date =>
          data !== null
      )
      .sort(
        (a: Date, b: Date) =>
          b.getTime() -
          a.getTime()
      );

    const ultimaPublicacao =
      datasValidas.length > 0
        ? datasValidas[
            0
          ].toISOString()
        : null;

    let intervaloMedioDias:
      | number
      | null = null;

    if (datasValidas.length >= 2) {
      const intervalos: number[] = [];

      for (
        let i = 0;
        i < datasValidas.length - 1;
        i++
      ) {
        const diferenca =
          datasValidas[i].getTime() -
          datasValidas[
            i + 1
          ].getTime();

        intervalos.push(
          diferenca /
            (1000 * 60 * 60 * 24)
        );
      }

      intervaloMedioDias =
        Math.round(
          (intervalos.reduce(
            (total, valor) =>
              total + valor,
            0
          ) /
            intervalos.length) *
            10
        ) / 10;
    }

    // --------------------------------
    // DIAGNÓSTICO BÁSICO
    // --------------------------------

    const possuiBio =
      bio.length > 0;

    const possuiLinkExterno =
      quantidadeLinks > 0;

    const possuiDestaques =
      destaques > 0;

    const utilizaVideo =
      videos > 0;

    const utilizaCarrossel =
      carrosseis > 0;

    const utilizaImagem =
      imagens > 0;

    const quantidadeFormatos =
      [
        utilizaVideo,
        utilizaCarrossel,
        utilizaImagem,
      ].filter(Boolean).length;

    // --------------------------------
    // INSIGHTS AUTOMÁTICOS
    // --------------------------------

    const pontosFortes: {
      titulo: string;
      descricao: string;
    }[] = [];

    const oportunidades: {
      titulo: string;
      descricao: string;
    }[] = [];

    // BIO

    if (possuiBio) {
      pontosFortes.push({
        titulo:
          "Bio preenchida",
        descricao:
          "O perfil possui uma bio ativa, ajudando quem chega à página a encontrar contexto sobre a conta.",
      });
    } else {
      oportunidades.push({
        titulo:
          "Construir uma bio clara",
        descricao:
          "O perfil não apresentou uma bio disponível. Uma bio objetiva pode explicar quem você é, o que oferece e qual ação o visitante deve realizar.",
      });
    }

    // LINK

    if (possuiLinkExterno) {
      pontosFortes.push({
        titulo:
          "Caminho para conversão",
        descricao:
          "O perfil possui pelo menos um link externo, criando um caminho para direcionar o público para páginas, projetos, produtos ou contato.",
      });
    } else {
      oportunidades.push({
        titulo:
          "Adicionar um link estratégico",
        descricao:
          "Não identificamos link externo. Um link pode transformar visitas ao perfil em ações como contato, cadastro, compra ou acesso a outros conteúdos.",
      });
    }

    // DESTAQUES

    if (possuiDestaques) {
      pontosFortes.push({
        titulo:
          "Uso de destaques",
        descricao: `O perfil possui ${destaques} destaque${
          destaques === 1 ? "" : "s"
        }, ampliando o espaço disponível para organizar informações importantes.`,
      });
    } else {
      oportunidades.push({
        titulo:
          "Organizar informações em destaques",
        descricao:
          "Não identificamos destaques. Eles podem ser usados para apresentar serviços, resultados, bastidores, perguntas frequentes ou informações importantes.",
      });
    }

    // FORMATO PREDOMINANTE

    if (
      posts.length > 0 &&
      formatoPredominante.quantidade > 0
    ) {
      pontosFortes.push({
        titulo: `${formatoPredominante.nome} são o formato predominante`,
        descricao: `${formatoPredominante.percentual}% da amostra analisada utiliza esse formato (${formatoPredominante.quantidade} de ${posts.length} publicações).`,
      });
    }

    // DIVERSIDADE

    if (quantidadeFormatos >= 3) {
      pontosFortes.push({
        titulo:
          "Diversidade de formatos",
        descricao:
          "A amostra contém vídeos, carrosséis e imagens, mostrando utilização de diferentes formatos de publicação.",
      });
    } else if (
      posts.length > 0 &&
      quantidadeFormatos === 1
    ) {
      oportunidades.push({
        titulo:
          "Testar novos formatos",
        descricao:
          "A amostra está concentrada em apenas um formato. Testar outros formatos pode ajudar a descobrir novas formas de apresentar o conteúdo.",
      });
    }

    // LEGENDAS

    if (
      mediaCaracteresLegenda > 0 &&
      mediaCaracteresLegenda < 120
    ) {
      oportunidades.push({
        titulo:
          "Explorar mais as legendas",
        descricao: `As legendas da amostra possuem em média ${mediaCaracteresLegenda} caracteres. Há espaço para testar legendas mais desenvolvidas quando o assunto pedir contexto, explicação ou chamada para ação.`,
      });
    }

    if (
      mediaCaracteresLegenda >= 120
    ) {
      pontosFortes.push({
        titulo:
          "Legendas com desenvolvimento",
        descricao: `As legendas possuem em média ${mediaCaracteresLegenda} caracteres na amostra, indicando uso do texto como parte relevante das publicações.`,
      });
    }

    // FREQUÊNCIA

    if (
      intervaloMedioDias !== null
    ) {
      if (intervaloMedioDias <= 4) {
        pontosFortes.push({
          titulo:
            "Ritmo frequente de publicação",
          descricao: `Na amostra coletada, o intervalo médio entre publicações foi de aproximadamente ${intervaloMedioDias} dia${
            intervaloMedioDias === 1
              ? ""
              : "s"
          }.`,
        });
      } else if (
        intervaloMedioDias > 10
      ) {
        oportunidades.push({
          titulo:
            "Avaliar a frequência de publicação",
          descricao: `Na amostra coletada, o intervalo médio entre publicações foi de aproximadamente ${intervaloMedioDias} dias. Pode valer a pena avaliar se uma cadência mais consistente faz sentido para os objetivos do perfil.`,
        });
      }
    }

    // HASHTAGS

    if (
      hashtagsMaisUsadas.length === 0 &&
      posts.length > 0
    ) {
      oportunidades.push({
        titulo:
          "Avaliar o uso de hashtags",
        descricao:
          "Não identificamos hashtags na amostra analisada. Dependendo da estratégia do perfil, vale testar hashtags específicas e acompanhar se contribuem para descoberta do conteúdo.",
      });
    }

    // --------------------------------
    // RESUMO AUTOMÁTICO
    // --------------------------------

    let resumoPerfil =
      "Ainda não há publicações suficientes na amostra para gerar uma leitura de conteúdo.";

    if (posts.length > 0) {
      resumoPerfil =
        `Foram analisadas ${posts.length} publicações. ` +
        `${formatoPredominante.nome} representam ${formatoPredominante.percentual}% da amostra. ` +
        `O perfil ${
          possuiBio
            ? "possui bio"
            : "não apresentou bio"
        }, ${
          possuiLinkExterno
            ? "possui link externo"
            : "não apresentou link externo"
        } e ${
          possuiDestaques
            ? `possui ${destaques} destaque${
                destaques === 1
                  ? ""
                  : "s"
              }`
            : "não apresentou destaques"
        }.`;
    }

    // --------------------------------
    // RESULTADO FINAL
    // --------------------------------

    const analise = {
      perfil: {
        usuario:
          perfil.account ||
          perfil.username ||
          null,

        nome:
          perfil.profile_name ||
          perfil.full_name ||
          null,

        seguidores,

        seguindo,

        publicacoes:
          totalPublicacoes,

        bio,

        perfil_privado:
          perfil.is_private === true,

        verificado:
          perfil.is_verified === true,

        destaques,

        links_externos:
          quantidadeLinks,
      },

      conteudo: {
        posts_analisados:
          posts.length,

        formatos,

        videos,
        carrosseis,
        imagens,

        percentuais: {
          videos:
            percentualVideos,
          carrosseis:
            percentualCarrosseis,
          imagens:
            percentualImagens,
        },

        formato_predominante:
          formatoPredominante,

        hashtags_mais_usadas:
          hashtagsMaisUsadas,

        media_caracteres_legenda:
          mediaCaracteresLegenda,

        ultima_publicacao:
          ultimaPublicacao,

        intervalo_medio_dias:
          intervaloMedioDias,
      },

      diagnostico: {
        possui_bio:
          possuiBio,

        possui_link_externo:
          possuiLinkExterno,

        possui_destaques:
          possuiDestaques,

        possui_posts_para_analisar:
          posts.length > 0,

        utiliza_video:
          utilizaVideo,

        utiliza_carrossel:
          utilizaCarrossel,

        utiliza_imagem:
          utilizaImagem,

        quantidade_formatos:
          quantidadeFormatos,
      },

      insights: {
        resumo:
          resumoPerfil,

        pontos_fortes:
          pontosFortes,

        oportunidades:
          oportunidades,
      },
    };

    // --------------------------------
    // SALVAR NO SUPABASE
    // --------------------------------

    let salvoNoSupabase = false;

    if (snapshotId) {
      const { error } = await supabase
        .from("analises")
        .update({
          resultado_analise:
            analise,
        })
        .eq(
          "dados_perfil->>snapshot_id",
          snapshotId
        );

      if (error) {
        console.error(
          "Erro ao salvar resultado no Supabase:",
          error
        );
      } else {
        salvoNoSupabase = true;
      }
    } else {
      console.warn(
        "snapshot_id não recebido. A análise foi gerada, mas não foi salva no Supabase."
      );
    }

    // --------------------------------
    // RETORNO
    // --------------------------------

    return NextResponse.json({
      sucesso: true,
      analise,
      salvo_no_supabase:
        salvoNoSupabase,
    });
  } catch (error) {
    console.error(
      "Erro ao gerar análise:",
      error
    );

    return NextResponse.json(
      {
        sucesso: false,
        erro:
          "Não foi possível gerar a análise.",
      },
      { status: 500 }
    );
  }
}