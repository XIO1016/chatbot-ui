import { FC, useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { useCreateReducer } from "@/lib/hooks/useCreateReducer"
import { Email } from "@/types/email"
import EmailbarContext from "./EmailBar.context"
import { EmailbarInitialState, initialState } from "./Emailbar.state"
import EmailSidebar from "@/components/email/components/EmailSidebar"
import HomeContext from "@/context/homecontext"
import { supabase } from "@/lib/supabase/browser-client"
import pLimit from "p-limit"

const Emailbar: FC = () => {
  const { t } = useTranslation("emailbar")

  const emailBarContextValue = useCreateReducer<EmailbarInitialState>({
    initialState
  })

  const {
    state: { showEmailbar },
    dispatch: homeDispatch
  } = useContext(HomeContext)

  const [currentEmails, setCurrentEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(false)
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [prevPageTokens, setPrevPageTokens] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState<number | null>(null)

  const handleToggleEmailbar = () => {
    homeDispatch({ field: "showEmailbar", value: !showEmailbar })
    localStorage.setItem("showEmailbar", JSON.stringify(!showEmailbar))
  }

  const fetchEmails = async (pageToken?: string) => {
    try {
      setLoading(true)

      // Get session and access token
      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session || !session.provider_token) {
        throw new Error("Google access token is not available.")
      }

      const accessToken = session.provider_token

      // Fetch email list
      const response = await fetch(
        `https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=10${
          pageToken ? `&pageToken=${pageToken}` : ""
        }`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      )

      if (!response.ok) {
        const errorDetails = await response.json()
        throw new Error(`Failed to fetch emails: ${errorDetails.error.message}`)
      }

      const data = await response.json()
      const {
        messages,
        nextPageToken: newNextPageToken,
        resultSizeEstimate
      } = data

      // Fetch email details with a limit of 5 concurrent requests
      const limit = pLimit(5)
      const emailDetails = await Promise.all(
        messages.map((message: any) =>
          limit(async () => {
            const detailResponse = await fetch(
              `https://www.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
              {
                method: "GET",
                headers: { Authorization: `Bearer ${accessToken}` }
              }
            )
            if (!detailResponse.ok) {
              throw new Error("Failed to fetch email details.")
            }
            const detailData = await detailResponse.json()
            return {
              id: detailData.id,
              snippet: detailData.snippet,
              payload: detailData.payload
            }
          })
        )
      )

      // Update state
      setCurrentEmails(emailDetails)
      setNextPageToken(newNextPageToken || null)

      // Calculate total pages if not already set
      if (resultSizeEstimate && !totalPages) {
        setTotalPages(Math.ceil(resultSizeEstimate / 10))
      }
    } catch (error) {
      console.error("Error fetching emails:", error)
    } finally {
      setLoading(false)
    }
  }

  const goToNextPage = () => {
    if (nextPageToken) {
      setPrevPageTokens(prev => [...prev, nextPageToken])
      setCurrentPage(prev => prev + 1)
      fetchEmails(nextPageToken)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      const prevPageToken = prevPageTokens[prevPageTokens.length - 1]
      setPrevPageTokens(prev => prev.slice(0, -1))
      setCurrentPage(prev => prev - 1)
      fetchEmails(prevPageToken)
    }
  }

  const goToFirstPage = () => {
    setPrevPageTokens([])
    setCurrentPage(1)
    fetchEmails()
  }

  const goToLastPage = () => {
    console.error("Google API doesn't support direct access to the last page.")
  }

  useEffect(() => {
    fetchEmails()
  }, [])

  return (
    <EmailbarContext.Provider value={emailBarContextValue}>
      <EmailSidebar<Email>
        side={"right"}
        isOpen={showEmailbar}
        addItemButtonTitle={t("New email")}
        items={currentEmails}
        toggleOpen={handleToggleEmailbar}
        loading={loading}
        renderPageNumbers={() => (
          <span>
            {currentPage} / {totalPages || "?"}
          </span>
        )}
        goToFirstPage={goToFirstPage}
        goToPreviousPage={goToPreviousPage}
        goToNextPage={goToNextPage}
        goToLastPage={goToLastPage}
        currentPage={currentPage}
        totalPages={totalPages || 1}
      />
    </EmailbarContext.Provider>
  )
}

export default Emailbar
