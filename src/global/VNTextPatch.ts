import jschardet from 'jschardet';


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
    public dotnetRuntime: any
    constructor() { 
        (import('../../wasm/dotnet.js' as any)).then(async({ dotnet }) => { 
            this.dotnetRuntime = await dotnet.create()
            this.isInitialized = true
        }).catch(e => { 
            console.error('Failed to initialize .NET:', e);
        })
    }

    private fileSystem() { return this.dotnetRuntime?.Module.FS }

    private decodeUint8Array(uint8Array: Uint8Array) { 
        const binaryString = new TextDecoder('latin1').decode(uint8Array);
        const detected = jschardet.detect(binaryString);
        //console.log('Encoding detectado:', detected);

        if (detected.encoding) {
            const decoder = new TextDecoder(detected.encoding);
            return decoder.decode(uint8Array);
        }
        
        // Fallback para UTF-8
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(uint8Array);
    }

    async addFiles(elementId: string) { 
        const fileInput = document.getElementById(elementId) as HTMLInputElement
        const files = fileInput?.files ?? []

        if (!this.fileSystem().analyzePath("input")?.exists) { this.fileSystem().mkdir("input") }
        if (!this.fileSystem().analyzePath("output")?.exists) { this.fileSystem().mkdir("output") }
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const arrayBuffer = await file.arrayBuffer();
                this.fileSystem().writeFile("input/" + file.name, new Uint8Array(arrayBuffer));
            }
        }
    }

    async getOutputFiles(outputFiles: Record<string, string> = {}) { 
        const fileNames = await this.fileSystem().readdir('output')
        fileNames.forEach(async (folderItem: string) => { 
            if (folderItem !== '.' && folderItem != '..' && !this.fileSystem().isDir('output/' + folderItem)) { 
                const file: Uint8Array = this.fileSystem().readFile('output/' + folderItem)
                const fileString = this.decodeUint8Array(file)
                outputFiles[folderItem] = fileString
            }
        })
        return outputFiles
    }
}

export class VNTextPatch extends MyWASM { 
    async execute(args: string[]) { 
        const exitCode = await this.dotnetRuntime.runMain('VNTextPatch.dll', args)
        if (exitCode === 0) {
            console.log('VNTextPatch completed successfully!');
        } else {
            console.log(`VNTextPatch exited with code: ${exitCode}`);
        }
    }

    async extractLocal() { 
        const outputFiles = {} as Record<string, any>
        const proxy = new Proxy(outputFiles, { 
            get(target, prop: string, _) { return target[prop] },
            set(target, prop: string, value, _) { 
                try { 
                    const parsed: any[] = JSON.parse(value) 
                    target[prop] = parsed.map && parsed.map(item => { 
                        const row = [ item.message, '', '', '', '' ]
                        return row
                    })
                }
                catch (e) { target[prop] = value }
                return true
            }
        })
        await this.addFiles('fileInput')
            .then(() => this.execute(['extractlocal', 'input', 'output']))
            .then(() => this.getOutputFiles(proxy))
        
        //console.log(outputFiles)
        return outputFiles
    }
}