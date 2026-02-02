import { remark } from 'remark';
import html from 'remark-html';

interface BlogContentProps {
  content: string;
}

interface ParsedContent {
  html: string;
  footnotes: { id: string; text: string }[];
  citations: { id: string; text: string }[];
}

function parseFootnotesAndCitations(markdown: string): {
  cleanedMarkdown: string;
  footnotes: { id: string; text: string }[];
  citations: { id: string; text: string }[];
} {
  const footnotes: { id: string; text: string }[] = [];
  const citations: { id: string; text: string }[] = [];

  // Extract footnote definitions [^1]: Footnote text here
  const footnoteDefRegex = /^\[\^(\d+)\]:\s*(.+)$/gm;
  let match;
  while ((match = footnoteDefRegex.exec(markdown)) !== null) {
    footnotes.push({ id: match[1], text: match[2] });
  }

  // Extract citation definitions [@key]: Citation text here
  const citationDefRegex = /^\[@([^\]]+)\]:\s*(.+)$/gm;
  while ((match = citationDefRegex.exec(markdown)) !== null) {
    citations.push({ id: match[1], text: match[2] });
  }

  // Remove definition lines from markdown
  let cleanedMarkdown = markdown
    .replace(/^\[\^(\d+)\]:\s*.+$/gm, '')
    .replace(/^\[@([^\]]+)\]:\s*.+$/gm, '');

  // Replace footnote references [^1] with numbered superscript spans
  cleanedMarkdown = cleanedMarkdown.replace(
    /\[\^(\d+)\]/g,
    '<sup class="footnote-ref" data-footnote="$1">$1</sup>'
  );

  // Replace citation references [@key] with styled spans
  cleanedMarkdown = cleanedMarkdown.replace(
    /\[@([^\]]+)\]/g,
    '<span class="citation-ref" data-citation="$1">[$1]</span>'
  );

  return { cleanedMarkdown, footnotes, citations };
}

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(html, { sanitize: false })
    .process(markdown);
  return result.toString();
}

export default async function BlogContent({ content }: BlogContentProps) {
  const { cleanedMarkdown, footnotes, citations } = parseFootnotesAndCitations(content);
  const htmlContent = await markdownToHtml(cleanedMarkdown);

  return (
    <div className="blog-article-container">
      {/* Left margin: Footnotes */}
      <aside className="blog-sidenotes blog-footnotes">
        {footnotes.map((fn) => (
          <div key={fn.id} className="sidenote" data-for={fn.id}>
            <span className="sidenote-number">{fn.id}</span>
            <span className="sidenote-text">{fn.text}</span>
          </div>
        ))}
      </aside>

      {/* Main content */}
      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />

      {/* Right margin: Citations */}
      <aside className="blog-sidenotes blog-citations">
        {citations.map((cit) => (
          <div key={cit.id} className="sidenote citation" data-for={cit.id}>
            <span className="sidenote-key">[{cit.id}]</span>
            <span className="sidenote-text">{cit.text}</span>
          </div>
        ))}
      </aside>
    </div>
  );
}
