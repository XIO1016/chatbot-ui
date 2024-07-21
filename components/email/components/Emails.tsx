import { FC } from "react"

import { Email } from "@/types/email"
import { EmailComponent } from "./Email"

interface Props {
  emails: Email[]
}

export const Emails: FC<Props> = ({ emails }) => {
  return (
    <div className="flex w-full flex-col gap-1">
      {emails
        .slice()
        //.reverse()
        .map((email, index) => (
          <EmailComponent key={index} email={email} />
        ))}
    </div>
  )
}
