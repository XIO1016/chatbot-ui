import { Email } from "@/types/email"

export interface EmailbarInitialState {
  searchTerm: string
  filteredEmails: Email[]
}

export const initialState: EmailbarInitialState = {
  searchTerm: "",
  filteredEmails: []
}
