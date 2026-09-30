import { createHmac, timingSafeEqual } from "node:crypto"

// Token link konsumen = HMAC(secret, id). Hanya server yang tahu secret, jadi URL
// konsumen lain tidak bisa ditebak dengan mengganti ID (mis. B-1 → B-2).
// ponytail: token stateless tanpa kedaluwarsa; tambah expiry/rotasi secret kalau link perlu dicabut
const normalize = (id: string) => id.replace(/\/+/g, "/") // URL merapatkan "//"

export function konsumenToken(id: string) {
  const secret = process.env.KONSUMEN_LINK_SECRET
  if (!secret) throw new Error("KONSUMEN_LINK_SECRET belum di-set")
  return createHmac("sha256", secret).update(normalize(id)).digest("base64url").slice(0, 22)
}

export function isValidKonsumenToken(id: string, token: string) {
  const a = Buffer.from(konsumenToken(id))
  const b = Buffer.from(token)
  return a.length === b.length && timingSafeEqual(a, b)
}
