import React from "react";
import {Pager} from "react-bootstrap";

import ReactPageScroller from "../../src/index";
import FirstComponent from "./FirstComponent";
import SecondComponent from "./SecondComponent";
import ThirdComponent from "./ThirdComponent";
import FourthComponent from "./FourthComponent";
import FifthComponent from "./FifthComponent";

import "./index.css";

export default class PageContain extends React.Component {
    constructor(props) {
        super(props);
        this.state = {currentPage: 1};
        this._pageScroller = null;
    }

    goToPage = (eventKey) => {
        this._pageScroller.goToPage(eventKey);
    };

    pageOnChange = (number) => {
        this.setState({currentPage: number});
    };

    getPagesNumbers = () => {

        const pageNumbers = [];

        for (let i = 1; i <= 5; i++) {
            pageNumbers.push(
                <Pager.Item key={i} eventKey={i - 1} onSelect={this.goToPage}>{i}</Pager.Item>
            )
        }

        return [...pageNumbers];
    };

    render() {

        const pagesNumbers = this.getPagesNumbers();

        return <div className="demo-page-contain">
            <h3 className="demo-page-contain__hint">You need to focus or hover page scroller to make scroll, keys or
                touch work</h3>
            <ReactPageScroller ref={c => this._pageScroller = c} pageOnChange={this.pageOnChange}
                               containerWidth={window.innerWidth * 0.4} containerHeight={window.innerHeight * 0.5}>
                <FirstComponent/>
                <SecondComponent/>
                <ThirdComponent/>
                <FourthComponent goToPage={this.goToPage}/>
                <FifthComponent/>
            </ReactPageScroller>
            <Pager className="pagination-additional-class" bsSize="large">
                {pagesNumbers}
            </Pager>
        </div>
    }
}