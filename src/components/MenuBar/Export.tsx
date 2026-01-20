import { createSignal, Show, type JSX } from "solid-js"
import { unwrap } from "solid-js/store"
import { sheets } from "../../global/utils"
import { useRepoContext } from "../../pages/context/repo"
import FeedBack from "../Feedback"


export default function Export({ class: className }: JSX.ButtonHTMLAttributes<HTMLButtonElement>) { 
    const [ progress_text, setProgressText ] = createSignal<string | null>(null)
    const [ repo ] = useRepoContext()
    let button: HTMLButtonElement | undefined

    async function extract() { 
        const outputFiles = Object.keys(unwrap(sheets)).length? unwrap(sheets) : await repo().getSheetsMap()
        const dirHandle: FileSystemDirectoryHandle = await (window as any).showDirectoryPicker()
        Object.values(outputFiles).forEach(async (file, i) => { 
            const fileHandle = await dirHandle.getFileHandle(file.filename + '.csv', { create: true })
            const writable = await fileHandle.createWritable()
            setProgressText(`Downloading ${file.filename} (${i+1}/${Object.values(outputFiles).length})`)
            await writable.write(file.content?.join('\n'))
            writable.close()
        })

        setProgressText(null)
    }


    return ( 
        <>
            <button class={`${className || 'size-8'} cursor-pointer group`} onClick={extract} ref={button}>
                <svg 
                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64.000000 64.000000"
                preserveAspectRatio="xMidYMid meet">
                    <g class="fill-primary group-hover:fill-primary/60" transform="translate(0.000000,64.000000) scale(0.100000,-0.100000)" stroke="none">
                        <path d="M100 560 c-19 -19 -20 -33 -20 -240 0 -281 -15 -260 190 -260 138 0
                        152 2 171 21 16 16 19 30 17 67 -2 34 -7 47 -18 47 -10 0 -17 -14 -20 -45 l-5
                        -45 -145 0 -145 0 0 215 0 215 78 3 77 3 0 -51 c0 -68 22 -90 89 -90 l50 0 3
                        -37 c2 -26 8 -38 18 -38 11 0 16 14 18 49 l3 49 -78 79 -78 78 -92 0 c-80 0
                        -96 -3 -113 -20z m270 -118 c-36 -6 -50 5 -50 40 l0 32 36 -35 c33 -32 34 -34
                        14 -37z"/>
                        <path d="M484 349 c-3 -6 6 -24 21 -39 l28 -29 -114 -3 c-93 -2 -114 -6 -114
                        -18 0 -12 21 -16 114 -18 l114 -3 -28 -29 c-23 -24 -26 -33 -17 -42 10 -10 24
                        -1 64 40 l53 52 -50 50 c-52 52 -60 57 -71 39z"/>
                    </g>
                </svg>
            </button>
            <Show when={progress_text()}>
                <FeedBack>{progress_text()}</FeedBack>
            </Show>
        </>
    )
}