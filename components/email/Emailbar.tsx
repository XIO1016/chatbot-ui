import { useContext, useEffect } from "react"
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

  // const handleCreateEmail = () => {
  //   const newEmail: Email = {
  //     sender_email: "mythist@gmail.com",
  //     receiver_email : "",
  //     name: "mythist",
  //     title: `New email`, // ${emails.length + 1}
  //     content: '',
  //     folderId: null,
  //   };

  //   const updatedEmails = [...emails, newEmail];

  //   homeDispatch({ field: 'emails', value: updatedEmails });

  //   saveEmails(updatedEmails);
  // };

  // const handleDeleteEmail = (email: Email) => {
  //   const updatedPrompts = prompts.filter((p) => p.id !== prompt.id);

  //   homeDispatch({ field: 'prompts', value: updatedPrompts });
  //   savePrompts(updatedPrompts);
  // };

  // const handleUpdateEmail = (prompt: Prompt) => {
  //   const updatedPrompts = prompts.map((p) => {
  //     if (p.id === prompt.id) {
  //       return prompt;
  //     }

  //     return p;
  //   });
  //   homeDispatch({ field: 'prompts', value: updatedPrompts });

  //   savePrompts(updatedPrompts);
  // };

  // const handleDrop = (e: any) => {
  //   if (e.dataTransfer) {
  //     const prompt = JSON.parse(e.dataTransfer.getData('prompt'));

  //     const updatedPrompt = {
  //       ...prompt,
  //       folderId: e.target.dataset.folderId,
  //     };

  //     handleUpdatePrompt(updatedPrompt);

  //     e.target.style.background = 'none';
  //   }
  // };

  // 가장 최근의 이메일을 Gmail에서 가져오는 함수
  const fetchRecentEmails = async (): Promise<Email[]> => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_TEST + `/get_recent_emails`,
        { mode: "no-cors" }
      )
      console.log(response)

      if (!response.ok) {
        throw new Error("Failed to fetch recent emails")
      }
      const emails = await response.json()
      //console.log(emails);
      return emails
    } catch (error) {
      console.error("Error fetching recent emails:", error)
      return []
    }
  }

  useEffect(() => {
    if (searchTerm || searchTerm != "") {
      fetchRecentEmails().then(recentEmails => {
        emailDispatch({
          field: "filteredEmails",
          value: recentEmails.filter(email => {
            const searchable =
              email.name.toLowerCase() +
              " " +
              email.title.toLowerCase() +
              " " +
              email.sender_email.toLowerCase() +
              " " +
              email.receiver_email.toLowerCase() +
              " " +
              email.content.toLowerCase()

            return searchable.includes(searchTerm.toLowerCase())
          })
        })
      })
    } else {
      fetchRecentEmails().then(recentEmails => {
        console.log(recentEmails)
        emailDispatch({
          field: "filteredEmails",
          value: recentEmails
        })
      })
    }
  }, [searchTerm, emails])

  return (
    <EmailbarContext.Provider
      value={{
        ...emailBarContextValue
        // handleCreatePrompt,
        // handleDeletePrompt,
        // handleUpdatePrompt,
      }}
    >
      <EmailSidebar<Email>
        side={"right"}
        isOpen={showEmailbar}
        addItemButtonTitle={t("New email")}
        itemComponent={
          Array.isArray(filteredEmails) ? (
            <Emails emails={filteredEmails.filter(email => !email.folderId)} />
          ) : (
            <div>No emails to display</div>
          )
        }
        //folderComponent={<PromptFolders />}
        items={filteredEmails}
        searchTerm={searchTerm}
        handleSearchTerm={(searchTerm: string) =>
          emailDispatch({ field: "searchTerm", value: searchTerm })
        }
        toggleOpen={handleToggleEmailbar}
        // handleCreateItem={handleCreatePrompt}
        // handleCreateFolder={() => handleCreateFolder(t('New folder'), 'prompt')}
        // handleDrop={handleDrop}
      />
    </EmailbarContext.Provider>
  )
}

export default Emailbar
