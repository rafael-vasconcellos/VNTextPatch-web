import Export from "./Export";
import Import from "./Import";
import './style.css'


export default function MenuBar() { 
    return ( 
        <section class="w-full flex justify-center gap-4">
            <Import />
            <Export />
        </section>
    )
}