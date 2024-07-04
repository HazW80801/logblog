import { ReplicateStream, StreamingTextResponse } from 'ai';
import Replicate from 'replicate';


const replicate = new Replicate({
    auth: process.env.REPLICATE_KEY
});

export const runtime = "edge"

export async function POST(req) {
    const { prompt, business_Description } = await req.json();
    const input = {
        top_k: 0,
        top_p: 0.9,
        prompt: `with no explanation, write human-styled SEO-friendly blog post about this ${prompt},
        for a business that can be described as ${business_Description}. add markdown is important.`,
        temperature: 0.6,
        length_penalty: 1,
        presence_penalty: 1.15,
        // min_new_tokens: 500,
        // max_new_tokens: 1200,
    };

    const response = await replicate.predictions.create({
        // llama3/70B instruct
        version: `fbfb20b472b2f3bdd101412a9f70a0ed4fc0ced78a77ff00970ee7a2383c575d`,
        stream: true,
        input
    })
    const stream = await ReplicateStream(response);
    return new StreamingTextResponse(stream);
}
