import { Fragment, type ReactNode } from "react";

/**
 * Small, safe Markdown renderer for CMS pages: headings, paragraphs, lists, quotes,
 * **bold**, _italic_ and [links](https://…). It builds React elements (never raw HTML),
 * so admin-entered text cannot inject scripts.
 */
function inline(text: string, key = 0): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*|_([^_]+)_|\[([^\]]+)\]\(([^)\s]+)\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = key;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[2]) out.push(<strong key={i++}>{m[2]}</strong>);
    else if (m[3]) out.push(<em key={i++}>{m[3]}</em>);
    else if (m[4]) {
      const href = /^(https?:\/\/|\/|mailto:|tel:)/.test(m[5]) ? m[5] : "#";
      const external = href.startsWith("http");
      out.push(
        <a key={i++} href={href} className="font-medium text-primary underline-offset-2 hover:underline" {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {m[4]}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let k = 0;

  const flushPara = () => {
    if (para.length) blocks.push(<p key={k++}>{inline(para.join(" "))}</p>);
    para = [];
  };
  const flushList = () => {
    if (!list) return;
    const items = list.items.map((it, i) => <li key={i}>{inline(it)}</li>);
    blocks.push(list.ordered ? <ol key={k++} className="list-decimal space-y-1 pl-6">{items}</ol> : <ul key={k++} className="list-disc space-y-1 pl-6">{items}</ul>);
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    const ul = /^\s*[-*]\s+(.*)$/.exec(line);
    const ol = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (!line.trim()) {
      flushPara();
      flushList();
    } else if (h) {
      flushPara();
      flushList();
      const level = h[1].length;
      const cls = level === 1 ? "font-serif text-3xl font-semibold" : level === 2 ? "mt-4 font-serif text-2xl font-semibold" : "mt-3 text-lg font-semibold";
      blocks.push(level === 1 ? <h1 key={k++} className={cls}>{inline(h[2])}</h1> : level === 2 ? <h2 key={k++} className={cls}>{inline(h[2])}</h2> : <h3 key={k++} className={cls}>{inline(h[2])}</h3>);
    } else if (ul || ol) {
      flushPara();
      const ordered = !!ol;
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push((ul ?? ol)![1]);
    } else if (line.startsWith(">")) {
      flushPara();
      flushList();
      blocks.push(
        <blockquote key={k++} className="border-l-4 border-accent/60 pl-4 text-ink-muted italic">
          {inline(line.replace(/^>\s?/, ""))}
        </blockquote>,
      );
    } else {
      flushList();
      para.push(line.trim());
    }
  }
  flushPara();
  flushList();
  return <div className="space-y-4 leading-relaxed text-ink">{blocks.map((b, i) => <Fragment key={i}>{b}</Fragment>)}</div>;
}
