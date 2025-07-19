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

        for (const fileName in outputFiles) { 
            const store = db.createObjectStore(fileName, { keyPath: "original_text" })
            store.add({ 
                original_text: outputFiles[fileName][0],
                t1: outputFiles[fileName][1],
                t2: outputFiles[fileName][2],
                t3: outputFiles[fileName][3],
                t4: outputFiles[fileName][4],
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

    updateSheet(fileName: string, row: string[]) { 
        const transaction = this.db().transaction(fileName, "readwrite")
        const store = transaction.objectStore(fileName)
        store?.put({ 
            original_text: row[0],
            t1: row[1],
            t2: row[2],
            t3: row[3],
            t4: row[4],
        })
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

    getSheet(fileName: string) { 
        const { promise, resolve, reject } = Promise.withResolvers()
        const transaction = this.db().transaction(fileName, "readwrite")
        const store = transaction.objectStore(fileName)
        const response = store.getAll()

        response.onsuccess = () => resolve(response.result)
        response.onerror = () => reject(response.error)
        return promise
    }
}