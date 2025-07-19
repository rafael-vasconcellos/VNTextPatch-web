import type { JSX } from "solid-js";


export default function UploadFiles({ onChange, ref }: JSX.InputHTMLAttributes<HTMLInputElement>) { 
    return( 
        <section class="w-[400px] h-52 border-dashed border-4 border-zinc-600 rounded-2xl flex flex-col items-center justify-center">
            <input ref={ref} class="appearance-none w-full h-full px-6 text-zinc-300" 
            type="file" id="fileInput" onChange={onChange} multiple />
            <svg class="size-20 opacity-50 absolute" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
        </section>
    )
}