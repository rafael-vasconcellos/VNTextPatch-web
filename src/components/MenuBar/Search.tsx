import { useNavigate } from "@solidjs/router"
import { Show } from "solid-js"
import type { JSX } from "solid-js"
import { useRepoContext } from "../../pages/context/repo"


export default function Search({ class: className }: JSX.ButtonHTMLAttributes<HTMLButtonElement>) { 
    const [ repo ] = useRepoContext()
    const navigate = useNavigate()

    return (
        <Show when={repo()?.projectName}>
            <button class={`${className || 'size-8'} cursor-pointer group`} onClick={() => navigate(`/${repo()?.projectName}/search`)}>
                <svg class="text-primary group-hover:text-primary/60" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
            </button>
        </Show>
    )
}