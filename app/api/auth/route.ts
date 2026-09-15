import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcrypt";

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
          message: "User not found",
        },
        { status: 404 }
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
          message: "Invalid password",
        },
        { status: 401 }
      );
    }

    // Login successful
    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
        },
      },
      { status: 200 }
    );
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