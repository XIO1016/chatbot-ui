import React, { FC } from "react"
import { IconLoader2, IconMistOff } from "@tabler/icons-react"
import { Email } from "@/types/email"
import { EmailComponent } from "@/components/email/components/Email"

interface EmailSidebarProps {
  side: string
  isOpen: boolean
  items: Email[]
  addItemButtonTitle: string
  toggleOpen: () => void
  loading: boolean
  renderPageNumbers: () => JSX.Element
  goToFirstPage: () => void
  goToPreviousPage: () => void
  goToNextPage: () => void
  goToLastPage: () => void
  currentPage: number
  totalPages: number
}

const EmailSidebar: FC<EmailSidebarProps> = ({
  side,
  isOpen,
  items,
  addItemButtonTitle,
  toggleOpen,
  loading,
  renderPageNumbers,
  goToFirstPage,
  goToPreviousPage,
  goToNextPage,
  goToLastPage,
  currentPage,
  totalPages
}) => {
  return isOpen ? (
    <div>
      <div
        className={`fixed top-0 z-40 flex h-full w-[260px] flex-none flex-col space-y-2 bg-[#202123] p-2 text-[14px] transition-all`}
      >
        {/* 이메일 목록 */}
        {loading ? (
          <div className="flex grow items-center justify-center overflow-auto">
            <IconLoader2
              className="animate-spin text-white opacity-50"
              size={48}
            />
          </div>
        ) : (
          <div className="grow overflow-auto">
            {items.length > 0 ? (
              <div className="pt-2">
                {items.map((email: Email, index: number) => (
                  <EmailComponent key={index} email={email} />
                ))}
              </div>
            ) : (
              <div className="mt-8 select-none text-center text-white opacity-50">
                <IconMistOff className="mx-auto mb-3" />
                <span className="text-[14px] leading-normal">
                  No emails to display.
                </span>
              </div>
            )}
          </div>
        )}

        {/* 페이지네이션 */}
        <div className="mt-4 flex items-center justify-center space-x-1">
          <button
            className="rounded-full px-2 py-1 text-white"
            onClick={goToFirstPage}
            disabled={currentPage === 1}
          >
            «
          </button>
          <button
            className="rounded-full px-2 py-1 text-white"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            ‹
          </button>
          {renderPageNumbers()}
          <button
            className="rounded-full px-2 py-1 text-white"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            ›
          </button>
          <button
            className="rounded-full px-2 py-1 text-white"
            onClick={goToLastPage}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div></div>
  )
}

export default EmailSidebar
