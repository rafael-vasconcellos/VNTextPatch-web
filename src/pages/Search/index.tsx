import { useParams } from "@solidjs/router";
import { createEffect, createSignal, Show } from "solid-js";
import { ProjectRepo } from "../../global/ProjectRepo";
import type { Sheet as ISheet } from "../../global/ProjectRepo";
import Sheet from "../../components/Sheet";



export default function Search() { 
    const { project_name } = useParams()
    const [ results, setResults ] = createSignal<ISheet[]>([])
    const [ current_file, setCurrentFile ] = createSignal<number>(0)
    const repo = new ProjectRepo(project_name)
    let search: HTMLInputElement | undefined
    let includeOriginal = false
    let useRegexp = false
    let doReplace = false

    async function onSearch(e: Event & {
        currentTarget: HTMLInputElement;
        target: HTMLInputElement;
    }) { 
        const value = e.currentTarget.value?.toLowerCase() ?? ""
        const value2 = ""
        if (!value) return
        const sheets = await repo.getSheets()
        const r: ISheet[] = []
        sheets.forEach(sheet => {
            if (doReplace) {
                sheet.content = sheet.content.map(row => {
                    return row.map(cell => cell.replace(value, value2))
                })
                return repo.updateSheet(sheet.filename, sheet.content)
            }

            sheet.content = sheet.content.filter(row => { 
                if (!includeOriginal) row = row.slice(1)
                if (useRegexp) return row.some(cell => new RegExp(value).test(cell))
                return row.some(cell => cell.toLowerCase().includes(value))
            })
            if (sheet.content.length > 0) r.push(sheet)
        })
        setResults(r)
        //console.log(r)
    }

    createEffect(() => {
        repo.open()
        search?.addEventListener('search', onSearch as any)
    })

    return (
        <div class="w-screen h-screen px-16">
            <main class="card w-full relative top-16 flex flex-col items-center gap-4 overflow-hidden">
                <input class="w-3/5 h-10 px-4 border-[1px] border-zinc-500 rounded-lg" type="search" placeholder="Type your query here..." ref={search} />
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
                    <Show when={results().length > 0}>
                        <section class="h-fit flex flex-col rounded-xl border-primary border-x-3 border-y-[20px]">
                            { results().map((sheet, i) => { 
                                const color = () => current_file() === i? "bg-primary text-white border-[0px]" : "bg-handsontable-background text-handsontable-foreground border-y-[1px]"
                                return <button class={`px-3 py-2 cursor-pointer ${color()} border-handsontable-border font-handsontable text-left flex justify-between items-center`}
                                        onClick={() => setCurrentFile(i)}>
                                            {sheet.filename}
                                        </button>
                            } ) }
                        </section>
                    </Show>
                    <Show when={results()[current_file()]}>
                        <Sheet sheet={results()[current_file()]} sheetOptions={{ readOnly: true }} />
                    </Show>
                </section>
            </main>
        </div>
    )
}