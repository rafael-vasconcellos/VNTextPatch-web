import GithubStats from "../GithubStats";
import Export from "./Export";
import Import from "./Import";
import Inject from "./Inject";
import New from "./New";
import './style.css'


export default function MenuBar() { 
    return ( 
        <section class="w-full py-3 flex justify-center gap-4 relative">
            <New />
            <Import />
            <Export />
            <Inject />
            <GithubStats />
        </section>
    )
}