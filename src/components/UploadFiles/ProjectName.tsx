interface Props {
  onSubmit: (s: string) => void;
}

export default function ProjectName({ onSubmit }: Props) { 
    let input: HTMLInputElement | undefined

    return ( 
        <div class="w-screen h-screen absolute top-0 bg-black/5 flex justify-center items-center">
            <div class="bg-black w-72 px-5 py-2 rounded-xl flex flex-col gap-6">
                <span class="font-bold">Project name</span>
                <input class="w-full p-2 border-zinc-800 border-2 rounded-lg"
                 type="text" placeholder="Insert project name"
                 ref={input} onkeyup={(e) => { 
                    if (e.key === "Enter" && onSubmit && e.currentTarget.value) { onSubmit(e.currentTarget.value.replaceAll(' ', '-')) }
                }} />
                <div class="w-full flex justify-end">
                    <button class="bg-white text-black font-bold rounded-lg px-4 py-1 mb-4" onClick={() => { 
                        const value = input?.value?.replaceAll(' ', '-')
                        if (onSubmit && value) { onSubmit(value) }
                    }}>
                        Start project
                    </button>
                </div>
            </div>
        </div>
    )
}