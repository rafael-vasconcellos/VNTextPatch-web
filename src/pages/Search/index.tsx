import { useNavigate, useParams } from "@solidjs/router";
import { createEffect, createSignal, Show } from "solid-js";
import { unwrap } from "solid-js/store";
import { ProjectRepo } from "../../global/ProjectRepo";
import { setSheets, sheets as sheetsStore, updateSheetContent } from "../../global/utils";
import type { Sheet as ISheet } from "../../global/ProjectRepo";
import Sheet from "../../components/Sheet";



export default function Search() { 
    const { project_name } = useParams()
    const navigate = useNavigate()
    const [ results, setResults ] = createSignal<ISheet[] | null>(null)
    const [ current_file, setCurrentFile ] = createSignal<number>(0)
    const [ displayReplace, setReplaceDisplay ] = createSignal(false)
    const arrowStyle = () => displayReplace()? "rotate-90" : ""
    const replaceStyle = () => displayReplace()? "" : "hidden"
    const repo = new ProjectRepo(project_name)
    let includeOriginal = false
    let useRegexp = false

    async function onSearch(e: Event & {
        currentTarget: HTMLInputElement;
        target: HTMLInputElement;
    }) { 
        const value = (document.getElementById("searchInput") as HTMLInputElement)?.value?.toLowerCase() ?? ""
        const value2 = (document.getElementById("replaceInput") as HTMLInputElement)?.value?.toLowerCase() ?? ""
        if (!value) return
        const sheets = structuredClone(unwrap(sheetsStore))
        const r: ISheet[] = []
        const doReplace = e.target.id === "replaceInput"
        for (const sheetName in sheets) {
            const sheet = sheets[sheetName]
            let value_tmp = value
            sheet.originalIndexes = []

            if (doReplace) { 
                sheet.content = sheet.content.map(row => {
                    return row.map(cell => cell?.toLowerCase()?.replaceAll(value, value2) ?? cell)
                })
                updateSheetContent(sheet.filename, sheet.content)
                value_tmp = value2
            }

            sheet.content = sheet.content.filter((row, rowIndex) => { 
                if (!includeOriginal) row = row.slice(1)
                if (useRegexp) return row.some(cell => new RegExp(value_tmp).test(cell!))
                const found = row.some(cell => cell?.toLowerCase().includes(value_tmp))
                if (found) sheet.originalIndexes?.push(rowIndex)
                return found
            })
            if (sheet.content.length > 0) r.push(sheet)
        }

        setResults(r)
        console.log(r)
    }

    createEffect(async() => {
        repo.open()
        if (!Object.keys(sheetsStore).length) setSheets(await repo.getSheetsMap())
        document.getElementById("searchInput")?.addEventListener('search', onSearch as any)
        document.getElementById("replaceInput")?.addEventListener('search', onSearch as any)
    })

    return (
        <div class="w-screen h-screen px-16">
            <button class="bg-primary hover:bg-primary/60 p-2 rounded-full absolute left-16 top-4 cursor-pointer" 
            onClick={() => navigate("/" + project_name)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
            </button>
            <main class="card w-full relative top-16 flex flex-col items-center gap-4 overflow-hidden">
                <div class="w-3/5 h-10 flex gap-4">
                    <button class={`cursor-pointer ${arrowStyle()}`} onClick={() => setReplaceDisplay(prev => !prev)}>
                        <svg class="size-6 text-zinc-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                    <input id="searchInput" class="w-full h-full px-4 border-[1px] border-zinc-500 rounded-lg" type="search" placeholder="Type your query here..." />
                </div>

                <div class={`w-3/5 h-10 pl-10 ${replaceStyle()}`}>
                    <input id="replaceInput" class="w-full h-full px-4 border-[1px] border-zinc-500 rounded-lg" type="search" placeholder="Type your query here..." />
                </div>
                <div class="flex gap-4">
                    <div class="flex gap-2">
                        <label for="includeOriginal">Include original text</label>
                        <input type="checkbox" id="includeOriginal" onChange={e => includeOriginal = e.currentTarget.checked} />
                    </div>
                    <div class="flex gap-2">
                        <label for="useRegexp">Use RegexExp</label>
                        <input type="checkbox" id="useRegexp" onChange={e => useRegexp = e.currentTarget.checked} />
                    </div>
                </div>
                <section class="w-full flex gap-4">
                    <Show when={results()}>
                        <Show when={results()?.length} fallback={<p class="w-full py-4 text-zinc-500 text-center">No results</p>}>
                            <section class="h-fit flex flex-col rounded-xl border-primary border-x-3 border-y-[20px]">
                                { results()?.map((sheet, i) => { 
                                    const color = () => current_file() === i? "bg-primary text-white border-[0px]" : "bg-handsontable-background text-handsontable-foreground border-y-[1px]"
                                    return <button class={`px-3 py-2 cursor-pointer ${color()} border-handsontable-border font-handsontable text-left flex justify-between items-center`}
                                            onClick={() => setCurrentFile(i)}>
                                                {sheet.filename}
                                            </button>
                                } ) }
                            </section>
                        </Show>
                    </Show>
                    <Show when={results()?.[current_file()]}>
                        <Sheet 
                        sheet={results()?.[current_file()]} 
                        //sheetOptions={{ readOnly: true }}
                        onChange={({ change: changeInFilteredSheet, sheet: filteredSheet }) => { 
                            if (!filteredSheet || !changeInFilteredSheet || !filteredSheet.filename || !filteredSheet.originalIndexes) return
                            const [ row, col,, value ] = changeInFilteredSheet
                            setSheets(filteredSheet.filename, "content", filteredSheet.originalIndexes[row], col, value)
                        }} />
                    </Show>
                </section>
            </main>
        </div>
    )
}