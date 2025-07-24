interface IRepoInit { 
    srcFiles?: FileList | null
    outputFiles?: Record<string, string[][]>
    projectName?: string
}

export interface StoreItem { 
    filename: string
    content: any
}


export class Repo {  
    private request?: IDBOpenDBRequest
    public projectName?: string
    private _isOpen: boolean = false
    constructor(projectName?: string) { 
        if (projectName) { this.projectName = projectName }
    }

    create(init?: IRepoInit) { 
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
                this.request!.onsuccess = () => this.insertSrcFiles(init.srcFiles as FileList)
            }
        }
        this.request.onerror = () => { console.error(this.request!.error) }
        this._isOpen = true
    }

    open() { 
        if (!this.projectName) { throw new Error('IndexedDB Repo Error: missing project name.') }
        this.request = indexedDB.open(this.projectName, 1)
        this._isOpen = true
    }

    get isOpen() { return this._isOpen }

    private async getDb() { 
        const { promise, resolve, reject } = Promise.withResolvers()
        if (this.request && this.request.readyState === "pending") { 
            this.request.onsuccess = () => { resolve(this.request!.result) }
            this.request.onerror = () => { reject(this.request!.error) }
        }
        else if (this.request && this.request.readyState === "done") { resolve(this.request.result) }
        else if (!this.request) { reject("IndexedDB Repo Error: Request is not defined.") }
        return promise as Promise<IDBDatabase>
    }

    private insertSheets(store: IDBObjectStore, outputFiles: Record<string, string[][]>) { 
        for (const fileName in outputFiles) { 
            store?.add({ 
                filename: fileName,
                content: outputFiles[fileName]
            } as StoreItem)
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

    async getSrcFiles() { 
        const db = await this.getDb()
        const { promise, resolve, reject } = Promise.withResolvers()
        const transaction = db.transaction("source_files", "readonly")
        const store = transaction.objectStore("source_files")
        const response = store.getAll()

        response.onsuccess = () => resolve(response.result)
        response.onerror = () => reject(response.error)
        return promise as Promise<StoreItem[]>
    }

    async getSrcFileList() { 
        const dataTransfer = new DataTransfer()
        const storeArr = await this.getSrcFiles()
        storeArr.forEach(storeItem => { 
            const file = new File([storeItem.content], storeItem.filename, { type: "text/plain" })
            dataTransfer.items.add(file)
        })
        return dataTransfer.files
    }

    async getSheet(fileName: string) { 
        const db = await this.getDb()
        const { promise, resolve, reject } = Promise.withResolvers()
        const transaction = db.transaction("sheets", "readwrite")
        const store = transaction.objectStore("sheets")
        const response = store.get(fileName)

        response.onsuccess = () => resolve(response.result)
        response.onerror = () => reject(response.error)
        return promise as Promise<StoreItem | undefined>
    }

    async getSheets() { 
        const db = await this.getDb()
        const { promise, resolve, reject } = Promise.withResolvers()
        const transaction = db.transaction("sheets", "readwrite")
        const store = transaction.objectStore("sheets")
        const response = store.getAll()

        response.onsuccess = () => resolve(response.result)
        response.onerror = () => reject(response.error)
        return promise as Promise<StoreItem[]>
    }

    async updateSheet(fileName: string, sheet: string[][]) { 
        const db = await this.getDb()
        const transaction = db?.transaction("sheets", "readwrite")
        const store = transaction?.objectStore("sheets")
        store?.put({ 
            filename: fileName,
            content: sheet
        } as StoreItem)
    }

    async getCharNames() { 
        const char_names: Record<string, string> = {}
        const sheet: string[][] | undefined = await this.getSheet("char_names").then(store => store?.content)
        sheet?.forEach(row => { 
            char_names[row[0]] = row.at(-1)!
        })
        return char_names
    }
}