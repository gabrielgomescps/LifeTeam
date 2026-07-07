# Life Team Academia — Landing Page

Site institucional de página única da **Life Team Academia** — musculação, lutas
(Muay Thai e Jiu-Jitsu), treinamento funcional, pilates e mobilidade no Jardim
Paulicéia, Campinas/SP.

- **Endereço:** Rua Jornalista Ernesto Nápoli, 534 — Jardim Paulicéia, Campinas/SP
- **WhatsApp:** (19) 98183-2481 · **Fixo:** (19) 3267-1014

## Stack

Site **100% estático** — HTML, CSS e JavaScript puro (vanilla), sem framework,
sem build e sem dependências em tempo de execução. Carrega instantâneo e é
publicável em qualquer hospedagem de arquivos estáticos.

```
index.html      Página única (todo o HTML + CSS embutido)
script.js       Interações: carrossel do hero, filtro da grade, menu móvel,
                contadores, scroll-reveal, banner de cookies, botão de WhatsApp
assets/         Imagens (WebP otimizado), logo, QR code e mapa
favicon-*.png   Ícones do site
robots.txt      / sitemap.xml — SEO
```

## Rodando localmente

Como é estático, basta abrir `index.html` no navegador. Para servir via HTTP
(recomendado, para o `defer` e caminhos relativos funcionarem igual à produção):

```bash
npx serve .
# ou
python -m http.server 8000
```

## Deploy na Vercel

O projeto não precisa de build. Ao importar o repositório na Vercel:

- **Framework Preset:** Other
- **Build Command:** *(vazio)*
- **Output Directory:** *(vazio / raiz)*

A Vercel serve a raiz do repositório diretamente.

## Pendências de conteúdo

Alguns dados são placeholders e devem ser confirmados com a academia antes de
divulgar o site:

- [x] **Imagens** — todos os slots usam o sistema visual próprio **"Cinética
      Noturna"** (ver `design/PHILOSOPHY.md`): diagramas de força vetoriais em
      preto/amarelo da marca, gerados por `design/cinetica.js` e renderizados
      em alta resolução. Para trocar por fotos reais no futuro, basta
      substituir os arquivos em `assets/` mantendo os mesmos nomes.
- [ ] **Preços dos planos** (R$ 129,90 / 109,90 / 89,90) — confirmar valores.
- [ ] **Contadores** ("12+ anos", "350+ alunos") — confirmar números reais.
- [ ] **Horários de Jump e Funcional (Ter/Qui)** — cards marcados com "Confirmar
      horário por dia" em `script.js`.
- [ ] **Blog** — títulos de artigo são exemplos.
