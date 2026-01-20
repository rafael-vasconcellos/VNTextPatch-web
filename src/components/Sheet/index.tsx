import { createEffect } from 'solid-js';
import { unwrap } from "solid-js/store";
import Handsontable from 'handsontable';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import './style.css';
import type { Sheet } from '../../global/ProjectRepo';
//import 'handsontable/styles/ht-theme-horizon.css';


interface SheetProps { 
    sheet?: Sheet
    onChange?: (s: Partial<Sheet>) => void
    sheetOptions?: {
        readOnly: boolean
    }
    addHook?: (
        key: "afterChange", 
        callback: 
            ((changes: Handsontable.CellChange[] | null, source: Handsontable.ChangeSource) => void) | 
            (((changes: Handsontable.CellChange[] | null, source: Handsontable.ChangeSource) => void) | undefined)[] | undefined, 
            orderIndex?: number
    ) => void
}

export default function Sheet(props: SheetProps) { 
    let section: HTMLElement | undefined

    createEffect(() => { //console.log(sheet())
        if (props.sheet?.content instanceof Array && props.sheet?.content?.[0] instanceof Array && section) { 
            section.innerHTML = ''
            const hot = new Handsontable(section, { 
                themeName: 'ht-theme-main-dark',
                startRows: 8,
                startCols: 5,
                rowHeaders: (index) => String(props.sheet?.originalIndexes?.[index] ?? index),
                colHeaders: ["Original Text", "Initial", "Machine Translation", "Better Translation", "Best Translation"],
                licenseKey: 'non-commercial-and-evaluation',
                afterChange(change, source) {
                    if (source === 'loadData' || !change) { return }
                    //console.log(change)
                },
                autoWrapRow: true,
                autoWrapCol: true,
                data: unwrap(props.sheet!.content),
                columns: [
                    {
                        data: 0,
                        readOnly: true
                    }, {
                        data: 1,
                    }, {
                        data: 2,
                    }, {
                        data: 3,
                    }, {
                        data: 4,
                    }, 
                ],
                renderAllColumns: false,
                readOnly: props.sheetOptions?.readOnly===true,
                stretchH: "none",
                colWidths: 215
            });

            hot.addHook('afterChange', (changes, _) => { 
                changes?.forEach(change => { 
                    const [ row, col, , value ] = change
                    if (col===0 && !value) { hot.alter('remove_row', row) }
                })
                props.onChange && props.sheet && props.onChange({
                    filename: props.sheet.filename,
                    content: hot.getData()
                })
            })
        }

    })


    return ( 
        <section class='w-full' ref={section}></section>
    )
}