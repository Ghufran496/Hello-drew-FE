import { openaiChatResponse } from "@/app/services/openaiService";
import { db } from "@/db";
import { leadConversation } from "@/db/schema/lead_conversation";
import { and, desc, eq, notInArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Predefined messages for different conversation types
const predefinedMessages = {
  initialOutreach: (
    leadName: string,
    agentName: string,
    brokerageName: string,
    property: string
  ) =>
    `Hi ${leadName}, this is ${agentName} with ${brokerageName}. I saw you were interested in ${property}. Are you currently looking to buy/sell a home?`,
  qualification: {
    interestConfirmation:
      "That’s great! Are you looking to move in the next few months or just browsing for now?",
    browsingOffer:
      "Totally understand! Would you like me to send you new listings as they hit the market?",
  },
  callToAction: (dayTime: string, alternativeTime: string) =>
    `I’d love to help you find the perfect home. I have time ${dayTime} or ${alternativeTime}. Which works best for you?`,
  followUps: {
    followUp1: (leadName: string, area: string) =>
      `Hey ${leadName}, just checking back! Did you still want to see homes in ${area}? Let me know, happy to help!`,
    followUp2:
      "Still looking? I have access to exclusive listings before they hit the market—let me know if you’d like early access!",
    finalFollowUp:
      "I don’t want to bother you, but if you’re still interested in buying/selling, I’m happy to help when you’re ready. Just reply whenever works for you!",
  },
  meetingConfirmation: (dayTime: string, location: string) =>
    `Got you locked in for ${dayTime} at ${location}. I’ll send a quick reminder before we meet—looking forward to it!`,
  reminder: (leadName: string, time: string) =>
    `Hey ${leadName}, looking forward to our meeting at ${time}. Let me know if you have any questions before we meet!`,
  postMeetingFollowUp: (propertyAddress: string) =>
    `Great meeting you today! What did you think of ${propertyAddress}? Let me know if you have any questions or if you’d like to see more options!`,
  postMeetingOptions:
    "I can send you a few more similar homes—want me to do that?",
};

export async function POST(request: NextRequest) {
  try {
    const body: {
      userId: number;
      leadId: number;
      messageText: string;
    } = await request.json();
    const { userId, leadId, messageText } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!leadId) {
      return NextResponse.json(
        { error: "Lead ID is required" },
        { status: 400 }
      );
    }

    if (!messageText) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!leadId || !messageText) {
      return NextResponse.json(
        { error: "Lead ID and message are required" },
        { status: 400 }
      );
    }

    // Determine the user's response
    const determineUserResponse = await openaiChatResponse([
      {
        role: "system",
        content:
          "You are a CRM assistant that determines the best next step for user response.",
      },
      {
        role: "user",
        content: messageText,
      },
      {
        role: "system",
        content:
          "Analyze the conversation and suggest the user's response in enum format. Options: Interested, Not-Interested, Browsing",
      },
    ]);

    // If the user is interested, determine the next message type
    if (determineUserResponse === "Interested") {
      // Get the previous conversations
      const previousConversations = await db
        .select()
        .from(leadConversation)
        .where(
          and(
            eq(leadConversation.lead_id, leadId),
            notInArray(leadConversation.message_type, ["Follow-Up"])
          )
        )
        .orderBy(desc(leadConversation.created_at));

      // Prepare conversation context for OpenAI
      const chatHistory = previousConversations.map<{
        role: "user" | "assistant";
        content: string;
      }>((conv) => ({
        role: conv.send_by ? "user" : "assistant",
        content: conv.message_text!,
      }));

      chatHistory.push({ role: "user", content: messageText! });

      // Use OpenAI to determine the next message type
      const aiResponse = await openaiChatResponse([
        {
          role: "system",
          content:
            "You are a CRM assistant that determines the best next step for a lead.",
        },
        ...chatHistory,
        {
          role: "system",
          content:
            "Analyze the conversation and suggest the next step in enum format. Options: Follow-Up, Appointment, Qualification, Reminder, Post-Meeting",
        },
      ]);

      // Determine message type based on AI response
      let messageType:
        | "Initial-Outreach"
        | "Follow-Up"
        | "Qualification"
        | "Appointment"
        | "Reminder"
        | "Post-Meeting" = "Follow-Up";
      if (aiResponse!.toLowerCase().includes("appointment")) {
        messageType = "Appointment";
      } else if (aiResponse!.toLowerCase().includes("qualification")) {
        messageType = "Qualification";
      } else if (aiResponse!.toLowerCase().includes("follow-up")) {
        messageType = "Follow-Up";
      } else if (aiResponse!.toLowerCase().includes("reminder")) {
        messageType = "Reminder";
      } else if (aiResponse!.toLowerCase().includes("post-meeting")) {
        messageType = "Post-Meeting";
      }

      // determine the message based on the message type
      let aiMessage = "";
      switch (messageType) {
        case "Qualification":
          aiMessage = predefinedMessages.qualification.interestConfirmation;
          break;
        case "Appointment":
          aiMessage = predefinedMessages.callToAction(
            "dayTime",
            "alternativeTime"
          );
          break;
        case "Reminder":
          aiMessage = predefinedMessages.reminder("leadName", "time");
          break;
        case "Post-Meeting":
          aiMessage = predefinedMessages.postMeetingFollowUp("propertyAddress");
          break;
      }

      // Store the AI response in lead_conversation
      await db
        .insert(leadConversation)
        .values({
          lead_id: leadId,
          message_type: messageType,
          message_text: messageText,
          send_by: "user",
          user_id: userId,
        })
        .returning();

      await db
        .insert(leadConversation)
        .values({
          lead_id: leadId,
          message_type: messageType,
          message_text: aiMessage,
          send_by: "assistant",
          user_id: userId,
        })
        .returning();

      // Schedule a meeting if the AI determines it's necessary
      if (messageType === "Appointment") {
        // TODO: Schedule a meeting
        return NextResponse.json(
          {
            success: true,
            message: aiMessage,
            // data: { meeting: scheduledMeeting },
          },
          { status: 201 }
        );
      }

      return NextResponse.json(
        { success: true, message: aiMessage },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error creating lead conversation:", error);
    return NextResponse.json(
      { error: "Failed to create lead conversation" },
      { status: 500 }
    );
  }
}
