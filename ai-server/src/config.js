// 설정(.env)과 프롬프트 파일 읽기
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// ai-server 폴더
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

try { process.loadEnvFile(path.join(ROOT, '.env')); } catch { /* .env가 없으면 기본값 */ }

const env = process.env;
const oneOf = (v, list, fallback) => (list.includes(v) ? v : fallback);
const DEFAULT_MODEL = 'gemini-3.5-flash-lite';

export function loadSettings(overrides = {}) {
  const s = {
    port: Number(env.PORT || 3000),
    portExplicit: !!env.PORT,
    host: env.HOST || '0.0.0.0',
    dataDir: path.resolve(ROOT, env.DATA_DIR || 'data'),
    contentDir: path.resolve(ROOT, env.CONTENT_DIR || 'content'),
    apiKey: env.GEMINI_API_KEY || env.GOOGLE_API_KEY || '',
    // 게임 모델: 손님 생성·손님 턴·조언 판정·자기 지향 변환·위험 판정
    gameModel: env.GAME_MODEL || DEFAULT_MODEL,
    // 변환 점검 모델. 변환한 모델과 다른 모델을 권장(자기 출력을 관대하게 볼 수 있음)
    gameCheckModel: env.GAME_CHECK_MODEL || env.GAME_MODEL || DEFAULT_MODEL,
    // 테스트 도구(npm run sim)의 가상 플레이어 모델. 손님 모델과 다른 모델을 권장
    simModel: env.SIM_MODEL || env.GAME_MODEL || DEFAULT_MODEL,
    // 추론 강도: low / medium / high. 모델이 지원하지 않으면 빼고 보낸다
    thinking: env.GEMINI_THINKING_LEVEL ?? 'low',
    // AI 호출 1회 시간 제한(ms). NFR-01: 일반 턴 p95 10초
    gameTimeoutMs: Number(env.GAME_TIMEOUT_MS || 9000),
    // 거울 장면(변환·점검, 최대 4회) 호출 1회 시간 제한(ms). 4회 × 5초 = 20초 (NFR-01)
    gameMirrorTimeoutMs: Number(env.GAME_MIRROR_TIMEOUT_MS || 5000),
    gamePromptVersion: env.GAME_PROMPT_VERSION || 'v1',
    llmModeEnv: oneOf(env.LLM_MODE, ['live', 'mock'], ''),
    ...overrides,
  };
  // 호출 종류별 모델
  s.kindModels = { g_guest: s.gameModel, g_turn: s.gameModel, g_judge: s.gameModel, g_mirror: s.gameModel, g_risk: s.gameModel, g_check: s.gameCheckModel, g_player: s.simModel, g_context: s.simModel, ...(s.kindModels || {}) };
  // 키가 있으면 실제 호출, 없으면 모의(mock) 응답. LLM_MODE로 강제할 수 있다
  s.llmMode = s.llmModeEnv === 'live' || (s.llmModeEnv !== 'mock' && s.apiKey) ? 'live' : 'mock';
  return s;
}

export const sha = (text) => crypto.createHash('sha256').update(text).digest('hex').slice(0, 12);

// 프롬프트: content/prompts/<종류>/<버전>.md (머리말 + 본문) + 같은 폴더의 schema.json(출력 JSON 형식)
export function loadPrompt(contentDir, kind, version) {
  const dir = path.join(contentDir, 'prompts', kind);
  const raw = fs.readFileSync(path.join(dir, `${version}.md`), 'utf8');
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  const meta = {};
  let body = raw;
  if (m) {
    body = m[2];
    for (const line of m[1].split(/\r?\n/)) {
      const i = line.indexOf(':');
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }
  const schemaRaw = fs.readFileSync(path.join(dir, meta.schema || 'schema.json'), 'utf8');
  return {
    kind, version, ref: `${kind}@${version}`, body, schema: JSON.parse(schemaRaw),
    temperature: meta.temperature === undefined ? null : Number(meta.temperature), hash: sha(raw + schemaRaw),
  };
}

// {{변수}}를 한 번에 치환한다. 사용자 입력 속 {{...}}는 다시 해석하지 않는다
export function renderPrompt(prompt, vars) {
  return prompt.body.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ''));
}
