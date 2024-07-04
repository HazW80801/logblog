"use client"
import { supabase } from "@/config/supabase_client"

export default function SignInPage() {
    const signIn = async () => {
        await supabase.auth.signInWithOAuth({ provider: "google" })
    }
    return <div className="wrap">
        <button className="button_small" onClick={signIn}> Signin with Google</button>
    </div>
}