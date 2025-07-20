interface IRepoInit { 
    srcFiles?: FileList | null
    outputFiles?: Record<string, string[][]>
}

interface StoreItem { 
    filename: string
    content: any
}


export class Repo {  
    private request?: IDBOpenDBRequest
    public projectName: string
    constructor(projectName: string) { 
        this.projectName = projectName
    }

    open() { 
        this.request = indexedDB.open(this.projectName, 1)
        this.request.onerror = () => { console.error(this.request!.error) }
    }

    create(init?: IRepoInit) { 
        this.request = indexedDB.open(this.projectName, 1)
        this.request.onupgradeneeded = (event) => { 
            const db = (event.target as IDBOpenDBRequest).result
            db.createObjectStore("source_files", { keyPath: "name" })
            db.createObjectStore("sheets", { keyPath: "filename" })
            if (init?.outputFiles) { 
                this.insertSheets(init.outputFiles)
            }
            if (init?.srcFiles) { 
                this.request!.onsuccess = () => this.insertSrcFiles(init.srcFiles as FileList)
            }
        }
        this.request.onerror = () => { console.error(this.request!.error) }
    }

    private db(): IDBDatabase | undefined { 
        return this.request?.result
    }

    private insertSheets(outputFiles: Record<string, string[][]>) { 
        if (!this.db()) { return }
        const transaction = this.db()?.transaction("sheets", "readwrite")
        const store = transaction?.objectStore("sheets")
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