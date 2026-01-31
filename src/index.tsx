/* @refresh reload */
import { render } from 'solid-js/web';
import { Router, Route } from "@solidjs/router";
import App from './pages/Home';
import Search from './pages/Search';
import Explorer from './pages/Explorer';
import TranslatePage from './pages/Translate';
import ConfigPage from './pages/Config';
import './index.css';



function Root() { 
    return (
        <Router>
            <Route path="/" component={App} />
            <Route path="/:project_name/search" component={Search} />
            <Route path="/:project_name" component={Explorer} />
            <Route path="/:project_name/translate" component={TranslatePage} />
            <Route path="/:project_name/config" component={ConfigPage} />
        </Router>
    )
}

render(Root, document.getElementById('root')!)
