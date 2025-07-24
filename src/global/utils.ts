import { createSignal } from "solid-js";
import { VNTextPatch } from "./VNTextPatch";


export const [ isProjectOpen, setProjectStatus ] = createSignal(false)
export const [ vn ] = createSignal(new VNTextPatch())
export const [ projects, setProjects ] = createSignal<(string | undefined)[]>([])

export async function downloadObjFiles(files: Record<string, any>) { 
    const dirHandle: FileSystemDirectoryHandle = await (window as any).showDirectoryPicker()
    for (const fileName in files) { 
        const file = files[fileName]
        const fileHandle = await dirHandle.getFileHandle(fileName, { create: true })
        const writable = await fileHandle.createWritable()
        writable.write(file)
        writable.close()
    }
}

export function downloadFile(fileContent: string, fileName: string = 'file', fileType: string = 'application/json') { 
    const blob = new Blob([fileContent], { type: fileType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
}