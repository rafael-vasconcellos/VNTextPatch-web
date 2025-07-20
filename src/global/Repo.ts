interface IRepoInit { 
    srcFiles?: FileList | null
    outputFiles?: Record<string, string[][]>
    projectName?: string
}

interface StoreItem { 
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

    open() { 
        if (!this.projectName) { throw new Error('IndexedDB Repo Error: missing project name.') }
        this.request = indexedDB.open(this.projectName, 1)
        this.request.onerror = () => { console.error(this.request!.error) }
        this._isOpen = true
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

    get isOpen() { return this._isOpen }

    private db(): IDBDatabase | undefined { 
        return this.request?.result
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
        if (!this.db()) { return }
        const files = await Promise.all(Array.from(srcFiles).map(async file => ({ 
            filename: file.name,
            content: new Uint8Array(await file.arrayBuffer())
        } as StoreItem)))
        const transaction = this.db()?.transaction("source_files", "readwrite")
        const store = transaction?.objectStore("source_files")
        for (const file of files) { store?.add(file) }
    }

    async getSourceFiles() { 
        if (!this.db()) { return Promise.resolve() }
        const { promise, resolve, reject } = Promise.withResolvers()
        const transaction = this.db()!.transaction("source_files", "readonly")
        const store = transaction.objectStore("source_files")
        const response = store.getAll()

        response.onsuccess = () => resolve(response.result)
        response.onerror = () => reject(response.error)
        return promise as Promise<StoreItem[]>
    }

    updateSheet(fileName: string, sheet: string[][]) { 
        if (!this.db()) { return }
        const transaction = this.db()?.transaction("sheets", "readwrite")
        const store = transaction?.objectStore("sheets")
        store?.put({ 
            filename: fileName,
            content: sheet
        } as StoreItem)
    }

    async getSheet(fileName: string) { 
        if (!this.db()) { return Promise.resolve() }
        const { promise, resolve, reject } = Promise.withResolvers()
        const transaction = this.db()!.transaction("sheets", "readwrite")
        const store = transaction.objectStore("sheets")
        const response = store.get(fileName)

        response.onsuccess = () => resolve(response.result?.content)
        response.onerror = () => reject(response.error)
        return promise as Promise<string[][]>
    }

    async getSheets() { 
        if (!this.db()) { return Promise.resolve() }
        const { promise, resolve, reject } = Promise.withResolvers()
        const transaction = this.db()!.transaction("sheets", "readwrite")
        const store = transaction.objectStore("sheets")
        const response = store.getAll()

        response.onsuccess = () => resolve(response.result)
        response.onerror = () => reject(response.error)
        return promise as Promise<StoreItem[]>
    }
}