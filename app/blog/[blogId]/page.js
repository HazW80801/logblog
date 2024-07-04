"use client"
import AuthUser from "@/app/comps/AuthUser"
import Header from "@/app/comps/Header"
import { TypewriterEffect } from "@/app/post/[blogPostId]/page"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { supabase } from "@/config/supabase_client"
import useUser from "@/utils/useUser"
import axios from "axios"
import { marked } from "marked"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { v4 as uuiv4 } from "uuid"


export default function BlogPage() {
    const [user] = useUser()
    const { blogId } = useParams()
    const [posts, setPosts] = useState([])
    const [openDialog, setOpenDialog] = useState(false)
    const [loading, setLoading] = useState(false)
    const [blogData, setBlogData] = useState()
    const [postData, setPostData] = useState({
        title: "",
        keywords: ""
    })
    const [streamedText, setStreamedText] = useState("")
    const [openCronDialog, setOpenCronDialog] = useState(false)
    const fetchPosts = async () => {
        const { data: blogPosts, error } = await supabase.from("blog_posts")
            .select().eq("blog_id", blogId).eq("user_id", user?.id)
        setPosts(blogPosts)
    }
    const fetchBlogData = async () => {
        const { data: businessData, error } = await supabase.from("blogs")
            .select().eq("blog_id", blogId).eq("user_id", user?.id)
        setBlogData(businessData[0])
    }
    useEffect(() => {
        if (!supabase || !user || !blogId) return;
        fetchPosts()
        fetchBlogData()
    }, [supabase, user, blogId])
    // generate new post
    const createPostIdea = async () => {
        let payload = {
            title: postData.title, keywords: postData.keywords,
            business_desc: blogData.blog_description
        }
        setLoading(true)
        const response = await fetch('/api/idea', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (response.status == 500) {
            return
            setLoading(false)
            setOpenDialog(false)
            setPostData({ title: "", keywords: "" })
            setStreamedText("")
            alert("sorry there is a problem.")
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result = '';
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            // Clean the streamed chunk
            const cleanedChunk = chunk
                .replace(/0:"/g, '') // Remove the 0:"
                .replace(/\\n/g, '\n') // Replace \n with an actual newline
                .replace(/\\n\d+/g, '\n') // Replace \n followed by digits with a newline
                .replace(/""/g, '') // Remove any double quotes
                .replace(/"/g, '') // Remove any single/double quotes
                .replace(/\\+/g, '') // Remove any backslashes
                .replace(/"\*\*(.*?)\*\*"/g, '**$1**'); // Format text within **...**

            result += cleanedChunk;
            setStreamedText(result)
        }
        let postId = uuiv4()
        await supabase.from("blog_posts")
            .insert([{
                blog_id: blogId, user_id: user?.id,
                title: result, state: "draft", post_id: postId
            }]).select()
        setTimeout(() => {
            setLoading(false)
            setOpenDialog(false)
            fetchPosts()
            setPostData({ title: "", keywords: "" })
            setStreamedText("")
        }, 2000)
    }
    return <div className="wrap">
        <AuthUser innerPage={{ table: "blogs", column: "blog_id" }} />
        <Header />
        <div className="w-full items-center
         justify-end flex py-4 px-8 mb-10 mt-6">
            <Dialog className="bg-black text-white" open={openDialog}>
                <DialogTrigger className="button"
                    onClick={() => setOpenDialog(true)}>
                    new post idea
                </DialogTrigger>
                <DialogContent onInteractOutside={() => setOpenDialog(false)}
                    className="bg-[#080808] text-white 
                        border border-white/10">
                    <DialogHeader>
                        <DialogTitle>generate new post idea</DialogTitle>
                        <DialogDescription>
                            <div className="py-6 px-4 items-center space-y-10
                                    justify-center flex flex-col mb-6">
                                <input className="input"
                                    placeholder="title (optional)"
                                    value={postData.title}
                                    onChange={(e) =>
                                        setPostData(curr => ({ ...curr, title: e.target.value }))} />

                                <textarea className="input"
                                    placeholder="keywords (optional) [use , between each keyword]"
                                    value={postData.keywords}
                                    onChange={(e) =>
                                        setPostData(curr => ({ ...curr, keywords: e.target.value }))} />
                            </div>
                            <p className="button w-full" onClick={createPostIdea}>
                                {loading ? "creating..." : "create"}</p>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
        <div className="items-center justify-center flex
         flex-col overflow-y-scroll mb-12
        pb-12 pt-6 w-3/4 bg-[#070707] border border-white/10 space-y-8">
            {/* draft */}
            <div className="w-full items-center justify-center flex flex-col">
                <h1 className="post_state">
                    Draft
                </h1>
                {streamedText && <span className="post_title">
                    {streamedText}
                </span>}
                <div className="space-y-4 w-full">
                    {posts?.filter(post => post.state == "draft").map(post => (
                        <Link key={post.post_id} href={`/post/${post.post_id}`}>
                            <div className="post_title"
                                dangerouslySetInnerHTML={{ __html: marked(post.title) }}
                            />
                        </Link>
                    ))}
                </div>

            </div>
            {/* in review */}
            <div className="w-full items-center justify-center flex flex-col">
                <h3 className="post_state">
                    in review
                </h3>
                {posts?.filter(post => post.state == "in review").map(post => (
                    <div key={post.post_id} className="w-full py-4 items-start justify-start flex text-white px-4">
                        <h2 className="post_title">{post.title}</h2>
                    </div>
                ))}
            </div>
            {/* published */}
            <div className="w-full items-center justify-center flex flex-col">
                <h3 className="post_state">
                    Published
                </h3>
                {posts?.filter(post => post.state == "published").map(post => (
                    <Link key={post.post_id} href={`/post/${post.post_id}`} className="w-full">
                        <div className="w-full py-4 items-start justify-start flex text-white px-4">
                            <h2 className="post_title">{post.title}</h2>
                        </div>
                    </Link>

                ))}
            </div>
        </div>
    </div>
}