import type { JSX } from "solid-js";


export default function SkeletonLoading({  }: JSX.HTMLAttributes<HTMLElement>) { 
    return ( 
        <section class={"w-full h-full absolute top-0 bg-zinc-900 animate-pulse flex justify-center items-center"}>
            <span class="text-xl">Loading...</span>
        </section>
    )
}