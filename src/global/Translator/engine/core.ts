import { TranslatorEngineConfig, type TranslatorEngine, type TranslatorEngineInit } from "./config"


export class EngineCore implements Omit<TranslatorEngine, 'translate'> {
    constructor(init?: TranslatorEngineInit) {
        if (init?.targetLanguage) this.config.targetLanguage.value = init.targetLanguage
        if (init?.batchSize) this.config.batchSize.value = init.batchSize
    }

    public static Build(init?: TranslatorEngineInit) {
        return new this(init)
    }

    public config = new TranslatorEngineConfig()
    get batchSize() { return this.config.batchSize.value }
    get targetLanguage() { return this.config.targetLanguage.value }

}