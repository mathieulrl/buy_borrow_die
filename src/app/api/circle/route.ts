import { NextRequest, NextResponse } from "next/server";

const CIRCLE_BASE_URL =
  process.env.NEXT_PUBLIC_CIRCLE_BASE_URL ?? "https://api.circle.com";
const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY as string;

export async function POST(request: NextRequest) {
  try {
    if (!CIRCLE_API_KEY) {
      return NextResponse.json(
        { error: "Missing CIRCLE_API_KEY environment variable" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { action, ...params } = body ?? {};

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    switch (action) {
      case "createUser": {
        const { userId } = params as { userId?: string };

        if (!userId) {
          return NextResponse.json(
            { error: "Missing required field: userId" },
            { status: 400 }
          );
        }

        const response = await fetch(`${CIRCLE_BASE_URL}/v1/w3s/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CIRCLE_API_KEY}`,
          },
          body: JSON.stringify({ userId }),
        });

        const data = await response.json();
        if (!response.ok) {
          return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data.data, { status: 200 });
      }

      case "getUserToken": {
        const { userId } = params as { userId?: string };

        if (!userId) {
          return NextResponse.json(
            { error: "Missing required field: userId" },
            { status: 400 }
          );
        }

        const response = await fetch(`${CIRCLE_BASE_URL}/v1/w3s/users/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CIRCLE_API_KEY}`,
          },
          body: JSON.stringify({ userId }),
        });

        const data = await response.json();
        if (!response.ok) {
          return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data.data, { status: 200 });
      }

      case "initializeUser": {
        const { userToken, accountType, blockchains } = params as {
          userToken?: string;
          accountType?: string;
          blockchains?: string[];
        };

        if (!userToken) {
          return NextResponse.json(
            { error: "Missing userToken" },
            { status: 400 }
          );
        }

        const requestBody: any = {
          idempotencyKey: crypto.randomUUID(),
        };

        if (accountType) requestBody.accountType = accountType;
        requestBody.blockchains = (blockchains && blockchains.length > 0)
          ? blockchains
          : ["ARC-TESTNET"];

        const response = await fetch(
          `${CIRCLE_BASE_URL}/v1/w3s/user/initialize`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${CIRCLE_API_KEY}`,
              "X-User-Token": userToken,
            },
            body: JSON.stringify(requestBody),
          }
        );

        const data = await response.json();
        if (!response.ok) {
          return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data.data, { status: 200 });
      }

      case "listWallets": {
        const { userToken } = params as { userToken?: string };
        if (!userToken) {
          return NextResponse.json(
            { error: "Missing userToken" },
            { status: 400 }
          );
        }

        const response = await fetch(`${CIRCLE_BASE_URL}/v1/w3s/wallets`, {
          method: "GET",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            Authorization: `Bearer ${CIRCLE_API_KEY}`,
            "X-User-Token": userToken,
          },
        });

        const data = await response.json();
        if (!response.ok) {
          return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data.data, { status: 200 });
      }

      case "getTokenBalance": {
        const { userToken, walletId } = params as {
          userToken?: string;
          walletId?: string;
        };
        if (!userToken || !walletId) {
          return NextResponse.json(
            { error: "Missing userToken or walletId" },
            { status: 400 }
          );
        }

        const response = await fetch(
          `${CIRCLE_BASE_URL}/v1/w3s/wallets/${walletId}/balances`,
          {
            method: "GET",
            headers: {
              accept: "application/json",
              Authorization: `Bearer ${CIRCLE_API_KEY}`,
              "X-User-Token": userToken,
            },
          }
        );

        const data = await response.json();
        if (!response.ok) {
          return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data.data, { status: 200 });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("Circle API route error:", error);
    return NextResponse.json(
      { error: error?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

