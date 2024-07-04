import { supabase } from '@/config/supabase_client'
import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from "uuid"
export const runtime = "edge"

export async function GET(req) { //GET
    const response = await update()
    return new NextResponse(JSON.stringify(response), {
        status: 200,
    })
}
// the function u wanna run
// 1. generate blog article idea
// 2. generate blog post
// 3. store to the database
async function update() {
    const { data: fetchedBlogs, error } = await supabase.from("blogs").select()
    for (const blog of fetchedBlogs) {
        const { user_id, blog_id, blog_description } = blog;
        let generatedTitle = "";
        let blogPostId = "";
        const createPostIdea = async () => {
            let payload = {
                business_desc: blog_description
            }
            const response = await fetch('http://localhost:3000/api/idea', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
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
                    .replace(/""/g, '') // Remove any double quotes
                    .replace(/"/g, '') // Remove any single/double quotes
                    .replace(/\\+/g, '') // Remove any backslashes
                    .replace(/"\*\*(.*?)\*\*"/g, '**$1**'); // Format text within **...**

                result += cleanedChunk;
            }
            blogPostId = uuidv4()
            await supabase.from("blog_posts")
                .insert([{
                    blog_id, user_id,
                    title: result, state: "draft", post_id: blogPostId
                }]).select()
            generatedTitle = result;


        }
        const generatePost = async () => {

            const response = await fetch('http://localhost:3000/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: generatedTitle,
                    business_Description: blog_description
                })
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
            }
            await supabase.from("blog_posts").update({ "content": result })
                .eq("post_id", blogPostId).select()
        };
        await createPostIdea();
        await generatePost();
    }
    return { message: "success" }
}