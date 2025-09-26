/* @refresh reload */
import { render } from 'solid-js/web'
import { Router, Route } from "@solidjs/router";
import App from './pages/Home'
import './index.css'
import Search from './pages/Search';


function Root() { 
    return (
        <Router>
            <Route path="/" component={App} />
            <Route path="/:project_name/search" component={Search} />
        </Router>
    )
}

render(Root, document.getElementById('root')!)
