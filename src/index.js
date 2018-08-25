import React from "react";
import "babel-polyfill";
import PropTypes from "prop-types"
import _ from "lodash";

const previousTouchMove = Symbol();
const scrolling = Symbol();
const wheelScroll = Symbol();
const touchMove = Symbol();
const keyPress = Symbol();
const onWindowResized = Symbol();
const addNextComponent = Symbol();
const scrollWindowUp = Symbol();
const scrollWindowDown = Symbol();


const ANIMATION_TIMER = 200;
const KEY_UP = 38;
const KEY_DOWN = 40;

export default class ReactPageScroller extends React.Component {
    static propTypes = {
        animationTimer: PropTypes.number,
        transitionTimingFunction: PropTypes.string,
        pageOnChange: PropTypes.func,
        scrollUnavailable: PropTypes.func,
        containerHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        containerWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    };

    static defaultProps = {
        animationTimer: 1000,
        transitionTimingFunction: "ease-in-out",
        containerHeight: "100vh",
        containerWidth: "100vw"
    };

    constructor(props) {
        super(props);
        this.state = {componentIndex: 0, componentsToRender: []};
        this[previousTouchMove] = null;
        this[scrolling] = false;
    }

    componentDidMount = () => {
        window.addEventListener('resize', this[onWindowResized]);

        document.ontouchmove = (event) => {
            event.preventDefault();
        };

        this._pageContainer.addEventListener("wheel", this[wheelScroll]);
        this._pageContainer.addEventListener("touchmove", this[touchMove]);
        this._pageContainer.addEventListener("keydown", this[keyPress]);

        const componentsToRender = [];

        if (!_.isNil(this.props.children[this.state.componentIndex])) {
            componentsToRender.push(
                <div key={this.state.componentIndex} ref={c => this["container_" + this.state.componentIndex] = c}
                     style={{height: "100%", width: "100%"}}>
                    {this.props.children[this.state.componentIndex]}
                </div>
            );
        } else {
            componentsToRender.push(
                <div ref={c => this["container_" + this.state.componentIndex] = c}
                     style={{height: "100%", width: "100%"}}>
                    {this.props.children}
                </div>
            );
        }

        this[addNextComponent](componentsToRender);

    };

    componentWillUnmount = () => {
        window.removeEventListener('resize', this[onWindowResized]);

        this._pageContainer.removeEventListener("wheel", this[wheelScroll]);
        this._pageContainer.removeEventListener("touchmove", this[touchMove]);
        this._pageContainer.removeEventListener("keydown", this[keyPress]);

    };

    goToPage = (number) => {
        const {pageOnChange, children} = this.props;
        const {componentIndex} = this.state;

        const componentsToRender = [...this.state.componentsToRender];

        if (!_.isEqual(componentIndex, number)) {
            if (!_.isNil(this["container_" + (number)]) && !this[scrolling]) {

                this[scrolling] = true;
                this._pageContainer.style.transform = `translate3d(0, ${(number) * -100}%, 0)`;

                if (pageOnChange) {
                    pageOnChange(number + 1);
                }

                if (_.isNil(this["container_" + (number + 1)]) && !_.isNil(children[number + 1]))
                    componentsToRender.push(
                        <div key={number + 1}
                             ref={c => this["container_" + (number + 1)] = c}
                             style={{height: "100%", width: "100%"}}>
                            {children[number + 1]}
                        </div>
                    );

                setTimeout(() => {
                    this.setState({componentIndex: number, componentsToRender: componentsToRender}, () => {
                        this[scrolling] = false;
                        this[previousTouchMove] = null;
                    });
                }, this.props.animationTimer + ANIMATION_TIMER)

            } else if (!this[scrolling] && !_.isNil(children[number])) {

                const componentsLength = componentsToRender.length;

                for (let i = componentsLength; i <= number; i++) {
                    componentsToRender.push(
                        <div key={i}
                             ref={c => this["container_" + i] = c}
                             style={{height: "100%", width: "100%"}}>
                            {children[i]}
                        </div>
                    );
                }

                if (!_.isNil(children[number + 1])) {
                    componentsToRender.push(
                        <div key={number + 1}
                             ref={c => this["container_" + (number + 1)] = c}
                             style={{height: "100%", width: "100%"}}>
                            {children[number + 1]}
                        </div>
                    );
                }

                this[scrolling] = true;
                this.setState({
                    componentsToRender
                }, () => {
                    this._pageContainer.style.transform = `translate3d(0, ${(number) * -100}%, 0)`;

                    if (pageOnChange) {
                        pageOnChange(number + 1);
                    }

                    setTimeout(() => {
                        this.setState({componentIndex: number}, () => {
                            this[scrolling] = false;
                            this[previousTouchMove] = null;
                        });
                    }, this.props.animationTimer + ANIMATION_TIMER)
                });
            }
        }
    };

