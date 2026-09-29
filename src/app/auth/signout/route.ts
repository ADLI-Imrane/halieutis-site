import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { SESSION_COOKIE } from '@/lib/admin-session'

export async function POST() {
  return handleSignOut()
}

export async function GET() {
  return handleSignOut()
}

async function handleSignOut() {
  ;(await cookies()).delete(SESSION_COOKIE)

  revalidatePath('/', 'layout')
  redirect('/dashboard/login')
}
