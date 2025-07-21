import { createEffect, type Accessor } from 'solid-js';
import Handsontable from 'handsontable';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
//import 'handsontable/styles/ht-theme-horizon.css';


interface SheetProps { 
    sheet: Accessor<string[][] | undefined>
    onChange?: (s: string[][]) => void
    addHook?: (
        key: "afterChange", 
        callback: 
            ((changes: Handsontable.CellChange[] | null, source: Handsontable.ChangeSource) => void) | 
            (((changes: Handsontable.CellChange[] | null, source: Handsontable.ChangeSource) => void) | undefined)[] | undefined, 
            orderIndex?: number
    ) => void
}

export default function Sheet({ sheet, onChange }: SheetProps) { 
    let section: HTMLElement | undefined

    createEffect(() => { //console.log(sheet())
        if (sheet() instanceof Array && sheet()?.[0] instanceof Array && section) { 
            section.innerHTML = ''
            const hot = new Handsontable(section, { 
                themeName: 'ht-theme-main-dark',
                //startRows: 8,
                startCols: 5,
                rowHeaders: false,
                colHeaders: false,
                height: 'auto',
                licenseKey: 'non-commercial-and-evaluation',
                afterChange(change, source) {
                    if (source === 'loadData' || !change) { return }
                    //console.log(change)
                },
                autoWrapRow: true,
                autoWrapCol: true,
                data: sheet()
            });
            
            hot.addHook('afterChange', () => { 
                onChange && onChange(hot.getData())
            })
        }
    })


    return ( 
        <section class='w-full' ref={section}></section>
    )
}