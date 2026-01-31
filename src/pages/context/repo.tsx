import { useParams } from "@solidjs/router";
import { createContext, createSignal, useContext, type Accessor, type Setter } from "solid-js";
import { ProjectRepo } from "../../global/repo/project";


interface RepoContextProviderProps { 
    projectName?: string
    children: any
}

const contextSignal = createSignal<ProjectRepo>({} as any)
const [ _, setContextValue ] = contextSignal
export const RepoContext = createContext<[ Accessor<ProjectRepo>, Setter<ProjectRepo> ]>(contextSignal)

export function useRepoContext() {
    const ctx = useContext(RepoContext)
    return ctx
}

export default function RepoContextProvider({ projectName, children }: RepoContextProviderProps) { 
    const { project_name } = useParams()
    projectName ||= project_name
    setContextValue(new ProjectRepo(projectName))

    return ( 
        <RepoContext.Provider value={contextSignal}>
            {children}
        </RepoContext.Provider>
    )
}