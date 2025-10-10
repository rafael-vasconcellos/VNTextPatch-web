export interface TranslatorEngineInit {
    batchSize: number
    targetLanguage: string
}

export interface TranslatorEngine extends TranslatorEngineInit {
    translate(texts: (string | null)[]): Promise<string[]>
}

export interface TranslatorConstructor {
    new(init: TranslatorEngineInit): TranslatorEngine
    Build(init: TranslatorEngineInit): TranslatorEngine
}

export class TranslationConfig { 
    public static get ignoreTranslated(): boolean {
        const strValue = sessionStorage.getItem("ignoreTranslated")
        return strValue? Boolean(strValue) : true
    }

    public static get overrideCells(): boolean {
        const strValue = sessionStorage.getItem("overrideCells")
        return strValue? Boolean(strValue) : false
    }

    public static get saveOnEachBatch(): boolean {
        const strValue = sessionStorage.getItem("saveOnEachBatch")
        return strValue? Boolean(strValue) : true
    }

    public static get targetColumn(): number {
        const strValue = sessionStorage.getItem("targetColumn")
        const n = Number(strValue)
        return Number.isNaN(n) || !strValue? 1 : n
    }

    public static get srcColumn(): number {
        const strValue = sessionStorage.getItem("srcColumn")
        const n = Number(strValue)
        return Number.isNaN(n)? 0 : n
    }




    public static setIgnoreTranslated(newValue: string) {
        sessionStorage.setItem("ignoreTranslated", newValue)
    }

    public static setOverrideCells(newValue: string) {
        sessionStorage.setItem("overrideCells", newValue)
    }

    public static setSaveOnEachBatch(newValue: string) {
        sessionStorage.setItem("saveOnEachBatch", newValue)
    }

    public static setTargetColumn(newValue: string) {
        sessionStorage.setItem("targetColumn", newValue)
    }

    public static setSrcColumn(newValue: string) {
        sessionStorage.setItem("srcColumn", newValue)
    }

    public static setTranslatorName(newValue: string) {
        sessionStorage.setItem("translatorName", newValue)
    }

    public static get translatorName() {
        return sessionStorage.getItem("translatorName") ?? "DeepLX"
    }
}