// Gemini 호출(JSON 출력) 또는 키 없이 쓰는 모의(mock) 응답
//   createLlm(settings, { client, mocks }) → { mode, call(kind, …), modelFor(kind) }
//   mocks: 호출 종류별 모의 응답 함수 (게임은 src/game/mocks.js)
//   settings.kindModels: 호출 종류별 모델

export function createLlm(settings, { client, mocks = {} } = {}) {
  const live = settings.llmMode === 'live';
  let aiPromise = null;
  let thinking = settings.thinking ? String(settings.thinking).toUpperCase() : '';

  async function ai() {
    if (client) return client; // 테스트에서 가짜 Gemini 클라이언트를 넣는다
    aiPromise ||= import('@google/genai').then(({ GoogleGenAI }) => new GoogleGenAI({ apiKey: settings.apiKey }));
    return aiPromise;
  }

  async function callGemini(model, text, schema, temperature, signal) {
    const g = await ai();
    const config = { responseMimeType: 'application/json', responseJsonSchema: schema };
    if (signal) config.abortSignal = signal;
    if (Number.isFinite(temperature)) config.temperature = temperature;
    if (thinking) config.thinkingConfig = { thinkingLevel: thinking };
    try {
      return await g.models.generateContent({ model, contents: text, config });
    } catch (err) {
      // 추론 강도 설정을 지원하지 않는 모델이면 설정 없이 다시 보낸다
      if (thinking && err?.status === 400 && /thinking/i.test(String(err.message))) {
        console.warn(`※ ${model}이(가) thinkingLevel을 지원하지 않아 설정 없이 보냅니다.`);
        thinking = '';
        delete config.thinkingConfig;
        return g.models.generateContent({ model, contents: text, config });
      }
      throw err;
    }
  }

  const modelFor = (kind) => settings.kindModels?.[kind] || settings.gameModel;

  // 한 번 호출 → { raw, meta }. mockInput = 모의 응답을 만들 입력
  async function call(kind, { promptText, schema, temperature, mockInput, attempt = 1, signal }) {
    if (!live) {
      if (!mocks[kind]) throw new Error(`모의 응답이 없는 호출 종류: ${kind}`);
      return { raw: mocks[kind](mockInput, attempt), meta: { model: 'mock', responseModel: 'mock' } };
    }
    const model = modelFor(kind);
    const res = await callGemini(model, promptText, schema, temperature, signal);
    return {
      raw: res.text ?? '',
      meta: {
        model,
        responseModel: res.modelVersion || null,
        finishReason: res.candidates?.[0]?.finishReason ?? null,
        blockReason: res.promptFeedback?.blockReason ?? null,
        usage: res.usageMetadata || null,
      },
    };
  }

  return {
    get mode() { return settings.llmMode; },
    get thinking() { return thinking || null; },
    call,
    modelFor: (kind) => (live ? modelFor(kind) : 'mock'),
  };
}
