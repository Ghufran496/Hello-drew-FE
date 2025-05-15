// /api/docusign/initiate.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db"; // Import your Drizzle DB instance
import { docusignAuthStates } from "@/db/schema/docusign";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { userId } = body as { userId?: number }; // Expect userId as a number

    console.log(userId, 'userId')

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 });
    }

    const clientId = process.env.DOCUSIGN_CLIENT_ID;
    const redirectUri = process.env.DOCUSIGN_REDIRECT_URI;
    const authServer = process.env.DOCUSIGN_AUTH_SERVER;

    if (!clientId || !redirectUri || !authServer) {
      return NextResponse.json({ message: "Missing DocuSign API credentials" }, { status: 500 });
    }

    // Generate a cryptographically secure random state using crypto.randomUUID().
    const state = crypto.randomUUID();

    // DocuSign OAuth URL with state.  Add prompt=login
    const redirectUrl = `${authServer}/oauth/auth?response_type=code&scope=signature&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&prompt=login`;

    console.log(state, 'state')
    console.log(clientId, 'clientId')
    console.log(redirectUri, 'redirectUri')
    console.log(authServer, 'authServer')

    console.log(redirectUrl, 'redirectUrl')

    // Store the state and userId using Drizzle.
    await db.insert(docusignAuthStates).values({ 
        state, 
        user_id: userId 
    });

    return NextResponse.json({ redirectUrl }, { status: 200 });

  } catch (error) {
    console.error("Error in DocuSign authentication handler:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: (error as Error).message },
      { status: 500 }
    );
  }
}