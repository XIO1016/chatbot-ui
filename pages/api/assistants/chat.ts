import {NextApiRequest, NextApiResponse} from "next";

export interface Message {
    role: Role;
    content: string;
}

export type Role = 'assistant' | 'user' | 'search_action' | 'email_action';


export interface AssistantThreadBody {
    assistantId: string;
    threadId: string;
    messages: string;
    key: string;
    prompt: string;
    temperature: number;
}


async function addThread(
    threadId: string,
    promptToAdd: string,
): Promise<Response> {
    // const message = await openai.beta.threads.messages.create(
    //   threadId,
    //   {
    //     role: "user",
    //     content: promptToAdd
    //   }
    // );
    const messageUrl = `${process.env.OPENAI_API_HOST}/v1/threads/${threadId}/messages`;
    console.log('messageUrl:', messageUrl);

    const messageBody = JSON.stringify({
        role: 'user',
        content: promptToAdd,
    });
    console.log('messageBody:', messageBody);
    const message = await fetch(messageUrl, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v1',
        },
        body: messageBody,
    });

    if (!message.ok) {
        console.error('Failed to add message:', message.statusText);
        throw new Error(`Failed to add message: ${message.statusText}`);
    }

    return message;
}

async function runThread(threadId: string, instruction: string) {
    if (!threadId) {
        console.error('Thread ID is undefined or invalid');
        throw new Error('Thread ID is undefined or invalid');
    }

    console.log('Initiating runThread with threadId:', threadId);

    const runUrl = `${process.env.OPENAI_API_HOST}/v1/threads/${threadId}/runs`;
    //console.log('runUrl:', runUrl);

    const runRequestBody = JSON.stringify({
        assistant_id: process.env.ASSISTANT_ID,
        model: 'gpt-4',
        instructions: instruction,
        // Include any other parameters if necessary
    });
    console.log('runRequestBody:', runRequestBody);

    const runResponse = await fetch(runUrl, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v1',
        },
        body: runRequestBody,
    });

    console.log('runResponse status:', runResponse.status);
    if (!runResponse.ok) {
        console.error('Failed to run thread:', runResponse.statusText);
        throw new Error(`Failed to run thread: ${runResponse.statusText}`);
    }

    const runData = await runResponse.json();
    console.log('runData:', runData);

    const runId = runData.id;
    console.log('Run ID:', runId);

    let runStatus = runData.status;
    let statusData;

    while (runStatus === 'queued' || runStatus === 'in_progress') {
        console.log('Polling for run status...');
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Poll every 5 seconds

        const statusUrl = `${process.env.OPENAI_API_HOST}/v1/threads/${threadId}/runs/${runId}`;
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
            console.error('Failed to get run status:', statusResponse.statusText);
            throw new Error(`Failed to get run status: ${statusResponse.statusText}`);
        }

        statusData = await statusResponse.json();
        console.log('statusData:', statusData);

        runStatus = statusData.status;
        console.log('Current run status:', runStatus);
    }

    if (runStatus === 'completed') {
        console.log('Run completed, fetching messages...');

        const messagesUrl = `${process.env.OPENAI_API_HOST}/v1/threads/${threadId}/messages`;
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
            console.error('Failed to fetch messages:', messagesResponse.statusText);
            throw new Error(
                `Failed to fetch messages: ${messagesResponse.statusText}`,
            );
        }

        const messagesData = await messagesResponse.json();
        console.log('Messages from assistant:', messagesData);

        // Extracting text from assistant messages
        const assistantMessages = messagesData.data
            .filter((msg: { role: string }) => msg.role === 'assistant')
            .map((msg: { content: { text: { value: any } }[] }) =>
                msg.content
                    .map((content: { text: { value: any } }) => content.text?.value)
                    .join(' '),
            )[0];
        // .join('\n');

        console.log('Extracted assistant messages:', assistantMessages);
        return {
            "type": "message",
            "data": assistantMessages
        };
    } else {
        console.log('Run ended with status:', runStatus);
        if (runStatus === 'requires_action') {
            console.log('Action required:', statusData.required_action);
            return {
                "type": "action_required",
                "runId": runId,
                "threadId": threadId,
                "data": statusData.required_action.submit_tool_outputs.tool_calls
            }
            //return hanleRequiredActions(statusData.required_action, runId, threadId);
        } else return null;
    }
}


export const OpenAIAssistantStream = async (
    assistantId: string,
    threadId: string,
    promptToAdd: string,
    instruction: string,
) => {

    const message = await addThread(threadId, promptToAdd);

    const runData = await runThread(threadId, instruction);

    if (!runData) {
        console.error('No response from assistant');
        throw new Error('No response from assistant');
    }

    console.log('Assistant response:', runData);
    return runData;
}


const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
    try {

        const {assistantId, threadId, messages, key, prompt, temperature} = (await req.body) as AssistantThreadBody;
        console.log('assistantId:', assistantId);
        console.log('threadId:', threadId);
        let promptToSend = prompt;


        // const lastUserMessage = messages[0];

        let temperatureToUse = temperature;
        // console.l
        const answerRes = await OpenAIAssistantStream(
            assistantId,
            threadId,
            messages,
            "You are helpful assistant for Korean transaction intermediary. Match sellers and buyers by checking the current inventory of sellers and the purchase requests from buyers. Preferred language is Korean. Try to make response with Korean language excepts inquiry emails. Inquiry emails needs to write in seller's preferred language. e.g. English. Email contents should be confirm by user before send. User using premium account. User name is 'Dong-Hyun Kim' and He is working for 'GTN service company.' He's contant info is 'gtnservice4@gmail.com'"
        )

        //const { choices: choices2 } = answerRes;
        //const answer = choices2[0].message.content;

        res.status(200).json(answerRes);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error'})
    }
};

export default handler;
