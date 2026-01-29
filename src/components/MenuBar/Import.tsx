import { useParams } from "@solidjs/router";
import { unwrap } from "solid-js/store";
import type { JSX } from "solid-js"
import Papa from "papaparse"
import { useRepoContext } from "../../pages/context/repo"
import { sheets_store, updateSheetContent } from "../../global/store";



async function parseCSV(csvText: string): Promise<string[][] | void> {
    try {
        return (Papa.parse(csvText).data as string[][]).map(row => {
            if (row.length < 5) row.push(...Array(5 - row.length).fill(''));
            return row;
        })
    } catch (e) { console.error(e) }
}

export default function Import({ class: className }: JSX.ButtonHTMLAttributes<HTMLButtonElement>) { 
    const [ repo ] = useRepoContext()
    const { project_name } = useParams()

    async function importFiles() { 
        const files: FileSystemFileHandle[] = await (window as any).showOpenFilePicker({
            multiple: true,
            types: [
                {
                    description: 'CSV Files',
                    accept: {
                        'text/plain': ['.csv'],
                    },
                },
            ],
        })

        files?.forEach(async handle => { 
            const sheetNames = await repo().getSheetNames()
            const fileNameWithExt = handle.name
            const csvFileName = fileNameWithExt.replace('.csv', '')
            if (!sheetNames.includes(csvFileName)) { return }
            const file = await handle.getFile()
            const content = await parseCSV(await file.text())
            if (!content) { return }


            let updated = false
            const prevSheet = structuredClone(unwrap(sheets_store)[project_name]?.[csvFileName]?.content)
            for (const row of content) {
                row[0] = row[0]?.replaceAll('"', "").replaceAll(/\r?\n/g, "")
                const [ original_text, ...translations ] = row ?? []
                const prevIndex = prevSheet.findIndex(prevRow => prevRow[0]?.replaceAll(/\r?\n/g, "") === original_text)
                if (prevIndex >= 0) {
                    const prevRow = prevSheet[prevIndex]
                    const mergedRow = [
                        original_text,
                        ...translations.map((cell, i) => cell || (i<prevRow.length? prevRow[i] : ''))
                    ]
                    prevSheet[prevIndex] = mergedRow
                    updated = true
                }
            }

            if (updated) updateSheetContent(project_name, csvFileName, prevSheet)
        })
    }


    return ( 
        <button class={`${className || 'size-8'} cursor-pointer group`} onClick={importFiles}>
            <svg 
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64.000000 64.000000" preserveAspectRatio="xMidYMid meet">
                <g class="fill-primary group-hover:fill-primary/60" transform="translate(0.000000,64.000000) scale(0.100000,-0.100000)" stroke="none">
                    <path d="M257 502 l-78 -79 3 -49 c2 -35 7 -49 18 -49 10 0 16 12 18 38 l3 37
                    50 0 c67 0 89 22 89 90 l0 51 78 -3 77 -3 0 -215 0 -215 -145 0 -145 0 -5 45
                    c-3 31 -10 45 -20 45 -11 0 -16 -13 -18 -47 -2 -37 1 -51 17 -67 19 -19 33
                    -21 171 -21 205 0 190 -21 190 260 0 271 6 260 -133 260 l-92 0 -78 -78z m59
                    -48 c-3 -8 -19 -14 -38 -14 l-32 0 35 36 c32 33 34 34 37 14 2 -12 1 -28 -2
                    -36z"/>
                    <path d="M85 310 l-50 -50 53 -52 c40 -41 54 -50 64 -40 9 9 6 18 -17 42 l-28
                    29 114 3 c93 2 114 6 114 18 0 12 -21 16 -114 18 l-114 3 28 29 c24 25 27 50
                    7 50 -4 0 -30 -23 -57 -50z"/>
                </g>
            </svg>
        </button>
    )
}