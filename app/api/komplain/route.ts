import { siproperProxy } from "@/lib/siproper"

export async function POST(request: Request) {
  return siproperProxy("sys2", "komplain-baru", await request.json())
}
