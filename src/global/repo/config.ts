import { Repo } from "./core";
import type { TranslatorEngineInit } from "../Translator/engine/config";



interface TranslatorConfigStore extends TranslatorEngineInit {
    translatorName: string
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
        const config = await this.getStoreItem("translator_engines", translatorName)
        return {
            translatorName,
            ...config
        }
    }

    async getTranslatorConfigOption<T=any>(translatorName: string, optionName: string, defaultValue: T) {
        const config = await this.getTranslatorConfig(translatorName)
        return config[optionName as keyof TranslatorEngineInit] || defaultValue
    }

    async setTranslatorConfig(translatorName: string, optionName: string, newValue: any) {
        const config = await this.getTranslatorConfig(translatorName)
        config[optionName as keyof TranslatorConfigStore] = newValue
        //console.log(config)
        this.updateStoreItem("translator_engines", config)
    }

}