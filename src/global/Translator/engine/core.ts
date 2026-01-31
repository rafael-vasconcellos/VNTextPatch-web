import { TranslatorEngineConfig, type TranslatorConstructor, type TranslatorEngine } from "./config"
import { ConfigRepo } from "../../repo/config"


export abstract class EngineCore implements TranslatorEngine {
    public static Build(this: TranslatorConstructor) {
        return new this()
    }

    abstract translatorName: string
    abstract translate(texts: (string | null)[]): Promise<string[]>
    public config = new TranslatorEngineConfig()
    private configRepo = new ConfigRepo()
    async batchSize() { 
        const config = await this.configRepo.getTranslatorConfig(this.translatorName)
        return config.batchSize || this.config.batchSize.value 
    }
    async targetLanguage() { 
        const config = await this.configRepo.getTranslatorConfig(this.translatorName)
        return config.targetLanguage || this.config.targetLanguage.value 
    }
}

