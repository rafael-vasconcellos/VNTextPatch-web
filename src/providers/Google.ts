import type { TranslatorEngine } from "../global/Translator/config"
import { EngineCore } from "../global/Translator/enginecore"


export class Google extends EngineCore implements TranslatorEngine {
    public batchSize: number = 25
    public targetLanguage: string = "en"
    public delimiter: string = "\n<br>\n"

    private async singleHandler(text: string): Promise<string | null> {
        return await fetch("https://google-translate-serverless-puce.vercel.app/api/translate", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                to: this.targetLanguage,
                text
            })
        })
        .then(response => {
            if (response.ok) return response.json()
            return null
        })
        .then(response => response?.text)
        .catch(err => {
            console.error(err)
            return null
        })
    }

    async translate(texts: string[]): Promise<string[]> {
        console.log(`Google Translate: Joined text length = ${texts.join().length}`)
        const translated_text = await this.singleHandler(texts.join(this.delimiter))
        if (!translated_text) throw new Error("Failed to translated batch.")
        return translated_text.split(this.delimiter)
    }

}