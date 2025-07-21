import Export from "./Export";
import Import from "./Import";
import New from "./New";
import './style.css'


export default function MenuBar() { 
    return ( 
        <section class="w-full py-3 flex justify-center gap-4">
            <New />
            <Import />
            <Export />
        </section>
    )
}