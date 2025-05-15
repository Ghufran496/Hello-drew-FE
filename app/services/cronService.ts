import schedule from "node-schedule";
import { checkUsageAndNotify } from "./usageService";
import { db } from "@/db";
import { and, desc, eq, lt } from "drizzle-orm";
// import { sendSMS } from "./twilio";
import { leads } from "@/db/schema/leads";
import { leadConversation } from "@/db/schema/lead_conversation";

export function initCronJobs() {
  try {
    console.log("⏰ Initializing cron jobs...");

    // Run immediately on startup
    console.log("📊 Running initial usage check...");
    checkUsageAndNotify().catch((error) => {
      console.error("❌ Initial usage check failed:", error);
    });

    // Schedule to run at the start of every hour (e.g., 1:00, 2:00, 3:00)
    const job = schedule.scheduleJob("0 * * * *", async () => {
      try {
        console.log(
          "⏰ Running hourly usage check at:",
          new Date().toISOString()
        );
        await checkUsageAndNotify();
      } catch (error) {
        console.error("❌ Scheduled usage check failed:", error);
      }
    });

    if (job) {
      console.log("✅ Hourly schedule initialized successfully");
      console.log(
        "⏱️ Next run scheduled for:",
        job.nextInvocation().toISOString()
      );
    } else {
      throw new Error("Failed to create cron job");
    }
  } catch (error) {
    console.error("❌ Failed to initialize cron jobs:", error);
    throw error;
  }
}

// Schedule Follow-Up Jobs
export const scheduleFollowUp = async (leadId: number) => {
  const [lastUserMessage] = await db
    .select()
    .from(leadConversation)
    .where(
      and(
        eq(leadConversation.lead_id, leadId),
        eq(leadConversation.send_by, "user")
      )
    )
    .orderBy(desc(leadConversation.created_at));

  const followUpCountsAfterLastUserMessage = await db
    .select()
    .from(leadConversation)
    .where(
      and(
        eq(leadConversation.lead_id, leadId),
        eq(leadConversation.message_type, "Follow-Up"),
        lt(leadConversation.created_at, lastUserMessage.created_at!)
      )
    );

  if (!lastUserMessage) {
    console.error(`No follow-up found for lead ID: ${leadId}`);
    return;
  }

  const now = new Date();
  const createdAt = new Date(lastUserMessage.created_at!);
  const hoursDifference =
    (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  let message;

  if (
    hoursDifference >= 24 &&
    hoursDifference < 48 &&
    followUpCountsAfterLastUserMessage.length === 0
  ) {
    message = "Hey, just checking back! Are you still interested?";
  } else if (
    hoursDifference >= 48 &&
    hoursDifference < 168 &&
    followUpCountsAfterLastUserMessage.length === 1
  ) {
    message = "I have access to exclusive listings. Want early access?";
  } else if (
    hoursDifference >= 168 &&
    followUpCountsAfterLastUserMessage.length === 2
  ) {
    message =
      "I don’t want to bother, but if you’re interested, I’m here to help!";
  }

  if (message) {
    await db.insert(leadConversation).values({
      lead_id: leadId,
      send_by: "assistant",
      message_type: "Follow-Up",
      message_text: message,
    });
    // TODO: Send follow-up message to lead
    console.log(`Follow-up message sent to lead ID: ${leadId}`);
  }
};

// Check for follow-ups every 5 minutes
export const initializeScheduledFollowUps = async () => {
  schedule.scheduleJob("*/5 * * * *", async () => {
    try {
      console.log("⏰ Running follow-up check at:", new Date().toISOString());

      const leadsToFollowUp = await db.select().from(leads);

      for (const lead of leadsToFollowUp) {
        await scheduleFollowUp(lead.id);
      }
    } catch (error) {
      console.error("❌ Scheduled follow-up check failed:", error);
    }
  });
};
