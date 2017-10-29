import React from "react";
import ReactDOM from "react-dom";

import ReactPageScroller from "../../src/index";
import FirstComponent from "./FirstComponent";
import SecondComponent from "./SecondComponent";
import ThirdComponent from "./ThirdComponent";
import FourthComponent from "./FourthComponent";
import FifthComponent from "./FifthComponent";

class Demo extends React.Component {

    render() {

        return (
            <ReactPageScroller>
                <FirstComponent/>
                <SecondComponent/>
                <ThirdComponent/>
                <FourthComponent/>
                <FifthComponent/>
            </ReactPageScroller>
        )
    }
}

ReactDOM.render(<Demo/>, document.getElementById("root"));