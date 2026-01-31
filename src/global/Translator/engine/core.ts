import { TranslatorEngineConfig, type TranslatorEngine } from "./config"


export class EngineCore implements Omit<TranslatorEngine, 'translate'> {
    public static Build() {
        return new this()
    }

    public config = new TranslatorEngineConfig()
    async batchSize() { return this.config.batchSize.value }
    async targetLanguage() { return this.config.targetLanguage.value }
}

