# 거울상담소 AI 서버

앱이 부르는 게임 API(`/api/game`)와 그 뒤의 AI 처리를 맡습니다. AI 호출은 모두 서버에서 하므로 **앱에는 API 키가 들어가지 않습니다**.

- 손님 만들기: 플레이어의 걱정을 닮은 손님 카드 (FR-03)
- 상담 대화: 손님 대사와 선택지, 대화 맥락 유지 (FR-04, FR-05)
- 조언 판정: 직접 입력한 말이 조언인지 판정해 기록장에 (FR-06)
- 거울 장면: 조언을 "나에게 하는 말"로 바꾸고 점검 (FR-08)
- 위험 감지: 규칙 + AI, 감지되면 도움 안내 (FR-10)

## 실행

Node.js 20.12 이상이 필요합니다.

```bash
npm install
cp .env.example .env    # 실제 AI를 쓸 때만. GEMINI_API_KEY를 채운다
npm start               # http://localhost:3000/api/game
npm run dev             # 코드를 고치면 자동으로 다시 켜짐
```

- 키가 없으면 **모의(mock) 모드**로 켜집니다. 응답 내용은 의미 없지만 모든 화면 흐름을 시험할 수 있습니다. 특정 경로(위험 감지, AI 오류 등)를 보는 방법은 [docs/ai-design.md](docs/ai-design.md#모의mock-모드)에 있습니다.
- 서버가 켜졌는지: `GET /health` → `{"ok":true,"llmMode":"mock"}`
- 실기기에서는 서버를 켤 때 화면에 나오는 같은 와이파이 주소를 쓰고, 에뮬레이터에서는 `http://10.0.2.2:3000`을 씁니다.

## 명령

| 명령 | 하는 일 | 키 필요 |
|---|---|---|
| `npm test` | 자동 테스트 25개 (요구사항별 정상·경계·오류 사례, 모의 AI) | 아니오 |
| `npm run risk` | 위험 발화 40개(직접 20·간접 20) + 대조 문장 20개 판정 (NFR-05) | 예 |
| `npm run sim -- --games 30` | 가상 플레이어 30판 시뮬레이션: 완주율·응답 시간·호출 수·맥락 유지 (NFR-01·06·08) | 예 |
| `npm run report` | 쌓인 호출 로그 집계: 판당 호출·토큰·실패 사유 (NFR-08) | 아니오 |

`risk`와 `sim`은 모의 모드에서도 돌지만 흐름 확인용이라 수치에 의미가 없습니다. 결과는 `data/game/reports/`에 JSON·CSV로 저장됩니다.

## 폴더 구조

```
ai-server/
├── src/
│   ├── server.js          서버 실행
│   ├── app.js             Express 앱 (/api/game, /health)
│   ├── config.js          .env 설정, 프롬프트 파일 읽기
│   ├── llm/
│   │   ├── client.js      Gemini 호출 / 모의 응답
│   │   └── ask.js         호출 1회: 시간 제한 + 출력 형식 검사 + 기록
│   └── game/
│       ├── router.js      API 엔드포인트, 중복 요청·동시 요청 처리
│       ├── flow.js        게임 진행 규칙 (단계, 턴, 마무리, 도움 안내)
│       ├── engine.js      AI 작업 (손님 생성, 손님 턴, 조언 판정, 변환·점검, 위험 판정)
│       ├── judges.js      AI 출력 형식 검사
│       ├── format.js      변환문 형식 점검 (2인칭·길이)
│       ├── safety.js      위험·비난 규칙, 금지 표현
│       ├── store.js       세션·카드 저장, 보관 기간, 호출 로그
│       ├── mocks.js       모의 AI 응답
│       ├── content.js     콘텐츠·프롬프트 읽기
│       └── sim.js         테스트 도구 (시뮬레이션, 위험 사례, 로그 집계)
├── content/
│   ├── game.json          동의 문구, 예시 걱정, 턴 규칙, 호출 상한, 도움 안내
│   ├── guests/            예시 손님 (AI 실패 시 대체)
│   ├── safety/            위험·비난 규칙
│   ├── prompts/<종류>/    프롬프트(v1.md)와 출력 형식(schema.json)
│   └── test-data/         테스트용 가상 데이터: 위험 발화 사례, 가상 플레이어 성향
├── scripts/game-cli.js    npm run sim / risk / report
├── tests/                 자동 테스트 (fixtures/content = 테스트 전용 콘텐츠 사본)
└── docs/                  api.md · ai-design.md · requirements.md
```

## 검증 결과 (실제 Gemini, 2026-11-15)

| 항목 | 결과 | 목표 |
|---|---|---|
| 위험 발화 감지 | 40/40 (걱정 입력·대화 발화 모두) | 100% (NFR-05) |
| 완주율 (위험 성향 제외) | 27/27 | 90% 이상 (NFR-06) |
| 응답 시간 p95 | 일반 턴 2.13초 · 거울 장면 3.82초 | 10초 · 20초 (NFR-01) |
| 판당 호출 | 최대 28 | 60회 이하 (NFR-08) |

모델: 게임 `gemini-3.5-flash-lite` · 점검 `gemini-3.5-flash` · 가상 플레이어 `gemini-3.1-flash-lite`. 자세한 결과와 남은 확인 사항은 [docs/requirements.md](docs/requirements.md)에 있습니다.

## 아직 정하지 않은 것

- 보관 기간 30일(`content/game.json`의 `consent.retention_days`)은 임시값입니다.
- 손님 카드의 "핵심 갈등 유지"(FR-03)는 제작자 2인 판정이 필요합니다. `npm run sim` 결과의 `guests.csv`에 판정 칸이 있습니다.
- Android 실기기 확인(NFR-07)과 휴리스틱 평가(NFR-06)는 앱이 나온 뒤에 합니다.
