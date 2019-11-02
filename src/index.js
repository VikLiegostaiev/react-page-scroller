import React from "react";
import PropTypes from "prop-types"
import _ from "lodash";
import * as Events from "./Events";

if (!global._babelPolyfill) {
	require("babel-polyfill");
}

const previousTouchMove = Symbol();
const scrolling = Symbol();
const wheelScroll = Symbol();
const touchMove = Symbol();
const keyPress = Symbol();
const onWindowResize = Symbol();
const addNextComponent = Symbol();
const scrollWindowUp = Symbol();
const scrollWindowDown = Symbol();
const setRenderComponents = Symbol();
const checkRenderOnMount = Symbol();
const _isMounted = Symbol();

const _isBodyScrollEnabled = Symbol();
const disableScroll = Symbol();
const enableScroll = Symbol();

const DEFAULT_ANIMATION_TIMER = 1000;
const DEFAULT_ANIMATION = "ease-in-out";
const DEFAULT_CONTAINER_HEIGHT = "100vh";
const DEFAULT_CONTAINER_WIDTH = "100vw";
const DEFAULT_COMPONENT_INDEX = 0;
const DEFAULT_COMPONENTS_TO_RENDER_LENGTH = 0;

const ANIMATION_TIMER_BUFFER = 200;
const KEY_UP = 38;
const KEY_DOWN = 40;
const DISABLED_CLASS_NAME = "rps-scroll--disabled";

export default class ReactPageScroller extends React.Component {
	static propTypes = {
		animationTimer: PropTypes.number,
		transitionTimingFunction: PropTypes.string,
		pageOnChange: PropTypes.func,
		handleScrollUnavailable: PropTypes.func,
		containerHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		containerWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		blockScrollUp: PropTypes.bool,
		blockScrollDown: PropTypes.bool
	};

	static defaultProps = {
		animationTimer: DEFAULT_ANIMATION_TIMER,
		transitionTimingFunction: DEFAULT_ANIMATION,
		containerHeight: DEFAULT_CONTAINER_HEIGHT,
		containerWidth: DEFAULT_CONTAINER_WIDTH,
		blockScrollUp: false,
		blockScrollDown: false
	};

	constructor(props) {
		super(props);
		this.state =
			{ componentIndex: DEFAULT_COMPONENT_INDEX, componentsToRenderLength: DEFAULT_COMPONENTS_TO_RENDER_LENGTH };
		this[previousTouchMove] = null;
		this[scrolling] = false;
		this[_isMounted] = false;
		this[_isBodyScrollEnabled] = true;
	}

	componentDidMount = () => {
		this[_isMounted] = true;

		window.addEventListener(Events.RESIZE, this[onWindowResize]);

		document.ontouchmove = (event) => {
			event.preventDefault();
		};

		this._pageContainer.addEventListener(Events.TOUCHMOVE, this[touchMove]);
		this._pageContainer.addEventListener(Events.KEYDOWN, this[keyPress]);

		this[checkRenderOnMount]();
	};

	componentWillUnmount = () => {
		this[_isMounted] = false;

		window.removeEventListener(Events.RESIZE, this[onWindowResize]);

		document.ontouchmove = (e) => {
			return true;
		};

		this._pageContainer.removeEventListener(Events.TOUCHMOVE, this[touchMove]);
		this._pageContainer.removeEventListener(Events.KEYDOWN, this[keyPress]);

	};

	goToPage = (number) => {
		const { pageOnChange, children } = this.props;
		const { componentIndex, componentsToRenderLength } = this.state;

		let newComponentsToRenderLength = componentsToRenderLength;

		if (!_.isEqual(componentIndex, number)) {
			if (!_.isNil(this["container_" + (number)]) && !this[scrolling]) {

				this[scrolling] = true;
				this._pageContainer.style.transform = `translate3d(0, ${(number) * -100}%, 0)`;

				if (pageOnChange) {
					pageOnChange(number + 1);
				}

				if (_.isNil(this["container_" + (number + 1)]) && !_.isNil(children[number + 1])) {
					newComponentsToRenderLength++;
				}

				setTimeout(() => {
					this.setState({ componentIndex: number, componentsToRenderLength: newComponentsToRenderLength },
						() => {
							this[scrolling] = false;
							this[previousTouchMove] = null;
						});
				}, this.props.animationTimer + ANIMATION_TIMER_BUFFER)

			} else if (!this[scrolling] && !_.isNil(children[number])) {
				for (let i = componentsToRenderLength; i <= number; i++) {
					newComponentsToRenderLength++;
				}

				if (!_.isNil(children[number + 1])) {
					newComponentsToRenderLength++
				}

				this[scrolling] = true;
				this.setState({
					componentsToRenderLength: newComponentsToRenderLength
				}, () => {
					this._pageContainer.style.transform = `translate3d(0, ${(number) * -100}%, 0)`;

					if (pageOnChange) {
						pageOnChange(number + 1);
					}

					setTimeout(() => {
						this.setState({ componentIndex: number }, () => {
							this[scrolling] = false;
							this[previousTouchMove] = null;
						});
					}, this.props.animationTimer + ANIMATION_TIMER_BUFFER)
				});
			}
		}
	};

