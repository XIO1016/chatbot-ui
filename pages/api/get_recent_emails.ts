// // import { NextApiRequest, NextApiResponse } from 'next';
// // import { Email } from '@/types/email';

// // export interface emailsResponse {
// //     result: Array<Email>;
// // }

// // const handler = async (req: NextApiRequest, res: NextApiResponse<any>) => {
// //     //try {
// //     const query = (await req.body);
// //     const result  = await (await fetch(`http://localhost:3000/get_recent_emails`)).json() as emailsResponse;

// //     res.status(200).json(result);
// //     //   } catch (error) {
// //     //     console.error(error);
// //     //     res.status(500).json({ error: 'Error'})
// //     //   }

// // }

// // export default handler;

// import { Email } from "@/types/email";
// import { google } from "googleapis";


// const fetchGmailEmails = async (accessToken: string): Promise<Email[]> => {
//     try {
//       const gmail = google.gmail({
//         version: "v1",
//         auth: accessToken,
//       });
  
//       const messagesList = await gmail.users.messages.list({
//         userId: "me",
//         maxResults: 42,
//       });
  
//       const messageIds = messagesList.data.messages?.map((msg) => msg.id) || [];
//       const emails: Email[] = [];
  
//       for (const id of messageIds) {
//         const message = await gmail.users.messages.get({
//           userId: "me",
//           id: id!,
//         });
  
//         const email = {
//           id: id!,
//           subject: message.data.payload?.headers?.find((h) => h.name === "Subject")
//             ?.value,
//           from: message.data.payload?.headers?.find((h) => h.name === "From")
//             ?.value,
//           snippet: message.data.snippet,
//           date: message.data.internalDate,
//         };
  
//         emails.push(email as Email);
//       }
  
//       return emails;
//     } catch (error) {
//       console.error("Error fetching Gmail emails:", error);
//       throw error;
//     }
//   };
  