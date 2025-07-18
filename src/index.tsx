/* @refresh reload */
import { render } from 'solid-js/web'
import { Router, Route } from "@solidjs/router";
import App from './pages/App.tsx'
import './index.css'


function Root() { 
    return (
        <Router>
            <Route path="/" component={App} />
        </Router>
    )
}

render(Root, document.getElementById('root')!)
