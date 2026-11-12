/* Small, safe Markdown renderer for the repo's own docs (GFM subset). */
(function () {
  const REPO = 'https://github.com/SacredRebel/dashboard-tools-/blob/main/';
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const slug = (s) => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/[`*_]/g, '').trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

  function resolve(base, rel) {
    const parts = base.split('/'); parts.pop();
    for (const seg of rel.split('/')) {
      if (seg === '..') parts.pop(); else if (seg !== '.' && seg !== '') parts.push(seg);
    }
    return parts.join('/');
  }
  function link(href, base, known) {
    if (/^(https?:|mailto:)/.test(href)) return { href, ext: true };
    if (href.startsWith('#')) return { href: '#/docs/' + base + href };
    const [p, anchor] = href.split('#');
    const path = resolve(base, p);
    if (known.has(path)) return { href: '#/docs/' + path + (anchor ? '#' + anchor : '') };
    return { href: REPO + path + (anchor ? '#' + anchor : ''), ext: true };
  }
  function inline(s, base, known) {
    const codes = [];
    s = s.replace(/`([^`]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000`; });
    s = esc(s);
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, h) => { const l = link(h.replace(/&amp;/g, '&'), base, known); return `<a href="${esc(l.href)}"${l.ext ? ' target="_blank" rel="noopener"' : ''}>${t}</a>`; });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^\w*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
    s = s.replace(/(^|\s)(https?:\/\/[^\s<]+[^\s<.,;:)])/g, '$1<a href="$2" target="_blank" rel="noopener">$2</a>');
    s = s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${esc(codes[+i])}</code>`);
    return s;
  }

  window.renderMarkdown = function (md, base, known) {
    md = md.replace(/<!--[\s\S]*?-->/g, '').replace(/\r/g, '');
    const lines = md.split('\n');
    let out = '', i = 0;
    const para = [];
    const flush = () => { if (para.length) { out += `<p>${inline(para.join(' '), base, known)}</p>`; para.length = 0; } };
    while (i < lines.length) {
      const line = lines[i];
      const anchor = line.match(/^<a id="([\w-]+)"><\/a>\s*$/);
      if (anchor) { flush(); out += `<a id="${anchor[1]}"></a>`; i++; continue; }
      if (/^```/.test(line)) {
        flush(); const lang = line.slice(3).trim(); const buf = []; i++;
        while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
        i++; out += `<pre><code${lang ? ` data-lang="${esc(lang)}"` : ''}>${esc(buf.join('\n'))}</code></pre>`; continue;
      }
      const h = line.match(/^(#{1,4})\s+(.*)$/);
      if (h) { flush(); const lvl = h[1].length; out += `<h${lvl} id="${slug(h[2])}">${inline(h[2], base, known)}</h${lvl}>`; i++; continue; }
      if (/^\s*(---|\*\*\*)\s*$/.test(line)) { flush(); out += '<hr>'; i++; continue; }
      if (/^\|/.test(line) && i + 1 < lines.length && /^\|?\s*:?-{2,}/.test(lines[i + 1])) {
        flush();
        const row = (l) => l.replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));
        const head = row(line); i += 2; const body = [];
        while (i < lines.length && /^\|/.test(lines[i])) body.push(row(lines[i++]));
        out += `<div class="tbl"><table><thead><tr>${head.map((c) => `<th>${inline(c, base, known)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c, base, known)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
        continue;
      }
      if (/^>\s?/.test(line)) {
        flush(); const buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
        out += `<blockquote><p>${inline(buf.join(' '), base, known)}</p></blockquote>`; continue;
      }
      const li = line.match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
      if (li) {
        flush(); const ordered = /\d/.test(li[2]); const items = [];
        while (i < lines.length) {
          const m = lines[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/);
          if (m) { items.push({ depth: m[1].length >= 2 ? 1 : 0, text: m[3] }); i++; continue; }
          if (/^\s{2,}\S/.test(lines[i]) && items.length) { items[items.length - 1].text += ' ' + lines[i].trim(); i++; continue; }
          break;
        }
        const tag = ordered ? 'ol' : 'ul';
        let html = `<${tag}>`, open = false;
        items.forEach((it, k) => {
          let t = it.text; let box = '';
          const tm = t.match(/^\[( |x)\]\s+(.*)$/i);
          if (tm) { box = `<input type="checkbox" disabled ${tm[1].toLowerCase() === 'x' ? 'checked' : ''}>`; t = tm[2]; }
          if (it.depth === 1 && !open) { html = html.replace(/<\/li>$/, ''); html += '<ul>'; open = true; }
          if (it.depth === 0 && open) { html += '</ul></li>'; open = false; }
          html += `<li>${box}${inline(t, base, known)}</li>`;
          void k;
        });
        if (open) html += '</ul></li>';
        out += html + `</${tag}>`; continue;
      }
      if (/^\s*$/.test(line)) { flush(); i++; continue; }
      para.push(line.trim()); i++;
    }
    flush();
    return out;
  };
})();
