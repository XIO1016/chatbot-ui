import { google } from "googleapis";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: "Access token is required" });
  }

  try {
    const gmail = google.gmail({
      version: "v1",
      auth: accessToken,
    });

    const messagesList = await gmail.users.messages.list({
      userId: "me",
      maxResults: 42,
    });

    const messageIds = messagesList.data.messages?.map((msg) => msg.id) || [];
    const emails = [];

    for (const id of messageIds) {
      const message = await gmail.users.messages.get({
        userId: "me",
        id: id!,
      });

      const email = {
        id: id!,
        subject: message.data.payload?.headers?.find((h) => h.name === "Subject")?.value,
        from: message.data.payload?.headers?.find((h) => h.name === "From")?.value,
        snippet: message.data.snippet,
        date: message.data.internalDate,
      };

      emails.push(email);
    }

    res.status(200).json(emails);
  } catch (error) {
    console.error("Error fetching Gmail emails:", error);
    res.status(500).json({ error: "Failed to fetch emails" });
  }
}
