import type { Sheet } from "../global/ProjectRepo"


interface SheetFooterProps {
    sheet: Sheet
}

export default function SheetFooter(props: SheetFooterProps) {
    const translatedRows = props.sheet.translatedRows ?? 0

    return (
        <footer class="w-full h-6 fixed bottom-0 flex justify-around" style={{ "background-color": "rgba(199, 199, 199, 0.12)" }}>
            <span>{props.sheet.filename}</span>
            <span>{props.sheet.rows} rows</span>
            <span>{translatedRows} translated rows ({(translatedRows / props.sheet.rows).toFixed(2)}%)</span>
        </footer>
    )
}