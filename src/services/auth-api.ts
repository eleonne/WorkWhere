type AuthMeClaim = { typ: string; val: string }

type AuthMeEntry = {
  user_id: string
  provider_name: string
  user_claims: AuthMeClaim[]
}

export type UserInfo = {
  name: string
  email: string
}

export const fetchCurrentUser = async (): Promise<UserInfo | null> => {
  try {
    const res = await fetch('/.auth/me')
    if (!res.ok) return null

    const data = await res.json() as AuthMeEntry[]
    const entry = data[0]
    if (!entry) return null

    const getClaim = (typ: string) =>
      entry.user_claims.find((c) => c.typ === typ)?.val ?? ''

    const name = getClaim('name') || getClaim('preferred_username') || entry.user_id
    const email = getClaim('preferred_username') || entry.user_id

    return { name, email }
  } catch {
    return null
  }
}
