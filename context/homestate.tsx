import { Email } from "@/types/email"
import { toolEmail } from "@/types/tools"

export interface HomeInitialState {
  loading: boolean
  lightMode: "light" | "dark"
  emails: Email[]
  showEmailbar: boolean
  searchTerm: string
  email: toolEmail | undefined
  showModal: boolean
}

export const initialState: HomeInitialState = {
  loading: false,
  lightMode: "dark",
  emails: [],
  showEmailbar: true,
  searchTerm: "",
  email: undefined,
  showModal: false
}
