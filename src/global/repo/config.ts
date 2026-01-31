import { Repo } from "./core";
import type { TranslatorEngineInit } from "../Translator/engine/config";
import type { TranslatorNames } from "../../providers";



interface TranslatorConfigStore extends TranslatorEngineInit {
    translatorName: TranslatorNames
}

interface PartialTranslatorConfigStore extends Partial<TranslatorEngineInit> {
    translatorName: TranslatorNames
}

export class ConfigRepo extends Repo {
    create() {
        this.request = indexedDB.open("config", 1)
        this.request.onupgradeneeded = (event) => { 
            const db = (event.target as IDBOpenDBRequest).result
            db.createObjectStore("translator_engines", { keyPath: "translatorName" })
        }
        this._isOpen = true
    }

    async open() {
        if (this._isOpen) return
        const databases = await indexedDB.databases() as any[]
        if (!databases.includes('config')) return this.create()
        this.request = indexedDB.open("config", 1)
        this._isOpen = true
    }

    async getTranslatorConfig(translatorName: string): Promise<Partial<TranslatorConfigStore>> {
        if (!this.isOpen) await this.open()
        return this.getStoreItem("translator_engines", translatorName)
    }

    async setTranslatorConfig(newConfig: PartialTranslatorConfigStore) {
        const config = await this.getTranslatorConfig(newConfig.translatorName)
        newConfig = Object.assign(config, newConfig)
        this.updateStoreItem("translator_engines", newConfig)
    }

}