	render() {
		const { animationTimer, transitionTimingFunction, containerHeight, containerWidth } = this.props;

		return (
			<div style={{ height: containerHeight, width: containerWidth, overflow: "hidden" }}>
				<div ref={c => this._pageContainer = c}
				     onWheel={this[wheelScroll]}
				     style={{
					     height: "100%",
					     width: "100%",
					     transition: `transform ${animationTimer}ms ${transitionTimingFunction}`
				     }}
				     tabIndex={0}>
					{this[setRenderComponents]()}
				</div>
			</div>
		)
	}

	[disableScroll] = () => {
		if (this[_isBodyScrollEnabled]) {
			this[_isBodyScrollEnabled] = false
			window.scrollTo({
				left: 0,
				top: 0,
				behavior: "smooth"
			})
			document.body.classList.add(DISABLED_CLASS_NAME)
			document.documentElement.classList.add(DISABLED_CLASS_NAME)
		}
	}

	[enableScroll] = () => {
		if (!this[_isBodyScrollEnabled]) {
			this[_isBodyScrollEnabled] = true
			document.body.classList.remove(DISABLED_CLASS_NAME)
			document.documentElement.classList.remove(DISABLED_CLASS_NAME)
		}
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

	[onWindowResize] = () => {
		this.forceUpdate();
	};

	[addNextComponent] = (componentsToRenderOnMountLength) => {
		let componentsToRenderLength = 0;

		if (!_.isNil(componentsToRenderOnMountLength)) {
			componentsToRenderLength = componentsToRenderOnMountLength;
		}

		componentsToRenderLength = Math.max(componentsToRenderLength, this.state.componentsToRenderLength);

		if (componentsToRenderLength <= this.state.componentIndex + 1) {
			if (!_.isNil(this.props.children[this.state.componentIndex + 1])) {
				componentsToRenderLength++;
			}
		}

		this.setState({
			componentsToRenderLength
		});
	};

	[setRenderComponents] = () => {
		const newComponentsToRender = [];

		for (let i = 0; i < this.state.componentsToRenderLength; i++) {
			if (!_.isNil(this.props.children[i])) {
				newComponentsToRender.push(
					<div key={i} ref={c => this["container_" + i] = c}
					     style={{ height: "100%", width: "100%" }}>
						{this.props.children[i]}
					</div>
				);
			} else {
				break;
			}
		}

		return newComponentsToRender;
	};

	[scrollWindowUp] = () => {
		if (!this[scrolling] && !this.props.blockScrollUp) {
			if (!_.isNil(this["container_" + (this.state.componentIndex - 1)])) {
				this[disableScroll]()
				this[scrolling] = true;
				this._pageContainer.style.transform = `translate3d(0, ${(this.state.componentIndex - 1) * -100}%, 0)`;

				if (this.props.pageOnChange) {
					this.props.pageOnChange(this.state.componentIndex);
				}

				setTimeout(() => {
					this[_isMounted] && this.setState((prevState) => ({ componentIndex: prevState.componentIndex - 1 }),
						() => {
							this[scrolling] = false;
							this[previousTouchMove] = null;
						});
				}, this.props.animationTimer + ANIMATION_TIMER_BUFFER)

			} else {
				this[enableScroll]()
				if (this.props.handleScrollUnavailable) {
					this.props.handleScrollUnavailable();
				}
			}
		}
	};

	[scrollWindowDown] = () => {
		if (!this[scrolling] && !this.props.blockScrollDown) {
			if (!_.isNil(this["container_" + (this.state.componentIndex + 1)])) {
				this[disableScroll]()
				this[scrolling] = true;
				this._pageContainer.style.transform = `translate3d(0, ${(this.state.componentIndex + 1) * -100}%, 0)`;

				if (this.props.pageOnChange) {
					this.props.pageOnChange(this.state.componentIndex + 2);
				}

				setTimeout(() => {
					this[_isMounted] && this.setState((prevState) => ({ componentIndex: prevState.componentIndex + 1 }),
						() => {
							this[scrolling] = false;
							this[previousTouchMove] = null;
							this[addNextComponent]();
						});
				}, this.props.animationTimer + ANIMATION_TIMER_BUFFER)

			} else {
				this[enableScroll]()
				if (this.props.handleScrollUnavailable) {
					this.props.handleScrollUnavailable();
				}
			}
		}
	};

    [checkRenderOnMount]() {
        if (!_.isNil(this.props.children[DEFAULT_COMPONENT_INDEX])) {
            this[addNextComponent](DEFAULT_COMPONENTS_TO_RENDER_LENGTH + 1);
        }
    }
}
