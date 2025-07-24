import { useRepoContext } from "../../pages/Explorer/context"
import { downloadObjFiles, vn } from '../../global/utils'


export default function Inject() { 
    const [ repo ] = useRepoContext()

    async function inject() { 
        const [ { jsonFiles, fileList }, sheets ] = await Promise.all([ 
            repo().getSrcFileList()
                .then(async fileList => ({ 
                    fileList,
                    jsonFiles: await vn().extractLocal(fileList),
                })), 

            repo().getSheets()
                .then(storeItems => storeItems.map(storeItem => Object.values(storeItem))) 
                .then((entries) => Object.fromEntries(entries) as Record<string, string[][]>)
        ])

        //console.log(sheets); console.log(jsonFiles)
        for (let fileName in sheets) { 
            if (sheets[fileName].length !== jsonFiles[fileName + '.json'].length) { 
                throw new Error(fileName + ' ' + "sheet is incompatible with original game files.")
            }
            for (let i=0; i<sheets[fileName].length; i++) { 
                const messages = sheets[fileName][i].filter(m => m)
                jsonFiles[fileName + '.json'][i].message = messages.at(-1) ?? messages[0]
            }
        }

        //console.log(jsonFiles)
        const patched_files = await vn().insertLocal(fileList, jsonFiles)
        downloadObjFiles(patched_files)
    }


    return ( 
        <button class="cursor-pointer" onClick={inject}>
            <svg class="size-11"
             xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64.000000 64.000000" preserveAspectRatio="xMidYMid meet">
                <g class="fill-white"
                transform="translate(0.000000,64.000000) scale(0.100000,-0.100000)" stroke="none">
                    <path d="M480 622 c0 -10 11 -29 25 -42 l25 -24 -35 -36 c-27 -28 -32 -39 -23
                    -48 9 -9 20 -4 48 23 l36 35 24 -25 c25 -26 60 -34 60 -12 0 16 -131 147 -148
                    147 -6 0 -12 -8 -12 -18z"/>
                    <path d="M325 529 c-4 -5 1 -19 11 -30 17 -18 16 -20 -4 -42 l-22 -23 22 -22
                    c20 -19 20 -22 4 -28 -10 -4 -24 0 -35 10 -16 15 -19 14 -39 -7 -20 -21 -20
                    -24 -5 -39 9 -10 13 -23 9 -34 -6 -16 -8 -15 -29 5 l-23 21 -22 -23 c-20 -21
                    -20 -24 -5 -39 9 -10 13 -23 9 -34 -6 -16 -8 -15 -29 5 l-23 21 -22 -23 c-16
                    -17 -22 -36 -22 -72 0 -46 -4 -53 -52 -102 -41 -42 -50 -55 -40 -65 10 -10 23
                    -1 65 40 49 48 56 52 101 52 l49 0 128 127 c127 125 129 126 149 108 16 -14
                    23 -16 32 -7 10 10 -10 35 -87 112 -55 55 -103 100 -107 100 -4 0 -10 -5 -13
                    -11z"/>
                </g>
            </svg>
        </button>
    )
}