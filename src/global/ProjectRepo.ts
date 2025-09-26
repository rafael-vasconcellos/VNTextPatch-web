import { Repo } from "./Repo"



interface ProjectRepoInit { 
    srcFiles?: FileList | null
    outputFiles?: Record<string, string[][]>
    projectName?: string
}

export interface StoreItem<T= any> { 
    filename: string
    content: T
}

export interface Sheet extends StoreItem<(string | null)[][]> {
    rows: number
    translatedRows: number
}

interface EventMap { 
    sheetimport: (e: {data: Sheet}) => void
}

export class ProjectRepo extends Repo { 
    public projectName?: string
    private eventListeners: {
        [K in keyof EventMap]: EventMap[K][];
    } = {
        sheetimport: []
    };
    private static EventNames: (keyof EventMap)[] = ["sheetimport"]
    constructor(projectName?: string) { 
        super()
        if (projectName) { this.projectName = projectName }
    }

    create(init?: ProjectRepoInit) { 
        const { resolve, reject, promise } = Promise.withResolvers<void>()
        this.projectName = init?.projectName || this.projectName
        if (!this.projectName) { throw new Error('IndexedDB Repo Error: missing project name.') }

        this.request = indexedDB.open(this.projectName, 1)
        this.request.onupgradeneeded = (event) => { 
            const db = (event.target as IDBOpenDBRequest).result
            const sheets_store = db.createObjectStore("sheets", { keyPath: "filename" })
            db.createObjectStore("source_files", { keyPath: "filename" })
            if ( Object.keys(init?.outputFiles ?? {}).length ) { 
                this.insertSheets(sheets_store, init!.outputFiles!)
            }
            if (init?.srcFiles?.length) { 
                this.request!.onsuccess = () => {
                    this.insertSrcFiles(init.srcFiles as FileList)
                    resolve()
                }
            }
        }
        this.request.onerror = () => { console.error(this.request!.error) ; reject() }
        this._isOpen = true
        return promise
    }

    open() {
        if (!this.projectName) { throw new Error('IndexedDB Repo Error: missing project name.') }
        if (this._isOpen) return
        this.request = indexedDB.open(this.projectName, 1)
        this._isOpen = true
    }

    private insertSheets(store: IDBObjectStore, outputFiles: Record<string, string[][]>) { 
        for (const fileName in outputFiles) { 
            store?.add({ 
                filename: fileName,
                content: outputFiles[fileName],
                rows: outputFiles[fileName].length,
            } as Sheet)
        }
    }

    private async insertSrcFiles(srcFiles: FileList) { 
        const db = await this.getDb()
        const files = await Promise.all(Array.from(srcFiles).map(async file => ({ 
            filename: file.name,
            content: new Uint8Array(await file.arrayBuffer())
        } as StoreItem)))
        const transaction = db.transaction("source_files", "readwrite")
        const store = transaction?.objectStore("source_files")
        for (const file of files) { store?.add(file) }
    }

    getSrcFiles<T= any>(): Promise<StoreItem<T>[]> { 
        return this.getStoreItems("source_files")
    }

    async getSrcFileList(): Promise<FileList> { 
        const dataTransfer = new DataTransfer()
        const storeArr = await this.getSrcFiles()
        storeArr.forEach(storeItem => { 
            const file = new File([storeItem.content], storeItem.filename, { type: "text/plain" })
            dataTransfer.items.add(file)
        })
        return dataTransfer.files
    }

    getSheet(fileName: string): Promise<Sheet> { 
        return this.getStoreItem("sheets", fileName)
    }

    getSheets(): Promise<Sheet[]> { 
        return this.getStoreItems("sheets")
    }

    async updateSheet(sheet: Sheet): Promise<Sheet> { 
        const data = { 
            filename: sheet.filename,
            content: sheet.content,
            rows: sheet.rows ?? sheet.content.length,
            translatedRows: sheet.translatedRows ?? sheet.content.filter(rows => rows.filter(c=>c).length > 1).length
        } as Sheet
        await this.updateStoreItem("sheets", data)
        return data
    }

    async getCharNames(): Promise<Record<string, string>> { 
        const char_names: Record<string, string> = {}
        const sheet: (string | null)[][] | undefined = await this.getSheet("char_names").then(store => store?.content)
        sheet?.forEach(row => { 
            char_names[row[0]!] = row.at(-1)!
        })
        return char_names
    }

    async getSheetNames() {
        const db = await this.getDb()
        const { promise, resolve, reject } = Promise.withResolvers()
        const transaction = db.transaction("sheets", "readonly")
        const store = transaction.objectStore("sheets")
        const response = store.getAllKeys()

        response.onsuccess = () => resolve(response.result)
        response.onerror = () => reject(response.error)
        return promise as Promise<IDBValidKey[]>
    }

    addEventListener<K extends keyof EventMap>(eventName: keyof EventMap, handler: EventMap[K]) {
        if (ProjectRepo.EventNames.includes(eventName)) { 
            if (!this.eventListeners[eventName]) { this.eventListeners[eventName] = [] }
            this.eventListeners[eventName].push(handler)
        }
    }

    removeEventListener(eventName: keyof EventMap, handler: any) {
        if (ProjectRepo.EventNames.includes(eventName)) {
            const index = this.eventListeners[eventName].indexOf(handler)
            this.eventListeners[eventName].splice(index, 1)
        }
    }

}