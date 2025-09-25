import { createEffect, createSignal, Show } from "solid-js"
import "./style.css"



const repo_path = "rafael-vasconcellos/VNTextPatch-web"
const [ release_name, setReleaseName ] = createSignal<string | null>(null)
const [ stars_count, setStarsCount ] = createSignal<number | null>(null)

export const download_url = () => release_name()? `https://github.com/${repo_path}/releases/tag/${release_name()}`
    : "https://github.com/" + repo_path

async function getRepoStars(): Promise<number> { 
    const response: Record<string, any> = await fetch("https://api.github.com/repos/" + repo_path)
    .then(response => response.json())
    .catch(() => null)
    return response?.stargazers_count ?? ""
}

async function getReleases(): Promise<string> { 
    const response: Record<string, any>[] = await fetch(`https://api.github.com/repos/${repo_path}/releases`)
    .then(response => response.json())
    .catch(() => null)
    return response?.[0]?.name ?? ""
}

export function GithubStats() { 
    createEffect(async() => { 
        if (!release_name() || !stars_count()) { return
            const [ stars, release ] = await Promise.all([ getRepoStars(), getReleases() ])
            setStarsCount(stars)
            setReleaseName(release)
        }
    })

    return ( 
        <section class="absolute right-5">
            <a class="flex gap-1 items-center" href={"https://github.com/" + repo_path}>
                <GitHubLogo className="size-8 fill-zinc-500" />
                {/* <span>{repo_path}</span> */}
            </a>
            <div class="py-1 flex gap-1 items-center">
                <Show when={release_name()}>
                    <GithubTagLogo />
                    <span class="pr-2">{release_name()}</span>
                </Show>
                <Show when={stars_count()}>
                    <GithubStarsLogo />
                    <span>{stars_count()}</span>
                </Show>
            </div>
        </section>
    )
}


export default function CTA() {
    return (
        <a id="contributeBtn" class="cta pulse absolute right-5 top-6" href="https://github.com/username/repo" target="_blank" rel="noopener noreferrer" role="button" aria-label="Contribuir no GitHub — abre em nova aba" title="Abrir https://github.com/username/repo (abre em nova aba)">
            {/* GitHub Mark (SVG) */}
            <svg viewBox="0 0 16 16" aria-hidden="true">
                <path fill="white" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52
                -.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64
                -.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.01.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68
                0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.11.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87
                3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42
                -3.58-8-8-8z"></path>
            </svg>

            <span class="inline-block text-left">
                <div class="text-[15px]">Contribuir no GitHub</div>
                <div class="text-[12px] opacity-90">Abra issues, envie PRs ou deutscher um ⭐</div>
            </span>
        </a>
    )
}


interface GitHubLogoProps { 
    className?: string
}

function GitHubLogo({ className }: GitHubLogoProps) { 
    return ( 
        <svg class={className + ' ' + "group"} aria-hidden="true" viewBox="0 0 24 24">
            <path class="group-hover:fill-zinc-500" d="M12 1C5.9225 1 1 5.9225 1 12C1 16.8675 4.14875 20.9787 8.52125 22.4362C9.07125 22.5325 9.2775 22.2025 9.2775 21.9137C9.2775 21.6525 9.26375 20.7862 9.26375 19.865C6.5 20.3737 5.785 19.1912 5.565 18.5725C5.44125 18.2562 4.905 17.28 4.4375 17.0187C4.0525 16.8125 3.5025 16.3037 4.42375 16.29C5.29 16.2762 5.90875 17.0875 6.115 17.4175C7.105 19.0812 8.68625 18.6137 9.31875 18.325C9.415 17.61 9.70375 17.1287 10.02 16.8537C7.5725 16.5787 5.015 15.63 5.015 11.4225C5.015 10.2262 5.44125 9.23625 6.1425 8.46625C6.0325 8.19125 5.6475 7.06375 6.2525 5.55125C6.2525 5.55125 7.17375 5.2625 9.2775 6.67875C10.1575 6.43125 11.0925 6.3075 12.0275 6.3075C12.9625 6.3075 13.8975 6.43125 14.7775 6.67875C16.8813 5.24875 17.8025 5.55125 17.8025 5.55125C18.4075 7.06375 18.0225 8.19125 17.9125 8.46625C18.6138 9.23625 19.04 10.2125 19.04 11.4225C19.04 15.6437 16.4688 16.5787 14.0213 16.8537C14.42 17.1975 14.7638 17.8575 14.7638 18.8887C14.7638 20.36 14.75 21.5425 14.75 21.9137C14.75 22.2025 14.9563 22.5462 15.5063 22.4362C19.8513 20.9787 23 16.8537 23 12C23 5.9225 18.0775 1 12 1Z"></path>
        </svg>
    )
}

function GithubTagLogo({ className }: GitHubLogoProps) { 
    return ( 
        <svg class={`size-4 fill-zinc-500 ${className}`} style="vertical-align:text-bottom" aria-hidden="true" viewBox="0 0 16 16">
            <path d="M1 7.775V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 0 1 0 2.474l-5.026 5.026a1.75 1.75 0 0 1-2.474 0l-6.25-6.25A1.752 1.752 0 0 1 1 7.775Zm1.5 0c0 .066.026.13.073.177l6.25 6.25a.25.25 0 0 0 .354 0l5.025-5.025a.25.25 0 0 0 0-.354l-6.25-6.25a.25.25 0 0 0-.177-.073H2.75a.25.25 0 0 0-.25.25ZM6 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"></path>
        </svg>
    )
}

function GithubStarsLogo({ className }: GitHubLogoProps) { 
    return ( 
        <svg class={`size-4 fill-zinc-500 ${className}`} style="vertical-align:text-bottom" aria-hidden="true" viewBox="0 0 16 16">
            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"></path>
        </svg>
    )
}

export function Fallback(props: { value?: any }) { 
    return ( 
        <Show when={props.value}>
            <p>Loading...</p>
        </Show>
    )
}