import { TranslationConfig, type TranslatorEngine } from "./config";
import { updateSheet } from "../utils"
import type { ProjectRepo, Sheet } from "../ProjectRepo";



interface TranslatorInit {
    engine: TranslatorEngine
    repo: ProjectRepo
    sheetNames: string[]
}

export class Translator { 
    private readonly repo: ProjectRepo
    private readonly engine: TranslatorEngine
    private sheetNames: string[]
    constructor(init: TranslatorInit) {
        this.engine = init.engine
        this.repo = init.repo
        this.sheetNames = init.sheetNames
    }

    async translate() {
        if (!this.sheetNames.length) this.sheetNames = await this.repo.getSheetNames() as string[]
        for (const sheetName of this.sheetNames) {
            const sheet = await this.repo.getSheet(sheetName)
            this.translateSheet(sheet)
                .then(() => updateSheet(sheet.filename, sheet.content))
                .catch(e => console.error(e))
        }
    }

    async translateSheet(sheet: Sheet) {
        for (let startIndex=0; startIndex<sheet.content.length; startIndex+=this.engine.batchSize) {
            const endIndex = startIndex + this.engine.batchSize
            const slice: {
                index: number
                row: (string | null)[]
            }[] = []
            for (let j=startIndex; j<Math.min(endIndex, sheet.content.length); j++) {
                if (!sheet.content[j]) break
                if (sheet.content[j][TranslationConfig.targetColumn] && TranslationConfig.ignoreTranslated) 
                    continue
                slice.push({
                    index: j,
                    row: sheet.content[j]
                })
            }


            if (slice.length === 0) continue
            const batch = slice.map(item => item.row[TranslationConfig.srcColumn])
            const translation = await this.engine.translate(batch)
            translation.forEach((line, i) => {
                if (slice[i].row[TranslationConfig.targetColumn] && !TranslationConfig.overrideCells) return
                slice[i].row[TranslationConfig.targetColumn] = line
                sheet.content[slice[i].index] = slice[i].row
            })

            if (TranslationConfig.saveOnEachBatch) { this.repo.updateSheet(sheet) }
        }
    }

}