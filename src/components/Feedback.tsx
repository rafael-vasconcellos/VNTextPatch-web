interface FeedBackProps { 
    children: any
}

export default function FeedBack(props: FeedBackProps) { 
    return ( 
        <section class="bg-black px-8 py-2 rounded-lg fixed right-5 top-15">
            {props.children}
        </section>
    )
}