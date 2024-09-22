import React from "react"
import { Trash } from "lucide-react"
import { deleteAllChat } from "@/db/chats"

const DeleteButton = ({ routerPush }: { routerPush: () => Promise<void> }) => {
  return (
    <div>
      <div className="mb-2 w-full border-t border-gray-600"></div>
      <button
        className="flex w-full  rounded-md px-4 py-2 text-white transition-colors duration-200 hover:bg-gray-600"
        onClick={async () => {
          if (
            window.confirm(
              "모든 채팅을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
            )
          ) {
            try {
              await deleteAllChat()
              alert("모든 채팅이 삭제되었습니다.")
              await routerPush()
              // 여기에 상태를 업데이트하거나 페이지를 새로고침하는 로직을 추가할 수 있습니다.
            } catch (error) {
              console.error("채팅 삭제 중 오류 발생:", error)
              alert("채팅 삭제 중 오류가 발생했습니다.")
            }
          }
        }}
      >
        <Trash size={18} className="mr-2" />
        대화 지우기
      </button>
    </div>
  )
}

export default DeleteButton
