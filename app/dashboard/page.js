"use client"
import AuthUser from "@/app/comps/AuthUser";
import { supabase } from "@/config/supabase_client";
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { v4 as uuiv4 } from "uuid"
import Link from "next/link";
import useUser from "@/utils/useUser";
import Header from "@/app/comps/Header";
import axios from "axios";


export default function DashboardPage() {
    const [blogs, setBlogs] = useState([])
    const [loading, setLoading] = useState(false)
    const [blogData, setBlogData] = useState({
        name: "",
        description: "",
    })
    const [user] = useUser();
    const [openDialog, setOpenDialog] = useState(false)
    const fetchBlogs = async () => {
        const { data: fetchedBlogs, error } = await
            supabase.from("blogs").select().eq("user_id", user?.id)
        setBlogs(fetchedBlogs)
    }
    useEffect(() => {
        if (!supabase || !user) return
        fetchBlogs()
    }, [supabase, user])
    // create blog 
    const createBlog = async () => {
        if (blogData.name.trim() == "" || blogData.description.trim() == "" || loading) return;
        setLoading(true)
        let blogId = uuiv4()
        let { data: { user } } = await supabase.auth.getUser()
        await supabase.from("blogs")
            .insert([{
                blog_id: blogId, blog_name: blogData.name, user_id: user.id,
                blog_description: blogData.description
            }])
        setLoading(false)
        setOpenDialog(false)
        fetchBlogs()
    }

    // const testCron = async () => {
    //     const response = await fetch('/api/cron', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         },
    //     });
    // }
    return <div className="bg-[#050505] min-h-screen w-full items-center justify-center relative">
        <Header />
        <AuthUser />
        <div className="w-full items-end justify-center flex flex-col p-6">
            <Dialog className="bg-black text-white" open={openDialog}>
                <DialogTrigger className="button" onClick={() => setOpenDialog(true)}>
                    create blog
                </DialogTrigger>
                <DialogContent onInteractOutside={() => setOpenDialog(false)}
                    className="bg-[#080808] text-white 
                        border border-white/10">
                    <DialogHeader>
                        <DialogTitle>tell us more about your business</DialogTitle>
                        <DialogDescription>
                            <div className="py-6 px-4 items-center space-y-10
                                    justify-center flex flex-col mb-6">
                                <input className="input"
                                    placeholder="name"
                                    value={blogData.name}
                                    onChange={(e) =>
                                        setBlogData(curr => ({ ...curr, name: e.target.value }))} />

                                <textarea className="input"
                                    placeholder="description"
                                    value={blogData.description}
                                    onChange={(e) =>
                                        setBlogData(curr => ({ ...curr, description: e.target.value }))} />

                            </div>
                            <button className="button w-full" onClick={createBlog}>
                                {loading ? "creating..." : "create"}</button>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
            {user && blogs?.length == 0 ?
                <div className="items-center justify-center space-y-10
                 flex flex-col w-full py-12 px-6 text-white
            ">
                    <h1>No Blogs Yet, create your first blog now. </h1>
                </div> :
                <div className="py-12 px-6 grid grid-cols-1 w-full
            md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {blogs?.map(blogItem => (
                        <Link key={blogItem.blog_id} href={`/blog/${blogItem.blog_id}`}>
                            <div className="text-white border border-white/20 bg-[#090909] 
                            hover:border-white/50 rounded-lg py-12 w-full px-6 
                            smooth cursor-pointer">
                                <p>{blogItem.blog_name}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            }
        </div>
        {/* <button className="button" onClick={testCron}>test</button> */}
    </div>
}