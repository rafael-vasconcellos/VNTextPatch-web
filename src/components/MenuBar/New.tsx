import type { JSX } from 'solid-js'
import { setProjectStatus } from '../../global/utils'


export default function New({ class: className }: JSX.ButtonHTMLAttributes<HTMLButtonElement>) { 
    function home() { 
        setProjectStatus(false)
    }

    return ( 
        <button class={(className || 'size-8') + ' ' + "cursor-pointer"} onclick={home}>
            <svg class="text-white hover:text-white/40" stroke="currentColor" stroke-width="1.5"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
        </button>
    )
}