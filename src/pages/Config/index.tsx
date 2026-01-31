import { useNavigate, useParams } from "@solidjs/router"
import { createResource, createSignal, Suspense } from "solid-js"
import { getTranslator, translatorNames } from "../../providers"
import type { TranslatorEngineConfig } from "../../global/Translator/engine/config"
import { ConfigRepo } from "../../global/repo/config"



const [ current_config, setCurrentConfig ] = createSignal(translatorNames[0])
const engine = () => getTranslator(current_config()).Build()

export default function ConfigPage() {
    const configNames = () => Object.keys(engine().config)
    const { project_name } = useParams()
    const navigate = useNavigate()


    return (
        <>
            <button class="bg-primary hover:bg-primary/60 p-2 rounded-full absolute left-16 top-4 cursor-pointer" 
            onClick={() => navigate("/" + project_name)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
            </button>
            <main class="h-full">
                <div class="card flex m-[5%]">
                    <section class="h-full w-44 overflow-y-scroll">
                        {translatorNames.map(translatorName => 
                            <button class={`select-none px-3 py-2 my-2 w-full border-[1px] border-zinc-600 rounded-md cursor-pointer hover:bg-primary`}
                            onClick={() => setCurrentConfig(translatorName)}>
                                {translatorName}
                            </button>
                        )}
                    </section>
                    <section class="w-full px-16 flex flex-col gap-5">
                        {configNames().map(configName => <ConfigurationOption option={configName} />)}
                    </section>
                </div>
            </main>
        </>
    )
}


interface ConfigurationOptionProps {
    option: string //TranslatorEngineOption
}

function ConfigurationOption({ option }: ConfigurationOptionProps) {
    const translatorEngineOption = engine().config[option as keyof TranslatorEngineConfig]
    const configRepo = new ConfigRepo()
    const [ value ] = createResource(async() => {
        return configRepo.getTranslatorConfigOption(current_config(), option, translatorEngineOption.value)
    })

    return (
        <Suspense>
            <div class="flex flex-col gap-2">
                <h2 class="text-xl font-bold my-1">{translatorEngineOption.label}</h2>
                <input class="w-full p-2 border-[1px] border-zinc-600 rounded-md"
                type="text" placeholder={`Please enter the ${translatorEngineOption.label}`} 
                value={value()}
                onChange={e => configRepo.setTranslatorConfig(current_config(), option, e.currentTarget.value)} />
                <p class="text-zinc-400">{translatorEngineOption.description}</p>
            </div>
        </Suspense>
    )
}