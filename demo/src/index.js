import React from "react";
import ReactDOM from "react-dom";
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Link
} from "react-router-dom";

import "./index.css";
import FullPage from "./FullPage";
import PageContain from "./PageContain";

import "./index.css";

class Demo extends React.Component {
    render() {
        return (
            <div>
                <h1 className="title">React Page Scroller Demo</h1>
                <div className="links">
                    <div className="link">
                        <Link to="/demos/fullpage">Full page demo</Link>
                    </div>
                    <div className="link">
                        <Link to="/demos/contain">Page contain demo</Link>
                    </div>
                </div>
            </div>
        )
    }
}

ReactDOM.render(
    <Router>
        <div>
            <Switch>
                <Route exact path="/" component={Demo}/>
                <Route path="/demos/fullpage" component={FullPage}/>
                <Route path="/demos/contain" component={PageContain}/>
            </Switch>
        </div>
    </Router>,
    document.getElementById("root")
);