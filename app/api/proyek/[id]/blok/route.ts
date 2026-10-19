import { siproperGet } from "@/lib/siproper"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const res = await siproperGet("sys2", `proyek/${encodeURIComponent((await params).id)}/blok`)
    if (!res.ok) return Response.json({ status: "error", message: `Gagal memuat blok (${res.status})` }, { status: res.status })
    const blok = (await res.json()).blok ?? []
    if (!blok.length) return Response.json({ status: "error", message: "Proyek belum memiliki blok" }, { status: 404 })
    return Response.json({ status: "success", data: blok })
  } catch (e) {
    return Response.json({ status: "error", message: e instanceof Error ? e.message : "Unknown error" }, { status: 500 })
  }
}
