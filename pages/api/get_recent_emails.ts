import { NextApiRequest, NextApiResponse } from 'next';
import { Email } from '@/types/email';

export interface emailsResponse {
    result: Array<Email>;
}

const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
    //try {
    const query = (await req.body);
    const result  = await (await fetch(`http://localhost:3000/get_recent_emails`)).json() as emailsResponse;

    res.status(200).json(result);
    //   } catch (error) {
    //     console.error(error);
    //     res.status(500).json({ error: 'Error'})
    //   }

}

export default handler;
