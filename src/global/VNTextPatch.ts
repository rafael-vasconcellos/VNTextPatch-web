import jschardet from 'jschardet';


interface ILineJSON { 
    name: string
    message: string
}

export function downloadFile(fileContent: string, fileName: string = 'file', fileType: string = 'application/json') { 
    const blob = new Blob([fileContent], { type: fileType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
}

export class MyWASM { 
    public isInitialized: boolean = false
    public dotnetRuntime?: Promise<any>
    constructor() { 
        (import('../../wasm/dotnet.js' as any)).then(async({ dotnet }) => { 
            this.dotnetRuntime = dotnet.create()
        }).catch(e => { 
            console.error('Failed to initialize .NET:', e);
        })
    }

    private async getFileSystem(): Promise<typeof FS> { 
        //await new Promise(res => setTimeout(res, 2000))
        const runtime = await this.dotnetRuntime
        if (!runtime) { throw new Error('Failed to use .NET virtual filesystem: .NET not initialized.') }
        return runtime?.Module.FS 
    }

    protected decodeUint8Array(uint8Array: Uint8Array, fileName?: string) { 
        const binaryString = new TextDecoder('latin1').decode(uint8Array);
        const detected = jschardet.detect(binaryString);

        if (detected.encoding) { 
            console.log(`Detected encoding for ${fileName}: ` + detected.encoding)
            const decoder = new TextDecoder(detected.encoding);
            return decoder.decode(uint8Array);
        }
        
        console.log(`Uint8Array decoding: using utf-8 fallback for ${fileName} file.`)
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(uint8Array);
    }

    protected async addFilesFromList(files: FileList) { 
        const fileSystem = await this.getFileSystem()
        if (!fileSystem.analyzePath("input")?.exists) { fileSystem.mkdir("input") }
        if (!fileSystem.analyzePath("output")?.exists) { fileSystem.mkdir("output") }
        if (files.length > 0) { 
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const arrayBuffer = await file.arrayBuffer();
                fileSystem.writeFile("input/" + file.name, new Uint8Array(arrayBuffer));
            }
        }
    }

    protected async getFolderFiles(folderName: string, outputFiles: Record<string, string> = {}) { 
        const fileSystem = await this.getFileSystem()
        const fileNames = await fileSystem.readdir(folderName)
        fileNames.forEach(async (folderItem: string) => { 
            const path_mode = fileSystem.stat(folderName + '/' + folderItem).mode
            if (folderItem !== '.' && folderItem != '..' && !fileSystem.isDir(path_mode)) { 
                const file: Uint8Array = fileSystem.readFile(folderName + '/' + folderItem)
                const fileString = new TextDecoder('utf-8').decode(file)
                outputFiles[folderItem] = fileString
            }
        })
        return outputFiles
    }

    async listDir(dir: string) { 
        const fileSystem = await this.getFileSystem()
        return await fileSystem.readdir(dir)?.filter((folderItem: string) => { 
            const path_mode = fileSystem.stat(dir + '/' + folderItem).mode
            return folderItem !== '.' && folderItem != '..' && !fileSystem.isDir(path_mode)
        })
    }

    async cleanDir(path: string) { 
        const fileSystem = await this.getFileSystem()
        const files = fileSystem.readdir(path);
        for (const f of files) {
            if (f !== '.' && f !== '..') {
                const fullPath = path + '/' + f;
                if (fileSystem.isFile(fileSystem.stat(fullPath).mode)) {
                    fileSystem.unlink(fullPath);
                }
            }
        }
    }

    async getOutputFiles(outputFiles: Record<string, string> = {}) { 
        return await this.getFolderFiles('output', outputFiles)
    }

    async addFilesFromInput(elementId: string) { 
        const fileInput = document.getElementById(elementId) as HTMLInputElement
        if (fileInput.files?.length) { return await this.addFilesFromList(fileInput.files) }
    }

    async addFiles({ files, elementId }: { 
        files?: FileList
        elementId?: string
    }) { 
        if (files) { return await this.addFilesFromList(files) }
        else if (elementId) { return await this.addFilesFromInput(elementId) }
    }
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
            set(target, oProp: string, value, _) { 
                const prop = oProp.replace('.json', '')
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
        const outputFiles = await this.extractLocal<ILineJSON[] | string[][]>(files)
        for (const fileName in outputFiles) { 
            outputFiles[fileName] = outputFiles[fileName].map((line) => { 
                return [ (line as ILineJSON).message, '', '', '', '' ]
            })
        }
        //console.log(outputFiles)
        return outputFiles as Record<string, string[][]>
    }
}