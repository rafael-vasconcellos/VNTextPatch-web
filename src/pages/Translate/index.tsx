import { useNavigate, useParams } from "@solidjs/router"
import { createEffect, createSignal, Show } from "solid-js"
import { TranslationConfig } from "../../global/Translator/config"
import { Translator } from "../../global/Translator"
import { createLog } from "../../global/log"
import { getTranslator } from "../../providers"
import RepoContextProvider, { useRepoContext } from "../context/repo"
import TranslationColumns from "./TranslationColumns"
import OptionToggle from "./OptionToggle"
import "./style.css"



const [ status, setStatus ] = createSignal(0)
const translator = new Translator()
const Log = createLog()

export default function TranslatePage() {
    const { project_name } = useParams()
    const navigate = useNavigate()

    return (
        <RepoContextProvider>
            <button class="bg-primary hover:bg-primary/60 p-2 rounded-full absolute left-16 top-4 cursor-pointer" 
            onClick={() => navigate("/" + project_name)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
            </button>
            <main class="h-full" id="translate">
                <Show when={status()}>
                    <Log.Component>
                        <Show when={status()===1}>
                            <button class="p-4 bg-zinc-500 rounded-lg cursor-pointer hover:bg-primary"
                            onclick={translator.abort}>
                                Abort
                            </button>
                        </Show>
                        <Show when={status()===2}>
                            <button class="p-4 bg-zinc-500 rounded-lg cursor-pointer hover:bg-primary"
                            onclick={() => { setStatus(0); Log.Clear() }}>
                                Close
                            </button>
                        </Show>
                    </Log.Component>
                </Show>
                <div class="card flex m-[5%]">
                    <SheetSelector />
                    <TranslationSettingsWidget />
                </div>
            </main>
        </RepoContextProvider>
    )
}

function TranslationSettingsWidget() {
    const navigate = useNavigate()
    const { project_name } = useParams()
    const [ repo ] = useRepoContext()

    async function translateProject() {
        if (status()) return
        setStatus(1)
        const sheetNames = Array.from(document.querySelectorAll('input[type=checkbox]:checked ~ label')).map(e => e.textContent)
        const engine = getTranslator(TranslationConfig.translatorName).Build()
        translator.setRepo(repo())
        translator.setEngine(engine)
        translator.on("batchTranslate", ({ detail: data }) => {
            Log.Add(`Translating ${data.filename} ${data.start}/${data.end}`)
        })
        translator.on("translationDone", () => setStatus(2))
        await translator.translate(sheetNames)
        //setStatus(false)
    }


    return (
        <section class="w-full px-16 flex flex-col gap-5">
            <div>
                <label for="translator-name">Translator: </label>
                <select class="m-1 p-1 border-[1px] border-zinc-500 rounded-lg" id="translator-name"
                onChange={e => e.currentTarget.value && TranslationConfig.setTranslatorName(e.currentTarget.value)}>
                    <option value="Google" selected>Google</option>
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
                <button onclick={translateProject}
                class="px-4 py-2 bg-primary rounded-lg cursor-pointer hover:bg-primary/60">
                    Translate
                </button>
            </div>
        </section>
    )
}


function SheetSelector() {
    const [ sheetNames, setSheetNames ] = createSignal<string[]>([])
    const [ repo ] = useRepoContext()

    createEffect(async() => {
        if (!repo().isOpen) { repo().open() }
        setSheetNames(await repo().getSheetNames())
    })


    return (
        <section class="h-full w-44 overflow-y-scroll">
            <div class="w-full flex justify-between">
                <input type="checkbox" id={`all-check`} checked={true}
                onChange={(ev) => {
                    document.querySelectorAll('input[type=checkbox]')?.forEach((e) => {
                        const el = e as HTMLInputElement
                        el.checked = ev.currentTarget.checked
                    })
                }} />
                <label for={`all-check`} class={`select-none px-3 py-2 cursor-pointer border-handsontable-border font-handsontable text-left flex justify-between items-center`}>
                    Select All
                </label>
            </div>
            {sheetNames().map(sheetName => 
                <div class="w-full flex justify-between">
                    <input type="checkbox" id={`${sheetName}-check`} checked={true} />
                    <label for={`${sheetName}-check`} class={`select-none px-3 py-2 cursor-pointer border-handsontable-border font-handsontable text-left flex justify-between items-center`}>
                        {sheetName}
                    </label>
                </div>
            )}
        </section>
    )
}


