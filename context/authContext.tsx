import React, { createContext, useContext, useState, ReactNode } from "react"

// Context에서 관리할 데이터 타입 정의
interface AuthContextType {
  accessToken: string | null // 로그인된 사용자의 Access Token
  setAccessToken: (token: string) => void // Access Token 설정 함수
}

// Context 기본값 설정
const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  setAccessToken: () => {} // 기본값으로 빈 함수 제공
})

// AuthProvider 정의: 하위 컴포넌트에서 Context를 사용할 수 있도록 래핑
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null)

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken }}>
      {children}
    </AuthContext.Provider>
  )
}

// 커스텀 훅: Context 데이터 가져오기
export const useAuth = () => useContext(AuthContext)
