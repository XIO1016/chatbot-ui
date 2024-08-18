import {
  IconLoader2,
  IconMistOff,
  IconPlus,
  IconRefresh,
  IconSettings
} from "@tabler/icons-react"
import { ReactNode, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import Search from "@/components/email/components/Search"
import SettingsSheet from "@/components/email/components/EmailAddressModal"
import { supabase } from "@/lib/supabase/browser-client"
import { EmailComponent } from "@/components/email/components/Email"
import EmailPopup from "@/components/email/components/SendEmailModal"

interface Props<T> {
  isOpen: boolean
  addItemButtonTitle: string
  side: "left" | "right"
  items: T[]
  itemComponent: ReactNode
  folderComponent?: ReactNode
  footerComponent?: ReactNode
  searchTerm: string
  handleSearchTerm: (searchTerm: string) => void
  toggleOpen: () => void
  handleCreateItem?: () => void
  handleCreateFolder?: () => void
  handleRefreshClick: any
  handleDrop?: (e: any) => void
  loading?: boolean
}

const Sidebar = <T,>({
  isOpen,
  addItemButtonTitle,
  side,
  items,
  itemComponent,
  folderComponent,
  footerComponent,
  searchTerm,
  handleSearchTerm,
  toggleOpen,
  handleCreateItem,
  handleDrop,
  handleRefreshClick,
  isSaved,
  credentials,
  setCredentials,
  userId,
  filteredEmails,
  page,
  setPage,
  loading,
  currentEmails,
  goToFirstPage,
  goToPreviousPage,
  goToNextPage,
  goToLastPage,
  renderPageNumbers,
  currentPage,
  totalPages
}: Props<T>) => {
  const { t } = useTranslation("emailbar")
  const allowDrop = (e: any) => {
    e.preventDefault()
  }

  // const highlightDrop = (e: any) => {
  //     e.target.style.background = "#343541"
  // }
  //
  // const removeHighlight = (e: any) => {
  //     e.target.style.background = "none"
  // }

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEmailPopupOpen, setIsEmailPopupOpen] = useState(false)

  const observer = useRef<IntersectionObserver | null>(null)
  const loader = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const intersectionObserver = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setPage(prevPage => prevPage + 1)
      }
    })
    if (loader.current) {
      intersectionObserver.observe(loader.current)
    }
    return () => {
      if (loader.current) {
        intersectionObserver.unobserve(loader.current)
      }
    }
  }, [])
  const handleSettingsClick = async () => {
    setIsModalOpen(true)
  }
  const openEmailPopup = () => {
    setIsEmailPopupOpen(true)
  }

  const closeEmailPopup = () => {
    setIsEmailPopupOpen(false)
  }

  useEffect(() => {
    console.log(isEmailPopupOpen)
  }, [isEmailPopupOpen])

  const handleSaveCredentials = async (email, password) => {
    console.log(email, password, userId)
    if (userId != "") {
      const c = {
        email: email + "@gmail.com",
        email_key: password,
        user_id: userId
      }
      console.log(c)

      setCredentials(c)
      if (isSaved) {
        const { data, error } = await supabase
          .from("email_account")
          .update(c)
          .eq("user_id", userId)
        console.log(data, error)
      } else {
        const { data, error } = await supabase
          .from("email_account")
          .insert([c])
          .select("*")

        console.log(data, error)
      }
      handleRefreshClick(c)
    }
  }

  return isOpen ? (
    <div>
      <div
        className={`fixed top-0 z-40 flex h-full w-[260px] flex-none flex-col space-y-2 bg-[#202123] p-2 text-[14px] transition-all sm:relative sm:top-0`}
      >
        {/* 상단 버튼 및 검색 영역 */}
        <div className="flex w-full items-center space-x-1">
          <button
            className="text-sidebar flex w-3/5 shrink-0 cursor-pointer select-none items-center gap-3 rounded-md border border-white/20 p-3 text-white transition-colors duration-200 hover:bg-gray-500/10"
            onClick={() => {
              openEmailPopup()
              handleSearchTerm("")
            }}
          >
            <IconPlus size={16} />
            {addItemButtonTitle}
          </button>
          <button
            className="text-sidebar flex shrink-0 cursor-pointer select-none items-center gap-1 rounded-md p-3 text-white transition-colors duration-200 hover:bg-gray-500/10"
            onClick={handleSettingsClick}
          >
            <IconSettings size={20} />
          </button>
          <button
            className="text-sidebar flex shrink-0 cursor-pointer select-none items-center gap-1 rounded-md p-3 text-white transition-colors duration-200 hover:bg-gray-500/10"
            onClick={handleRefreshClick}
          >
            <IconRefresh size={20} />
          </button>
        </div>

        <Search
          placeholder={t("Search...") || ""}
          searchTerm={searchTerm}
          onSearch={handleSearchTerm}
        />

        {/* 이메일 목록 영역 */}
        {loading ? (
          <div className="flex grow items-center justify-center overflow-auto">
            <IconLoader2
              className="animate-spin text-white opacity-50"
              size={48}
            />
          </div>
        ) : (
          <div className="grow overflow-auto">
            {currentEmails.length > 0 ? (
              <div className="pt-2">
                {currentEmails.map((email, index) => (
                  <EmailComponent key={index} email={email} />
                ))}
              </div>
            ) : (
              <div className="mt-8 select-none text-center text-white opacity-50">
                <IconMistOff className="mx-auto mb-3" />
                <span className="text-[14px] leading-normal">No data.</span>
              </div>
            )}
          </div>
        )}

        {/* 페이지네이션 숫자 버튼 */}
        <div className="mt-4 flex items-center justify-center space-x-1">
          {/* 처음 페이지 버튼 */}
          <button
            className="rounded-full px-2 py-1  text-white"
            onClick={goToFirstPage}
            disabled={currentPage === 1}
          >
            «
          </button>

          {/* 이전 페이지 버튼 */}
          <button
            className="rounded-full px-2 py-1  text-white"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            ‹
          </button>

          {/* 페이지 번호 버튼 */}
          {renderPageNumbers()}

          {/* 다음 페이지 버튼 */}
          <button
            className="rounded-full px-2 py-1  text-white"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            ›
          </button>

          {/* 마지막 페이지 버튼 */}
          <button
            className="rounded-full px-2 py-1 text-white"
            onClick={goToLastPage}
            disabled={currentPage === totalPages}
          >
            »
          </button>
        </div>

        {footerComponent}
      </div>

      {/* 모달 및 팝업 영역 */}
      <SettingsSheet
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveCredentials}
        isSaved={isSaved}
        credentials={credentials}
      />
      <EmailPopup
        isOpen={isEmailPopupOpen}
        onClose={closeEmailPopup}
        credentials={credentials}
      />
    </div>
  ) : (
    <div></div>
  )
}

export default Sidebar
