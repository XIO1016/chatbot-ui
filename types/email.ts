// import { OpenAIModel } from './openai';

export interface Email {
  id: string
  sender_email: string
  receiver_email: string
  name: string
  title: string
  content: string
  date: string
  folderId: string | null
}
