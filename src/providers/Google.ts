import { TranslatorEngineConfig, type TranslatorEngine } from "../global/Translator/engine/config"
import { EngineCore } from "../global/Translator/engine/core"



export class Google extends EngineCore implements TranslatorEngine {
    public translatorName: string = "Google"
    public config = new TranslatorEngineConfig({
        batchSize: 150,
        targetLanguage: "en"
    })
    public delimiter: string = "\n<br>\n"
    private readonly maxRequestsPerMinute: number = 30
    private readonly timeWindowMs: number = 60000 // 1 minuto em ms
    private requestTimestamps: number[] = []

    private async enforceRateLimit(): Promise<void> {
        const now = Date.now()
        
        // Remove timestamps que saíram da janela de 1 minuto
        this.requestTimestamps = this.requestTimestamps.filter(
            timestamp => now - timestamp < this.timeWindowMs
        )

        // Se atingiu o limite, aguarda
        if (this.requestTimestamps.length >= this.maxRequestsPerMinute) {
            const oldestTimestamp = this.requestTimestamps[0]
            const waitTime = this.timeWindowMs - (now - oldestTimestamp)
            if (waitTime > 0) {
                await new Promise(resolve => setTimeout(resolve, waitTime + 100))
                // Após aguardar, limpa novamente
                this.requestTimestamps = this.requestTimestamps.filter(
                    timestamp => Date.now() - timestamp < this.timeWindowMs
                )
            }
        }

        // Registra esta requisição
        this.requestTimestamps.push(Date.now())
    }

    private async singleHandler(text: string): Promise<string | null> {
        await this.enforceRateLimit()
        return await fetch("https://google-translate-serverless-puce.vercel.app/api/translate", { 
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                to: await this.targetLanguage(),
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