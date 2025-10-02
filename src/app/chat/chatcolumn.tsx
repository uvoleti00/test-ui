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
          <div className="text-xs text-gray-500 mb-2 text-center">
            {model} responses
          </div>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-2 flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-lg break-words prose ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-white border border-gray-200 rounded-bl-none"
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
                    code: ({ node, ...props }) =>
                       (
                        <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto">
                          <code {...props} />
                        </pre>
                      ),
                  }}
                >
                  {msg.text}
                </ReactMarkdown>

                {msg.role=== 'ai'  && (
                <div className="mt-1 text-xs text-gray-400 flex justify-between items-center">
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
