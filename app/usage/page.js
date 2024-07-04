"use client"
import useUser from "@/utils/useUser";
import { redirect } from "next/navigation";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { supabase } from "@/config/supabase_client";
import AuthUser from "../comps/AuthUser";
import Header from "../comps/Header";

export default function UsagePage() {
    const [user] = useUser()
    const [loading, setLoading] = useState(false)
    if (user == "no user") redirect("/signin")
    const [usage, setUsage] = useState({
        blogsNumber: 0, postsNumber: 0
    })
    const fetchPosts = async () => {
        setLoading(true)
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const thirtyDaysAgoISOString = thirtyDaysAgo.toISOString();
        const [blogs, posts] = await Promise.all([
            supabase.from("blogs").select().eq("user_id", user?.id)
                .gte("created_at", thirtyDaysAgoISOString),
            supabase.from("blog_posts").select().eq("user_id", user?.id)
                .gte("created_at", thirtyDaysAgoISOString),
        ])
        setUsage({ blogsNumber: blogs.data.length, postsNumber: posts.data.length })
        setLoading(false)
    }
    useEffect(() => {
        if (!supabase || user == "no user" || !user) return;
        fetchPosts()
    }, [supabase, user])
    return (
        <div className="bg-black min-h-screen w-full items-center justify-start text-black flex flex-col">
            <AuthUser />
            <Header />
            <div className="min-h-[50vh] items-center justify-start rounded-lg
             flex flex-col bg-white rounded-lg w-3/4 lg:w-1/2 my-6 py-6 px-6">
                <p className="border-b border-black/10 w-full pb-4 font-bold">usage in the last 30 days</p>
                <span className="w-full flex items-center justify-between mt-12">
                    <p className="w-1/2">blogs</p>
                    <span className="w-full flex items-center justify-end space-x-2">
                        <Progress value={(usage.blogsNumber / 5) * 100} className="progress" />
                        <p>{usage.blogsNumber}/5</p>
                    </span>
                </span>
                <span className="w-full flex items-center justify-between mt-12">
                    <p className="w-1/2">blogs posts</p>
                    <span className="w-full flex items-center justify-end space-x-2">
                        <Progress value={(usage.postsNumber / 20) * 100} className="progress" />
                        <p>{usage.postsNumber}/20</p>
                    </span>
                </span>
            </div>

        </div>
    )
}