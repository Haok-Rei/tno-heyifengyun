/** Repair only a trailing comma outside strings; prose bytes are never rewritten. */
export function parseModelJSON(text) {
  try { return { data: JSON.parse(text), formatRepairs: 0 }; } catch {}
  let quoted = false, escaped = false, cleaned = '', repairs = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      cleaned += char;
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') quoted = false;
    } else {
      if (char === '"') quoted = true;
      if (char === ',') {
        let next = i + 1;
        while (/\s/.test(text[next] || '') && next < text.length) next++;
        if (text[next] === '}' || text[next] === ']') { repairs++; continue; }
      }
      cleaned += char;
    }
  }
  return { data: JSON.parse(cleaned), formatRepairs: repairs };
}
