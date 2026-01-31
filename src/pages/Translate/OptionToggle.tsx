interface OptionToggleProps {
    title: string
    children: any
    id: string
    defaultValue: boolean
    handler?: (e: HTMLInputElement) => void
}

export default function OptionToggle({ title, children, id, handler, defaultValue }: OptionToggleProps) {
    return (
        <div class="flex justify-between">
            <label for={id}>
                <h2 class="font-xl font-bold my-1">{title}</h2>
                <p class="text-zinc-400">{children}</p>
            </label>
            <input class="w-7 text-primary" type="range" id={id} min={0} max={1} value={defaultValue? 1 : 0}
            onMouseDown={e => e.preventDefault()}
            onClick={e => { 
                e.currentTarget.value = e.currentTarget.value==='0'? '1':'0'
                handler && handler(e.currentTarget)
            }} />
        </div>
    )
}