interface IRepoInit { 
    projectName: string
    srcFiles: FileList
    outputFiles: Record<string, string[][]>
}


export class Repo {  
    public projectName: string
    private request: IDBOpenDBRequest
    constructor(init: IRepoInit) { 
        this.projectName = init.projectName
        this.request = indexedDB.open(this.projectName, 1)

        this.request.onupgradeneeded = (event) => { 
            const db = (event.target as IDBOpenDBRequest).result
            this.create(db, init.outputFiles)
            this.request.onsuccess = () => this.insertSrcFiles(init.srcFiles)
        }
        this.request.onerror = () => { console.error(this.request.error) }
    }

    private db(): IDBDatabase { 
        return this.request.result
    }

    private create(db: IDBDatabase, outputFiles: Record<string, string[][]>) { 
        db.createObjectStore("source_files", { keyPath: "name" })

        const store = db.createObjectStore("sheets", { keyPath: "filename" })
        for (const fileName in outputFiles) { 
            store.add({ 
                filename: fileName,
                content: outputFiles[fileName]
            })
        }
    }

    private async insertSrcFiles(srcFiles: FileList) { 
        const files = await Promise.all(Array.from(srcFiles).map(async file => ({ 
            name: file.name,
            content: new Uint8Array(await file.arrayBuffer())
        })))
        const transaction = this.db().transaction("source_files", "readwrite")
        const store = transaction.objectStore("source_files")
        for (const file of files) { store.add(file) }
    }

    getSourceFiles() { 
        const { promise, resolve, reject } = Promise.withResolvers()
        const transaction = this.db().transaction("source_files", "readonly")
        const store = transaction.objectStore("source_files")
        const response = store.getAll()

        response.onsuccess = () => resolve(response.result)
        response.onerror = () => reject(response.error)
        return promise
    }

    updateSheet(fileName: string, sheet: string[][]) { 
        const transaction = this.db().transaction("sheets", "readwrite")
        const store = transaction.objectStore("sheets")
        store?.put({ 
            filename: fileName,
            content: sheet
        })
    }

    getSheet(fileName: string) { 
        const { promise, resolve, reject } = Promise.withResolvers()
        const transaction = this.db().transaction("sheets", "readwrite")
        const store = transaction.objectStore("sheets")
        const index = store.index("filename")
        const response = index.get(fileName)

        response.onsuccess = () => resolve(response.result)
        response.onerror = () => reject(response.error)
        return promise
    }
}