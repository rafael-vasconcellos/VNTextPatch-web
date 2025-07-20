import { createEffect, createSignal, For, Show } from "solid-js"
import { Repo } from "../../global/Repo"
import Sheet from "../../components/Sheet"


interface ExplorerProps { 
    projectName: string
    //srcFiles: FileList
}

export default function Explorer({ projectName }: ExplorerProps) { 
    const repo = new Repo(projectName)
    const [ current_file, setCurrentFile ] = createSignal<string>('')
    const [ project_files, setProjectFiles ] = createSignal<string[]>([])
    const [ sheet, setSheet ] = createSignal<string[][] | undefined>()

    createEffect(async() => { 
        repo.open()
        const files = await repo.getSheets().then(sheets => sheets?.map(store => store.filename))
        if (files) { 
            setProjectFiles(files); setCurrentFile(files[0])
        }
    })

    createEffect(async() => { 
        if (current_file()) { 
            const s = await repo.getSheet(current_file())
            s && setSheet(s)
        }
    })


    return ( 
        <main class="p-14 flex gap-16">
            <section>
                <For each={project_files()}>
                    { fileName => 
                        <button onClick={() => setCurrentFile(fileName)}>{fileName}</button> }
                </For>
            </section>
            <Show when={sheet()}>
                <Sheet sheet={sheet() as string[][]} />
            </Show>
        </main>
    )
}