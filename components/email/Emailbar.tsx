import { useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { useCreateReducer } from "@/lib/hooks/useCreateReducer"

//import { savePrompts } from '@/utils/app/prompts';
import { Email } from "@/types/email"

// import { PromptFolders } from './components/PromptFolders';
// import { PromptbarSettings } from './components/PromptbarSettings';
// import { Prompts } from './components/Prompts';
import { Emails } from "./components/Emails"

// import PromptbarContext from './PromptBar.context';
import EmailbarContext from "./EmailBar.context"
// import { PromptbarInitialState, initialState } from './Promptbar.state';
import { EmailbarInitialState, initialState } from "./Emailbar.state"
import EmailSidebar from "@/components/email/components/EmailSidebar"
import HomeContext from "@/context/homecontext"
import { supabase } from "@/lib/supabase/browser-client"

interface Email {
  email_id: string
  title: string
  sender_email: string
  date: string
  content: string
}

interface EmailRequest {
  // user_id: string;  // UUID 형식의 문자열
  user_email: string // UUID 형식의 문자열
  user_password: string // UUID 형식의 문자열
  search_unread?: boolean
  sender?: string
  subject?: string
  since_date?: string
  before_date?: string
  num_emails?: number
}

const fetchRecentEmails = async (
  request: EmailRequest,
  page: number,
  limit: number = 42
): Promise<[number, Email[]]> => {
  try {
    const queryParams = new URLSearchParams({
      user_email: request.user_email,
      user_password: request.user_password,
      search_unread: request.search_unread ? "false" : "true",
      sender: request.sender || "",
      subject: request.subject || "",
      since_date: request.since_date || "",
      before_date: request.before_date || "",
      limit: limit.toString(),
      page: page.toString()
    }).toString()

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_TEST}/get_recent_emails?${queryParams}`,
      {
        method: "GET"
      }
    )

    if (!response.ok) {
      throw new Error("Failed to fetch recent emails")
    }

    // FastAPI에서 반환하는 데이터 형식에 맞게 처리
    const data = await response.json()

    if (!Array.isArray(data.emails)) {
      throw new Error("Invalid response format")
    }

    return [data.total_emails as number, data.emails as Email[]] // FastAPI에서 반환한 이메일 목록을 반환
  } catch (error) {
    console.error("Error fetching recent emails:", error)
    return []
  }
}
const Emailbar = () => {
  const { t } = useTranslation("emailbar")

  const emailBarContextValue = useCreateReducer<EmailbarInitialState>({
    initialState
  })

  const {
    state: { emails, showEmailbar },
    dispatch: homeDispatch
  } = useContext(HomeContext)

  const {
    state: { searchTerm, filteredEmails },
    dispatch: emailDispatch
  } = emailBarContextValue

  const handleToggleEmailbar = () => {
    homeDispatch({ field: "showEmailbar", value: !showEmailbar })
    localStorage.setItem("showEmailbar", JSON.stringify(!showEmailbar))
  }

  const [isSaved, setIsSaved] = useState(false)
  const [credentials, setCredentials] = useState({
    email: "",
    email_key: "",
    user_id: ""
  })
  const [userId, setUserId] = useState("")

  const [page, setPage] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [totalPages, setTotalPages] = useState<number>(0) // 총 페이지 수 상태 추가
  const [fetchedEmails, setFetchedEmails] = useState<{
    [page: number]: Email[]
  }>({}) // 페이지별 이메일 저장
  const [currentEmails, setCurrentEmails] = useState<Email[]>([]) // 현재 페이지의 이메일 저장
  const itemsPerPage = 14 // 한 페이지당 보여줄 이메일 개수
  const [isNextButtonClicked, setIsNextButtonClicked] = useState<boolean>(false)

  // 이메일 데이터를 페치하는 함수 (42개씩 가져오기)
  const fetchData = async (
    pageToFetch: number,
    fetchTotalPages: boolean = false
  ) => {
    if (loading) return
    setLoading(true)

    const {
      data: { session }
    } = await supabase.auth.getSession()
    if (session) {
      const tmpUserId = session?.user.id ?? ""
      setUserId(tmpUserId)

      const { data } = await supabase
        .from("email_account")
        .select("*")
        .eq("user_id", tmpUserId)

      if (data && data.length > 0) {
        setCredentials({
          email: data[0].email,
          email_key: data[0].email_key,
          user_id: tmpUserId
        })
        setIsSaved(true)

        const emailRequest: EmailRequest = {
          user_email: data[0].email,
          user_password: data[0].email_key,
          search_unread: true,
          num_emails: 42 // 한 번에 42개 페치
        }

        try {
          if (fetchTotalPages) {
            const [totalEmails, emailsBatch] = await fetchRecentEmails(
              emailRequest,
              pageToFetch
            )

            console.log(totalEmails, emailsBatch)
            // 총 페이지 계산
            setTotalPages(Math.ceil(totalEmails / itemsPerPage))
            // 이메일 데이터 저장
            setFetchedEmails(prev => ({
              ...prev,
              [pageToFetch]: emailsBatch // 페이지별로 저장
            }))
            setCurrentEmails(emailsBatch.slice(0, itemsPerPage)) // 처음 14개를 currentEmails로 설정
          } else {
            const [totalEmails, emailsBatch] = await fetchRecentEmails(
              emailRequest,
              pageToFetch
            )

            // 이메일 데이터 append 및 currentEmails 업데이트
            setFetchedEmails(prev => ({
              ...prev,
              [pageToFetch]: emailsBatch // 페이지별로 저장
            }))
            setCurrentEmails(emailsBatch.slice(0, itemsPerPage)) // 새로운 42개의 첫 14개
          }
        } catch (error) {
          console.error("Error fetching emails or total email count:", error)
        }
      }
    }

    setLoading(false)
  }
  useEffect(() => {
    console.log(totalPages)
  }, [totalPages])

  // 페이지 변경 시 currentEmails 업데이트 (페이지에 맞는 14개의 이메일 설정)
  useEffect(() => {
    const startIndex = ((page - 1) % 3) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    // console.log(fetchedEmails)

    // 이미 저장된 페이지가 있는지 확인하고 설정, 없으면 데이터 페치
    if (fetchedEmails[Math.ceil(page / 3)]) {
      setCurrentEmails(
        fetchedEmails[Math.ceil(page / 3)]?.slice(startIndex, endIndex) || []
      )
    } else {
      fetchData(Math.ceil(page / 3), false).then(() => {
        setCurrentEmails(
          fetchedEmails[Math.ceil(page / 3)]?.slice(startIndex, endIndex) || []
        )
      })
    }
  }, [page, fetchedEmails])

  // 다음 3페이지 묶음 데이터를 페치
  const fetchNextPageSet = async () => {
    const nextPageSet = Math.ceil((page + 1) / 3)
    if (!fetchedEmails[nextPageSet]) {
      await fetchData(nextPageSet, false) // 새로운 42개 데이터 페치
    }
    setPage(prev => prev + 1) // 다음 페이지로 이동
  }

  // 다음 페이지로 이동 (3페이지 단위로)
  const goToNextPage = async () => {
    const nextPage = page + 1

    if (nextPage % 3 === 1) {
      // 3의 배수 페이지일 때 새로운 묶음 페치
      setIsNextButtonClicked(true)
      await fetchNextPageSet()
    } else {
      setPage(nextPage) // 페이지 설정
    }
  }

  // 마지막 페이지로 이동 (fetch only if needed)
  const goToLastPage = async () => {
    if (currentEmails.length === 0) {
      await fetchData(totalPages, false)
    }

    setPage(totalPages)
  }

  const goToFirstPage = () => setPage(1)

  const goToPreviousPage = async () => {
    if (page > 1) {
      if (currentEmails.length === 0) {
        await fetchData(totalPages, false)
      }
      setPage(page - 1)
    }
  }

  const renderPageNumbers = () => {
    const pageNumbers = []
    const pageRange = 3 // 페이지 세트를 3개씩 묶음
    const currentSet = Math.floor((page - 1) / pageRange) // 현재 페이지가 속한 세트 계산
    const startPage = currentSet * pageRange + 1
    const endPage = Math.min(startPage + pageRange - 1, totalPages) // 총 페이지가 끝날 경우 대비

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`mx-1 rounded-full px-3 py-2 ${
            page === i ? "text-blue-400" : "text-gray-300 hover:text-white"
          }`}
          onClick={() => setPage(i)}
        >
          {i}
        </button>
      )
    }
    return pageNumbers
  }

  // 첫 데이터 페치
  useEffect(() => {
    fetchData(1, true) // 처음 페이지에서는 첫 번째 42개 이메일 페치 및 totalPages 호출
  }, [])

  return (
    <EmailbarContext.Provider value={emailBarContextValue}>
      <EmailSidebar<Email>
        side={"right"}
        isOpen={showEmailbar}
        addItemButtonTitle={t("New email")}
        itemComponent={
          Array.isArray(currentEmails) ? (
            <Emails emails={currentEmails} />
          ) : (
            <div>No emails to display</div>
          )
        }
        items={currentEmails}
        searchTerm={searchTerm}
        handleSearchTerm={(searchTerm: string) =>
          emailDispatch({ field: "searchTerm", value: searchTerm })
        }
        toggleOpen={handleToggleEmailbar}
        isSaved={isSaved}
        credentials={credentials}
        setCredentials={setCredentials}
        userId={userId}
        filteredEmails={filteredEmails}
        page={page}
        setPage={setPage}
        handleRefreshClick={() => {
          fetchData(1)
          setPage(1)
        }}
        loading={loading}
        currentEmails={currentEmails}
        goToFirstPage={goToFirstPage}
        goToPreviousPage={goToPreviousPage}
        goToNextPage={goToNextPage}
        goToLastPage={goToLastPage}
        renderPageNumbers={renderPageNumbers}
        currentPage={page}
        totalPages={totalPages}
      />
    </EmailbarContext.Provider>
  )
}

export default Emailbar
