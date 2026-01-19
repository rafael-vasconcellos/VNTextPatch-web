import { createStore } from "solid-js/store";



export function createLog() {
    const [ store, setLog ] = createStore<{
        logs: string[]
    }>({
        logs: []
    })
    const list = store.logs

    function LogComponent(props: any) {
        return (
            <div class="h-screen w-screen fixed bg-black/40 flex justify-center items-center">
                <section>
                    <div class="w-1/2 border-white border-[1px]">
                        {list.map(log => <p>{log}</p>)}
                    </div>
                    <div class="w-1/4 py-4 flex justify-center">{props.children}</div>
                </section>
            </div>
        )
    }

    return {
        Component: LogComponent,
        Add(text: string) {
            setLog("logs", list.length, text)
        }
    }
}