import { ReplicateStream, StreamingTextResponse } from 'ai';
import { NextResponse } from 'next/server';
import Replicate from 'replicate';
const replicate = new Replicate({
    auth: process.env.REPLICATE_KEY
});

export const runtime = 'edge';

export async function POST(req) {
    const { title, keywords, business_desc } = await req.json();
    let prompt = `no explanation please. in one line, I need only one blog post title for business 
    described as ${business_desc}
    ${title && title.trim() !== "" && "very important to form the title from this example" + title}
    ,${keywords && keywords.trim() !== "" && "very important to form the title from these keywords" + keywords},
    `

    const input = {
        top_k: 0,
        top_p: 0.9,
        prompt,
        temperature: 0.6,
        length_penalty: 1,
        presence_penalty: 1.15,
        // min_new_tokens: 50,
        // max_new_tokens: 20,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
    try {
        const response = await replicate.predictions.create({
            // llama3/70B
            version: `5a6809ca6288247d06daf6365557e5e429063f32a21146b2a807c682652136b8`,
            // model: "meta/meta-llama-3-8b-instruct",
            stream: true,
            input
        })
        clearTimeout(timeoutId); // Clear the timeout if the request completes in time

        const stream = await ReplicateStream(response);
        return new StreamingTextResponse(stream);
    }
    catch (error) {
        if (error.name === 'AbortError') {
            return NextResponse.json({ error: 'Request timed out' }, { status: 408 }); // 408 Request Timeout
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
