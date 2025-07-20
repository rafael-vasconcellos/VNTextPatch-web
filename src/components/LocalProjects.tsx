import { For } from "solid-js"
import { createEffect, createSignal } from "solid-js"


interface LocalProjectsProps { 
    onClick?: (s: string) => void
}

export default function LocalProjects({ onClick }: LocalProjectsProps) { 
    const [ projects, setProjects ] = createSignal<(string | undefined)[]>([])
    createEffect(async() => { 
        const dbs = await indexedDB.databases()
        setProjects(dbs.map(db => db.name))
    })

    return ( 
        <For each={projects()}>
            { projectName => 
                <button class="p-4 text-xl border-2 border-zinc-800 rounded-lg cursor-pointer hover:bg-white hover:text-black" 
                 onClick={() => onClick && onClick(projectName as string)}>
                    {projectName}
                </button> 
            }
        </For>
    )
}