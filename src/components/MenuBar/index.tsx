import GithubStats from "../GithubStats";
import Export from "./Export";
import Import from "./Import";
import Inject from "./Inject";
import New from "./New";
import './style.css'


export default function MenuBar() { 
    return ( 
        <section class="w-full py-3 flex justify-center gap-4 relative">
            <New class="size-8" />
            <Import class="size-8" />
            <Export class="size-8" />
            <Inject class="size-8" />
            <GithubStats />
        </section>
    )
}