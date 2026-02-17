import ReactMarkdown from "react-markdown";

interface MarkdownMessageProps {
  content: string;
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <ReactMarkdown
      components={{
        // Headings - responsive sizes
        h1: ({ children }) => (
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4 mt-4 sm:mt-5 first:mt-0">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3 mt-3 sm:mt-4 first:mt-0">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2 sm:mb-3 mt-2 sm:mt-3 first:mt-0">
            {children}
          </h3>
        ),
        // Paragraphs - responsive line height
        p: ({ children }) => (
          <p className="text-sm sm:text-base text-foreground/90 mb-3 sm:mb-4 last:mb-0 leading-relaxed">
            {children}
          </p>
        ),
        // Lists - tighter on mobile
        ul: ({ children }) => (
          <ul className="list-disc list-outside ml-4 sm:ml-5 mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 text-sm sm:text-base text-foreground/90">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-outside ml-4 sm:ml-5 mb-3 sm:mb-4 space-y-1.5 sm:space-y-2 text-sm sm:text-base text-foreground/90">
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed pl-0.5 sm:pl-1">{children}</li>
        ),
        // Strong/Bold
        strong: ({ children }) => (
          <strong className="font-semibold text-primary">{children}</strong>
        ),
        // Emphasis/Italic
        em: ({ children }) => (
          <em className="italic text-foreground/80">{children}</em>
        ),
        // Code - responsive padding
        code: ({ children, className }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="bg-secondary dark:bg-zinc-800 text-primary px-1 sm:px-1.5 py-0.5 rounded text-[11px] sm:text-xs font-mono break-all">
                {children}
              </code>
            );
          }
          return (
            <code className="block bg-secondary dark:bg-zinc-900 p-2 sm:p-3 rounded-lg text-[11px] sm:text-xs font-mono overflow-x-auto mb-2 sm:mb-3">
              {children}
            </code>
          );
        },
        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-primary/50 pl-2 sm:pl-3 my-2 sm:my-3 text-foreground/70 italic text-[13px] sm:text-sm">
            {children}
          </blockquote>
        ),
        // Horizontal rule
        hr: () => (
          <hr className="border-border dark:border-zinc-700 my-3 sm:my-4" />
        ),
        // Images - responsive and rounded
        img: ({ src, alt }) => (
          <img
            src={src}
            alt={alt}
            className="rounded-lg max-w-full h-auto my-2 sm:my-3 border border-border/50"
          />
        ),
        // Tables - horizontal scroll wrapper
        table: ({ children }) => (
          <div className="w-full overflow-x-auto my-3 sm:my-4 rounded-lg border border-border/50">
            <table className="w-full border-collapse text-sm text-left">
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead className="bg-secondary/50 dark:bg-white/5 border-b border-border/50 text-xs uppercase font-semibold text-foreground/70">
            {children}
          </thead>
        ),
        tbody: ({ children }) => (
          <tbody className="divide-y divide-border/30">{children}</tbody>
        ),
        tr: ({ children }) => (
          <tr className="transition-colors hover:bg-muted/30">{children}</tr>
        ),
        th: ({ children }) => (
          <th className="px-3 sm:px-4 py-2 sm:py-3 whitespace-nowrap font-medium text-foreground">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 sm:px-4 py-2 sm:py-3 align-top text-foreground/80">
            {children}
          </td>
        ),
        // Links - with word break for long URLs
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline underline-offset-2 break-words"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
