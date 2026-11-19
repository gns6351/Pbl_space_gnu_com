// 변환문 형식 점검(규칙, AI 없이): 빈 출력 · 2인칭 남음 · 지나친 길이 증가
const cp = (s) => [...String(s ?? '')].length;

// 2인칭이 남았는지: 앞뒤가 한글이 아닌 '너/넌/널/네가/니가/당신…'('너무'·'너머'는 제외)
// + 소유격 '네/니 + 공백 + 한글'(네 페이스, 니 생각). 수량 표현(네 번·네 가지·네 개…)은 제외
const SECOND_PERSON = /(?<![가-힣])(너(?:는|를|의|도|한테|에게|랑|만|가|희|희들)?|넌|널|네가|니가|당신(?:은|이|의|도|을|에게|한테|께서)?)(?![가-힣])/u;
const COUNTERS = '번째|번|가지|개|명|시간|시|살|차례|권|장|달|주|해|군데|마리|곳|줄|문제|과목|단계|글자|페이지|배';
const SECOND_POSSESSIVE = new RegExp(`(?<![가-힣])(네|니)\\s+(?!(?:${COUNTERS})(?![가-힣]))[가-힣]`, 'u');

// rules = game.json의 check 항목 { maxLengthRatio, shortAdviceChars, shortExtraChars }
export function formatCheck(advice, self, rules = {}) {
  const errors = [];
  const text = String(self ?? '').trim();
  if (!text) errors.push('empty');
  if (text && (SECOND_PERSON.test(text) || SECOND_POSSESSIVE.test(text))) errors.push('second_person');
  const a = cp(String(advice).trim());
  const b = cp(text);
  const ratio = Number(rules.maxLengthRatio) || 2.5;
  const shortN = Number(rules.shortAdviceChars) || 0;
  const extra = Number(rules.shortExtraChars) || 0;
  const limit = a < shortN ? Math.max(a * ratio, a + extra) : a * ratio;
  if (b > limit) errors.push('too_long');
  return { pass: errors.length === 0, errors, length: { advice: a, self: b, limit: Math.round(limit) } };
}
