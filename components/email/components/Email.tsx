import {
  IconBulbFilled,
  IconCheck,
  IconTrash,
  IconX
} from "@tabler/icons-react"
import {
  DragEvent,
  MouseEventHandler,
  useContext,
  useEffect,
  useState
} from "react"

//import { Prompt } from '@/types/prompt';
import { Email } from "@/types/email"

// import PromptbarContext from '../PromptBar.context';
import EmailbarContext from "../EmailBar.context"
import { EmailModal } from "./EmailModal"
import { useChatHandler } from "@/components/chat/chat-hooks/use-chat-handler"
//import { PromptModal } from './PromptModal';

interface Props {
  email: Email
}

export const EmailComponent = ({ email }: Props) => {
  const {
    dispatch: emailDispatch
    //handleUpdatePrompt,
    // handleDeletePrompt,
  } = useContext(EmailbarContext)

  const [showModal, setShowModal] = useState<boolean>(false)
  // const [isDeleting, setIsDeleting] = useState(false);
  // const [isRenaming, setIsRenaming] = useState(false);
  // const [renameValue, setRenameValue] = useState('');

  // const handleUpdate = (email: Email) => {
  //   handleUpdatePrompt(prompt);
  //   promptDispatch({ field: 'searchTerm', value: '' });
  // };

  // const handleDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
  //   e.stopPropagation();

  //   if (isDeleting) {
  //     handleDeletePrompt(prompt);
  //     promptDispatch({ field: 'searchTerm', value: '' });
  //   }

  //   setIsDeleting(false);
  // };

  // const handleCancelDelete: MouseEventHandler<HTMLButtonElement> = (e) => {
  //   e.stopPropagation();
  //   setIsDeleting(false);
  // };

  // const handleOpenDeleteModal: MouseEventHandler<HTMLButtonElement> = (e) => {
  //   e.stopPropagation();
  //   setIsDeleting(true);
  // };

  // const handleDragStart = (e: DragEvent<HTMLButtonElement>, email: Email) => {
  //   if (e.dataTransfer) {
  //     e.dataTransfer.setData('email', JSON.stringify(email));
  //   }
  // };

  // useEffect(() => {
  //   if (isRenaming) {
  //     setIsDeleting(false);
  //   } else if (isDeleting) {
  //     setIsRenaming(false);
  //   }
  // }, [isRenaming, isDeleting]);
  const {
    chatInputRef,
    handleSendMessage,
    handleEmailChat,
    handleStopMessage,
    handleFocusChatInput,
    handleNewChat
  } = useChatHandler()

  const onChatWithGTN = () => {
    console.log("Chat with GTN")
    setShowModal(false)
    handleEmailChat(email, [], false)
  }

  return (
    <div className="relative flex items-center">
      <button
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm transition-colors duration-200 hover:bg-[#343541]/90"
        // draggable="true"
        onClick={e => {
          e.stopPropagation()
          setShowModal(true)
        }}
        // onDragStart={(e) => handleDragStart(e, prompt)}
        // onMouseLeave={() => {
        //   setIsDeleting(false);
        //   setIsRenaming(false);
        //   setRenameValue('');
        // }}
      >
        <IconBulbFilled size={18} />

        <div className="relative max-h-5 flex-1 truncate break-all pr-4 text-left text-[12.5px] leading-3">
          {email.title}
        </div>
      </button>

      {/* {(isDeleting || isRenaming) && (
        <div className="absolute right-1 z-10 flex text-gray-300">
          <SidebarActionButton handleClick={handleDelete}>
            <IconCheck size={18} />
          </SidebarActionButton>

          <SidebarActionButton handleClick={handleCancelDelete}>
            <IconX size={18} />
          </SidebarActionButton>
        </div>
      )}

      {!isDeleting && !isRenaming && (
        <div className="absolute right-1 z-10 flex text-gray-300">
          <SidebarActionButton handleClick={handleOpenDeleteModal}>
            <IconTrash size={18} />
          </SidebarActionButton>
        </div>
      )} */}

      {showModal && (
        <EmailModal
          email={email}
          onClose={() => setShowModal(false)}
          onChatWithGTN={onChatWithGTN}
          //          onUpdatePrompt={handleUpdate}
        />
      )}
    </div>
  )
}
