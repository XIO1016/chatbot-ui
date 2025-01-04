import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      // fetch를 이용한 외부 API 호출
      const response = await fetch(`${process.env.NEXT_PUBLIC_EMAIL_URL}/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${process.env.NEXT_PUBLIC_EMAIL_KEY}`
        },
        body: JSON.stringify({
          email: email,
          raw_password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return res.status(200).json({ message: 'Data sent successfully', data });
      } else {
        return res.status(response.status).json({ error: 'Failed to send data', details: data });
      }
    } catch (error:any) {
      console.error('Error sending data to external API:', error);
      return res.status(500).json({ error: 'Failed to send data to external API', details: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} not allowed`);
  }
}
