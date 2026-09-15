import { NextRequest } from "next/server";
import * as jose from "jose";

export interface AuthUserPayload extends jose.JWTPayload {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  privilages: string[];
}

export async function getUser(request: NextRequest): Promise<AuthUserPayload | null> {
  const token =
    request.cookies.get("token")?.value ||
    request.cookies.get("loginToken")?.value;

  if (!token) {
    return null;
  }

  const secretText = process.env.JOSE_WEB_TOKEN;
  if (!secretText) {
    console.error("JOSE_WEB_TOKEN environment variable is not configured");
    return null;
  }

  const secret = new TextEncoder().encode(secretText);

  try {
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as AuthUserPayload;
  } catch (error) {
    return null;
  }
}

// Backwards compatibility for capitalized name
export const GetUser = getUser;