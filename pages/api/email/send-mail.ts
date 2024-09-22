// pages/api/send-email.js
import nodemailer from 'nodemailer';

export default async function handler(req: any, res: any) {
    if (req.method === 'POST') {
        const { to, subject, body, email, email_key } = req.body;

        // SMTP 트랜스포터 생성
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',  // Gmail SMTP 서버 사용. 다른 서비스의 경우 해당 서비스의 SMTP 서버로 변경
            port: 587,
            secure: false, // TLS 사용
            auth: {
                user: email,
                pass: email_key
            }
        });

        try {
            // 이메일 전송
            await transporter.sendMail({
                from: email,
                to: to,
                subject: subject,
                text: body,
            });

            res.status(200).json({ message: 'Email sent successfully' });
        } catch (error) {
            console.error('이메일 전송 오류:', error);
            if (error instanceof Error) {
                res.status(500).json({ error: '이메일 전송 실패', details: error.message });
            } else {
                res.status(500).json({ error: '이메일 전송 실패', details: '알 수 없는 오류 발생' });
            }
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`메소드 ${req.method}는 허용되지 않습니다`);
    }
}