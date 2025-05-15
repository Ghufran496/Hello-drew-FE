import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contracts, userDocusignCredentials } from "@/db/schema/docusign";
import { and, eq } from "drizzle-orm";

async function getDocuSignAccessToken(userId: number): Promise<string | null> {
    const credentialData = await db
            .select()
            .from(userDocusignCredentials)
            .where(eq(userDocusignCredentials.user_id, userId));

    if (!credentialData) {
        console.error("Error fetching DocuSign credentials");
        return null;
    }

    const { accessToken, expiresAt } = credentialData[0];
    const expiresAtDate = new Date(expiresAt);

    if (expiresAtDate <= new Date()) {
        // Access token has expired, refresh it.
        const refreshResult = await fetch('/api/docusign/refresh-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }), // Send userId
        });

        if (!refreshResult.ok) {
            console.error("Token refresh failed:", await refreshResult.json());
            return null; // Or throw an error
        }

        const { access_token: newAccessToken } = await refreshResult.json();
        return newAccessToken;
    }

    return accessToken;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const body = await request.json();
        const { userId, filename, recipients } = body as {
            userId: number;
            filename: string;
            recipients: { email: string; name: string; routingOrder?: string; }[]; // Added optional routingOrder
        };

        if (!userId || !filename || !recipients || recipients.length === 0) {
            return NextResponse.json({ message: "Missing required parameters" }, { status: 400 });
        }

        // *** CRITICAL: VALIDATE ACCESS TOKEN ***
        const accessToken = await getDocuSignAccessToken(userId);
        console.log(accessToken,'accessToken')
        if (!accessToken) {
            return NextResponse.json({ error: "Failed to retrieve or refresh DocuSign access token. Please connect your DocuSign account." }, { status: 401 }); // Unauthorized
        }

        // Retrieve DocuSign Account ID.
        const credentialData = await db
            .select()
            .from(userDocusignCredentials)
            .where(eq(userDocusignCredentials.user_id, userId));

        if (!credentialData) {
            return NextResponse.json({ error: "User's docusign credential not found" }, { status: 404 })
        }
        const accountId = credentialData[0].accountId;

        // Get file URL from database
        const contractData = await db
            .select()
            .from(contracts)
            .where(eq(contracts.user_id, userId));

            console.log(contractData, 'contractData')

        if (!contractData) {
            return NextResponse.json({ error: "Contract not found" }, { status: 404 });
        }

        const fileUrl = contractData[contractData.length - 1].filename; // This is now the *URL*

        // Construct the full file URL if needed for external access (adjust as needed)
        const fullFileUrl = `${process.env.NEXT_PUBLIC_APP_URL}/${fileUrl}`;

        // Fetch the file content using the URL
        const fileResponse = await fetch(fullFileUrl);

        if (!fileResponse.ok) {
            console.error("Error retrieving file from URL", fileResponse.status);
            return NextResponse.json(
                { error: "Failed to retrieve file from storage", details: fileResponse.status },
                { status: 500 }
            );
        }
        const arrayBuffer = await fileResponse.arrayBuffer();
        const docBase64 = Buffer.from(arrayBuffer).toString("base64");


        // Create the DocuSign envelope.
        const docusignRecipients = recipients.map((recipient, index) => ({
            email: recipient.email,
            name: recipient.name,
            recipientId: String(index + 1),
            clientUserId: String(index + 1), // Required for embedded signing, unique
            authenticationMethod: "none",
            routingOrder: recipient.routingOrder || "1", // Use provided routingOrder, default to 1
        }));

        const envelopeResponse = await fetch(
            `https://demo.docusign.net/restapi/v2.1/accounts/${accountId}/envelopes`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    emailSubject: "Please sign this document",
                    documents: [
                        {
                            documentBase64: docBase64,
                            name: filename, // Use a descriptive name, possibly from DB
                            fileExtension: filename.split(".").pop(),
                            documentId: "1",
                        },
                    ],
                    recipients: {
                        signers: docusignRecipients,
                    },
                    status: "sent", // Send immediately
                }),
            }
        );

        if (!envelopeResponse.ok) {
            const errorData = await envelopeResponse.json();
            console.error("Error creating envelope:", errorData);
            return NextResponse.json({ error: "Failed to create envelope", details: errorData }, { status: 500 });
        }

        const envelopeData = await envelopeResponse.json();
        const envelopeId = envelopeData.envelopeId;

        // Store the envelope ID in your database.
        await db
            .update(contracts)
            .set({ docusignEnvelopeId: envelopeId, status: 'sent' })
            .where(
                and( // Use 'and' to combine conditions
                    eq(contracts.user_id, userId),
                    eq(contracts.filename, fileUrl)
                )
            );

        // Generate the recipient view URLs (embedded signing).
        const signingUrls = [];
        for (const recipient of docusignRecipients) {
            const recipientViewResponse = await fetch(
                `https://demo.docusign.net/restapi/v2.1/accounts/${accountId}/envelopes/${envelopeId}/views/recipient`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userName: recipient.name,
                        email: recipient.email,
                        recipientId: recipient.recipientId,
                        clientUserId: recipient.clientUserId,
                        authenticationMethod: "none",
                        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/contracts?envelopeId=${envelopeId}`, // Your callback
                    }),
                }
            );

            if (!recipientViewResponse.ok) {
                const errorData = await recipientViewResponse.json();
                console.error("Error generating signing URL:", errorData);
                // Consider handling this: maybe skip this recipient, or return a partial error?
                continue; // Skip to next recipient
            }

            const { url } = await recipientViewResponse.json();
            signingUrls.push({ email: recipient.email, url });
        }

        return NextResponse.json({ envelopeId, signingUrls }, { status: 201 });
    } catch (error) {
        console.error("Error in signature request:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error }, { status: 500 });
    }
}