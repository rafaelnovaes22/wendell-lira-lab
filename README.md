# WENDELL LIRA LAB

Do campo ao controle. Método de treino de EA FC e eFootball de Wendell Lira, vencedor do Prêmio Puskás 2015.

Plataforma AI-first de treino adaptativo: diagnóstico vivo, plano da semana, XP/streak, trilhas e Coach WL AI, com leitura do futebol real aplicada no virtual.

## História embutida no produto

- Meia-bicicleta pelo Goianésia vs Atlético-GO em 11/03/2015, Puskás 2015 com 46,7% contra Messi
- 6x1 contra o campeão mundial de FIFA em Zurique, convite da EA para o FIWC 2016
- Sporting CP esports, Netshoes Miners, Fluxo (EA FC 24), lives diárias na Kick, aposta atual no eFootball

## Rodar

```bash
npm ci
npm run dev
```

Local: `http://localhost:3000/wendell-lira-lab/`

Gates: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.

## Arquitetura

Site 100% estático. Progresso de cada jogador vive no `localStorage` do navegador dele (`lib/browser-platform.ts`), com aulas, trilhas e precificação vindas do seed (`lib/seed-platform.ts`). O Coach WL AI roda local (`lib/adaptive-plan-core.ts`): recomenda aulas publicadas, gera plano semanal e mantém o protocolo de crise (CVV 188, SAMU 192). Conteúdo das aulas aponta para o canal oficial na Kick.

## Deploy

GitHub Pages via GitHub Actions (`.github/workflows/deploy-pages.yml`): build com `output: "export"` e publicação do `out/`.

Produção: `https://rafaelnovaes22.github.io/wendell-lira-lab/`
