"use server"

import { NextResponse } from "next/server"

// Cache for access token
let cachedToken: string | null = null
let tokenExpiry: number = 0

async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  if (cachedToken && Date.now() < tokenExpiry) {
    console.log("✅ Using cached token")
    return cachedToken
  }

  const baseUrl = process.env.SIPROPER_API_URL
  const email = process.env.SIPROPER_EMAIL
  const password = process.env.SIPROPER_PASSWORD

  console.log("🔐 Attempting to login to:", baseUrl)
  console.log("📧 Email:", email ? "✓ Set" : "✗ Missing")
  console.log("🔑 Password:", password ? "✓ Set" : "✗ Missing")

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
    console.error("❌ Login failed:", response.status, response.statusText)
    throw new Error(`Login failed: ${response.statusText}`)
  }

  const data = await response.json()
  console.log("📥 Login response:", JSON.stringify(data, null, 2))

  if (data.status !== "success") {
    console.error("❌ Login unsuccessful:", data.message)
    throw new Error(data.message || "Login failed")
  }

  // Cache the token with expiry (subtract 60 seconds for safety margin)
  cachedToken = data.data.access_token
  tokenExpiry = Date.now() + (data.data.expires_in - 60) * 1000
  
  console.log("✅ Login successful! Token cached for", data.data.expires_in, "seconds")

  return cachedToken as string
}

export async function GET() {
  try {
    console.log("🚀 Starting GET /api/proyek request")
    
    // Check environment variables
    console.log("🔍 Environment check:")
    console.log("  SIPROPER_API_URL:", process.env.SIPROPER_API_URL ? "✓ Set" : "✗ Missing")
    console.log("  SIPROPER_EMAIL:", process.env.SIPROPER_EMAIL ? "✓ Set" : "✗ Missing") 
    console.log("  SIPROPER_PASSWORD:", process.env.SIPROPER_PASSWORD ? "✓ Set" : "✗ Missing")
    
    const token = await getAccessToken()
    const baseUrl = process.env.SIPROPER_API_URL

    console.log("📡 Fetching proyek from:", `${baseUrl}/api/proyek`)
    const response = await fetch(`${baseUrl}/api/proyek`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      console.error("❌ Proyek fetch failed:", response.status, response.statusText)
      
      // If unauthorized, try to refresh token
      if (response.status === 401) {
        console.log("🔄 Token expired, refreshing...")
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
          console.error("❌ Retry failed:", retryResponse.status, retryResponse.statusText)
          throw new Error(`Failed to fetch proyek: ${retryResponse.statusText}`)
        }

        const retryData = await retryResponse.json()
        console.log("✅ Retry successful! Data:", JSON.stringify(retryData, null, 2))
        return NextResponse.json(retryData)
      }

      throw new Error(`Failed to fetch proyek: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Proyek fetched successfully!")
    console.log("📊 Data:", JSON.stringify(data, null, 2))
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching proyek:", error)
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
