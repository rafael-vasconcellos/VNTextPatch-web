export interface TranslatorEngineInit {
    batchSize: number
    targetLanguage: string
}

export interface TranslatorEngine extends TranslatorEngineInit {
    translate(texts: (string | null)[]): Promise<string[]>
}

export class TranslationConfig { 
    public static get ignoreTranslated(): boolean {
        return Boolean(sessionStorage.getItem("ignoreTranslated")) ?? true
    }

    public static get overrideCells(): boolean {
        return Boolean(sessionStorage.getItem("overrideCells")) ?? true
    }

    public static get saveOnEachBatch(): boolean {
        return Boolean(sessionStorage.getItem("saveOnEachBatch")) ?? true
    }

    public static get targetColumn(): number {
        return Number(sessionStorage.getItem("targetColumn")) ?? 1
    }

    public static get srcColumn(): number {
        return Number(sessionStorage.getItem("srcColumn")) ?? 1
    }




    public static setIgnoreTranslated(newValue: boolean) {
        sessionStorage.setItem("ignoreTranslated", String(newValue))
    }

    public static setOverrideCells(newValue: boolean) {
        sessionStorage.setItem("overrideCells", String(newValue))
    }

    public static setSaveOnEachBatch(newValue: boolean) {
        sessionStorage.setItem("saveOnEachBatch", String(newValue))
    }

    public static setTargetColumn(newValue: number) {
        sessionStorage.setItem("targetColumn", String(newValue))
    }

    public static setSrcColumn(newValue: number) {
        sessionStorage.setItem("srcColumn", String(newValue))
    }

    public static setTranslatorName(newValue: string) {
        sessionStorage.setItem("translatorName", newValue)
    }

    public static get translatorName() {
        return sessionStorage.getItem("translatorName") ?? "DeepLX"
    }
}