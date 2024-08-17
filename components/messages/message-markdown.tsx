import React, { FC, useEffect, useRef, useState } from "react"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import { MessageCodeBlock } from "./message-codeblock"
import { MessageMarkdownMemoized } from "./message-markdown-memoized"
import DOMPurify from "dompurify"
interface MessageMarkdownProps {
  content: string
}

const EmailBodyRenderer = ({ htmlContent }) => {
  const [scale, setScale] = useState(0.8)
  const contentRef = useRef(null)
  const containerRef = useRef(null)

  const sanitizedHtml = DOMPurify.sanitize(htmlContent)

  useEffect(() => {
    const updateContainerSize = () => {
      if (contentRef.current && containerRef.current) {
        const contentWidth = contentRef.current.scrollWidth
        const contentHeight = contentRef.current.scrollHeight
        containerRef.current.style.width = `${contentWidth * scale}px`
        containerRef.current.style.height = `${contentHeight * scale}px`
      }
    }

    // 초기 크기 설정 및 스케일 변경 시 크기 업데이트
    updateContainerSize()

    // 창 크기 변경 시 컨테이너 크기 업데이트
    window.addEventListener("resize", updateContainerSize)
    return () => window.removeEventListener("resize", updateContainerSize)
  }, [scale, htmlContent])

  const containerStyle = `
    .email-content {
      transform: scale(${scale});
      transform-origin: top left;
      font-size: 14px;
      width: fit-content;
    }
    .email-content h1 { font-size: 1.8em; }
    .email-content h2 { font-size: 1.5em; }
    .email-content h3 { font-size: 1.3em; }
    .email-content h4, .email-content h5, .email-content h6 { font-size: 1.1em; }
    .email-content p { font-size: 1em; }
    .email-content pre, .email-content code { font-size: 0.9em; }
    /* 기타 스타일은 이전과 동일 */
  `

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="scale-slider" className="mr-2">
          크기 조절:
        </label>
        <input
          id="scale-slider"
          type="range"
          min="0.5"
          max="1"
          step="0.1"
          value={scale}
          onChange={e => setScale(parseFloat(e.target.value))}
          className="w-32"
        />
      </div>
      <style>{containerStyle}</style>
      <div ref={containerRef} style={{ overflow: "hidden" }}>
        <div
          ref={contentRef}
          className="email-content prose dark:prose-invert prose-p:leading-relaxed min-w-full space-y-6 break-words"
          dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
      </div>
    </div>
  )
}

const EmailHelperDisplay: FC<{ content: string }> = ({ content }) => {
  const lines = content.split("\n")
  const [title, ...restLines] = lines

  const getField = (prefix: string): string => {
    const startIndex = content.indexOf(prefix)
    if (startIndex === -1) return "" // prefix를 찾지 못한 경우

    const contentStart = startIndex + prefix.length
    const nextFieldIndex = content.slice(contentStart).search(/\n[A-Z_]+:/)

    if (nextFieldIndex === -1) {
      return content.slice(contentStart).trim()
    } else {
      return content.slice(contentStart, contentStart + nextFieldIndex).trim()
    }
  }

  const subject = getField("TITLE:")
  const sender = getField("EMAIL_SENDER:")
  const date = getField("EMAIL_DATE:")
  const email_content = getField("EMAIL_CONTENT:")

  // console.log(emailBody)
  return (
    <div className="mx-auto max-w-2xl rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white">
        {title || "Untitled Email"}
      </h2>
      <div className="mb-4 space-y-2">
        <p className="text-sm">
          <span className="font-semibold text-gray-600 dark:text-gray-300">
            제목:
          </span>{" "}
          <span className="text-gray-800 dark:text-gray-100">{subject}</span>
        </p>
        <p className="text-sm">
          <span className="font-semibold text-gray-600 dark:text-gray-300">
            발신자:
          </span>{" "}
          <span className="text-gray-800 dark:text-gray-100">{sender}</span>
        </p>
        <p className="text-sm">
          <span className="font-semibold text-gray-600 dark:text-gray-300">
            날짜:
          </span>{" "}
          <span className="text-gray-800 dark:text-gray-100">{date}</span>
        </p>
      </div>
      <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
        <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white">
          내용:
        </h3>
        <EmailBodyRenderer htmlContent={email_content} />
      </div>
    </div>
  )
}

export const MessageMarkdown: FC<MessageMarkdownProps> = ({ content }) => {
  const isEmailHelper = content.trim().startsWith("이메일 도우미")

  if (isEmailHelper) {
    return <EmailHelperDisplay content={content} />
  }

  return (
    <MessageMarkdownMemoized
      className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 min-w-full space-y-6 break-words"
      remarkPlugins={[remarkGfm, remarkMath]}
      components={{
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>
        },
        img({ node, ...props }) {
          return <img className="max-w-[67%]" {...props} />
        },
        code({ node, className, children, ...props }) {
          const childArray = React.Children.toArray(children)
          const firstChild = childArray[0] as React.ReactElement
          const firstChildAsString = React.isValidElement(firstChild)
            ? (firstChild as React.ReactElement).props.children
            : firstChild

          if (firstChildAsString === "▍") {
            return <span className="mt-1 animate-pulse cursor-default">▍</span>
          }

          if (typeof firstChildAsString === "string") {
            childArray[0] = firstChildAsString.replace("`▍`", "▍")
          }

          const match = /language-(\w+)/.exec(className || "")

          if (
            typeof firstChildAsString === "string" &&
            !firstChildAsString.includes("\n")
          ) {
            return (
              <code className={className} {...props}>
                {childArray}
              </code>
            )
          }

          return (
            <MessageCodeBlock
              key={Math.random()}
              language={(match && match[1]) || ""}
              value={String(childArray).replace(/\n$/, "")}
              {...props}
            />
          )
        }
      }}
    >
      {content}
    </MessageMarkdownMemoized>
  )
}
