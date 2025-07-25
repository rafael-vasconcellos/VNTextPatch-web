import { createEffect, createSignal, Show } from 'solid-js'
import { Repo } from '../../global/Repo'
import { isProjectOpen, projects, setProjectStatus, vn } from '../../global/utils'
import './style.css'
import RepoContextProvider from '../Explorer/context'
import Explorer from '../Explorer'
import UploadFiles from '../../components/UploadFiles'
import ProjectName from '../../components/UploadFiles/ProjectName'
import LocalProjects from '../../components/LocalProjects'


export default function App() { 
    const repo = new Repo()
    const [ project_name, setProjectName ] = createSignal('')
    const [ src_files, setSrcFiles ] = createSignal<FileList>()
    let fileInput: HTMLInputElement | undefined

    createEffect(async() => { 
        if (src_files()?.length && project_name()) { 
            repo.create({ 
                projectName: project_name(),
                outputFiles: await vn().extractLocalAsSheets(src_files()),
                srcFiles: src_files()
            })
            setProjectStatus(repo.isOpen)
        }
    })


    return ( 
        <>
            <Show when={!isProjectOpen()}>
                <section class='w-screen h-screen flex flex-col justify-center items-center gap-8'>
                    <div>
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
                <ProjectName onSubmit={(name: string) => { 
                    if (projects().includes(name)) { return alert('A project with this name already exists!') }
                    setProjectName(name)
                }} />
            </Show>
            <Show when={isProjectOpen()}>
                <RepoContextProvider projectName={project_name()}>
                    <Explorer projectName={project_name()} />
                </RepoContextProvider>
            </Show>
        </>
    )
}


