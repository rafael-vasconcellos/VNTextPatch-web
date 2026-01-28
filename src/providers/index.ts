import type { TranslatorConstructor } from "../global/Translator/config";
//import type { EngineCore } from "../global/Translator/enginecore";
import { DeepLX } from "./DeepLX";
import { Google } from "./Google";



const translators: Record<string, TranslatorConstructor> = {
    DeepLX,
    Google
}

export function getTranslator(translatorName: string) {
    if (translatorName in translators) return translators[translatorName as keyof typeof translators]
    throw new Error("Translator not found!")
}

export default { getTranslator }