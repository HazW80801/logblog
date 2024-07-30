"use client"

import { supabase } from "@/config/supabase_client"
import { marked } from "marked"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function PublishedPostPage() {
    const { publishedPostId } = useParams()
    const [postData, setPostData] = useState()
    const router = useRouter()
    const fetchPost = async () => {
        const { data, error } = await supabase.from("blog_posts")
            .select().eq("slug", publishedPostId)
        if (data.length > 0) {
            setPostData(data[0])
        } else {
            router.replace("/")
        }
    }
    useEffect(() => {
        if (!supabase) return;
        fetchPost()
    }, [supabase])
    if (postData) {
        return (
            <div className="items-center justify-center flex py-12 px-6 w-full flex-col">
                <div className="w-1/2 mb-12 pb-5 border-b border-black/10">
                    <h1 className="text-2xl font-bold">{postData?.title}</h1>
                    <p className="text-sm italic text-black/90">
                        {new Date(postData.created_at).toDateString()}
                    </p>
                </div>
                <div className="w-1/2" dangerouslySetInnerHTML={{ __html: postData?.content }} />
            </div>)

    }
    return <></>

}