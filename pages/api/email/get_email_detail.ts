import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { email, password, emailId } = req.query;

    if (!email || !password || !emailId) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
        // FastAPI 서버 주소와 쿼리 파라미터를 함께 지정합니다.
        const fastApiUrl = `${process.env.NEXT_PUBLIC_TEST}/get_email_detail/${emailId}?user_email=${encodeURIComponent(email.toString())}&user_password=${encodeURIComponent(password.toString())}`;

        // FastAPI로 GET 요청을 보냅니다.
        const response = await fetch(fastApiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch email details from FastAPI: ${response.statusText}`);
        }

        const emailDetail = await response.json();

        // FastAPI로부터 받은 이메일 데이터를 Next.js API 핸들러의 응답으로 전송
        res.status(200).json(emailDetail);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(500).json({ error: '알 수 없는 오류가 발생했습니다.' });
        }
    }
}
