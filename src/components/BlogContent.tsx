import { remark } from 'remark';
import html from 'remark-html';

interface BlogContentProps {
  content: string;
}

async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(html, { sanitize: false })
    .process(markdown);
  return result.toString();
}

export default async function BlogContent({ content }: BlogContentProps) {
  const htmlContent = await markdownToHtml(content);

  return (
    <div
      className="blog-content"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
