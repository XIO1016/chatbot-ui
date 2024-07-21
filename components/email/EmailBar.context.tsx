import { Dispatch, createContext } from "react"

import { ActionType } from "@/lib/hooks/useCreateReducer"

import { Email } from "@/types/email"

import { EmailbarInitialState } from "./Emailbar.state"

export interface EmailbarContextProps {
  state: EmailbarInitialState
  dispatch: Dispatch<ActionType<EmailbarInitialState>>
  // handleCreatePrompt: () => void;
  // handleDeletePrompt: (email: Email) => void;
  // handleUpdatePrompt: (email: Email) => void;
}

const EmailbarContext = createContext<EmailbarContextProps>(undefined!)

export default EmailbarContext
