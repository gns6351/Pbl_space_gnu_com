// Express 앱: 거울상담소 게임 API(/api/game)와 상태 확인(/health)
import express from 'express';
import { loadSettings } from './config.js';
import { createLlm } from './llm/client.js';
import { createGameRouter } from './game/router.js';
import { GAME_MOCKS } from './game/mocks.js';

// overrides: 설정 덮어쓰기(테스트용) · deps.geminiClient: 가짜 Gemini 클라이언트(테스트용) · deps.llm: LLM 객체 직접 주입
export function createApp(overrides = {}, deps = {}) {
  const settings = loadSettings(overrides);
  const llm = deps.llm || createLlm(settings, { client: deps.geminiClient, mocks: GAME_MOCKS });

  const app = express();
  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.set({ 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'Cache-Control': 'no-store' });
    next();
  });
  app.use(express.json({ limit: '64kb' }));
  app.use('/api', (req, res, next) => {
    if (req.method === 'POST' && !req.is('application/json')) return res.status(415).json({ error: 'JSON으로 보내 주세요' });
    next();
  });

  app.get('/health', (req, res) => res.json({ ok: true, llmMode: settings.llmMode }));

  const gameRouter = createGameRouter({ settings, llm });
  app.use('/api/game', gameRouter);

  app.use((req, res) => res.status(404).json({ error: '없는 주소예요' }));
  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON 형식이 잘못됐어요' });
    if (err?.type === 'entity.too.large') return res.status(413).json({ error: '요청이 너무 커요' });
    console.error(err);
    res.status(500).json({ error: '서버 오류가 났어요' });
  });

  app.locals.game = { settings, llm, store: gameRouter.locals.store };
  return app;
}
