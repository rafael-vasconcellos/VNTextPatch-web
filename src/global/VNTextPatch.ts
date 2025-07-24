import jschardet from 'jschardet';


interface ILineJSON { 
    name: string
    message: string
}

interface GetFolderOptions { 
    folderName: string
    outputFiles?: Record<string, string>
    encoding?: string
}

class MyTextDecoder { 
    private uintArray: Uint8Array
    private fileName?: string
    constructor(uintArray: Uint8Array, fileName?: string) { 
        this.uintArray = uintArray
        this.fileName = fileName
    }

    public detectEncoding() { 
        const binaryString = new TextDecoder('latin1').decode(this.uintArray);
        const detected = jschardet.detect(binaryString);

        if (detected.encoding) { 
            console.log(`Detected encoding for ${this.fileName || ''}: ` + detected.encoding)
            return detected.encoding
        }

        console.log(`Uint8Array decoding: using utf-8 fallback for ${this.fileName || ''} file.`)
        return 'utf-8'
    }

    public getDecoder() { 
        return new TextDecoder(this.detectEncoding())
    }

    public decode(encoding?: string) { 
        if (encoding === 'auto' || !encoding) { return this.getDecoder().decode(this.uintArray) }
        return new TextDecoder(encoding).decode(this.uintArray)
    }
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

    protected async addFilesFromList(files: FileList, inputFolder: string = "input") { 
        const fileSystem = await this.getFileSystem()
        if (!fileSystem.analyzePath(inputFolder)?.exists) { fileSystem.mkdir(inputFolder) }
        if (!fileSystem.analyzePath("output")?.exists) { fileSystem.mkdir("output") }
        if (files.length > 0) { 
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const arrayBuffer = await file.arrayBuffer();
                fileSystem.writeFile(inputFolder + "/" + file.name, new Uint8Array(arrayBuffer));
            }
        }
    }

    async getFolderFiles({ folderName, outputFiles, encoding }: GetFolderOptions) { 
        outputFiles ||= {}
        const fileSystem = await this.getFileSystem()
        const fileNames = await fileSystem.readdir(folderName)
        fileNames.forEach(async (folderItem: string) => { 
            const path_mode = fileSystem.stat(folderName + '/' + folderItem).mode
            if (folderItem !== '.' && folderItem != '..' && !fileSystem.isDir(path_mode)) { 
                const file: Uint8Array = fileSystem.readFile(folderName + '/' + folderItem)
                const fileString = new MyTextDecoder(file).decode(encoding ?? 'utf-8')
                outputFiles[folderItem] = fileString
            }
        })
        return outputFiles
    }

    async addFilesFromObj(files: Record<string, any>, inputFolder: string = "input") { 
        const fileSystem = await this.getFileSystem()
        if (!fileSystem.analyzePath(inputFolder)?.exists) { fileSystem.mkdir(inputFolder) }
        if (!fileSystem.analyzePath("output")?.exists) { fileSystem.mkdir("output") }
        for (const fileName in files) {
            const file = files[fileName]
            fileSystem.writeFile(inputFolder + "/" + fileName, MyWASM.formatFile(file))
        }
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

    async addFilesFromInput(elementId: string) { 
        const fileInput = document.getElementById(elementId) as HTMLInputElement
        if (fileInput.files?.length) { return await this.addFilesFromList(fileInput.files) }
    }

    async getOutputFiles(outputFiles: Record<string, string> = {}) { 
        return await this.getFolderFiles({ 
            folderName: 'output',
            outputFiles
        })
    }

    async addFiles({ files, elementId, obj }: { 
        files?: FileList
        elementId?: string
        obj?: Record<string, any>
    }) { 
        if (files) { return await this.addFilesFromList(files) }
        else if (elementId) { return await this.addFilesFromInput(elementId) }
        else if (obj) { return await this.addFilesFromObj(obj) }
    }

    public static formatFile(file: any) { 
        if (typeof file === "string" || file instanceof Uint8Array) { return file }
        else if (typeof file === "object") { return JSON.stringify(file) }
        return String(file)
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
        for (const fileName in jsonFiles) { 
            outputFiles[fileName.replace('.json', '')] = jsonFiles[fileName].map((line) => { 
                return [ line.message, '', '', '', '' ]
            })
        }
        //console.log(jsonFiles)
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