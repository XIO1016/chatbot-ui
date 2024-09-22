import React, { useEffect, useRef, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai"

const SettingsSheet = ({
  isOpen,
  onOpenChange,
  onSave,
  isSaved,
  credentials
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSave: (email: string, password: string) => void
  isSaved: boolean
  credentials: { email: string; email_key: string }
}) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  // const [confirmPassword, setConfirmPassword] = useState('');
  // const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!isSaved) return
    setEmail(credentials.email.split("@")[0] || "")
    setPassword(credentials.email_key || "")
  }, [credentials])
  const toggleShowPassword = () => {
    setShowPassword(!showPassword)
  }

  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleSave = () => {
    if (email && password) {
      onSave(email, password)
      onOpenChange(false)
    } else {
      alert("Please enter both email and password.")
    }
  }

  const handleEdit = () => {
    setEmail(credentials.email || "")
    setPassword(credentials.email_key || "")
    // setIsSaved(false);
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent>
        <div className="grow overflow-auto p-4">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between space-x-2">
              <div>Email Settings</div>
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Label>GMAIL 주소</Label>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <Input
                    className="w-2/3 pr-10"
                    placeholder="test1234..."
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                  <span>@gmail.com</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Label>GMAIL 비밀번호</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  className="pr-10"
                  placeholder="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  onClick={toggleShowPassword}
                  className="rounded px-2 py-1"
                >
                  {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                </button>
              </div>
            </div>
            {/*{!isSaved && (*/}
            {/*    <div className="space-y-4">*/}
            {/*        <div className="flex items-center space-x-2">*/}
            {/*            <Label>비밀번호 확인</Label>*/}
            {/*        </div>*/}
            {/*        <div className="flex items-center space-x-2">*/}
            {/*            <Input*/}
            {/*                className="pr-10"*/}
            {/*                placeholder="비밀번호 확인"*/}
            {/*                type="password"*/}
            {/*                value={confirmPassword}*/}
            {/*                onChange={handleConfirmPasswordChange}*/}
            {/*            />*/}
            {/*        </div>*/}
            {/*        {!passwordsMatch && (*/}
            {/*            <div className="text-red-500 text-sm">*/}
            {/*                비밀번호가 일치하지 않습니다.*/}
            {/*            </div>*/}
            {/*        )}*/}
            {/*    </div>*/}
            {/*)}*/}
            <div className="mt-6 flex justify-end space-x-2">
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button ref={buttonRef} onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default SettingsSheet
