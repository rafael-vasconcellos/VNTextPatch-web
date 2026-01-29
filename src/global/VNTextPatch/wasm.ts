import { MyTextDecoder } from './text';



interface GetFolderOptions { 
    folderName: string
    outputFiles?: Record<string, string>
    encoding?: string
}

export class MyWASM { 
    public isInitialized: boolean = false
    public dotnetRuntime?: Promise<any>
    constructor() { 
        ((window as any).importDotNet as Promise<any>)
        .then(async({ dotnet }) => { 
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
        const filenames = await fileSystem.readdir(folderName)
        filenames.forEach(async (folderItem: string) => { 
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
        for (const filename in files) {
            const file = files[filename]
            fileSystem.writeFile(inputFolder + "/" + filename, MyWASM.formatFile(file))
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