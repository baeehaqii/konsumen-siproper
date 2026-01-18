"use server"

import { NextResponse } from "next/server"

// Cache for access token (shared with other routes)
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

export async function POST(request: Request) {
  try {
    console.log("🚀 Starting POST /api/tracking-komplain request")
    
    const body = await request.json()
    console.log("📤 Tracking data:", JSON.stringify(body, null, 2))
    
    const token = await getAccessToken()
    const baseUrl = process.env.SIPROPER_API_URL

    console.log("📡 Sending tracking request to:", `${baseUrl}/api/tracking-komplain`)
    const response = await fetch(`${baseUrl}/api/tracking-komplain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.error("❌ Tracking request failed:", response.status, response.statusText)
      
      // Try to get error message from response
      const errorText = await response.text()
      console.error("❌ Error response body:", errorText)
      
      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || response.statusText }
      }
      
      // If unauthorized, try to refresh token
      if (response.status === 401) {
        console.log("🔄 Token expired, refreshing...")
        cachedToken = null
        tokenExpiry = 0
        const newToken = await getAccessToken()
        
        const retryResponse = await fetch(`${baseUrl}/api/tracking-komplain`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${newToken}`,
          },
          body: JSON.stringify(body),
        })

        if (!retryResponse.ok) {
          console.error("❌ Retry failed:", retryResponse.status, retryResponse.statusText)
          const retryErrorText = await retryResponse.text()
          console.error("❌ Retry error body:", retryErrorText)
          
          let retryErrorData
          try {
            retryErrorData = JSON.parse(retryErrorText)
          } catch {
            retryErrorData = { message: retryErrorText || retryResponse.statusText }
          }
          
          throw new Error(retryErrorData.message || `Failed to track komplain: ${retryResponse.statusText}`)
        }

        const retryData = await retryResponse.json()
        console.log("✅ Retry successful! Response:", JSON.stringify(retryData, null, 2))
        return NextResponse.json(retryData)
      }

      // Return error from first attempt
      throw new Error(errorData.message || `Failed to track komplain: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Tracking request successful!")
    console.log("📊 Response:", JSON.stringify(data, null, 2))
    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Error tracking komplain:", error)
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}