# WENDELL LIRA LAB

Do campo ao controle. Método de treino de EA FC e eFootball de Wendell Lira, vencedor do Prêmio Puskás 2015.

Adaptado do Gabgol Pro Lab: mesma plataforma (Next.js, plano adaptativo, Coach AI, XP/streak), nova identidade ouro Puskás e conteúdo dual EA FC + eFootball.

## História embutida no produto

- Meia-bicicleta pelo Goianésia vs Atlético-GO em 11/03/2015, Puskás 2015 com 46,7% contra Messi
- 6x1 contra o campeão mundial de FIFA em Zurique, convite da EA para o FIWC 2016
- Sporting CP esports, Netshoes Miners, Fluxo (EA FC 24), lives diárias na Kick, aposta atual no eFootball

## Rodar

```bash
npm ci
npm run dev
```

Gates: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.

## Deploy

Dockerfile + `railway.toml` com health em `/api/health`. Produção: `https://wendell-lira-lab-production.up.railway.app`.