    render() {
        const {animationTimer, transitionTimingFunction, containerHeight, containerWidth} = this.props;

        return (
            <div style={{height: containerHeight, width: containerWidth, overflow: "hidden"}}>
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

    [wheelScroll] = (event) => {
        if (event.deltaY < 0) {
            this[scrollWindowUp]();
        } else {
            this[scrollWindowDown]();
        }

    };

    [touchMove] = (event) => {
        if (!_.isNull(this[previousTouchMove])) {
            if (event.touches[0].clientY > this[previousTouchMove]) {
                this[scrollWindowUp]();
            } else {
                this[scrollWindowDown]();
            }
        } else {
            this[previousTouchMove] = event.touches[0].clientY;
        }
    };

    [keyPress] = (event) => {
        if (_.isEqual(event.keyCode, KEY_UP)) {
            this[scrollWindowUp]();
        }
        if (_.isEqual(event.keyCode, KEY_DOWN)) {
            this[scrollWindowDown]();
        }
    };

    [onWindowResized] = () => {
        this.forceUpdate();
    };

    [addNextComponent] = (onMountedComponents) => {
        let componentsToRender = [];

        if (!_.isNil(onMountedComponents)) {
            componentsToRender = [...onMountedComponents];
        }

        componentsToRender = [...componentsToRender, ...this.state.componentsToRender];

        if (!componentsToRender[this.state.componentIndex + 1]) {
            if (!_.isNil(this.props.children[this.state.componentIndex + 1])) {
                componentsToRender.push(
                    <div key={this.state.componentIndex + 1}
                         ref={c => this["container_" + (this.state.componentIndex + 1)] = c}
                         style={{height: "100%", width: "100%"}}>
                        {this.props.children[this.state.componentIndex + 1]}
                    </div>
                );
            }
        }

        this.setState({componentsToRender: [...componentsToRender]});
    };

    [scrollWindowUp] = () => {
        if (!_.isNil(this["container_" + (this.state.componentIndex - 1)]) && !this[scrolling]) {

            this[scrolling] = true;
            this._pageContainer.style.transform = `translate3d(0, ${(this.state.componentIndex - 1) * -100}%, 0)`;

            if (this.props.pageOnChange) {
                this.props.pageOnChange(this.state.componentIndex);
            }

            setTimeout(() => {
                this.setState((prevState) => ({componentIndex: prevState.componentIndex - 1}), () => {
                    this[scrolling] = false;
                    this[previousTouchMove] = null;
                });
            }, this.props.animationTimer + ANIMATION_TIMER)

        } else if (this.props.scrollUnavailable) {
            this.props.scrollUnavailable();
        }
    };

    [scrollWindowDown] = () => {
        if (!_.isNil(this["container_" + (this.state.componentIndex + 1)]) && !this[scrolling]) {

            this[scrolling] = true;
            this._pageContainer.style.transform = `translate3d(0, ${(this.state.componentIndex + 1) * -100}%, 0)`;

            if (this.props.pageOnChange) {
                this.props.pageOnChange(this.state.componentIndex + 2);
            }

            setTimeout(() => {
                this.setState((prevState) => ({componentIndex: prevState.componentIndex + 1}), () => {
                    this[scrolling] = false;
                    this[previousTouchMove] = null;
                    this[addNextComponent]();
                });
            }, this.props.animationTimer + ANIMATION_TIMER)

        } else if (this.props.scrollUnavailable) {
            this.props.scrollUnavailable();
        }
    };
}