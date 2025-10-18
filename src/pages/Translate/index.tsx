import { useNavigate, useParams } from "@solidjs/router"
import { createEffect, createSignal } from "solid-js"
import { TranslationConfig } from "../../global/Translator/config"
import RepoContextProvider, { useRepoContext } from "../context/repo"
import TranslationColumns from "./TranslationColumns"
import OptionToggle from "./OptionToggle"
import "./style.css"



interface SheetStatus {
    sheetName: string
    active: boolean
}

const [ sheetStatus, setSheetStatus ] = createSignal<SheetStatus[]>([])

export default function TranslatePage() {
    return (
        <RepoContextProvider>
            <main class="card h-full flex">
                <SheetSelector />
                <TranslationSettingsWidget />
            </main>
        </RepoContextProvider>
    )
}

function TranslationSettingsWidget() {
    const navigate = useNavigate()
    const { project_name } = useParams()
    const [ repo ] = useRepoContext()


    return (
        <section class="w-full px-16 flex flex-col gap-5">
            <div>
                <label for="translator-name">Translator: </label>
                <select class="m-1 p-1 border-[1px] border-zinc-500 rounded-lg" id="translator-name"
                onChange={e => e.currentTarget.value && TranslationConfig.setTranslatorName(e.currentTarget.value)}>
                    <option value="DeepLX" selected>DeepLX</option>
                </select>
            </div>
            <div class="flex justify-between">
                <TranslationColumns id="src-column" selected={TranslationConfig.srcColumn} 
                handler={(e: HTMLSelectElement) => TranslationConfig.setSrcColumn(e.value)} />

                <TranslationColumns id="target-column" selected={TranslationConfig.targetColumn} 
                handler={(e: HTMLSelectElement) => TranslationConfig.setTargetColumn(e.value)} />
            </div>
            <OptionToggle title="Ignore Translated" id="ignore-translated" defaultValue={TranslationConfig.ignoreTranslated} 
            handler={(e: HTMLInputElement) => TranslationConfig.setIgnoreTranslated(e.value)}>
                Ignore already translated rows.
            </OptionToggle>

            <OptionToggle title="Override cells" id="override-cells" defaultValue={TranslationConfig.overrideCells} 
            handler={(e: HTMLInputElement) => TranslationConfig.setOverrideCells(e.value)}>
                Override previous cell values.
            </OptionToggle>

            <OptionToggle title="Save on Each Batch" id="save-batch" defaultValue={TranslationConfig.saveOnEachBatch} 
            handler={(e: HTMLInputElement) => TranslationConfig.setSaveOnEachBatch(e.value)}>
                Save your project on each batch.
            </OptionToggle>
            <div class="flex gap-3 justify-end">
                <button class="px-4 py-2 bg-zinc-500 rounded-lg cursor-pointer hover:bg-zinc-500/60" onClick={() => {
                    if (project_name) navigate("/" + project_name)
                }}>Cancel</button>
                <button class="px-4 py-2 bg-primary rounded-lg cursor-pointer hover:bg-primary/60">Translate</button>
            </div>
        </section>
    )
}


function SheetSelector() {
    const [ repo ] = useRepoContext()

    createEffect(async() => {
        if (!repo().isOpen) { repo().open() }
        const sheets = await repo().getSheetNames().then(sheetNames => 
            sheetNames.map(sheetName => ({
                sheetName: sheetName as string,
                active: false
            }))
        )
        setSheetStatus(sheets)
    })


    return (
        <section class="h-full w-44 overflow-y-scroll">
            {sheetStatus().map(sheet => 
                <div class="w-full flex justify-between">
                    <input type="checkbox" id={`${sheet.sheetName}-check`} checked={true}
                    onChange={e => sheet.active = e.currentTarget.checked} />
                    <label for={`${sheet.sheetName}-check`} class={`select-none px-3 py-2 cursor-pointer border-handsontable-border font-handsontable text-left flex justify-between items-center`}>
                        {sheet.sheetName}
                    </label>
                </div>
            )}
        </section>
    )
}