import type { TranslatorEngineInit } from "./config"


export class EngineCore {
    public targetLanguage: string = "en_US"
    public batchSize: number = 50
    constructor(init?: TranslatorEngineInit) {
        if (init?.targetLanguage) this.targetLanguage = init.targetLanguage
        if (init?.batchSize) this.batchSize = init.batchSize
    }

    public static Build(init?: TranslatorEngineInit) {
        return new this(init)
    }

    async translate(_: string[]): Promise<string[]> {
        throw new Error("Unimplemented method")
    }

}