// components/EmailPopup.js
import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"

export default function EmailPopup({
  isOpen,
  onClose,
  credentials
}: {
  isOpen: boolean
  onClose: () => void
  credentials: { email: string; email_key: string }
}) {
  const [to, setTo] = useState<string>("")
  const [subject, setSubject] = useState<string>("")
  const [body, setBody] = useState<string>("")
  const [isSending, setIsSending] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSending(true)
    try {
      const response = await fetch("/api/email/send-mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to,
          subject,
          body,
          email: credentials.email,
          email_key: credentials.email_key
        })
      })
      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Success",
          description: data.message
        })
        onClose()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send email")
      }
    } catch (error) {
      toast({
        title: "오류",
        description:
          error instanceof Error
            ? error.message
            : "이메일 전송에 실패했습니다. 다시 시도해 주세요.",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Email</DialogTitle>
          <DialogDescription>Compose your email here.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="to"
              className="block text-sm font-medium text-gray-700"
            >
              To:
            </label>
            <Input
              type="email"
              id="to"
              value={to}
              onChange={e => setTo(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700"
            >
              Subject:
            </label>
            <Input
              type="text"
              id="subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="body"
              className="block text-sm font-medium text-gray-700"
            >
              Message:
            </label>
            <Textarea
              id="body"
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={5}
              required
            />
          </div>
          <Button type="submit" disabled={isSending}>
            {isSending ? "Sending..." : "Send Email"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
