import { DeepLX } from "./DeepLX";
import { Google } from "./Google";



const translators = {
    DeepLX,
    Google
}

export type TranslatorNames = keyof typeof translators

export function getTranslator(translatorName: string) {
    if (translatorName in translators) return translators[translatorName as keyof typeof translators]
    throw new Error("Translator not found!")
}

export const translatorNames = Object.keys(translators)

export default { getTranslator, translatorNames }