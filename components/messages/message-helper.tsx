import React from "react"
import { MessageMarkdownMemoized } from "@/components/messages/message-markdown-memoized"

const EmailHelperDisplay = ({ content }) => {
  if (typeof content !== "string") {
    console.error("Expected string for content, got:", typeof content)
    return <div>Error: Invalid content format</div>
  }

  const lines = content.split("\n")
  const [title, ...restLines] = lines

  const getField = prefix => {
    const line = restLines.find(l => l.startsWith(prefix))
    return line ? line.replace(prefix, "").trim() : "N/A"
  }

  const subject = getField("제목:")
  const sender = getField("발신자:")
  const date = getField("날짜:")

  const bodyStartIndex = restLines.findIndex(l => l.startsWith("내용:"))
  const emailBody =
    bodyStartIndex !== -1
      ? restLines.slice(bodyStartIndex + 1).join("\n")
      : "No content available"

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
        <MessageMarkdownMemoized className="prose dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 min-w-full space-y-6 break-words">
          {emailBody}
        </MessageMarkdownMemoized>
      </div>
    </div>
  )
}

export default EmailHelperDisplay
