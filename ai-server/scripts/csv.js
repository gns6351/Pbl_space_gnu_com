// 보고서용 CSV (엑셀에서 한글이 깨지지 않게 BOM을 붙인다)
function cell(v) {
  const t = v == null ? '' : String(v);
  const safe = /^[=+\-@\t\r]/.test(t) ? `'${t}` : t; // 엑셀 수식 주입 방지
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(rows) {
  if (!rows.length) return '﻿';
  const head = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  return `﻿${[head.map(cell).join(','), ...rows.map((r) => head.map((k) => cell(r[k])).join(','))].join('\r\n')}\r\n`;
}
