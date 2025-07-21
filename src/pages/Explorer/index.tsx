import { createEffect, createSignal, For, Show } from "solid-js"
import Sheet from "../../components/Sheet"
import { useRepoContext } from "./context"


interface ExplorerProps { 
    projectName?: string
}

export default function Explorer({  }: ExplorerProps) { 
    const [ repo ] = useRepoContext()
    const [ current_file, setCurrentFile ] = createSignal<string>('')
    const [ project_files, setProjectFiles ] = createSignal<string[]>([])
    const [ sheet, setSheet ] = createSignal<string[][] | undefined>()

    createEffect(async() => { console.log(repo())
        repo()?.open()
        const files = await repo()?.getSheets().then(sheets => sheets?.map(store => store.filename))
        if (files) { 
            setProjectFiles(files); setCurrentFile(files[0])
        }
    })

    createEffect(async() => { 
        if (current_file()) { 
            const s = await repo()?.getSheet(current_file())
            s && setSheet(s)
        }
    })


    return ( 
        <main class="p-14 flex gap-16">
            <section class="h-fit bg-zinc-800 flex flex-col rounded-xl border-white border-x-2 border-y-[20px]">
                <For each={project_files()}>
                    { fileName => 
                        <button class="px-3 cursor-pointer text-left border-white border-[1px]"
                         onClick={() => setCurrentFile(fileName)}>
                            {fileName}
                        </button> 
                    }
                </For>
            </section>
            <Show when={sheet()}>
                <Sheet sheet={sheet} onChange={sheet => { 
                    repo().updateSheet(current_file(), sheet)
                }} />
            </Show>
        </main>
    )
}