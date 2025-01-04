import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/browser-client"
import { IconLogout } from "@tabler/icons-react"
import { useRouter } from "next/navigation"
import { FC } from "react"

interface SignoutButtonProps {
  onSignOut: () => void
}

const SignoutButton: FC<SignoutButtonProps> = ({ onSignOut }) => {
  const router = useRouter()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
    return
  }

  return (
    <button
      className="flex w-full  rounded-md px-4 py-2 text-white transition-colors duration-200 hover:bg-gray-600"
      onClick={handleSignOut}
    >
      <IconLogout className="mr-1" size={20} />
      로그아웃 하기
    </button>
  )
}

export default SignoutButton
