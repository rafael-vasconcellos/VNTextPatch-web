import { createEffect } from 'solid-js';
import { unwrap } from "solid-js/store";
import Handsontable from 'handsontable';
import type { Sheet } from '../../global/repo/project';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import './style.css';
//import 'handsontable/styles/ht-theme-horizon.css';



interface ChangeEvent {
    sheet?: Partial<Sheet>
    change?: any[]
}

interface SelectionEvent {
    row: number
    col: number
}

interface SheetProps { 
    sheet?: Sheet
    onChange?: (p: ChangeEvent) => void
    onSelection?: (p: SelectionEvent) => void
    onDeselect?: () => void
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

    createEffect(() => { 
        if (props.sheet?.content instanceof Array && props.sheet?.content?.[0] instanceof Array && section) { 
            section.innerHTML = ''
            const hot = new Handsontable(section, { 
                themeName: 'ht-theme-main-dark',
                startRows: 8,
                startCols: 5,
                rowHeaders: (index) => String((props.sheet?.originalIndexes?.[index] ?? index)+1),
                colHeaders: ["Original Text", "Initial", "Machine Translation", "Better Translation", "Best Translation"],
                afterChange(change, source) {
                    if (source === 'loadData' || !change) { return }
                    //console.log(props.sheet?.content)
                },
                afterSelection(row, col, row2, col2) {
                    if (row===row2 && col===col2 && props.onSelection)
                        props.onSelection({ row, col })
                },
                afterDeselect() { props.onDeselect && props.onDeselect() },
                autoWrapRow: true,
                autoWrapCol: true,
                data: structuredClone(unwrap(props.sheet!.content)),
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
                colWidths: 215,
                licenseKey: 'non-commercial-and-evaluation',
            });

            hot.addHook('afterChange', (changes, _) => { 
                /* changes?.forEach(change => { 
                    const [ row, col, _, value ] = change
                    if (col===0 && !value) { hot.alter('remove_row', row) }
                    //console.log(_) // _ = prevValue
                }); */
                props.onChange && props.sheet && props.onChange({
                    sheet: {
                        ...props.sheet,
                        content: hot.getData()
                    },
                    change: changes?.[0]
                })
            })
        }

    })


    return ( 
        <section class='w-full' ref={section}></section>
    )
}