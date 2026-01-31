import { useParams } from "@solidjs/router"
import { createEffect } from "solid-js"
import { getCharNames } from "../global/store"
import type { Sheet } from "../global/repo/project"



interface DialoguePreviewProps {
    sheet: Sheet
    selectedCell: SelectedCell
}

export interface SelectedCell {
    row: number
    col: number
}

export default function DialoguePreview(props: DialoguePreviewProps) {
    const { project_name } = useParams()
    const charNames = getCharNames(project_name)
    const originalSpeakerName = () => props.sheet.speakerNames?.[props.selectedCell.row]
    const speakerName = () => charNames[originalSpeakerName() as string]

    createEffect(() => console.log(originalSpeakerName(), speakerName()))

    return (
        <section class="bg-zinc-600 w-full py-4 fixed bottom-6 z-50 flex flex-col items-center">
            {speakerName && <h2 class="font-bold">{speakerName()}</h2>}
            <p class="w-1/2 text-center">{props.sheet.content[props.selectedCell.row][props.selectedCell.col]}</p>
        </section>
    )
}