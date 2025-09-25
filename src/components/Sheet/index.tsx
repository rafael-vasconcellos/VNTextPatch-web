import { createEffect } from 'solid-js';
import Handsontable from 'handsontable';
import { useRepoContext } from '../../pages/Explorer/context';
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
    const [ repo ] = useRepoContext()
    let section: HTMLElement | undefined

    createEffect(() => { //console.log(sheet())
        if (props.sheet?.content instanceof Array && props.sheet?.content?.[0] instanceof Array && section) { 
            section.innerHTML = ''
            const hot = new Handsontable(section, { 
                themeName: 'ht-theme-main-dark',
                //startRows: 8,
                startCols: 5,
                rowHeaders: true,
                colHeaders: ["Original Text", "Initial", "Machine Translation", "Better Translation", "Best Translation"],
                height: 'auto',
                licenseKey: 'non-commercial-and-evaluation',
                afterChange(change, source) {
                    if (source === 'loadData' || !change) { return }
                    //console.log(change)
                },
                autoWrapRow: true,
                autoWrapCol: true,
                data: props.sheet!.content,
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
                renderAllColumns: false
            });
            
            hot.addHook('afterChange', (changes) => { 
                changes?.forEach(change => { 
                    const [ row, col, , value ] = change
                    if (col===0 && !value) { hot.alter('remove_row', row) }
                })
                props.onChange && props.onChange(hot.getData())
            })

            repo().addEventListener<"sheetupdate">("sheetupdate", evt => {
                hot.updateData(evt.data.content)
            })
        }
    })


    return ( 
        <section class='w-full' ref={section}></section>
    )
}