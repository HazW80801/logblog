"use client"
import AuthUser from "@/app/comps/AuthUser";
import Header from "@/app/comps/Header";
import Tiptap from "@/app/comps/Tiptap";
import { supabase } from "@/config/supabase_client";
import { marked } from "marked";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";


export default function BlogPostPage() {
    const [prompt, setPrompt] = useState("")
    const [loading, setLoading] = useState(false)
    const [streamedText, setStreamedText] = useState('');
    const [postData, setPostData] = useState()
    const { blogPostId } = useParams()
    const router = useRouter()
    const [loadingToPublish, setLoadingToPublish] = useState(false)
    const [slug, setSlug] = useState("")
    const [updateNow, setUpdateNow] = useState(false)

    const fetchPostData = async () => {
        const { data, error } = await supabase.from("blog_posts").select()
            .eq("post_id", blogPostId)
        if (data.length == 0) router.replace("/dashboard")
        setPostData(data[0])
        setPrompt(data[0].title)
        setSlug(data[0].slug ?? "")
    }
    useEffect(() => {
        if (!supabase || !blogPostId) return;
        fetchPostData()
    }, [blogPostId, supabase])
    // create the blog post
    const generatePost = async () => {
        setLoading(true)
        setPostData()
        if (loading) return;
        const { data: blogData } = await supabase.from("blogs").select()
            .eq("blog_id", postData.blog_id)
        let business_Description = blogData[0].blog_description
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt, business_Description })
        });

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
                .replace(".", '\n') // Replace . at the end of the sentence with a newline
                .replace(/"/g, '') // Remove any single/double quotes
                .replace(/\\+/g, '') // Remove any backslashes
                .replace("*", "")
            // .replace(/\\+/g, '') // Remove any backslashes
            // .replace(/"\*\*(.*?)\*\*"/g, '**$1**'); // Format text within **...**
            result += cleanedChunk;
            setStreamedText(result)
        }
        await supabase.from("blog_posts").update({ "content": result })
            .eq("post_id", blogPostId).select()
        fetchPostData()
        setLoading(false)
    };
    // publish post 
    const publishPost = async () => {
        setLoadingToPublish(true)
        if (slug.trim() == "" || loadingToPublish) return;
        const { data } = await supabase.from("blog_posts").select("*")
        if (slugDuplicate(data, slug)) {
            window.alert(`this slug is used before, make sure your slug is unique., ${slug}`)
            setLoadingToPublish(false)
            return;
        }
        await supabase.from("blog_posts")
            .update({ state: "published", slug: slug.trim() }).eq("post_id", blogPostId)
        setUpdateNow(true) // in order to convert the string to HTML and store it as html in the database
        fetchPostData()
        setLoadingToPublish(false)
    }
    const slugDuplicate = (data, slugText) => {
        if (data.filter(item => item.slug == slugText).length > 0) { return true }
        else { return false }
    }

    return (
        <main className="wrap relative">
            <AuthUser innerPage={{ table: "blog_posts", column: "post_id" }} />
            <Header />
            <Link prefetch href={postData?.slug ? `/p/${postData?.slug}` : `/post/${postData?.post_id}`}
                className="text-white py-6 mb-6 text-left border-b text-xl
             border-white/10 w-3/4 flex items-center justify-between group">
                <h1 className="">
                    {postData?.title}
                </h1>
                {postData?.state == "published" && <ArrowUpRightIcon className="h-8 w-8 stroke-white
                 group-hover:translate-x-1 group-hover:-translate-y-1 smooth" />}
            </Link>

            <div className=" bg-white text-black
            py-12 px-6 min-h-screen w-3/4 mb-12">
                {(loading || !postData?.content) ?
                    <div className="text-black">
                        {streamedText}
                    </div>
                    : <div className="">
                        <Tiptap updateNow={updateNow} content={marked(postData?.content)} />
                    </div>
                }
            </div>
            <footer className="footer">
                <button onClick={generatePost} className="button">
                    {loading ? "generating..." : postData?.content ? "regenerate" : "generate"}</button>
                {postData?.content &&
                    <>
                        {postData?.state !== "published" &&
                            < Popover>
                                <PopoverTrigger className="button">publish</PopoverTrigger>
                                <PopoverContent className="bg-black text-white
                             border border-white/10 rounded-lg space-y-6 pt-6">

                                    <input className="input" placeholder="slug" type="text"
                                        value={slug.replaceAll(" ", "-")}
                                        onChange={(e) => setSlug(e.target.value)} />

                                    <button className="button"
                                        onClick={slug.trim() !== "" ? publishPost : null}>

                                        {loadingToPublish ?
                                            "publishing..." : "publish"}
                                    </button>
                                </PopoverContent>
                            </Popover >
                        }
                    </>
                }

            </footer>
        </main >
    );
}
