import { createEffect, createSignal, Show } from 'solid-js'
import { Repo } from '../../global/Repo'
import { VNTextPatch } from '../../global/VNTextPatch'
import './style.css'
import UploadFiles from '../../components/UploadFiles'
import ProjectName from '../../components/UploadFiles/ProjectName'
import Explorer from '../Explorer'
import LocalProjects from '../../components/LocalProjects'


export default function App() { 
    const vn = new VNTextPatch()
    const repo = new Repo()
    const [ project_name, setProjectName ] = createSignal('')
    const [ src_files, setSrcFiles ] = createSignal<FileList>()
    const [ isProjectOpen, setProjectStatus ] = createSignal(false)
    let fileInput: HTMLInputElement | undefined

    createEffect(async() => { 
        if (src_files()?.length && project_name()) { 
            repo.create({ 
                projectName: project_name(),
                outputFiles: await vn.extractLocalAsSheets(src_files()),
                srcFiles: src_files()
            })
            setProjectStatus(repo.isOpen)
        }
    })


    return ( 
        <>
            <Show when={!isProjectOpen()}>
                <section class='w-screen h-screen flex flex-col justify-center items-center gap-8'>
                    <div class='flex flex-col gap-8'>
                        <Show when={!src_files()?.length && !isProjectOpen()}>
                            <UploadFiles ref={fileInput} onChange={() => { 
                                if (fileInput?.files?.length) { setSrcFiles(fileInput.files) }
                            }} />
                        </Show>
                        <LocalProjects onClick={projectName => { 
                            setProjectName(projectName)
                            setProjectStatus(true)
                        } }/>
                    </div>
                </section>
            </Show>
            <Show when={src_files()?.length && !project_name()}>
                <ProjectName onSubmit={(name: string) => setProjectName(name)} />
            </Show>
            <Show when={isProjectOpen()}>
                <Explorer projectName={project_name()} />
            </Show>
        </>
    )
}


