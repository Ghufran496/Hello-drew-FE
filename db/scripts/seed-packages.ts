import { db } from "..";
import { packages } from "../schema/packages";
import { eq } from "drizzle-orm";

const packagesList: (typeof packages.$inferInsert)[] = [
  {
    name: "Solo Starter",
    type: "solo",
    features: [
      "Custom Phone Number",
      "Seamless CRM Integrations (Salesforce, MLS, Zillow, and more)",
      "Scheduling & Follow-Up Automation",
      "Outbound & Inbound Calls with Real-Time Conversational AI",
      "Standard Voice Options",
      "350 Calls, 600 Texts, 2,500 Emails/Month",
    ],
    price_id: "price_1QhqVpEa8qu85ZnDoKrZMj9Y",
    price: 19500,
    calls_limit: 350,
    texts_limit: 600,
    emails_limit: 2500,
  },
  {
    name: "Solo Growth",
    type: "solo",
    features: [
      "Everything in Solo Starter, plus:",
      "Multiple Phone Numbers for Campaigns",
      "Virtual Meetings & Note Taking",
      "Lead Scoring & Real-Time Data Updates (Schools, Neighborhoods, etc.)",
      "600 Calls, 1,000 Texts, 5,000 Emails/Month",
    ],
    price_id: "price_1QhqWGEa8qu85ZnD4gDMF4xb",
    price: 29500,
    calls_limit: 600,
    texts_limit: 1000,
    emails_limit: 5000,
  },
  {
    name: "Solo Growth Elite",
    type: "solo",
    features: [
      "Everything in Solo Growth, plus:",
      "Automated Reminders & Custom Voice Solutions",
      "Advanced Analytics & AI-Driven Insights",
      "1,200 Calls, 2,000 Texts, 10,000 Emails/Month",
    ],
    price_id: "price_1QhqWaEa8qu85ZnDiNJrf5PC",
    price: 39500,
    calls_limit: 1200,
    texts_limit: 2000,
    emails_limit: 10000,
  },
  {
    name: "Team Accelerator",
    type: "team",
    features: [
      "Dedicated Phone Numbers for Agents or Campaigns",
      "Team-Wide Scheduling & Follow-Ups",
      "Monthly Analytics Reports (Conversion Rates, Call Performance)",
      "Seamless Integration with BoldLeads, Lofty, BoomTown, and More",
      "3,000 Calls, 6,000 Texts, 20,000 Emails/Month",
    ],
    price_id: "price_1QhqX5Ea8qu85ZnDk2t4jNl9",
    price: 69500,
    calls_limit: 3000,
    texts_limit: 6000,
    emails_limit: 20000,
  },
  {
    name: "Team Elite",
    type: "team",
    features: [
      "Everything in Team Accelerator, plus:",
      "Virtual Meeting Attendance & Task Assignments",
      "Premium Voice Library & Team-Specific Branding",
      "Real-Time API Updates for MLS, Zillow, and Schools",
      "6,000 Calls, 12,000 Texts, 50,000 Emails/Month",
    ],
    price_id: "price_1QhqZ9Ea8qu85ZnD5f2TYJOS",
    price: 119500,
    calls_limit: 6000,
    texts_limit: 12000,
    emails_limit: 50000,
  },
];

async function seedPackages() {
  for (const pkg of packagesList) {
    const exists = await db
      .select()
      .from(packages)
      .where(eq(packages.name, pkg.name));
    if (!exists.length) {
      await db.insert(packages).values(pkg);
    }
  }
  console.log("Packages Seeding complete!");
}
seedPackages().catch(console.error);
