export abstract class Repo {
    protected _isOpen: boolean = false
    protected request?: IDBOpenDBRequest

    abstract create(init?: any): void
    abstract open(): void

    get isOpen() { return this._isOpen }

    protected async getDb() { 
        const { promise, resolve, reject } = Promise.withResolvers()
        if (this.request && this.request.readyState === "pending") { 
            this.request.onsuccess = () => { resolve(this.request!.result) }
            this.request.onerror = () => { reject(this.request!.error) }
        }
        else if (this.request && this.request.readyState === "done") { resolve(this.request.result) }
        else if (!this.request) { reject("IndexedDB Repo Error: Request is not defined.") }
        return promise as Promise<IDBDatabase>
    }

    protected async getStoreItem<T= any>(storeName: string, key: string): Promise<T> { 
        if (!storeName || !key) throw new Error("Store data missing!")
        const db = await this.getDb()
        const { promise, resolve, reject } = Promise.withResolvers()
        const transaction = db.transaction(storeName, "readonly")
        const store = transaction.objectStore(storeName)
        const response = store.get(key)

        response.onsuccess = () => resolve(response.result ?? {} as any)
        response.onerror = () => reject(response.error)
        return promise as Promise<any>
    }

    protected async getStoreItems<T= any>(storeName: string): Promise<T[]> { 
        if (!storeName) throw new Error("Store data missing!")
        const db = await this.getDb()
        const { promise, resolve, reject } = Promise.withResolvers()
        const transaction = db.transaction(storeName, "readonly")
        const store = transaction.objectStore(storeName)
        const response = store.getAll()

        response.onsuccess = () => resolve(response.result)
        response.onerror = () => reject(response.error)
        return promise as Promise<any>
    }

    protected async updateStoreItem(storeName: string, value: any) { 
        if (!storeName || !value) throw new Error("Store data missing!")
        const db = await this.getDb()
        const transaction = db?.transaction(storeName, "readwrite")
        const store = transaction?.objectStore(storeName)
        store?.put(value)
    }

}