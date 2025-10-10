interface TranslationColumnsProps {
    id: string
    selected: number
    handler?: (e: HTMLSelectElement) => void
}

export default function TranslationColumns({ id, selected, handler }: TranslationColumnsProps) {
    return (
        <div>
            <label for={id}>Source Column: </label>
            <select class="m-1 p-1 border-[1px] border-zinc-500 rounded-lg" id={id} onChange={e => handler && handler(e.currentTarget)}>
                <option value="0" selected={selected===0}>Original Text</option>
                <option value="1" selected={selected===1}>Inital</option>
                <option value="2" selected={selected===2}>Machine Translation</option>
                <option value="3" selected={selected===3}>Better Translation</option>
                <option value="4" selected={selected===4}>Best Translation</option>
            </select>
        </div>
    )
}