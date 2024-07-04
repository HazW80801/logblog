"use client"
import { supabase } from "@/config/supabase_client"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
//  only authenticated users

export default function AuthUser({ innerPage }) {
    const router = useRouter()
    const { blogId } = useParams()
    const { blogPostId } = useParams()
    const pageId = blogId ?? blogPostId
    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) router.replace("/signin")
        if (innerPage) {
            const { data } = await supabase.from(`${innerPage.table}`)
                .select().eq("user_id", user.id)  // check if the current page is created by the current user
                .eq(`${innerPage.column}`, pageId) // check if the current page exists or not.}
        }
    }
    useEffect(() => {
        if (!supabase) return;
        fetchUser()
    }, [supabase])
    return <></>
}