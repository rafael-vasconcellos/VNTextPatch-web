import { createEffect, createSignal, For, Show } from "solid-js"
import Sheet from "../../components/Sheet"
import { useRepoContext } from "./context"
import MenuBar from "../../components/MenuBar"
import SkeletonLoading from "../../components/SkeletonLoading"
import type { StoreItem } from "../../global/Repo"


interface ExplorerProps { 
    projectName?: string
}

export default function Explorer({  }: ExplorerProps) { 
    const [ repo ] = useRepoContext()
    const [ current_file, setCurrentFile ] = createSignal<string>('')
    const [ project_files, setProjectFiles ] = createSignal<string[]>([])
    const [ sheet, setSheet ] = createSignal<StoreItem>()

    createEffect(async() => { //console.log(repo())
        repo()?.open()
        const sheets = await repo()?.getSheets()
        const files = sheets?.map(store => store.filename)
        if (files.length) { 
            setProjectFiles(files)
            setSheet(sheets[0])
            setCurrentFile(files[0])
        }
    })

    createEffect(async() => { 
        if (current_file() && current_file() !== sheet()?.filename) { 
            const s = await repo()?.getSheet(current_file())
            s && setSheet(s)
        }
    })


    return ( 
        <Show when={current_file() && sheet()} fallback={<SkeletonLoading />}>
            <MenuBar />
            <main class="px-8 py-14 flex gap-8">
                <section class="h-fit flex flex-col rounded-xl border-primary border-x-3 border-y-[20px]">
                    <For each={project_files()}>
                        { fileName => { 
                            const color = () => current_file() === fileName? "bg-primary text-white border-[0px]" : "bg-handsontable-background text-handsontable-foreground border-y-[1px]"
                            return <button class={`px-3 py-2 cursor-pointer ${color()} border-handsontable-border font-handsontable text-left`}
                                    onClick={() => setCurrentFile(fileName)}>
                                        {fileName}
                                    </button>
                        }}
                    </For>
                </section>
                <Show when={sheet()}>
                    <Sheet sheet={sheet()} onChange={sheet => { 
                        repo().updateSheet(current_file(), sheet)
                    }} />
                </Show>
            </main>
        </Show>
    )
}