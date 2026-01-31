import { For, Show } from "solid-js"
import { createEffect } from "solid-js"
import { projects, setProjects } from "../../global/utils"
import SkeletonLoading from "../SkeletonLoading"
import './style.css'



interface LocalProjectsProps { 
    onClick?: (s: string) => void
}

export default function LocalProjects({ onClick }: LocalProjectsProps) { 
    function deleteProject(projectName: string) { 
        setProjects(
            projects()?.filter(p => p!==projectName) ?? []
        )
        const request = indexedDB.deleteDatabase(projectName)
        request.onerror = () => console.error(request.error)
    }

    createEffect(async() => {
        const dbs: string[] = (await indexedDB.databases() as any[]).map(db => db.name)
        setProjects(dbs.filter(name => name !== "config"))
    })


    return ( 
        <Show when={projects()} fallback={<SkeletonLoading class="h-44" />}>
            <section class="w-full flex flex-col gap-5">
                { projects()!.length > 0 && <span class="text-xl font-bold text-zinc-500">Local saved projects</span> }
                <For each={projects()}>
                    { projectName => 
                        <button class="p-4 text-xl border-2 border-zinc-600 rounded-lg cursor-pointer relative hover:bg-white hover:text-black hover:border-transparent" 
                        onClick={() => onClick && onClick(projectName as string)}>
                            {projectName}
                            <svg class="size-6 p-1 text-white bg-red-800 absolute top-0 right-0" stroke="currentColor" stroke-width="1.5" 
                            onClick={(e) => { 
                                deleteProject(projectName as string)
                                e.stopPropagation()
                            } } xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                            </svg>
                        </button> 
                    }
                </For>
            </section>
        </Show>
    )
}