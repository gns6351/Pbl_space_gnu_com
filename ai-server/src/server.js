// 서버 실행: npm start
import fs from 'node:fs';
import os from 'node:os';
import { createApp } from './app.js';

const app = createApp();
const { settings } = app.locals.game;
// PORT를 직접 적지 않았으면 막힌 포트(윈도우 예약 등)를 피해 차례로 시도
const candidates = settings.portExplicit ? [settings.port] : [3000, 8080, 5050, 8000, 4321, 7777, 9090];

const lanAddresses = () => Object.values(os.networkInterfaces()).flat().filter((i) => i && i.family === 'IPv4' && !i.internal).map((i) => i.address);

function ready(port) {
  const line = '-'.repeat(60);
  console.log(line);
  console.log(` 거울상담소 AI 서버: http://localhost:${port}/api/game  (문서: docs/api.md)`);
  if (settings.host === '0.0.0.0') for (const ip of lanAddresses()) console.log(` 같은 와이파이(실기기): http://${ip}:${port}/api/game`);
  console.log(line);
  console.log(` AI: ${settings.llmMode === 'live' ? `실제 호출 (게임 ${settings.gameModel} · 점검 ${settings.gameCheckModel})` : '모의(mock) — .env에 GEMINI_API_KEY를 넣으면 실제 호출'}`);
  console.log(` 데이터 폴더: ${settings.dataDir}`);
  console.log(' 이 창을 닫으면 서버가 꺼집니다.');
  try { fs.mkdirSync(settings.dataDir, { recursive: true }); } catch { /* 없어도 서버는 동작 */ }
}

function listen(i) {
  const port = candidates[i];
  const server = app.listen(port, settings.host, () => ready(port));
  server.once('error', (err) => {
    if ((err.code === 'EACCES' || err.code === 'EADDRINUSE') && i + 1 < candidates.length) {
      console.log(`※ ${port}번 포트를 쓸 수 없어 ${candidates[i + 1]}번으로 다시 시도해요.`);
      return listen(i + 1);
    }
    console.error(`※ 서버를 켜지 못했어요 (${err.code || err.message}). .env의 PORT를 다른 번호로 바꿔 보세요.`);
    process.exit(1);
  });
}

listen(0);
