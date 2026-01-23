import { useParams } from "@solidjs/router"
import { createEffect, createSignal, For, Show } from "solid-js"
import { useRepoContext } from "../context/repo"
import { sheets_store, setSheet, updateSheetContent } from "../../global/store"
import Sheet from "../../components/Sheet"
import MenuBar from "../../components/MenuBar"
import SkeletonLoading from "../../components/SkeletonLoading"
import SheetFooter from "../../components/SheetFooter"
import type { Sheet as ISheet } from "../../global/ProjectRepo"



interface ExplorerProps { 
    projectName?: string
}

function getTranslatedPercent(sheet: ISheet) {
    return (
        ((sheet.translatedRows || 0) / sheet.rows) * 100
    ).toFixed(2) + "%"
}

export default function ExplorerPage({  }: ExplorerProps) { 
    const [ current_file, setCurrentFile ] = createSignal<string>('')
    const [ repo ] = useRepoContext()
    const { project_name } = useParams()

    createEffect(async() => { 
        repo()?.open()
        const repoSheets = await repo()?.getSheets()
        repoSheets?.forEach((store, i) => {
            if (i===0) setCurrentFile(store.filename)
            if (!sheets_store[project_name]?.[store.filename]) setSheet(project_name, store.filename, store)
        })

    })

    //createEffect(() => current_file() && console.log(sheets))


    return ( 
        <Show when={current_file() && sheets_store[project_name]?.[current_file()]} fallback={<SkeletonLoading class="h-full absolute top-0" />}>
            <MenuBar />
            <main class="px-8 py-14 flex gap-8">
                <section class="h-fit flex flex-col rounded-xl border-primary border-x-3 border-y-[20px]">
                    <For each={Object.keys(sheets_store[project_name])}>
                        { fileName => { 
                            const color = () => current_file() === fileName? "bg-primary text-white border-[0px]" : "bg-handsontable-background text-handsontable-foreground border-y-[1px]"
                            return <button class={`px-3 py-2 cursor-pointer ${color()} border-handsontable-border font-handsontable text-left flex justify-between items-center`}
                                    onClick={() => setCurrentFile(fileName)}>
                                        {fileName}
                                        <span>{getTranslatedPercent(sheets_store[project_name][fileName])}</span>
                                    </button>
                        }}
                    </For>
                </section>
                <Show when={sheets_store[project_name]?.[current_file()]}>
                    <Sheet sheet={sheets_store[project_name][current_file()]} onChange={({ sheet }) => { 
                        sheet && updateSheetContent(project_name, sheet.filename!, sheet.content!)
                    }} />
                </Show>
            </main>
            <SheetFooter sheet={sheets_store[project_name]?.[current_file()]} />
        </Show>
    )
}