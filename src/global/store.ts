import { createStore } from "solid-js/store";
import type { Sheet } from "./ProjectRepo";


export const [ sheets_store, setProjectSheets ] = createStore<Record<string, Record<string, Sheet>>>({})

export function setSheets(projectName: string, sheets: Record<string, Sheet>) {
    setProjectSheets(projectName, sheets)
}

export function setSheet(projectName: string, fileName: string, sheet: Sheet) {
    if (!sheets_store[projectName]) setProjectSheets(projectName, {})
    //if (!sheets_store[projectName]?.[fileName]) setProjectSheets(projectName, fileName, {})
    setProjectSheets(projectName, fileName, sheet)
}

export function updateSheetContent(projectName: string, fileName: string, sheet: (string | null)[][]) {
    if (sheets_store[projectName]?.[fileName]) {
        setProjectSheets(projectName, fileName, "content", sheet)
        setProjectSheets(projectName, fileName, "translatedRows", sheet.filter(rows => rows.filter(c=>c).length > 1).length)
    }
}