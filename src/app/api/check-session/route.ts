import { currentUser } from '@clerk/nextjs/server'

export async function GET() {
  const userId = await currentUser()

  if (userId) {
    return Response.json({ isLoggedIn: true }, { status: 200 })
  } else {
    return Response.json({ isLoggedIn: false }, { status: 200 })
  }
}
