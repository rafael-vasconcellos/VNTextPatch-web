import jschardet from 'jschardet';



export class MyTextDecoder { 
    private uintArray: Uint8Array
    private filename?: string
    constructor(uintArray: Uint8Array, filename?: string) { 
        this.uintArray = uintArray
        this.filename = filename
    }

    public detectEncoding() { 
        const binaryString = new TextDecoder('latin1').decode(this.uintArray);
        const detected = jschardet.detect(binaryString);

        if (detected.encoding) { 
            console.log(`Detected encoding for ${this.filename || ''}: ` + detected.encoding)
            return detected.encoding
        }

        console.log(`Uint8Array decoding: using utf-8 fallback for ${this.filename || ''} file.`)
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