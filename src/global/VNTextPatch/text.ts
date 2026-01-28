import jschardet from 'jschardet';



export class MyTextDecoder { 
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