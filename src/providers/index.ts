import type { TranslatorConstructor } from "../global/Translator/config";
import { DeepLX } from "./DeepLX";



const translators: Record<string, TranslatorConstructor> = {
    DeepLX,
}

export function getTranslator(translatorName: string) {
    if (translatorName in translators) return translators[translatorName as keyof typeof translators]
    throw new Error("Translator not found!")
}

export default { getTranslator }