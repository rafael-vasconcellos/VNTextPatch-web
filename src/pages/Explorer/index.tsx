import { createEffect, createSignal, For, Show } from "solid-js"
import Sheet from "../../components/Sheet"
import { useRepoContext } from "./context"
import MenuBar from "../../components/MenuBar"
import SkeletonLoading from "../../components/SkeletonLoading"
import type { Sheet as ISheet } from "../../global/ProjectRepo"
import SheetFooter from "../../components/SheetFooter"


interface ExplorerProps { 
    projectName?: string
}

type ProjectFiles = Record<string, string>

export default function Explorer({  }: ExplorerProps) { 
    const [ repo ] = useRepoContext()
    const [ current_file, setCurrentFile ] = createSignal<string>('')
    const [ project_files, setProjectFiles ] = createSignal<ProjectFiles>({})
    const [ sheet, setSheet ] = createSignal<ISheet>()

    async function getSheetsData() {
        const sheets = await repo()?.getSheets()
        const files: ProjectFiles = {}
        sheets?.forEach(store => {
            files[store.filename] = (((store.translatedRows || 0) / store.rows) * 100).toFixed(2) + "%"
        })
        return { sheets, files }
    }

    createEffect(async() => { //console.log(repo())
        repo()?.open()
        const { sheets, files } = await getSheetsData()
        if (Object.keys(files).length) { 
            setProjectFiles(files)
            setSheet(sheets[0])
            setCurrentFile(sheets[0].filename)
        }

        repo()?.addEventListener<"sheetimport">("sheetimport", async() => {
            const { sheets, files } = await getSheetsData()
            setProjectFiles(files)
            setSheet(sheets.find(sheet => sheet.filename === current_file()))
        })
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
                    <For each={Object.keys(project_files())}>
                        { fileName => { 
                            const color = () => current_file() === fileName? "bg-primary text-white border-[0px]" : "bg-handsontable-background text-handsontable-foreground border-y-[1px]"
                            return <button class={`px-3 py-2 cursor-pointer ${color()} border-handsontable-border font-handsontable text-left flex justify-between items-center`}
                                    onClick={() => setCurrentFile(fileName)}>
                                        {fileName}
                                        <span>{project_files()[fileName]}</span>
                                    </button>
                        }}
                    </For>
                </section>
                <Show when={sheet()}>
                    <Sheet sheet={sheet()} onChange={async sheet => { 
                        const data = await repo().updateSheet(current_file(), sheet)
                        setSheet(data)
                        project_files()[current_file()] = (((data.translatedRows || 0) / data.rows) * 100).toFixed(2) + "%"
                        setProjectFiles({ ...project_files() })
                    }} />
                </Show>
            </main>
            <SheetFooter sheet={sheet()!} />
        </Show>
    )
}