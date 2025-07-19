interface Props {
  onSubmit: (s: string) => void;
}

export default function ProjectName({ onSubmit }: Props) { 
    let input: HTMLInputElement | undefined

    return ( 
        <div class="w-screen h-screen absolute bg-black/50">
            <div class="bg-black w-48 h-28 px-10">
                <span class="font-bold">Project name</span>
                <input type="text" placeholder="Insert project name"
                 ref={input} onkeyup={(e) => { 
                    if (e.key === "Enter" && onSubmit) { onSubmit(e.currentTarget.value) }
                }} />
                <div class="w-full flex justify-end">
                    <button class="bg-white text-black font-bold rounded-lg" onClick={() => onSubmit(input?.value ?? '')}>
                        Start project
                    </button>
                </div>
            </div>
        </div>
    )
}