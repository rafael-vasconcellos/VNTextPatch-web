import GithubStats from "../GithubStats";
import Export from "./Export";
import Import from "./Import";
import Inject from "./Inject";
import New from "./New";
import Search from "./Search";


export default function MenuBar() { 
    return ( 
        <section class="w-full py-3 mb-10 flex justify-center gap-4">
            <New class="size-8" />
            <Import class="size-8" />
            <Export class="size-8" />
            <Search class="size-8" />
            <Inject class="size-8" />
            <GithubStats />
        </section>
    )
}