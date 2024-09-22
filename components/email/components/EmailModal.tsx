import { FC, KeyboardEvent, useEffect, useRef } from "react"

import { useTranslation } from "next-i18next"

//import { Prompt } from '@/types/prompt';
import { Email } from "@/types/email"
import DOMPurify from "dompurify"

interface Props {
  email: Email
  onClose: () => void
  onChatWithGTN: () => void
  // onUpdatePrompt: (prompt: Prompt) => void;
}

export const EmailModal: FC<Props> = ({ email, onClose, onChatWithGTN }) => {
  const { t } = useTranslation("emailbar")
  // const [name, setName] = useState(prompt.name);
  // const [description, setDescription] = useState(prompt.description);
  // const [content, setContent] = useState(prompt.content);

  const modalRef = useRef<HTMLDivElement>(null)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const handleEnter = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      //onUpdatePrompt({ ...prompt, name, description, content: content.trim() });
      onClose()
    }
  }

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        window.addEventListener("mouseup", handleMouseUp)
      }
    }

    const handleMouseUp = (e: MouseEvent) => {
      window.removeEventListener("mouseup", handleMouseUp)
      onClose()
    }

    window.addEventListener("mousedown", handleMouseDown)

    return () => {
      window.removeEventListener("mousedown", handleMouseDown)
    }
  }, [onClose])

  useEffect(() => {
    nameInputRef.current?.focus()
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onKeyDown={handleEnter}
    >
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onKeyDown={handleEnter}
      >
        <div className="fixed inset-0 z-10 overflow-hidden">
          <div className="flex min-h-screen items-center justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div
              className="hidden sm:inline-block sm:h-screen sm:align-middle"
              aria-hidden="true"
            />

            <div
              ref={modalRef}
              className="dark:border-netural-400 inline-block max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-gray-300 bg-white px-6 pb-6 pt-5 text-left align-bottom shadow-xl transition-all sm:my-8 sm:align-middle dark:bg-[#202123]"
              role="dialog"
            >
              <div className="flex w-full items-end justify-between">
                <div className="text-sm font-bold text-black dark:text-neutral-200">
                  {t("제목")}
                </div>
                <button
                  onClick={onChatWithGTN}
                  className="mb-1 rounded-lg bg-blue-500 px-4 py-2 text-white shadow-md transition-colors duration-200 ease-in-out hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  GTN과 대화하기
                </button>
              </div>
              <div className=" w-full">
                {/*<input*/}
                {/*  ref={nameInputRef}*/}
                {/*  className="w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"*/}
                {/*  placeholder={t("A name for your prompt.") || ""}*/}
                {/*/>*/}
                {/*<h3 className="mt-2 text-neutral-900 dark:text-neutral-100">*/}
                {/*    {email.title}*/}
                {/*</h3>*/}

                <textarea
                  className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
                  style={{ resize: "none" }}
                  placeholder={"제목이 없습니다." || ""}
                  value={email.title}
                  //onChange={(e) => setDescription(e.target.value)}
                  rows={1}
                  readOnly
                />
              </div>

              <div className="mt-6 text-sm font-bold text-black dark:text-neutral-200">
                {t("보낸 사람")}
              </div>
              <textarea
                className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
                style={{ resize: "none" }}
                placeholder={t("A description for your prompt.") || ""}
                value={email.sender_email}
                //onChange={(e) => setDescription(e.target.value)}
                rows={1}
                readOnly
              />
              <div className="mt-6 text-sm font-bold text-black dark:text-neutral-200">
                {t("날짜")}
              </div>
              <textarea
                className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
                style={{ resize: "none" }}
                placeholder={t("A description for your prompt.") || ""}
                value={email.date}
                //onChange={(e) => setDescription(e.target.value)}
                rows={1}
                readOnly
              />

              <div className="mt-6 text-sm font-bold text-black dark:text-neutral-200">
                {t("내용")}
              </div>
              {/*<textarea*/}
              {/*  className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"*/}
              {/*  style={{ resize: "none" }}*/}
              {/*  placeholder={*/}
              {/*    t(*/}
              {/*      "Prompt content. Use {{}} to denote a variable. Ex: {{name}} is a {{adjective}} {{noun}}"*/}
              {/*    ) || ""*/}
              {/*  }*/}
              {/*  value={email.content}*/}
              {/*  // onChange={(e) => setContent(e.target.value)}*/}
              {/*  rows={10}*/}
              {/*  readOnly*/}
              {/*/>*/}

              <div
                className="mt-2 w-full overflow-auto rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
                style={{ minHeight: "200px", maxHeight: "400px" }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(email.content)
                }}
              />
              {/* <button
              type="button"
              className="w-full px-4 py-2 mt-6 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
              onClick={() => {
                const updatedPrompt = {
                  ...prompt,
                  name,
                  description,
                  content: content.trim(),
                };

                onUpdatePrompt(updatedPrompt);
                onClose();
              }}
            >
              {t('Save')}
            </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
