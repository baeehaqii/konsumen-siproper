import { siproperProxy } from "@/lib/siproper"

export async function POST(request: Request) {
  return siproperProxy("sys2", "tracking-komplain", await request.json())
}
