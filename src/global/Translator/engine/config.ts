export interface TranslatorEngineInit {
    batchSize: number
    targetLanguage: string
}

export interface TranslatorEngine extends TranslatorEngineInit {
    config: TranslatorEngineConfig
    translate(texts: (string | null)[]): Promise<string[]>
}

export class TranslatorEngineOption<T=any> {
    public value: T
    public label: string
    public description: string
    constructor(
        value: T,
        label: string,
        description: string
    ) {
        this.value = value
        this.label = label
        this.description = description
    }
}

type ITranslatorEngineConfig = {
    [K in keyof TranslatorEngineInit]: TranslatorEngineOption
}

export class TranslatorEngineConfig implements ITranslatorEngineConfig {
    public targetLanguage = new TranslatorEngineOption<string>("en_US", "Target Language", "Target language of the translation")
    public batchSize = new TranslatorEngineOption<number>(50, "Batch Size", "Amount of text to translate per request")

    constructor(init?: TranslatorEngineInit) {
        if (init?.targetLanguage) this.targetLanguage.value = init.targetLanguage
        if (init?.batchSize) this.batchSize.value = init.batchSize
    }
}