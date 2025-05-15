import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contracts, docusignAuthStates, userDocusignCredentials } from "@/db/schema/docusign";
import { desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const returnedState = searchParams.get("state");

    console.log(code, 'code')
    console.log(returnedState, 'returnedState')

    if (!code || !returnedState) {
        return NextResponse.json({ error: "Authorization code or state is missing" }, { status: 400 });
    }
    try {

        // 1. Retrieve the stored state and user ID using Drizzle.
        const stateDataResult = await db
            .select()
            .from(docusignAuthStates)
            .where(eq(docusignAuthStates.state, returnedState));

        const stateData = stateDataResult[0]; // .findFirst() returns an array, even with one element

        if (!stateData) {
            return NextResponse.json({ error: "Invalid state parameter" }, { status: 400 });
        }

        const userId = stateData?.user_id;
        console.log(stateData, 'returnedState')

        // 2. Exchange authorization code for access token.
        const tokenResponse = await fetch(`${process.env.DOCUSIGN_AUTH_SERVER}/oauth/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code,
                client_id: process.env.DOCUSIGN_CLIENT_ID!,
                client_secret: process.env.DOCUSIGN_CLIENT_SECRET!,
                redirect_uri: process.env.DOCUSIGN_REDIRECT_URI!,
            }).toString(),
        });

        console.log(tokenResponse, 'tokenResponse')
        
        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            console.error("Error exchanging code for token:", errorData);
            return NextResponse.json({ error: "Failed to get access token", details: errorData }, { status: 500 });
        }

        const tokenData = await tokenResponse.json();

        const { access_token, refresh_token, expires_in } = tokenData;

        console.log(access_token, 'access_token')
        console.log(refresh_token, 'refresh_token')
        console.log(expires_in, 'expires_in')

        // 3. Get user info (to get account ID)
        const userInfoResponse = await fetch(`${process.env.DOCUSIGN_AUTH_SERVER}/oauth/userinfo`, {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        if (!userInfoResponse.ok) {
            const errorData = await userInfoResponse.json();
            console.error("Error fetching user info:", errorData);
            return NextResponse.json({ error: "Failed to fetch user info", details: errorData }, { status: 500 });
        }



        const userInfo = await userInfoResponse.json();
        const accountId = userInfo.accounts[0].account_id;
        console.log(accountId, 'accountId')


        // // 4. Store the tokens and expiry time using Drizzle.
        const expiresAt = new Date(Date.now() + expires_in * 1000);
        await db
            .insert(userDocusignCredentials)
            .values({
                user_id: userId,
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresAt,
                accountId,
            })
            .onConflictDoUpdate({
                target: userDocusignCredentials.user_id,
                set: {
                    accessToken: access_token,
                    refreshToken: refresh_token,
                    expiresAt,
                    accountId,
                },
            });

        // // 5. Delete the temporary state record.
        await db.delete(docusignAuthStates).where(eq(docusignAuthStates.state, returnedState));

        // // --- Get latest uploaded file ---
        const latestContractResult = await db
            .select()
            .from(contracts)
            .where(eq(contracts.user_id, userId))
            .orderBy(desc(contracts.createdAt)) // Corrected: Use desc() for descending order
            .limit(1); // Add this line!

        const latestContract = latestContractResult[0];

        const filename = latestContract.filename;

        // --- Call /api/documents/sign INTERNALLY ---
        const signResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/docusign/sign`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                filename,
                recipients: [{
                    email: "nomanmujahid.cs@gmail.com",
                    name: "Noman Mujahid"
                }]
            }),
        });

        if (!signResponse.ok) {
            const errorData = await signResponse.json();
            console.error("Error initiating signing:", errorData);
            return NextResponse.json({ error: "Failed to initiate signing", details: errorData }, { status: 500 });
        }


        const { signingUrls } = await signResponse.json();

        // 7. Redirect to the DocuSign signing URL (first recipient)
        if (signingUrls && signingUrls.length > 0) {
            return NextResponse.redirect(signingUrls[0].url); // Use signing URL
        } else {
            return NextResponse.json({ error: "No signing URL returned." }, { status: 500 });
        }

        // Old Version

        // if (!latestContract) {
        //     return NextResponse.json({ error: "No contract found for this user." }, { status: 404 });
        // }

        // const filename = latestContract.filename;


        // console.log(access_token, 'access_token')

        // // 📌 2. Read the `.docx` file and convert it to Base64
        // const docPath = path.join(process.cwd(), "public/pdf/requirements-specification.docx");
        // if (!fs.existsSync(docPath)) {
        //     return NextResponse.json({ error: "Document not found" }, { status: 404 });
        // }

        // const fileBuffer = fs.readFileSync(docPath);
        // const docBase64 = fileBuffer.toString("base64");

        // // 📌 3. Create an envelope with the `.docx` file
        // const envelopeResponse = await fetch(`https://demo.docusign.net/restapi/v2.1/accounts/${process.env.DOCUSIGN_ACCOUNT_ID}/envelopes`, {
        //     method: "POST",
        //     headers: {
        //         "Authorization": `Bearer ${access_token}`,
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //         emailSubject: "Please sign this document",
        //         documents: [
        //             {
        //                 documentBase64: docBase64,
        //                 name: "Contract.docx",
        //                 fileExtension: "docx",
        //                 documentId: "1",
        //             }
        //         ],
        //         recipients: {
        //             signers: [
        //                 {
        //                     email: "nomanmujahid.cs@gmail.com",
        //                     name: "Noman Mujahid",
        //                     recipientId: "1",
        //                     clientUserId: "1234", // Required for embedded signing
        //                     authenticationMethod: "none",
        //                     tabs: {},
        //                 }
        //             ]
        //         },
        //         status: "sent",
        //     }),
        // });

        // if (!envelopeResponse.ok) {
        //     const errorData = await envelopeResponse.json();
        //     console.error("Error creating envelope:", errorData);
        //     return NextResponse.json({ error: "Failed to create contract", details: errorData }, { status: 500 });
        // }

        // const envelopeData = await envelopeResponse.json();
        // const envelopeId = envelopeData.envelopeId;

        // // 📌 4. Generate the recipient signing URL
        // const recipientViewResponse = await fetch(
        //     `https://demo.docusign.net/restapi/v2.1/accounts/${process.env.DOCUSIGN_ACCOUNT_ID}/envelopes/${envelopeId}/views/recipient`,
        //     {
        //         method: "POST",
        //         headers: {
        //             "Authorization": `Bearer ${access_token}`,
        //             "Content-Type": "application/json",
        //         },
        //         body: JSON.stringify({
        //             userName: "Noman Mujahid",
        //             email: "nomanmujahid.cs@gmail.com",
        //             recipientId: "1",
        //             clientUserId: "1234", // Must match the recipient in the envelope
        //             authenticationMethod: "none",
        //             returnUrl: `${process.env.DOCUSIGN_RETURN_URL}`, // Where to redirect after signing
        //         }),
        //     }
        // );

        // if (!recipientViewResponse.ok) {
        //     const errorData = await recipientViewResponse.json();
        //     console.error("Error generating signing URL:", errorData);
        //     return NextResponse.json({ error: "Failed to generate signing URL", details: errorData }, { status: 500 });
        // }

        // const { url } = await recipientViewResponse.json();

        // // 5. Redirect user to the signing URL
        // return NextResponse.redirect(url);
    } catch (error) {
        console.error("Unexpected error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
