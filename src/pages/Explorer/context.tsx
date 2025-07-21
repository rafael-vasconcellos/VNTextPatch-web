import { createContext, createSignal, useContext, type Accessor, type Setter } from "solid-js";
import { Repo } from "../../global/Repo";


interface RepoContextProviderProps { 
    projectName: string
    children: any
}

const context = createSignal<Repo>({} as any)
const [ _, setContextValue ] = context
export const RepoContext = createContext<[ Accessor<Repo>, Setter<Repo> ]>(context)

export function useRepoContext() {
    const ctx = useContext(RepoContext)
    return ctx
}

export default function RepoContextProvider({ projectName, children }: RepoContextProviderProps) { 
    setContextValue(new Repo(projectName))

    return ( 
        <RepoContext.Provider value={context}>
            {children}
        </RepoContext.Provider>
    )
}