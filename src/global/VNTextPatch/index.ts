import { MyWASM } from "./wasm";



interface ILineJSON { 
    name: string
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

    async extractLocal<T= ILineJSON[]>(files?: FileList): Promise<Record<string, T>> { 
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

    async extractLocalAsSheets(files?: FileList) { 
        const jsonFiles = await this.extractLocal<ILineJSON[]>(files)
        const outputFiles = {} as Record<string, string[][]>
        const char_names = new Set<string>()
        for (const fileName in jsonFiles) { 
            outputFiles[fileName.replace('.json', '')] = jsonFiles[fileName].map((line) => { 
                if (line.name) { char_names.add(line.name) }
                return [ line.message, '', '', '', '' ]
            })
        }

        //console.log(jsonFiles)
        outputFiles.char_names = []
        char_names.forEach(name => { 
            (outputFiles.char_names as Array<string[]>).push([ name, '', '', '', '' ])
        })
        return outputFiles as Record<string, string[][]>
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