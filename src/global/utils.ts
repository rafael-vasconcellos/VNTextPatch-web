import { createSignal } from "solid-js";
import { VNTextPatch } from "./VNTextPatch";
import { createStore } from "solid-js/store";
import type { Sheet } from "./ProjectRepo";


export const [ vn ] = createSignal(new VNTextPatch())
export const [ projects, setProjects ] = createSignal<Array<string | undefined> | null>(null)
export const [ sheets, setSheets ] = createStore<Record<string, Sheet>>({})

export function updateSheet(fileName: string, sheet: (string | null)[][]) {
    if (sheets[fileName]) {
        setSheets(fileName, "content", sheet)
        setSheets(fileName, "translatedRows", sheet.filter(rows => rows.filter(c=>c).length > 1).length)
    }
}

export async function* downloadObjFiles(files: Record<string, any>) { 
    const dirHandle: FileSystemDirectoryHandle = await (window as any).showDirectoryPicker()
    const fileNames = Object.keys(files)
    for (let i=0; i<fileNames.length; i++) { 
        const fileName = fileNames[i]
        const file = files[fileName]
        const fileHandle = await dirHandle.getFileHandle(fileName, { create: true })
        const writable = await fileHandle.createWritable()
        yield { 
            fileName,
            index: i,
            length: fileNames.length
        }
        await writable.write(file)
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


