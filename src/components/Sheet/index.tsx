import { createEffect } from 'solid-js';
import Handsontable from 'handsontable';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
import './style.css';
import type { StoreItem } from '../../global/Repo';
//import 'handsontable/styles/ht-theme-horizon.css';


interface SheetProps { 
    sheet?: StoreItem
    onChange?: (s: string[][]) => void
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
                data: props.sheet!.content
            });
            
            hot.addHook('afterChange', (changes) => { 
                changes?.forEach(change => { 
                    const [ row, col, , value ] = change
                    if (col===0 && !value) { hot.alter('remove_row', row) }
                })
                props.onChange && props.onChange(hot.getData())
            })
        }
    })


    return ( 
        <section class='w-full' ref={section}></section>
    )
}