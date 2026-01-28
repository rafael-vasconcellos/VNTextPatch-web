import type { TranslatorConstructor, TranslatorEngine } from "../global/Translator/config"
import { EngineCore } from "../global/Translator/enginecore"



export const DeepLX: TranslatorConstructor = class extends EngineCore implements TranslatorEngine {
    public targetLanguage: string = "en"
    public batchSize: number = 25

    private async handler(text: string): Promise<string | null> { 
        return await fetch("https://deep-lx-vercel-coral.vercel.app/api/translate", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                text,
                target_lang: this.targetLanguage
            })
        }).then(response => {
            if (response.ok) return response.json()
            return null
        })
        .then(response => response?.data)
        .catch(err => {
            console.error(err)
            return null
        })
    }

    async translate(texts: string[]): Promise<string[]> {
        const promises = texts.map(text => this.handler(text))
        return await Promise.all(promises).then(translated_texts => {
            if (translated_texts.some(text => text?.length)) return translated_texts as string[]
            throw new Error("Failed to translated batch.")
        })
    }
}