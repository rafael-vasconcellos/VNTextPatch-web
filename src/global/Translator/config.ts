export class TranslationConfig { 
    public static get ignoreTranslated(): boolean {
        const strValue = sessionStorage.getItem("ignoreTranslated") ?? "1"
        return Number(strValue)>0
    }

    public static get overrideCells(): boolean {
        const strValue = sessionStorage.getItem("overrideCells") ?? "0"
        return Number(strValue)>0
    }

    public static get saveOnEachBatch(): boolean {
        const strValue = sessionStorage.getItem("saveOnEachBatch") ?? "1"
        return Number(strValue)>0
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
        return sessionStorage.getItem("translatorName") ?? "Google"
    }
}