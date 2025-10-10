import RepoContextProvider from "../context/repo";
import ExplorerPage from "./page";


export default function Explorer() {
    return (
        <RepoContextProvider>
            <ExplorerPage />
        </RepoContextProvider>
    )
}