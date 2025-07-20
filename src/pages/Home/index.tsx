import { createSignal, Show } from 'solid-js'
import './App.css'
import UploadFiles from '../../components/UploadFiles'
import ProjectName from '../../components/UploadFiles/ProjectName'


export default function App() { 
    const [ project_name, setProjectName ] = createSignal('')
    const [ srcFiles, setSrcFiles ] = createSignal<FileList>()
    let fileInput: HTMLInputElement | undefined


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
      </>
    )
}


