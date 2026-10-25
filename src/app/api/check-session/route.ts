import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  const user = await getCurrentUser()

  if (user) {
    return Response.json({ isLoggedIn: true }, { status: 200 })
  } else {
    return Response.json({ isLoggedIn: false }, { status: 200 })
  }
}
