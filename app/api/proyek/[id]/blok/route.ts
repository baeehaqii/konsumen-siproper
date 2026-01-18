"use server"

import { NextResponse } from "next/server"

// Cache for access token (shared with proyek route)
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log("🚀 Starting GET /api/proyek/[id]/blok request for proyek ID:", id)
    const token = await getAccessToken()
    const baseUrl = process.env.SIPROPER_API_URL

    console.log("📡 Fetching blok from:", `${baseUrl}/api/proyek/${id}/blok`)
    const response = await fetch(`${baseUrl}/api/proyek/${id}/blok`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      console.error("❌ Blok fetch failed:", response.status, response.statusText)
      
      // If unauthorized, try to refresh token
      if (response.status === 401) {
        console.log("🔄 Token expired, refreshing...")
        cachedToken = null
        tokenExpiry = 0
        const newToken = await getAccessToken()
        
        const retryResponse = await fetch(`${baseUrl}/api/proyek/${id}/blok`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${newToken}`,
          },
        })

        if (!retryResponse.ok) {
          console.error("❌ Retry failed:", retryResponse.status, retryResponse.statusText)
          throw new Error(`Failed to fetch blok: ${retryResponse.statusText}`)
        }

        const retryData = await retryResponse.json()
        console.log("✅ Retry successful! Blok data:", JSON.stringify(retryData, null, 2))
        
        const retryBlokArray = retryData.blok || []
        
        if (!retryBlokArray || retryBlokArray.length === 0) {
          return NextResponse.json(
            { status: "error", message: "Proyek belum memiliki blok" },
            { status: 404 }
          )
        }
        
        return NextResponse.json({
          status: "success",
          data: retryBlokArray
        })
      }

      throw new Error(`Failed to fetch blok: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Blok fetched successfully!")
    console.log("📊 Full Response:", JSON.stringify(data, null, 2))
    
    // Extract blok array from response
    const blokArray = data.blok || []
    console.log("📊 Blok array:", blokArray)
    console.log("📊 Blok count:", blokArray.length)
    
    // Check if proyek has blok
    if (!blokArray || blokArray.length === 0) {
      console.log("⚠️ Proyek tidak memiliki blok")
      return NextResponse.json(
        { status: "error", message: "Proyek belum memiliki blok" },
        { status: 404 }
      )
    }

    console.log("✅ Returning", blokArray.length, "blok to frontend")
    return NextResponse.json({
      status: "success",
      data: blokArray
    })
  } catch (error) {
    console.error("Error fetching blok:", error)
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
