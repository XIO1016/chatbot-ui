// pages/api/send-email.js
import nodemailer from "nodemailer"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { to, subject, body, email, email_key } = req.body as {
      to: string
      subject: string
      body: string
      email: string
      email_key: string
    }

    // SMTP 트랜스포터 생성
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com", // Gmail SMTP 서버 사용. 다른 서비스의 경우 해당 서비스의 SMTP 서버로 변경
      port: 587,
      secure: false, // TLS 사용
      auth: {
        user: email,
        pass: email_key
      }
    })

    try {
      // 이메일 전송
      await transporter.sendMail({
        from: email,
        to: to,
        subject: subject,
        text: body
      })

      res.status(200).json({ message: "Email sent successfully" })
    } catch (error) {
      console.error("Error sending email:", error)
      res
        .status(500)
        .json({ error: "이메일 전송 실패", details: (error as Error).message })
    }
  } else {
    res.setHeader("Allow", ["POST"])
    res.status(405).end(`메소드 ${req.method}는 허용되지 않습니다`)
  }
}
