import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter as Router, Route, Switch, Link } from "react-router-dom";

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
            <Link to="/fullpage">Full page demo</Link>
          </div>
          <div className="link">
            <Link to="/contain">Page contain demo</Link>
          </div>
        </div>
      </div>
    );
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router basename="/demos">
    <div>
      <Switch>
        <Route exact path="/" component={Demo} />
        <Route path="/fullpage" component={FullPage} />
        <Route path="/contain" component={PageContain} />
      </Switch>
    </div>
  </Router>,
);
