import { useNavigate, useParams } from "@solidjs/router"
import { createEffect } from "solid-js"
import { TranslationConfig } from "../../global/Translator/config"
import RepoContextProvider, { useRepoContext } from "../context/repo"
import TranslationColumns from "./TranslationColumns"
import OptionToggle from "./OptionToggle"



export default function TranslatePage() {
    return (
        <RepoContextProvider>
            <main class="p-16 min-h-screen">
                <TranslationSettingsWidget />
            </main>
        </RepoContextProvider>
    )
}

function TranslationSettingsWidget() {
    const navigate = useNavigate()
    const { project_name } = useParams()
    const [ repo ] = useRepoContext()

    createEffect(() => console.log(repo()))

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

