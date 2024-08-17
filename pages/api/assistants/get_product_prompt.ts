// pages/api/getProductPrompt.js

import {NextApiRequest, NextApiResponse} from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { outputs, answer } = req.body;

    // baseUrl을 환경 변수에서 가져옴
    const baseUrl = process.env.OPENAI_API_HOST;

    // URL을 생성
    const runUrl = new URL(
        `/v1/threads/${answer.threadId}/runs/${answer.runId}/submit_tool_outputs`,
        baseUrl
    ).toString();

    // 요청 본문 생성
    const runRequestBody = JSON.stringify({ tool_outputs: outputs });
    console.log('runRequestBody:', runRequestBody);

    try {
        // fetch를 통해 POST 요청을 보냄
        const runResponse = await fetch(runUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v1',
            },
            body: runRequestBody,
        });

        // 응답 처리
        const runData = await runResponse.json();
        console.log(runData);
        let statusData;
        // 상태 데이터를 처리하고 응답 반환
        const runId = runData.id;
        let runStatus = runData.status;
        while (runStatus === 'queued' || runStatus === 'in_progress') {
            console.log('Polling for run status...');
            await new Promise((resolve) => setTimeout(resolve, 5000)); // Poll every 5 seconds

            const statusUrl = `${process.env.OPENAI_API_HOST}/v1/threads/${answer.threadId}/runs/${runId}`;
            console.log('Checking status at:', statusUrl);

            const statusResponse = await fetch(statusUrl, {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v1',
                },
            });

            console.log('statusResponse status:', statusResponse.status);
            if (!statusResponse.ok) {
                console.error(
                    'Failed to get run status:',
                    statusResponse.statusText,
                );
                throw new Error(
                    `Failed to get run status: ${statusResponse.statusText}`,
                );
            }

            statusData = await statusResponse.json();
            console.log('statusData:', statusData);

            runStatus = statusData.status;
            console.log('Current run status:', runStatus);
        }
        console.log('Run completed, fetching messages...');

        const messagesUrl = `${process.env.OPENAI_API_HOST}/v1/threads/${answer.threadId}/messages`;
        console.log('Fetching messages from:', messagesUrl);

        const messagesResponse = await fetch(messagesUrl, {
            headers: {
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v1',
            },
        });

        console.log('messagesResponse status:', messagesResponse.status);
        if (!messagesResponse.ok) {
            console.error(
                'Failed to fetch messages:',
                messagesResponse.statusText,
            );
            throw new Error(
                `Failed to fetch messages: ${messagesResponse.statusText}`,
            );
        }

        const messagesData = await messagesResponse.json();
        console.log('Messages from assistant:', messagesData);
        const assistantMessages = messagesData.data
            .filter((msg: { role: string }) => msg.role === 'assistant')
            .map((msg: { content: { text: { value: any } }[] }) =>
                msg.content
                    .map((content: { text: { value: any } }) => content.text?.value)
                    .join(' '),
            )[0]
        //.join('\n');

        console.log('Extracted assistant messages:', assistantMessages);

        res.status(200).json({ assistant:assistantMessages });

    } catch (error) {
        console.error('Error during API call:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
