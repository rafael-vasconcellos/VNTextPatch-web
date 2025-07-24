import { For } from "solid-js"
import { createEffect } from "solid-js"
import './style.css'
import { projects, setProjects } from "../../global/utils"


interface LocalProjectsProps { 
    onClick?: (s: string) => void
}

export default function LocalProjects({ onClick }: LocalProjectsProps) { 
    createEffect(getProjects)

    async function getProjects() { 
        const dbs = await indexedDB.databases()
        setProjects(dbs.map(db => db.name))
    }

    function deleteProject(projectName: string) { 
        const request = indexedDB.deleteDatabase(projectName)
        request.onerror = () => console.error(request.error)
        request.onsuccess = getProjects
    }


    return ( 
        <For each={projects()}>
            { projectName => 
                <button class="p-4 text-xl border-2 border-zinc-800 rounded-lg cursor-pointer relative hover:bg-white hover:text-black" 
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
    )
}