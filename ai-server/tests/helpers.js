// 테스트용 서버: 임시 데이터 폴더 + 테스트용 콘텐츠(tests/fixtures/content) + 모의 AI
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';

export const FIXTURE = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'content');

export async function boot(overrides = {}, deps = {}) {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'game-test-'));
  const app = createApp({ dataDir, contentDir: FIXTURE, llmModeEnv: 'mock', apiKey: '', ...overrides }, deps);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const req = async (method, p, body, headers = {}) => {
    const res = await fetch(base + p, {
      method, headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* JSON이 아닌 응답 */ }
    return { status: res.status, body: json, text };
  };
  return {
    base, dataDir, app,
    post: (p, b, h) => req('POST', p, b, h),
    get: (p, h) => req('GET', p, undefined, h),
    del: (p, h) => req('DELETE', p, undefined, h),
    close: () => new Promise((r) => server.close(r)),
  };
}
