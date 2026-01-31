import type { TranslatorConstructor } from "../global/Translator/engine/config";
//import type { EngineCore } from "../global/Translator/enginecore";
import { DeepLX } from "./DeepLX";
import { Google } from "./Google";



const translators = {
    DeepLX,
    Google
} as unknown as Record<string, TranslatorConstructor>

export function getTranslator(translatorName: string) {
    if (translatorName in translators) return translators[translatorName as keyof typeof translators]
    throw new Error("Translator not found!")
}

export default { getTranslator }