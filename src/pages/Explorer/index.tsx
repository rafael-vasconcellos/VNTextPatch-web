import RepoContextProvider from "./context";
import ExplorerPage from "./page";


export default function Explorer() {
    return (
        <RepoContextProvider>
            <ExplorerPage />
        </RepoContextProvider>
    )
}