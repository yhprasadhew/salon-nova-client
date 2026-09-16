import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcrypt";
import * as jose from "jose";

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json();

    // Validate email
    if (!body.email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    // Validate password
    if (!body.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Password is required",
        },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    // User doesn't exist
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Check account status
    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "Your account is not active",
        },
        { status: 401 }
      );
    }

    // Compare entered password with hashed password
    const isPasswordValid = await compare(
      body.password,
      user.password
    );

    // Invalid password
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // --------------------------------
    // Password is correct from here
    // --------------------------------

    await prisma.user.update({
        where: {
            id: user.id,
        },data :{
            lastLogin: new Date(),
        }
        })
    
    // Get JWT secret
    const secretText = process.env.JOSE_WEB_TOKEN;

    if (!secretText) {
      throw new Error("JOSE_WEB_TOKEN is not configured");
    }

    const secret = new TextEncoder().encode(secretText);

    // Create JWT
    const token = await new jose.SignJWT({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      privilages: user.privilages,
    })
      .setProtectedHeader({
        alg: "HS256",
      })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 200 }
    );

    // Store JWT in HTTP-only cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
    });

    return response;

  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}