import React from "react";
import PropTypes from "prop-types"
import _ from "lodash";

const previousTouchMove = Symbol();
const scrolling = Symbol();

export default class ReactPageScroller extends React.Component {

    constructor(props) {
        super(props);
        this.state = {componentIndex: 0, componentsToRender: []};
        this[previousTouchMove] = null;
        this[scrolling] = false;
    }

    componentDidMount = () => {

        document.ontouchmove = (event) => {
            event.preventDefault();
        };

        this._pageContainer.addEventListener("wheel", this.wheelScroll);
        this._pageContainer.addEventListener("touchmove", this.touchMove);
        this._pageContainer.addEventListener("keydown", this.keyPress);

        if (!_.isNil(this.props.children[this.state.componentIndex])) {
            this.state.componentsToRender.push(
                <div key={this.state.componentIndex} ref={c => this["container_" + this.state.componentIndex] = c}
                     style={{height: window.innerHeight + "px", width: "100%"}}>
                    {this.props.children[this.state.componentIndex]}
                </div>
            );
        } else {
            this.state.componentsToRender.push(
                <div ref={c => this["container_" + this.state.componentIndex] = c}
                     style={{height: window.innerHeight + "px", width: "100%"}}>
                    {this.props.children}
                </div>
            );
        }

        this.addNextComponent();

    };

    componentWillUnmount = () => {

        this._pageContainer.removeEventListener("wheel", this.wheelScroll);
        this._pageContainer.removeEventListener("touchmove", this.touchMove);
        document.removeEventListener("keydown", this.keyPress);

    };

    addNextComponent = () => {

        if (!this.state.componentsToRender[this.state.componentIndex + 1]) {
            if (!_.isNil(this.props.children[this.state.componentIndex + 1])) {
                this.state.componentsToRender.push(
                    <div key={this.state.componentIndex + 1}
                         ref={c => this["container_" + (this.state.componentIndex + 1)] = c}
                         style={{height: window.innerHeight + "px", width: "100%"}}>
                        {this.props.children[this.state.componentIndex + 1]}
                    </div>
                );
            }
        }

        this.forceUpdate();

    };

    wheelScroll = (event) => {

        if (event.wheelDeltaY > 0) {
            this.scrollWindowUp();
        } else {
            this.scrollWindowDown();
        }

    };

    touchMove = (event) => {

        if (!_.isNull(this[previousTouchMove])) {
            if (event.touches[0].clientY > this[previousTouchMove]) {
                this.scrollWindowUp();
            } else {
                this.scrollWindowDown();
            }
        } else {
            this[previousTouchMove] = event.touches[0].clientY;
        }

    };

    keyPress = (event) => {

        if (_.isEqual(event.keyCode, 38)) {
            this.scrollWindowUp();
        }
        if (_.isEqual(event.keyCode, 40)) {
            this.scrollWindowDown();
        }

    };

    scrollWindowUp = () => {

        if (!_.isNil(this["container_" + (this.state.componentIndex - 1)]) && !this[scrolling]) {

            this[scrolling] = true;
            this._pageContainer.style.transform = `translate3d(0, ${(this.state.componentIndex - 1) * -100}%, 0)`;

            setTimeout(() => {
                this.setState((prevState) => ({componentIndex: prevState.componentIndex - 1}), () => {
                    this[scrolling] = false;
                    this[previousTouchMove] = null;
                });
            }, this.props.animationTimer + 200)

        }

    };

    scrollWindowDown = () => {

        if (!_.isNil(this["container_" + (this.state.componentIndex + 1)]) && !this[scrolling]) {

            this[scrolling] = true;
            this._pageContainer.style.transform = `translate3d(0, ${(this.state.componentIndex + 1) * -100}%, 0)`;

            setTimeout(() => {
                this.setState((prevState) => ({componentIndex: prevState.componentIndex + 1}), () => {
                    this[scrolling] = false;
                    this[previousTouchMove] = null;
                    this.addNextComponent();
                });
            }, this.props.animationTimer + 200)

        }
    };

    render() {

        const {animationTimer, transitionTimingFunction} = this.props;

        return (

            <div style={{width: window.innerWidth, height: window.innerHeight, overflow: "hidden"}}>
                <div ref={c => this._pageContainer = c}
                     style={{
                         height: "100%",
                         width: "100%",
                         transition: `transform ${animationTimer}ms ${transitionTimingFunction}`
                     }}
                     tabIndex={0}>
                    {this.state.componentsToRender}
                </div>
            </div>

        )
    }

    static get propTypes() {
        return {
            animationTimer: PropTypes.number,
            transitionTimingFunction: PropTypes.string
        }
    }

    static get defaultProps() {
        return {
            animationTimer: 1000,
            transitionTimingFunction: "ease-in-out"
        }
    }

}