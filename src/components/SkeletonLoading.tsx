import type { JSX } from "solid-js";


export default function SkeletonLoading({ class: className }: JSX.HTMLAttributes<HTMLElement>) { 
    return ( 
        <section class={`w-full ${className} bg-zinc-900 animate-pulse flex justify-center items-center`}>
            <span class="text-xl">Loading...</span>
        </section>
    )
}