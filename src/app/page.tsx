'use client'

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const [connected, setConnected] = useState<boolean | null>(null)

  const testSupabaseConnection = async () => {
    try {
      // Test connection by checking auth status (always available)
      const { data, error } = await supabase.auth.getSession()
      setConnected(!error)
    } catch (err) {
      setConnected(false)
    }
  }

  return (
    <div className="min-h-screen p-8 flex flex-col items-center justify-center gap-8">
      <main className="flex flex-col gap-8 items-center text-center max-w-2xl">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        
        <h1 className="text-4xl font-bold">
          NextJS + TypeScript + Tailwind + Supabase + Shadcn/ui
        </h1>
        
        <p className="text-lg text-muted-foreground">
          Your scaffolded application is ready to go! All components are properly configured and integrated.
        </p>

        <div className="flex flex-col gap-4 items-center">
          <Button onClick={testSupabaseConnection} variant="outline">
            Test Supabase Connection
          </Button>
          
          {connected !== null && (
            <p className={`text-sm ${connected ? 'text-green-600' : 'text-red-600'}`}>
              {connected ? '✅ Supabase connected successfully!' : '❌ Supabase connection failed - check your environment variables'}
            </p>
          )}
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p>✅ NextJS 15 with App Router</p>
          <p>✅ TypeScript configured</p>
          <p>✅ Tailwind CSS with Shadcn/ui</p>
          <p>✅ Supabase client ready</p>
          <p>✅ Environment variables template</p>
        </div>
      </main>
    </div>
  )
}
