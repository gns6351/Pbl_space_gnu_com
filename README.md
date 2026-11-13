# 거울상담소 (MIND:ON)

내 걱정을 닮은 AI 손님을 상담하고, 손님에게 건넨 조언을 나에게 돌려받는 모바일 자기성찰 게임.

| 폴더 | 내용 | 담당 |
|---|---|---|
| `app/` | React Native(Expo) 앱 | 안여진 |
| `server/` | 게임용 Node.js 서버 (Gemini) | 권지훈 |

## 실행

```bash
cd app
npm install
npx expo start   # a: 안드로이드 에뮬레이터, w: 웹
```

## 규칙

- `.env`(API 키)는 절대 커밋하지 않는다.
- 작업은 브랜치(`app/기능명`, `server/기능명`)에서 하고 Pull Request로 합친다.
- 커밋 메시지 앞에 요구사항 ID: `[FR-06] 기록장 원문 일치 테스트 추가`
