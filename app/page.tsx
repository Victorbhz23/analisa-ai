"use client";

import { useState } from "react";

export default function Home() {
  const [perfil, setPerfil] = useState("");
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [analisando, setAnalisando] = useState(false);
  const [dadosPerfil, setDadosPerfil] = useState<any>(null);
  const [resultadoAnalise, setResultadoAnalise] = useState<any>(null);
  const [mostrarDesbloqueio, setMostrarDesbloqueio] = useState(false);

  function solicitarAnalise() {
    if (!perfil.trim()) {
      alert("Digite seu @ ou cole o link do Instagram.");
      return;
    }

    setMostrarDesbloqueio(true);
  }

  function abrirInstagram() {
    window.open(
      "https://www.instagram.com/victormiranda_mkt/",
      "_blank",
      "noopener,noreferrer"
    );
  }

  function liberarAnalise() {
    setMostrarDesbloqueio(false);
    analisarPerfil();
  }

  async function analisarPerfil() {
    if (!perfil.trim()) {
      alert("Digite seu @ ou cole o link do Instagram.");
      return;
    }

    try {
      setAnalisando(true);
      setMostrarResultado(false);
      setDadosPerfil(null);
      setResultadoAnalise(null);

      const resposta = await fetch("/api/analisar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instagram_username: perfil,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok || !dados.sucesso) {
        throw new Error(
          dados.erro || "Não foi possível iniciar a análise."
        );
      }

      const snapshotId = dados.snapshot_id;

      if (!snapshotId) {
        throw new Error("Não recebemos o código da coleta.");
      }

      let tentativas = 0;
      const maxTentativas = 30;

      while (tentativas < maxTentativas) {
        await new Promise((resolve) =>
          setTimeout(resolve, 3000)
        );

        const respostaResultado = await fetch(
          `/api/resultado-instagram?snapshot_id=${encodeURIComponent(
            snapshotId
          )}`,
          {
            cache: "no-store",
          }
        );

        const resultado = await respostaResultado.json();

        if (
          respostaResultado.ok &&
          resultado.sucesso &&
          resultado.pronto === false
        ) {
          tentativas++;
          continue;
        }

        if (
          respostaResultado.status === 202 ||
          respostaResultado.status === 404
        ) {
          tentativas++;
          continue;
        }

        if (
          respostaResultado.ok &&
          resultado.sucesso &&
          resultado.pronto === true
        ) {
          const perfilColetado = resultado.dados;

          const respostaAnalise = await fetch(
            "/api/gerar-analise",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                perfil: perfilColetado,
                snapshot_id: snapshotId,
              }),
            }
          );

          const analise = await respostaAnalise.json();

          if (!respostaAnalise.ok || !analise.sucesso) {
            throw new Error(
              analise.erro ||
                "Não foi possível gerar o diagnóstico."
            );
          }

          if (analise.salvo_no_supabase === false) {
            console.warn(
              "A análise foi gerada, mas não foi salva no Supabase."
            );
          }

          setDadosPerfil(perfilColetado);
          setResultadoAnalise(analise.analise);
          setMostrarResultado(true);
          setAnalisando(false);

          setTimeout(() => {
            document
              .getElementById("resultado")
              ?.scrollIntoView({
                behavior: "smooth",
              });
          }, 150);

          return;
        }

        throw new Error(
          "Não foi possível consultar o resultado."
        );
      }

      throw new Error(
        "A análise está demorando mais que o esperado. Tente novamente em alguns instantes."
      );
    } catch (erro) {
      console.error("Erro ao analisar perfil:", erro);

      setAnalisando(false);

      if (erro instanceof Error) {
        alert(erro.message);
      } else {
        alert("Erro ao realizar a análise.");
      }
    }
  }

  function formatarNumero(valor: any) {
    if (valor === null || valor === undefined) {
      return "—";
    }

    const numero = Number(valor);

    if (Number.isNaN(numero)) {
      return "—";
    }

    return new Intl.NumberFormat("pt-BR", {
      notation: numero >= 10000 ? "compact" : "standard",
      maximumFractionDigits: 1,
    }).format(numero);
  }

  function formatarData(data: string | null) {
    if (!data) {
      return "Não disponível";
    }

    const objetoData = new Date(data);

    if (Number.isNaN(objetoData.getTime())) {
      return "Não disponível";
    }

    return objetoData.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  const username =
    dadosPerfil?.account ||
    dadosPerfil?.username ||
    perfil
      .replace("https://www.instagram.com/", "")
      .replace("https://instagram.com/", "")
      .replace("@", "")
      .split("?")[0]
      .replaceAll("/", "");

  const seguidores = dadosPerfil?.followers;
  const seguindo = dadosPerfil?.following;

  const publicacoes =
    dadosPerfil?.posts_count ??
    (Array.isArray(dadosPerfil?.posts)
      ? dadosPerfil.posts.length
      : undefined);

  const nome =
    dadosPerfil?.profile_name ||
    dadosPerfil?.full_name ||
    "";

  const bio = dadosPerfil?.biography || "";

  const fotoPerfil =
    dadosPerfil?.profile_image_link ||
    dadosPerfil?.profile_pic_url ||
    "";

  const verificado =
    dadosPerfil?.is_verified === true;

  const privado =
    dadosPerfil?.is_private === true;

  const destaques =
    dadosPerfil?.highlights_count;

  const conteudo =
    resultadoAnalise?.conteudo;

  const diagnostico =
    resultadoAnalise?.diagnostico;

  const insights =
    resultadoAnalise?.insights;

  const formatos =
    conteudo?.formatos || {};

  const percentuais =
    conteudo?.percentuais || {};

  const hashtags =
    conteudo?.hashtags_mais_usadas || [];

  const pontosFortes =
    insights?.pontos_fortes || [];

  const oportunidades =
    insights?.oportunidades || [];

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#171717]">
      <header className="border-b border-black/10 bg-[#f7f6f2]">
        <div className="mx-auto flex h-28 max-w-6xl items-center justify-between px-6">
          <img
            src="/logo victor certa.png"
            alt="Victor Miranda"
            className="h-20 w-auto object-contain"
          />

          <div className="text-sm text-neutral-500">
            Análise de Instagram
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <div className="mb-6 inline-block rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold tracking-wider">
          ANÁLISE GRATUITA
        </div>

        <h1 className="mx-auto max-w-4xl text-6xl font-black leading-[0.9] tracking-[-5px] md:text-8xl">
          Analisa Aí.
        </h1>

        <h2 className="mx-auto mt-8 max-w-3xl text-2xl font-bold md:text-4xl">
          O que o seu Instagram está comunicando?
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-neutral-500">
          Descubra padrões do seu perfil e encontre
          oportunidades para melhorar sua presença digital.
        </p>

        <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-2 rounded-2xl border border-black/10 bg-white p-2 shadow-xl shadow-black/5 sm:flex-row">
          <input
            value={perfil}
            onChange={(e) => setPerfil(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !analisando) {
                solicitarAnalise();
              }
            }}
            placeholder="@seuusuario ou link do Instagram"
            disabled={analisando}
            className="flex-1 rounded-xl px-5 py-4 outline-none disabled:opacity-60"
          />

          <button
            onClick={solicitarAnalise}
            disabled={analisando}
            className="rounded-xl bg-black px-6 py-4 font-bold text-white transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {analisando
              ? "Analisando..."
              : "Analisar gratuitamente →"}
          </button>
        </div>

        {mostrarDesbloqueio && !analisando && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 py-10"
            onClick={() => setMostrarDesbloqueio(false)}
          >
            <div
              className="w-full max-w-lg rounded-[32px] bg-[#f7f6f2] p-8 text-left shadow-2xl md:p-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setMostrarDesbloqueio(false)}
                className="ml-auto block text-2xl leading-none text-neutral-400 transition hover:text-black"
                aria-label="Fechar"
              >
                ×
              </button>

              <p className="mt-3 text-xs font-bold tracking-[3px] text-neutral-500">
                ANÁLISE GRATUITA
              </p>

              <h3 className="mt-3 text-3xl font-black tracking-[-1px] md:text-4xl">
                Desbloqueie sua análise gratuita.
              </h3>

              <p className="mt-5 leading-7 text-neutral-600">
                Para apoiar o projeto e acompanhar mais
                conteúdos sobre marketing, conteúdo e presença
                digital, siga
                <span className="font-bold text-black">
                  {" "}
                  @victormiranda_mkt
                </span>{" "}
                no Instagram.
              </p>

              <button
                type="button"
                onClick={abrirInstagram}
                className="mt-7 w-full rounded-xl bg-black px-6 py-4 font-bold text-white transition hover:opacity-80"
              >
                1. Seguir @victormiranda_mkt no Instagram ↗
              </button>

              <button
                type="button"
                onClick={liberarAnalise}
                className="mt-3 w-full rounded-xl border border-black/15 bg-white px-6 py-4 font-bold text-black transition hover:bg-neutral-100"
              >
                2. Já estou seguindo — liberar análise
              </button>

              <p className="mt-5 text-center text-xs leading-5 text-neutral-400">
                A confirmação é feita por você. O Analisa Aí
                não acessa sua conta nem verifica sua lista de
                seguidores.
              </p>
            </div>
          </div>
        )}

        {analisando && (
          <div className="mx-auto mt-6 max-w-xl">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-black/10 border-t-black" />

            <p className="mt-4 text-sm font-medium text-neutral-600">
              Analisando o perfil...
            </p>

            <p className="mt-1 text-xs text-neutral-400">
              Estamos coletando e processando as informações
              públicas do perfil.
            </p>
          </div>
        )}

        {!analisando && (
          <p className="mt-3 text-xs text-neutral-400">
            Análise inicial gratuita • Resultado em poucos
            segundos
          </p>
        )}
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-24 md:grid-cols-3">
        <div>
          <div className="text-3xl">◫</div>
          <h3 className="mt-4 text-xl font-bold">
            Entenda seu perfil
          </h3>
          <p className="mt-2 leading-7 text-neutral-500">
            Veja os principais sinais encontrados na estrutura
            e no conteúdo do perfil.
          </p>
        </div>

        <div>
          <div className="text-3xl">◎</div>
          <h3 className="mt-4 text-xl font-bold">
            Identifique padrões
          </h3>
          <p className="mt-2 leading-7 text-neutral-500">
            Descubra formatos, frequência, hashtags e
            características das publicações.
          </p>
        </div>

        <div>
          <div className="text-3xl">↗</div>
          <h3 className="mt-4 text-xl font-bold">
            Encontre oportunidades
          </h3>
          <p className="mt-2 leading-7 text-neutral-500">
            Receba sugestões práticas baseadas nos dados
            encontrados na análise.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid overflow-hidden rounded-[32px] bg-[#e9e4dc] md:grid-cols-2">
          <div className="p-10 md:p-14">
            <p className="text-xs font-bold tracking-[3px] text-neutral-500">
              CRIADO POR VICTOR MIRANDA
            </p>

            <h2 className="mt-4 text-4xl font-black leading-none tracking-[-2px] md:text-5xl">
              Mais clareza.
              <br />
              Mais estratégia.
              <br />
              Mais resultados.
            </h2>

            <p className="mt-6 max-w-lg leading-7 text-neutral-600">
              O Analisa Aí transforma informações públicas do
              Instagram em uma leitura simples, direta e útil.
            </p>
          </div>

          <div className="flex min-h-[320px] items-center justify-center bg-black p-10">
            <img
              src="/logo victor certa.png"
              alt="Victor Miranda"
              className="h-28 w-auto object-contain brightness-0 invert"
            />
          </div>
        </div>
      </section>

      {mostrarResultado &&
        dadosPerfil &&
        resultadoAnalise && (
          <section
            id="resultado"
            className="border-t border-black/10 bg-[#ece8e1] py-24"
          >
            <div className="mx-auto max-w-6xl px-6">
              <p className="text-xs font-bold tracking-[3px] text-neutral-500">
                ANÁLISE INICIAL
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-[-2px] md:text-6xl">
                Sua análise está pronta.
              </h2>

              <div className="mt-8 flex flex-col gap-5 rounded-3xl bg-white p-7 sm:flex-row sm:items-center">
                {fotoPerfil && (
                  <img
                    src={fotoPerfil}
                    alt={`Foto de @${username}`}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                )}

                <div>
                  {nome && (
                    <h3 className="text-2xl font-black">
                      {nome}
                      {verificado && (
                        <span className="ml-2">✓</span>
                      )}
                    </h3>
                  )}

                  <p className="mt-1 font-medium text-neutral-600">
                    @{username}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-neutral-100 px-3 py-1">
                      {privado
                        ? "Perfil privado"
                        : "Perfil público"}
                    </span>

                    {verificado && (
                      <span className="rounded-full bg-neutral-100 px-3 py-1">
                        Perfil verificado
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-3xl bg-white p-7">
                  <p className="text-sm text-neutral-500">
                    Seguidores
                  </p>
                  <p className="mt-3 text-4xl font-black">
                    {formatarNumero(seguidores)}
                  </p>
                </div>

                <div className="rounded-3xl bg-white p-7">
                  <p className="text-sm text-neutral-500">
                    Seguindo
                  </p>
                  <p className="mt-3 text-4xl font-black">
                    {formatarNumero(seguindo)}
                  </p>
                </div>

                <div className="rounded-3xl bg-white p-7">
                  <p className="text-sm text-neutral-500">
                    Publicações
                  </p>
                  <p className="mt-3 text-4xl font-black">
                    {formatarNumero(publicacoes)}
                  </p>
                </div>

                <div className="rounded-3xl bg-white p-7">
                  <p className="text-sm text-neutral-500">
                    Destaques
                  </p>
                  <p className="mt-3 text-4xl font-black">
                    {formatarNumero(destaques)}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-3xl bg-white p-8">
                <p className="text-xs font-bold tracking-wider text-neutral-400">
                  BIO DO PERFIL
                </p>

                <h3 className="mt-3 text-2xl font-bold">
                  O que o perfil comunica
                </h3>

                <p className="mt-4 whitespace-pre-line leading-7 text-neutral-600">
                  {bio ||
                    "Este perfil não possui uma bio disponível."}
                </p>
              </div>

              {insights?.resumo && (
                <div className="mt-4 rounded-3xl bg-[#ded8ce] p-8 md:p-10">
                  <p className="text-xs font-bold tracking-[2px] text-neutral-500">
                    LEITURA GERAL
                  </p>

                  <h3 className="mt-3 text-3xl font-black">
                    O que encontramos
                  </h3>

                  <p className="mt-5 max-w-4xl text-lg leading-8 text-neutral-700">
                    {insights.resumo}
                  </p>
                </div>
              )}

              <div className="mt-4 rounded-3xl bg-black p-8 text-white md:p-10">
                <p className="text-xs font-bold tracking-[2px] text-neutral-400">
                  ANÁLISE DE CONTEÚDO
                </p>

                <h3 className="mt-3 text-3xl font-black">
                  Como esse perfil publica
                </h3>

                <p className="mt-3 max-w-2xl leading-7 text-neutral-400">
                  A leitura abaixo considera a amostra de
                  publicações obtida no momento da coleta.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl bg-white/10 p-5">
                    <p className="text-sm text-neutral-400">
                      Posts analisados
                    </p>
                    <p className="mt-2 text-3xl font-black">
                      {formatarNumero(
                        conteudo?.posts_analisados
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-5">
                    <p className="text-sm text-neutral-400">
                      Vídeos
                    </p>
                    <p className="mt-2 text-3xl font-black">
                      {formatarNumero(formatos?.Video || 0)}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {formatarNumero(
                        percentuais?.videos || 0
                      )}
                      % da amostra
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-5">
                    <p className="text-sm text-neutral-400">
                      Carrosséis
                    </p>
                    <p className="mt-2 text-3xl font-black">
                      {formatarNumero(
                        formatos?.Carousel || 0
                      )}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {formatarNumero(
                        percentuais?.carrosseis || 0
                      )}
                      % da amostra
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-5">
                    <p className="text-sm text-neutral-400">
                      Imagens
                    </p>
                    <p className="mt-2 text-3xl font-black">
                      {formatarNumero(formatos?.Image || 0)}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {formatarNumero(
                        percentuais?.imagens || 0
                      )}
                      % da amostra
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl bg-white p-8">
                  <p className="text-xs font-bold tracking-wider text-neutral-400">
                    ATIVIDADE
                  </p>

                  <h3 className="mt-3 text-2xl font-bold">
                    Dados da amostra
                  </h3>

                  <div className="mt-6 space-y-4 text-neutral-600">
                    <div>
                      <span className="font-bold text-black">
                        Última publicação:
                      </span>{" "}
                      {formatarData(
                        conteudo?.ultima_publicacao
                      )}
                    </div>

                    <div>
                      <span className="font-bold text-black">
                        Intervalo médio:
                      </span>{" "}
                      {conteudo?.intervalo_medio_dias !==
                      null &&
                      conteudo?.intervalo_medio_dias !==
                        undefined
                        ? `${conteudo.intervalo_medio_dias} dias`
                        : "Não disponível"}
                    </div>

                    <div>
                      <span className="font-bold text-black">
                        Média das legendas:
                      </span>{" "}
                      {formatarNumero(
                        conteudo?.media_caracteres_legenda
                      )}{" "}
                      caracteres
                    </div>

                    <div>
                      <span className="font-bold text-black">
                        Links externos:
                      </span>{" "}
                      {diagnostico?.possui_link_externo
                        ? "Sim"
                        : "Não"}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-8">
                  <p className="text-xs font-bold tracking-wider text-neutral-400">
                    HASHTAGS
                  </p>

                  <h3 className="mt-3 text-2xl font-bold">
                    Mais encontradas na amostra
                  </h3>

                  {hashtags.length > 0 ? (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {hashtags.map(
                        (item: any, index: number) => (
                          <span
                            key={`${item.hashtag}-${index}`}
                            className="rounded-full bg-neutral-100 px-4 py-2 text-sm"
                          >
                            #{item.hashtag}{" "}
                            <span className="text-neutral-400">
                              ×{item.quantidade}
                            </span>
                          </span>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="mt-6 text-neutral-500">
                      Nenhuma hashtag foi encontrada na
                      amostra.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl bg-white p-8 md:p-10">
                  <p className="text-xs font-bold tracking-[2px] text-neutral-400">
                    PONTOS FORTES
                  </p>

                  <h3 className="mt-3 text-3xl font-black">
                    Sinais positivos
                  </h3>

                  <div className="mt-7 space-y-3">
                    {pontosFortes.length > 0 ? (
                      pontosFortes.map(
                        (item: any, index: number) => (
                          <div
                            key={index}
                            className="rounded-2xl bg-[#f7f6f2] p-5"
                          >
                            <div className="flex gap-3">
                              <span className="font-black">
                                ✓
                              </span>

                              <div>
                                <h4 className="font-bold">
                                  {item.titulo}
                                </h4>

                                <p className="mt-2 text-sm leading-6 text-neutral-600">
                                  {item.descricao}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-neutral-500">
                        Ainda não há dados suficientes para
                        destacar pontos fortes.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl bg-[#e9e4dc] p-8 md:p-10">
                  <p className="text-xs font-bold tracking-[2px] text-neutral-500">
                    OPORTUNIDADES
                  </p>

                  <h3 className="mt-3 text-3xl font-black">
                    O que pode ser explorado
                  </h3>

                  <div className="mt-7 space-y-3">
                    {oportunidades.length > 0 ? (
                      oportunidades.map(
                        (item: any, index: number) => (
                          <div
                            key={index}
                            className="rounded-2xl bg-white/70 p-5"
                          >
                            <div className="flex gap-3">
                              <span className="font-black">
                                ↗
                              </span>

                              <div>
                                <h4 className="font-bold">
                                  {item.titulo}
                                </h4>

                                <p className="mt-2 text-sm leading-6 text-neutral-600">
                                  {item.descricao}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-neutral-600">
                        Nenhuma oportunidade automática foi
                        identificada pelas regras atuais.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-3xl bg-white p-8">
                <p className="text-xs font-bold tracking-wider text-neutral-400">
                  ESTRUTURA DO PERFIL
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-2xl bg-[#f7f6f2] p-4">
                    {diagnostico?.possui_bio ? "✓" : "—"}{" "}
                    Possui bio
                  </div>

                  <div className="rounded-2xl bg-[#f7f6f2] p-4">
                    {diagnostico?.possui_link_externo
                      ? "✓"
                      : "—"}{" "}
                    Possui link externo
                  </div>

                  <div className="rounded-2xl bg-[#f7f6f2] p-4">
                    {diagnostico?.possui_destaques
                      ? "✓"
                      : "—"}{" "}
                    Possui destaques
                  </div>

                  <div className="rounded-2xl bg-[#f7f6f2] p-4">
                    {diagnostico?.utiliza_video ? "✓" : "—"}{" "}
                    Utiliza vídeos
                  </div>

                  <div className="rounded-2xl bg-[#f7f6f2] p-4">
                    {diagnostico?.utiliza_carrossel
                      ? "✓"
                      : "—"}{" "}
                    Utiliza carrosséis
                  </div>

                  <div className="rounded-2xl bg-[#f7f6f2] p-4">
                    {diagnostico?.utiliza_imagem ? "✓" : "—"}{" "}
                    Utiliza imagens
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-5 text-center">
                <p className="text-sm leading-6 text-neutral-500">
                  Esta análise utiliza informações públicas
                  disponíveis no perfil e uma amostra das
                  publicações coletadas. Os insights são
                  gerados por regras baseadas nos dados
                  encontrados e não representam garantia de
                  desempenho ou crescimento.
                </p>
              </div>
            </div>
          </section>
        )}

      <footer className="border-t border-black/10 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <img
            src="/logo victor certa.png"
            alt="Victor Miranda"
            className="h-12 w-auto object-contain"
          />

          <span>Analisa Aí © 2026</span>
        </div>
      </footer>
    </main>
  );
}