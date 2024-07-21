// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { TextareaAutosize } from "@/components/ui/textarea-autosize"
// import { PROMPT_NAME_MAX } from "@/db/limits"
// import { Tables } from "@/supabase/types"
// import { IconPencil } from "@tabler/icons-react"
// import { FC, useState } from "react"
// import { SidebarItem } from "../all/sidebar-display-item"
// import {Email} from "@/types/email";
//
// interface EmailItemProps {
//   email: Email
// }
//
// export const EmailItem: FC<EmailItemProps> = ({ email }) => {
//   const [name, setName] = useState(email.name)
//   const [content, setContent] = useState(email.content)
//   const [isTyping, setIsTyping] = useState(false)
//   return (
//     <SidebarItem
//       item={email}
//       isTyping={isTyping}
//       contentType="email"
//       icon={<IconPencil size={30} />}
//       updateState={{ name, content }}
//       renderInputs={() => (
//         <>
//           <div className="space-y-1">
//             <Label>Name</Label>
//
//             <Input
//               placeholder="Email name..."
//               value={name}
//               onChange={e => setName(e.target.value)}
//               maxLength={PROMPT_NAME_MAX}
//               onCompositionStart={() => setIsTyping(true)}
//               onCompositionEnd={() => setIsTyping(false)}
//             />
//           </div>
//
//           <div className="space-y-1">
//             <Label>Email</Label>
//
//             <TextareaAutosize
//               placeholder="Email..."
//               value={content}
//               onValueChange={setContent}
//               minRows={6}
//               maxRows={20}
//               onCompositionStart={() => setIsTyping(true)}
//               onCompositionEnd={() => setIsTyping(false)}
//             />
//           </div>
//         </>
//       )}
//     />
//   )
// }
