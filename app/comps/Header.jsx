"use client"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/config/supabase_client";
import useUser from "@/utils/useUser";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
    const [user] = useUser()
    const router = useRouter()
    if (user == "no user") router.replace("/signin")
    const signOut = async () => {
        await supabase.auth.signOut()
        router.replace("/signin")
    }

    return (
        <div className="w-full border-b border-white/5 py-4
        px-4 items-center justify-between flex z-50 ">
            <Link href="/dashboard" prefetch className="text-white">
                Log
                <b className="font-mono opacity-90">Blog.</b>
            </Link>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    {user !== "no user" &&
                        <div className="flex space-x-2 items-center justify-center">
                            <img className="rounded-full h-6 w-6 self-center"
                                src={user?.user_metadata.picture} alt={user?.user_metadata.name} />
                            <p className="label text-white">{user?.user_metadata.name}</p>
                        </div>
                    }
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black text-white border-white border-white/10">
                    <Link href={"/dashboard"} >
                        <DropdownMenuItem className="dropmenu_item">
                            dashboard
                        </DropdownMenuItem>
                    </Link>
                    <Link href={"/usage"} >

                        <DropdownMenuItem className="dropmenu_item">
                            usage
                        </DropdownMenuItem>
                    </Link>
                    <Link href={"/plans"} >
                        <DropdownMenuItem className="dropmenu_item">
                            plans
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem className="dropmenu_item"
                        onClick={signOut}>logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div >
    )
}