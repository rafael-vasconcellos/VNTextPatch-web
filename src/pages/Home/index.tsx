import { useNavigate } from '@solidjs/router'
import { createEffect, createSignal, Show } from 'solid-js'
import { ProjectRepo } from '../../global/ProjectRepo'
import { projects, vn } from '../../global/utils'
import './style.css'
import UploadFiles from '../../components/UploadFiles'
import ProjectName from '../../components/UploadFiles/ProjectName'
import LocalProjects from '../../components/LocalProjects'
import Contribute from '../../components/Contribute'
import GithubStats from '../../components/GithubStats'



export default function App() { 
    const repo = new ProjectRepo()
    const navigate = useNavigate()
    const [ project_name, setProjectName ] = createSignal('')
    const [ src_files, setSrcFiles ] = createSignal<FileList>()
    let fileInput: HTMLInputElement | undefined

    createEffect(async() => { 
        if (src_files()?.length && project_name()) { 
            repo.create({ 
                projectName: project_name(),
                outputFiles: await vn().extractLocalAsSheets(src_files()),
                srcFiles: src_files()
            }).then(() => navigate("/" + project_name()))
        }

    })


    return ( 
        <>
            <GithubStats />
            <section class='w-screen py-20 flex flex-col items-center gap-28'>
                <div class='mb-28'>
                    <Show when={!src_files()?.length}>
                        <UploadFiles ref={fileInput} onChange={() => { 
                            if (fileInput?.files?.length) { setSrcFiles(fileInput.files) }
                        }} />
                    </Show>
                    <LocalProjects onClick={projectName => navigate("/" + projectName)}/>
                </div>
                <Contribute />
            </section>
            <Show when={src_files()?.length && !project_name()}>
                <ProjectName onSubmit={(name: string) => { 
                    if (projects()?.includes(name)) { return alert('A project with this name already exists!') }
                    setProjectName(name)
                }} />
            </Show>
        </>
    )
}


