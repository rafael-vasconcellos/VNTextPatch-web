import { TranslationConfig, type TranslatorEngine } from "./config";
import { sheets_store, updateSheetContent } from "../store"
import type { ProjectRepo, Sheet } from "../ProjectRepo";



interface TranslatorInit {
    engine?: TranslatorEngine
    repo?: ProjectRepo
}

interface MyCustomEvent {
    detail: {
        filename: string,
        start: number,
        end: number,
        length: number
    }
}

type EventName = "translationDone" | "batchTranslate"

class TranslationAbortedException extends Error {
    constructor() { super("Translation aborted!") }
}

class EngineNotProvidedException extends Error {
    constructor() { super("Translator engine not provided") }
}

class RepoNotProvidedException extends Error {
    constructor() { super("Project Repo not provided") }
}

class MyEmitter extends EventTarget {
    private listeners: Record<string, any> = {}
    on(eventName: string, listener: EventListenerOrEventListenerObject) {
        if (this.listeners[eventName] === listener) return
        else if (this.listeners[eventName]) this.removeEventListener(eventName, this.listeners[eventName])
        this.listeners[eventName] = listener
        this.addEventListener(eventName, listener)
    }

    dispatchCustomEvent(eventName: string, detail: Record<string, any> = {}) {
        this.dispatchEvent(
            new CustomEvent(eventName, { detail })
        )
    }
}

export class Translator {
    private repo?: ProjectRepo
    private engine?: TranslatorEngine
    private abortFlag: boolean = false
    private emitter = new MyEmitter()
    public on(eventName: EventName, listener: (e: MyCustomEvent) => void) {
        this.emitter.on(eventName, listener as any)
    }
    constructor(init?: TranslatorInit) {
        this.repo = init?.repo
        this.engine = init?.engine
    }

    abort() { this.abortFlag = true }
    setEngine(engine: TranslatorEngine) { this.engine = engine }
    setRepo(repo: ProjectRepo) { this.repo = repo }

    async translate(sheetNames: string[]) {
        if (!this.engine)
            throw new EngineNotProvidedException()
        if (!this.repo)
            throw new RepoNotProvidedException()
        if (!sheetNames.length) 
            sheetNames = await this.repo.getSheetNames() as string[]

        this.abortFlag = false
        for (const sheetName of sheetNames) {
            if (this.abortFlag) return Promise.resolve()
            const sheet = await this.repo.getSheet(sheetName)
            await this.translateSheet(sheet)
                .then(() => updateSheetContent(this.repo!.projectName!, sheet.filename, sheet.content))
                .then(() => console.log(sheets_store[this.repo!.projectName!]?.[sheet.filename]))
                .catch(e => !(e instanceof TranslationAbortedException) && console.error(e))
        }

        if (!this.abortFlag) this.emitter.dispatchCustomEvent("translationDone")
        if (this.abortFlag) this.abortFlag = false
        return null
    }

    async translateSheet(sheet: Sheet) {
        for (let startIndex=0; startIndex<sheet.content.length; startIndex+=this.engine!.batchSize) {
            if (this.abortFlag) throw new TranslationAbortedException()
            const endIndex = Math.min(startIndex + this.engine!.batchSize, sheet.content.length)
            const slice: {
                index: number
                row: (string | null)[]
            }[] = []

            for (let j=startIndex; j<endIndex; j++) {
                const isTranslated = sheet.content[j].some((cell, i) => (
                    cell && i>0
                ))
                if (isTranslated && TranslationConfig.ignoreTranslated) continue
                slice.push({
                    index: j,
                    row: sheet.content[j]
                })
            }

            if (slice.length === 0) continue
            this.emitter.dispatchCustomEvent("batchTranslate", {
                filename: sheet.filename,
                start: startIndex+1,
                end: endIndex+1,
                length: sheet.content.length,
            } as MyCustomEvent['detail'])

            const batch = slice.map(item => item.row[TranslationConfig.srcColumn])
            const translation = await this.engine!.translate(batch)
            .catch(e => {
                console.error(e)
                return []
            })
            translation.forEach((line, i) => {
                if (slice[i].row[TranslationConfig.targetColumn] && !TranslationConfig.overrideCells) return
                slice[i].row[TranslationConfig.targetColumn] = line
                sheet.content[slice[i].index] = slice[i].row
            })

            if (TranslationConfig.saveOnEachBatch && translation.length) { 
                if (!this.repo) throw new RepoNotProvidedException()
                this.repo.updateSheet(sheet) 
            }
        }
    }

}


