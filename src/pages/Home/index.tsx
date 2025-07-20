import { createEffect, createSignal, Show } from 'solid-js'
import { Repo } from '../../global/Repo'
import { VNTextPatch } from '../../global/VNTextPatch'
import './style.css'
import UploadFiles from '../../components/UploadFiles'
import ProjectName from '../../components/UploadFiles/ProjectName'
import Explorer from '../Explorer'


export default function App() { 
    const repo = new Repo()
    const [ project_name, setProjectName ] = createSignal('')
    const [ src_files, setSrcFiles ] = createSignal<FileList>()
    const [ isRepoOpen, setRepoStatus ] = createSignal(false)
    let fileInput: HTMLInputElement | undefined

    createEffect(async() => { 
        if (src_files()?.length && project_name()) { 
            const vn = new VNTextPatch()
            repo.create({ 
                projectName: project_name(),
                outputFiles: await vn.extractLocalAsSheets(src_files()),
                srcFiles: src_files()
            })
            setRepoStatus(repo.isOpen)
        }
    })


    return (
      <section class='w-screen h-screen flex justify-center items-center'>
        <Show when={!src_files()?.length}>
            <UploadFiles ref={fileInput} onChange={() => { 
                if (fileInput?.files?.length) { setSrcFiles(fileInput.files) }
            }} />
        </Show>
        <Show when={src_files()?.length && !project_name()}>
            <ProjectName onSubmit={(name: string) => setProjectName(name)} />
        </Show>
        <Show when={isRepoOpen()}>
            <Explorer projectName={project_name()} />
        </Show>
      </section>
    )
}


