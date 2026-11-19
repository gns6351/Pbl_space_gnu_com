# 거울상담소

> 손님의 고민을 들어 주고 건넨 조언이, 마지막에 나에게 돌아오는 자기성찰 상담 게임 (웹 PBL 프로젝트)

플레이어가 자기 걱정을 적으면 그 걱정을 닮은 손님이 상담소를 찾아옵니다. 플레이어는 상담사가 되어 손님과 대화하고, 대화 끝에 자신이 손님에게 건넨 조언을 "나에게 하는 말"로 바꿔 돌려받습니다.

기준 문서: 「거울상담소 중간보고서」 (요구사항 FR-01~12, NFR-01~08)

## 저장소 구성

| 폴더 | 내용 | 상태 |
|---|---|---|
| [`ai-server/`](ai-server/) | AI 서버: 손님 생성·손님 대사·조언 판정·자기 지향 변환·점검·위험 감지 (Node.js + Gemini) | 요구사항의 AI 부분 구현 완료, 실제 Gemini로 검증 |
| `app/` | Android 앱 (React Native·Expo) | 예정 |

## 빠르게 시작하기 (AI 서버)

```bash
cd ai-server
npm install
npm start          # http://localhost:3000/api/game
```

API 키가 없어도 모의(mock) 모드로 앱의 모든 화면 흐름을 시험할 수 있습니다. 실제 AI를 쓰려면 `ai-server/.env.example`을 `.env`로 복사해 `GEMINI_API_KEY`를 넣으세요.

## 문서

| 문서 | 누가 보면 좋은가 |
|---|---|
| [ai-server/README.md](ai-server/README.md) | 서버를 실행·테스트하는 사람 |
| [ai-server/docs/api.md](ai-server/docs/api.md) | 앱 개발자: 화면 단계(stage)별로 부를 API와 오류 처리 |
| [ai-server/docs/ai-design.md](ai-server/docs/ai-design.md) | 프롬프트·게임 규칙을 고치는 사람: AI 흐름과 고치는 곳 |
| [ai-server/docs/requirements.md](ai-server/docs/requirements.md) | 요구사항별 구현·검증 상태, 실제 Gemini 실행 결과 |

## 함께 작업할 때

- **API 키, `.env`, `data/` 폴더(플레이어 대화 기록)는 올리지 않습니다.** `.gitignore`에 들어 있습니다.
- `main`에 바로 올리지 말고 브랜치를 만들어 PR로 합칩니다.
- AI 서버를 고쳤으면 PR 전에 `cd ai-server && npm test`가 통과하는지 확인합니다.
- 프롬프트를 바꿨으면 `npm run risk`(위험 발화 40개)도 실제 키로 돌려 봅니다.
