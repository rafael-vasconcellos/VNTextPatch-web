import { MyWASM } from "./wasm";
import type { Sheet } from "../ProjectRepo";



export interface ILineJSON { 
    name?: string
    message: string
}

export class VNTextPatch extends MyWASM { 
    async execute(args: string[]) { 
        const runtime = await this.dotnetRuntime
        const exitCode = await runtime?.runMain('VNTextPatch.dll', args)
        if (exitCode === 0) {
            console.log('VNTextPatch completed successfully!');
        } else {
            console.log(`VNTextPatch exited with code: ${exitCode}`);
        }
    }

    async extractLocal(files?: FileList): Promise<Record<string, ILineJSON[]>> { 
        const outputFiles = {} as Record<string, any>
        const proxy = new Proxy(outputFiles, { 
            get(target, prop: string, _) { return target[prop] },
            set(target, prop: string, value, _) { 
                try { target[prop] = JSON.parse(value) }
                catch (e) { target[prop] = value }
                return true
            }
        })
        await this.addFiles({ 
            files,
            elementId: 'fileInput'
        })
            .then(() => this.execute(['extractlocal', 'input', 'output']))
            .then(() => this.getOutputFiles(proxy))

        
        //console.log(outputFiles)
        this.cleanDir('input'); this.cleanDir('output')
        return outputFiles
    }

    async extractLocalAsSheets(files?: FileList): Promise<Record<string, Sheet>> { 
        const jsonFiles = await this.extractLocal(files)
        const outputFiles = {} as Record<string, Sheet>
        const charNames = new Set<string>()
        for (const filename in jsonFiles) { 
            const content = jsonFiles[filename].map(lineObj => { 
                if (lineObj.name) { charNames.add(lineObj.name) }
                return [ lineObj.message, '', '', '', '' ]
            })
            outputFiles[filename.replace('.json', '')] = {
                content,
                filename: filename.replace('.json', ''),
                rows: content.length,
                speakerNames: jsonFiles[filename].map(lineObj => lineObj.name)
            } as Sheet
        }

        //console.log(jsonFiles)
        outputFiles.char_names = {
            filename: "char_names",
            content: [] as string[][],
            rows: 0,
        } as Sheet
        charNames.forEach(name => { 
            outputFiles.char_names.content.push([ name, '', '', '', '' ])
            outputFiles.char_names.rows += 1
        })
        return outputFiles
    }

    async insertLocal(srcFiles: FileList, jsonFiles: Record<string, ILineJSON[]>) { 
        await this.addFilesFromList(srcFiles, "src_files")
        await this.addFilesFromObj(jsonFiles)


        const patchedFiles = await this.execute([ 'insertlocal', 'src_files', 'input', 'output' ])
            .then(() => this.getFolderFiles({ 
                folderName: 'output',
                encoding: 'auto'
            }))

        //console.log(patchedFiles)
        this.cleanDir('input'); this.cleanDir('output'); this.cleanDir('src_files')
        return patchedFiles
    }
}