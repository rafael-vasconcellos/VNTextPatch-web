import { createEffect, createSignal, Show } from 'solid-js'
import { Repo } from '../../global/Repo'
import { VNTextPatch } from '../../global/VNTextPatch'
import './App.css'
import UploadFiles from '../../components/UploadFiles'
import ProjectName from '../../components/UploadFiles/ProjectName'
import Explorer from '../Explorer'


export default function App() { 
    const repo = new Repo()
    const [ project_name, setProjectName ] = createSignal('')
    const [ srcFiles, setSrcFiles ] = createSignal<FileList>()
    let fileInput: HTMLInputElement | undefined

    createEffect(async() => { 
        if (srcFiles()?.length && project_name()) { 
            const vn = new VNTextPatch()
            repo.create({ 
                projectName: project_name(),
                outputFiles: await vn.extractLocalAsSheets(),
                srcFiles: srcFiles()
            })
        }
    })


    return (
      <>
        <Show when={!srcFiles()?.length}>
            <UploadFiles ref={fileInput} onChange={() => { 
                if (fileInput?.files?.length) { setSrcFiles(fileInput.files) }
            }} />
        </Show>
        <Show when={srcFiles()?.length && !project_name()}>
            <ProjectName onSubmit={(name: string) => setProjectName(name)} />
        </Show>
        <Show when={repo.isOpen}>
            <Explorer projectName={project_name()} />
        </Show>
      </>
    )
}


