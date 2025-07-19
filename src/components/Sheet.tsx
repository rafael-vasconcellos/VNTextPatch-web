import { createEffect } from 'solid-js';
import Handsontable from 'handsontable';
import 'handsontable/styles/handsontable.css';
import 'handsontable/styles/ht-theme-main.css';
//import 'handsontable/styles/ht-theme-horizon.css';


interface SheetProps { 
    sheet: string[][]
}

export default function Sheet({ sheet }: SheetProps) { //console.log(sheet)
    let section: HTMLElement | undefined

    createEffect(() => { 
        if (sheet instanceof Array && sheet[0] instanceof Array && section) { 
            new Handsontable(section, {
                themeName: 'ht-theme-main-dark',
                //startRows: 8,
                startCols: 5,
                rowHeaders: false,
                colHeaders: false,
                height: 'auto',
                licenseKey: 'non-commercial-and-evaluation',
                afterChange(change, source) {
                    if (source === 'loadData' || !change) { return }
                    
                },
                autoWrapRow: true,
                autoWrapCol: true,
                data: sheet
            });
        }
    })


    return ( 
        <section ref={section}></section>
    )
}