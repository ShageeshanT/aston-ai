import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function Markdown({ content }: { content: string }) {
  return (
    <div className="md-body text-[15.5px] leading-[1.7] text-[color:var(--color-text)]">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="my-3 first:mt-0 last:mb-0 text-pretty">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="my-3 list-disc space-y-1.5 pl-5 marker:text-[color:var(--color-faint)]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 list-decimal space-y-1.5 pl-5 marker:text-[color:var(--color-faint)]">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-semibold text-[color:var(--color-text)]">
              {children}
            </strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          h1: ({ children }) => (
            <h1 className="mt-5 mb-2 text-[20px] font-semibold tracking-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-5 mb-2 text-[17px] font-semibold tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-4 mb-1.5 text-[15px] font-semibold tracking-tight">
              {children}
            </h3>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="text-[color:var(--color-accent)] underline decoration-[color:var(--color-accent)]/40 decoration-1 underline-offset-[3px] transition-colors hover:decoration-[color:var(--color-accent)]"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-3 border-l-2 border-[color:var(--color-border-strong)] pl-3 text-[color:var(--color-muted)]">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-4 border-[color:var(--color-border)]" />,
          code: ({ className, children, ...rest }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="rounded-[5px] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-[5px] py-[1.5px] font-mono text-[13px] text-[color:var(--color-text)]"
                  {...rest}
                >
                  {children}
                </code>
              );
            }
            const lang = /language-(\w+)/.exec(className ?? "")?.[1] ?? "";
            return <CodeBlock lang={lang}>{String(children).replace(/\n$/, "")}</CodeBlock>;
          },
          pre: ({ children }) => <>{children}</>,
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-[10px] border border-[color:var(--color-border)]">
              <table className="w-full border-collapse text-[13.5px]">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)] px-3 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-[color:var(--color-border)] px-3 py-2">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({ lang, children }: { lang: string; children: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-3 overflow-hidden rounded-[10px] border border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]">
      <div className="flex items-center justify-between border-b border-[color:var(--color-border)] px-3 py-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wider text-[color:var(--color-faint)]">
          {lang || "code"}
        </span>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(children);
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          }}
          className="flex items-center gap-1 rounded-[5px] px-1.5 py-0.5 text-[11px] text-[color:var(--color-muted)] transition-colors hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-text)]"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[13px] leading-[1.55]">
        <code>{children}</code>
      </pre>
    </div>
  );
}
