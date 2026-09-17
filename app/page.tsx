"use client";

import { useState } from "react";

export default function Home() {
  const [perfil, setPerfil] = useState("");
  const [mostrarResultado, setMostrarResultado] = useState(false);

  function analisarPerfil() {
    if (!perfil.trim()) {
      alert("Digite seu @ ou cole o link do Instagram.");
      return;
    }

    setMostrarResultado(true);

    setTimeout(() => {
      document
        .getElementById("resultado")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  }

  return (
    <main className="min-h-screen bg-[#f7f6f2] text-[#171717]">

      {/* HEADER */}
      <header className="border-b border-black/10 bg-[#f7f6f2]">
        <div className="mx-auto flex h-28 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center">
            <img
              src="/logo victor certa.png"
              alt="Victor Miranda"
              className="h-20 w-auto object-contain"
            />
          </div>

          <div className="text-sm text-neutral-500">
            Análise de Instagram
          </div>
        </div>
      </header>

      {/* HERO */}
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
          Descubra como seu perfil está sendo percebido, quem você tende a atrair
          e onde existem oportunidades para melhorar sua presença digital.
        </p>

        {/* CAMPO */}
        <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-2 rounded-2xl border border-black/10 bg-white p-2 shadow-xl shadow-black/5 sm:flex-row">

          <input
            value={perfil}
            onChange={(e) => setPerfil(e.target.value)}
            placeholder="@seuusuario ou link do Instagram"
            className="flex-1 rounded-xl px-5 py-4 outline-none"
          />

          <button
            onClick={analisarPerfil}
            className="rounded-xl bg-black px-6 py-4 font-bold text-white transition hover:opacity-80"
          >
            Analisar gratuitamente →
          </button>

        </div>

        <p className="mt-3 text-xs text-neutral-400">
          Análise inicial gratuita • Resultado em poucos segundos
        </p>
      </section>

      {/* BENEFÍCIOS */}
      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-24 md:grid-cols-3">

        <div>
          <div className="text-3xl">◫</div>

          <h3 className="mt-4 text-xl font-bold">
            Entenda seu posicionamento
          </h3>

          <p className="mt-2 leading-7 text-neutral-500">
            Veja se sua mensagem está clara e como seu perfil tende a ser percebido.
          </p>
        </div>

        <div>
          <div className="text-3xl">◎</div>

          <h3 className="mt-4 text-xl font-bold">
            Conheça seu público
          </h3>

          <p className="mt-2 leading-7 text-neutral-500">
            Entenda quais pessoas seu conteúdo provavelmente está atraindo.
          </p>
        </div>

        <div>
          <div className="text-3xl">↗</div>

          <h3 className="mt-4 text-xl font-bold">
            Receba insights práticos
          </h3>

          <p className="mt-2 leading-7 text-neutral-500">
            Descubra oportunidades para conteúdo, posicionamento e crescimento.
          </p>
        </div>

      </section>

      {/* BLOCO DA MARCA */}
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
              O Analisa Aí foi criado para transformar uma análise de Instagram
              em algo simples, direto e útil.
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

      {/* RESULTADO */}
      {mostrarResultado && (
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

            <p className="mt-3 text-neutral-500">
              Perfil analisado:{" "}
              <strong className="text-black">
                {perfil}
              </strong>
            </p>

            {/* MÉTRICAS */}
            <div className="mt-10 grid gap-4 md:grid-cols-3">

              <div className="rounded-3xl bg-white p-7">
                <div className="text-sm text-neutral-500">
                  Seguidores
                </div>

                <div className="mt-3 text-4xl font-black">
                  12,8 mil
                </div>
              </div>

              <div className="rounded-3xl bg-white p-7">
                <div className="text-sm text-neutral-500">
                  Publicações
                </div>

                <div className="mt-3 text-4xl font-black">
                  184
                </div>
              </div>

              <div className="rounded-3xl bg-white p-7">
                <div className="text-sm text-neutral-500">
                  Engajamento estimado
                </div>

                <div className="mt-3 text-4xl font-black">
                  3,8%
                </div>
              </div>

            </div>

            {/* DIAGNÓSTICO */}
            <div className="mt-4 grid gap-4 md:grid-cols-2">

              <div className="rounded-3xl bg-white p-8">

                <p className="text-xs font-bold tracking-wider text-neutral-400">
                  NICHO PROVÁVEL
                </p>

                <h3 className="mt-3 text-2xl font-bold">
                  Marketing, conteúdo e presença digital
                </h3>

                <p className="mt-4 leading-7 text-neutral-500">
                  O perfil apresenta sinais de posicionamento voltado para pessoas
                  interessadas em melhorar comunicação e presença no ambiente digital.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-8">

                <p className="text-xs font-bold tracking-wider text-neutral-400">
                  PÚBLICO PROVÁVEL
                </p>

                <h3 className="mt-3 text-2xl font-bold">
                  Criadores, profissionais e pequenos negócios
                </h3>

                <p className="mt-4 leading-7 text-neutral-500">
                  Pessoas buscando melhorar posicionamento, conteúdo, comunicação
                  e crescimento nas redes sociais.
                </p>
              </div>

              <div className="rounded-3xl bg-white p-8">

                <h3 className="text-xl font-bold">
                  Pontos fortes
                </h3>

                <ul className="mt-5 space-y-3 text-neutral-600">
                  <li>✓ Identidade visual consistente</li>
                  <li>✓ Conteúdo educativo</li>
                  <li>✓ Posicionamento reconhecível</li>
                </ul>
              </div>

              <div className="rounded-3xl bg-white p-8">

                <h3 className="text-xl font-bold">
                  Oportunidades
                </h3>

                <ul className="mt-5 space-y-3 text-neutral-600">
                  <li>→ Tornar a proposta da bio mais clara</li>
                  <li>→ Criar conteúdos com CTAs mais específicos</li>
                  <li>→ Trabalhar formatos com maior retenção</li>
                </ul>
              </div>

            </div>

            {/* IDEIAS */}
            <div className="mt-4 rounded-3xl bg-black p-8 text-white md:p-10">

              <p className="text-xs font-bold tracking-[2px] text-neutral-400">
                IDEIAS DE CONTEÚDO
              </p>

              <h3 className="mt-3 text-3xl font-black">
                5 conteúdos para testar
              </h3>

              <div className="mt-7 space-y-4 text-neutral-300">
                <p>
                  01 — 3 sinais de que seu Instagram não deixa claro o que você faz
                </p>

                <p>
                  02 — O erro de bio que pode afastar o público certo
                </p>

                <p>
                  03 — Conteúdo bonito x conteúdo estratégico
                </p>

                <p>
                  04 — Como transformar uma dúvida do cliente em post
                </p>

                <p>
                  05 — O que seus últimos 9 posts estão comunicando?
                </p>
              </div>

            </div>

            {/* AVISO */}
            <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-5 text-center">

              <p className="text-sm text-neutral-500">
                Esta versão ainda está em desenvolvimento.
                Os dados apresentados neste momento são demonstrativos.
              </p>

            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="border-t border-black/10 py-10">

        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center">

            <img
              src="/logo victor certa.png"
              alt="Victor Miranda"
              className="h-12 w-auto object-contain"
            />

          </div>

          <span>
            Analisa Aí © 2026
          </span>

        </div>

      </footer>

    </main>
  );
}