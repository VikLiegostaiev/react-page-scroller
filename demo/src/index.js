import React from "react";
import ReactDOM from "react-dom";
import {Pagination} from "react-bootstrap";

import ReactPageScroller from "../../src/index";
import FirstComponent from "./FirstComponent";
import SecondComponent from "./SecondComponent";
import ThirdComponent from "./ThirdComponent";
import FourthComponent from "./FourthComponent";
import FifthComponent from "./FifthComponent";

import "./index.css";

class Demo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {currentPage: 1};
        this._pageScroller = null;
    }

    goToPage = (number) => {
        this._pageScroller.goToPage(number);
    };

    pageOnChange = (number) => {
        this.setState({currentPage: number});
    };

    render() {

        return [
            <ReactPageScroller ref={c => this._pageScroller = c} pageOnChange={this.pageOnChange}>
                <FirstComponent/>
                <SecondComponent/>
                <ThirdComponent/>
                <FourthComponent goToPage={this.goToPage}/>
                <FifthComponent/>
            </ReactPageScroller>,
            <Pagination className="pagination-additional-class" bsSize="large" activePage={this.state.currentPage}
                        onSelect={this.goToPage} items={5}/>
        ]
    }
}

ReactDOM.render(<Demo/>, document.getElementById("root"));