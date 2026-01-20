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
            <div class="h-screen w-screen fixed z-50 top-0 bg-black/40 backdrop-blur-md flex justify-center items-center">
                <section class="w-1/2 h-4/5">
                    <div class="h-5/6 px-4 py-2 border-white border-[1px] overflow-y-scroll">
                        {list.map(log => <p>{log}</p>)}
                    </div>
                    <div class="py-4 flex justify-center">{props.children}</div>
                </section>
            </div>
        )
    }

    return {
        Component: LogComponent,
        Add(text: string) {
            setLog("logs", list.length, text)
        },
        Clear() {
            setLog("logs", [])
        }
    }
}