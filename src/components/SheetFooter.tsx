import type { Sheet } from "../global/ProjectRepo"


interface SheetFooterProps {
    sheet: Sheet
}

export default function SheetFooter(props: SheetFooterProps) { 
    const translatedRows = () => props.sheet.translatedRows ?? 0

    return (
        <footer class="w-full h-6 bg-zinc-600 fixed bottom-0 z-50 flex justify-around">
            <span>{props.sheet.filename}</span>
            <span>{props.sheet.rows} rows</span>
            <span>{translatedRows()} translated rows ({((translatedRows() / props.sheet.rows) * 100).toFixed(2)}%)</span>
        </footer>
    )
}