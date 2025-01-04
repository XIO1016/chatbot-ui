"use client"

import { useEffect, useState, useContext } from "react"
import { useRouter } from "next/navigation"
import { ChatbotUIContext } from "@/context/context"
import { supabase } from "@/lib/supabase/browser-client"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

import { getProfileByUserId, updateProfile } from "@/db/profile"
import { getWorkspacesByUserId, updateWorkspace } from "@/db/workspaces"
import { TablesUpdate } from "@/supabase/types"
import { User } from "@supabase/supabase-js"
import { useAuth } from "@/context/authcontext"

import Loading from "../loading"

/**
 * 구글 OAuth 전용 회원가입(로그인) 페이지
 */
export default function SignUpPage() {
  const router = useRouter()
  const { setProfile } = useContext(ChatbotUIContext)
  const { setAccessToken } = useAuth()

  const [loading, setLoading] = useState(false)
  const [signupErrorMessage, setSignupErrorMessage] = useState("")

  // 페이지 마운트 시, 이미 로그인된 세션이 있는지 체크
  useEffect(() => {
    checkSessionAndSetup()
  }, [])

  /**
   * 세션이 존재하면 handleSaveSetupSetting()을 호출해
   * 프로필, 워크스페이스 등 초기 설정을 진행
   */
  const checkSessionAndSetup = async () => {
    setLoading(true)
    try {
      const sessionRes = await supabase.auth.getSession()
      const session = sessionRes.data.session

      if (session) {
        await handleSaveSetupSetting()
      }
    } catch (err) {
      console.error("Error checking session:", err)
    } finally {
      setLoading(false)
    }
  }
  /**
   * 구글로 OAuth 회원가입(로그인)
   * - 구글 인증 완료 후, Supabase가 지정한 redirectTo URL로 돌아옴
   * - 돌아온 뒤에 session이 있으면, handleSaveSetupSetting() 등을 수행
   */
  const handleGoogleSignUp = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://anthrometa.com:8443/auth/v1/callback"
        }
      })

      console.log("OAuth Response:", data, error)

      if (error) throw error

      console.log("OAuth Data:", data)

      router.push("/dashboard")
    } catch (error) {
      console.error("Error signing in with Google:", error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 프로필, 워크스페이스 초기 세팅
   * - 프로필 레코드 업데이트(또는 생성)
   * - 기본 워크스페이스 업데이트
   * - email_account 테이블에 사용자 이메일 정보 추가 등
   */
  const handleSaveSetupSetting = async () => {
    setLoading(true)
    try {
      const session = (await supabase.auth.getSession()).data.session
      if (!session) {
        return router.push("/login")
      }

      const accessToken = session.provider_token // Google OAuth 액세스 토큰
      const user = session.user

      // Gmail API 호출
      const fetchEmails = async (accessToken: string) => {
        try {
          const response = await fetch(
            "https://www.googleapis.com/gmail/v1/users/me/messages",
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          )
          const data = await response.json()
          console.log("Emails:", data)
        } catch (error) {
          console.error("Error fetching emails:", error)
        }
      }

      await fetchEmails(accessToken)

      // 프로필 업데이트 및 워크스페이스 설정 (기존 로직)
      const profile = await getProfileByUserId(user.id)
      const updateProfilePayload: TablesUpdate<"profiles"> = {
        ...profile,
        has_onboarded: true,
        display_name:
          profile?.display_name || user.user_metadata.full_name || "",
        username: profile?.username || user.email?.split("@")[0] || "",
        openai_api_key: process.env.NEXT_PUBLIC_OPENAI_API_KEY
      }

      const updatedProfile = await updateProfile(
        profile.id,
        updateProfilePayload
      )
      setProfile(updatedProfile)

      const workspaces = await getWorkspacesByUserId(profile.user_id)
      const homeWorkspace = workspaces.find(w => w.is_home)

      if (homeWorkspace) {
        await updateWorkspace(homeWorkspace.id, {
          ...homeWorkspace,
          default_model: "gpt-4o",
          default_prompt: `User name: ${updatedProfile.username}.`
        })
      }

      if (homeWorkspace) {
        router.push(`/${homeWorkspace.id}/chat`)
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Error in handleSaveSetupSetting:", error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * email_account 테이블 예시
   * - OAuth를 통해 들어온 user.email, user.id 등을 저장
   */
  // const handleSaveEmailAccount = async (user: User) => {
  //   const insertData = {
  //     email: user.email,
  //     email_key: "", // 필요한 경우
  //     user_id: user.id,
  //   };

  //   const { data, error } = await supabase
  //     .from("email_account")
  //     .insert([insertData])
  //     .select("*");

  //   if (error) {
  //     console.error("Error creating email account:", error);
  //   }
  // };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {loading && <Loading />}
      <div className="w-full max-w-md space-y-8">
        <h1 className="mb-8 text-center text-3xl font-bold">Sign Up</h1>

        {/* "구글로 회원가입(로그인)" 버튼만 제공 */}
        <Button
          variant="outline"
          onClick={handleGoogleSignUp}
          className="w-full"
        >
          Continue with Google
        </Button>

        {/* 에러 메시지 */}
        {signupErrorMessage && (
          <Alert
            variant="destructive"
            className="mt-4 border-red-400 bg-red-100 text-red-700"
          >
            <AlertDescription className="font-semibold">
              {signupErrorMessage}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
