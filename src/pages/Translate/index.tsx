import { useNavigate, useParams } from "@solidjs/router"
import { TranslationConfig } from "../../global/Translator/config"


export default function TranslatePage() {
    return (
        <main class="p-16 min-h-screen">
            <TranslationSettingsWidget />
        </main>
    )
}

function TranslationSettingsWidget() {
    const navigate = useNavigate()
    const { project_name } = useParams()

    return (
        <section class="card w-full flex flex-col gap-5">
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

interface TranslationColumnsProps {
    id: string
    selected: number
    handler?: (e: HTMLSelectElement) => void
}

function TranslationColumns({ id, selected, handler }: TranslationColumnsProps) {
    return (
        <div>
            <label for={id}>Source Column: </label>
            <select class="m-1 p-1 border-[1px] border-zinc-500 rounded-lg" id={id} onChange={e => handler && handler(e.currentTarget)}>
                <option value="0" selected={selected===0}>Original Text</option>
                <option value="1" selected={selected===1}>Inital</option>
                <option value="2" selected={selected===2}>Machine Translation</option>
                <option value="3" selected={selected===3}>Better Translation</option>
                <option value="4" selected={selected===4}>Best Translation</option>
            </select>
        </div>
    )
}

interface OptionToggleProps {
    title: string
    children: any
    id: string
    defaultValue: boolean
    handler?: (e: HTMLInputElement) => void
}

function OptionToggle({ title, children, id, handler, defaultValue }: OptionToggleProps) {
    return (
        <div class="flex justify-between">
            <label for={id}>
                <h2 class="font-xl font-bold my-1">{title}</h2>
                <p class="text-zinc-400">{children}</p>
            </label>
            <input class="w-7 text-primary" type="range" id={id} min={0} max={1} value={defaultValue? 1 : 0}
            onChange={e => handler && handler(e.currentTarget)} />
        </div>
    )
}