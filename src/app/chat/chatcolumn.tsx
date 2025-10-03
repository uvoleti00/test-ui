import { ReactNode } from "react";
import { Message } from "./page";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeStarryNight from "rehype-starry-night";

type Props = {
  model: string;
  messages: Message[];
  containerRef: React.RefObject<HTMLDivElement>;
};

export function ChatColumn(props: Props): ReactNode {
  const { model, messages, containerRef } = props;
  return (
    <>
      <div className="flex-1 overflow-auto p-4 bg-gray-50" ref={containerRef}>
        <div className="flex flex-col">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-3 flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] md:max-w-[70%] px-3 py-2 rounded-lg break-words prose prose-sm sm:prose-base leading-relaxed [word-break:break-word] ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-white border border-gray-200 rounded-bl-none shadow-sm"
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className="text-xl font-semibold mt-3 mb-2"
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="mb-3 leading-relaxed" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc pl-6 mb-3" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal pl-6 mb-3" {...props} />
                    ),
                    code: ({ node, children, className, ...props }) => {
                      const text = String(children);
                      const isMultiLine = /\n/.test(text.trim());
                      if (!isMultiLine) {
                        return (
                          <code
                            className={`bg-gray-800/70 text-gray-100 px-1.5 py-0.5 rounded text-[0.7rem] sm:text-xs ${
                              className || ""
                            }`}
                            {...props}
                          >
                            {text}
                          </code>
                        );
                      }
                      return (
                        <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-xs sm:text-sm leading-relaxed">
                          <code className={className} {...props}>
                            {text}
                          </code>
                        </pre>
                      );
                    },
                  }}
                >
                  {msg.text}
                </ReactMarkdown>

                {msg.role === "ai" && (
                  <div className="mt-1 text-[10px] sm:text-xs text-gray-400 flex justify-between items-center">
                    <span>{msg.status}</span>
                    {msg.timeTaken !== undefined && (
                      <span>{(msg.timeTaken / 1000).toFixed(2)}s</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
