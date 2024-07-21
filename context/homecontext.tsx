import { Dispatch, createContext } from "react"

import { ActionType } from "@/lib/hooks/useCreateReducer"

import { HomeInitialState } from "./homestate"
import { toolEmail } from "@/types/tools"

export interface HomeContextProps {
  state: HomeInitialState
  dispatch: Dispatch<ActionType<HomeInitialState>>
  // handleNewConversation: () => void;
  // handleDeleteFolder: (folderId: string) => void;
  // handleUpdateFolder: (folderId: string, name: string) => void;
  // // handleSelectConversation: (conversation: Conversation) => void;
  // handleUpdateConversation: (
  //   conversation: Conversation,
  //   data: KeyValuePair,
  // ) => void;
  handleUpdateEmail: (email: toolEmail) => void
}

const HomeContext = createContext<HomeContextProps>(undefined!)

export default HomeContext
