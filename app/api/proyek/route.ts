"use server"

import { NextResponse } from "next/server"

// Cache for access token
let cachedToken: string | null = null
let tokenExpiry: number = 0

async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken
  }

  const baseUrl = process.env.SIPROPER_API_URL
  const email = process.env.SIPROPER_EMAIL
  const password = process.env.SIPROPER_PASSWORD

  if (!baseUrl || !email || !password) {
    throw new Error("Missing API credentials in environment variables")
  }

  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`)
  }

  const data = await response.json()

  if (data.status !== "success") {
    throw new Error(data.message || "Login failed")
  }

  // Cache the token with expiry (subtract 60 seconds for safety margin)
  cachedToken = data.data.access_token
  tokenExpiry = Date.now() + (data.data.expires_in - 60) * 1000

  return cachedToken as string
}

export async function GET() {
  try {
    const token = await getAccessToken()
    const baseUrl = process.env.SIPROPER_API_URL

    const response = await fetch(`${baseUrl}/api/proyek`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      // If unauthorized, try to refresh token
      if (response.status === 401) {
        cachedToken = null
        tokenExpiry = 0
        const newToken = await getAccessToken()
        
        const retryResponse = await fetch(`${baseUrl}/api/proyek`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${newToken}`,
          },
        })

        if (!retryResponse.ok) {
          throw new Error(`Failed to fetch proyek: ${retryResponse.statusText}`)
        }

        const retryData = await retryResponse.json()
        return NextResponse.json(retryData)
      }

      throw new Error(`Failed to fetch proyek: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching proyek:", error)
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
