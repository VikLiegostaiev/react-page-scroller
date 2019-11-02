import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types"
import { isEqual, isNil, isNull } from "lodash";
import * as Events from "./Events";

if (!global._babelPolyfill) {
	require("babel-polyfill");
}

const wheelScroll = Symbol();
const touchMove = Symbol();
const keyPress = Symbol();
const onWindowResize = Symbol();
const addNextComponent = Symbol();
const scrollWindowUp = Symbol();
const scrollWindowDown = Symbol();
const setRenderComponents = Symbol();
const _isMounted = Symbol();

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

let previousTouchMove = null;
let scrolling = false;
let isMounted = false;
let isBodyScrollEnabled = true;
const containers = [];

const ReactPageScroller = ({ animationTimer, blockScrollUp, children, containerHeight, containerWidth, pageOnChange, transitionTimingFunction }) => {
	const [componentIndex, setComponentIndex] = useState(DEFAULT_COMPONENT_INDEX);
	const [componentsToRenderLength, setComponentsToRenderLength] = useState(DEFAULT_COMPONENTS_TO_RENDER_LENGTH);
	const pageContainer = useRef(null);

	const addNextComponent = useCallback((componentsToRenderOnMountLength) => {
		let tempComponentsToRenderLength = 0;

		if (!isNil(componentsToRenderOnMountLength)) {
			tempComponentsToRenderLength = componentsToRenderOnMountLength;
		}

		tempComponentsToRenderLength = Math.max(tempComponentsToRenderLength, componentsToRenderLength);

		if (tempComponentsToRenderLength <= componentIndex + 1) {
			if (!isNil(children[componentIndex + 1])) {
				tempComponentsToRenderLength++;
			}
		}

		setComponentsToRenderLength(tempComponentsToRenderLength);
	});

	const checkRenderOnMount = useCallback(() => {
		if (!isNil(children[DEFAULT_COMPONENT_INDEX])) {
			addNextComponent(DEFAULT_COMPONENTS_TO_RENDER_LENGTH + 1);
		}
	});

	const disableScroll = useCallback(() => {
		if (isBodyScrollEnabled) {
			isBodyScrollEnabled = false;
			window.scrollTo({
				left: 0,
				top: 0,
				behavior: "smooth"
			});
			document.body.classList.add(DISABLED_CLASS_NAME);
			document.documentElement.classList.add(DISABLED_CLASS_NAME);
		}
	});

	const scrollWindowUp = useCallback(() => {
		if (!scrolling && !blockScrollUp) {
			if (!isNil(containers[(componentIndex - 1)])) {
				disableScroll();
				scrolling = true;
				pageContainer.current.style.transform = `translate3d(0, ${(this.state.componentIndex - 1) * -100}%, 0)`;

				if (pageOnChange) {
					pageOnChange(componentIndex);
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
	});

	const touchMove = useCallback((event) => {
		if (!isNull(previousTouchMove)) {
			if (event.touches[0].clientY > previousTouchMove) {
				this[scrollWindowUp]();
			} else {
				this[scrollWindowDown]();
			}
		} else {
			previousTouchMove = event.touches[0].clientY;
		}
	});

	useEffect(() => {
		isMounted = true;

		document.ontouchmove = (event) => {
			event.preventDefault();
		};

		pageContainer.current.addEventListener(Events.TOUCHMOVE, this[touchMove]);
		pageContainer.current.addEventListener(Events.KEYDOWN, this[keyPress]);

		checkRenderOnMount();
	}, []);

	return (
		<div style={{ height: containerHeight, width: containerWidth, overflow: "hidden" }}>
			<div ref={pageContainer}
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
};

ReactPageScroller.propTypes = {
	animationTimer: PropTypes.number,
	transitionTimingFunction: PropTypes.string,
	pageOnChange: PropTypes.func,
	handleScrollUnavailable: PropTypes.func,
	containerHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	containerWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	blockScrollUp: PropTypes.bool,
	blockScrollDown: PropTypes.bool
};

ReactPageScroller.defaultProps = {
	animationTimer: DEFAULT_ANIMATION_TIMER,
	transitionTimingFunction: DEFAULT_ANIMATION,
	containerHeight: DEFAULT_CONTAINER_HEIGHT,
	containerWidth: DEFAULT_CONTAINER_WIDTH,
	blockScrollUp: false,
	blockScrollDown: false
};

export default class ReactPageScroller extends React.Component {
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

		if (!isEqual(componentIndex, number)) {
			if (!isNil(this["container_" + (number)]) && !this[scrolling]) {

				this[scrolling] = true;
				this._pageContainer.style.transform = `translate3d(0, ${(number) * -100}%, 0)`;

				if (pageOnChange) {
					pageOnChange(number + 1);
				}

				if (isNil(this["container_" + (number + 1)]) && !isNil(children[number + 1])) {
					newComponentsToRenderLength++;
				}

				setTimeout(() => {
					this.setState({ componentIndex: number, componentsToRenderLength: newComponentsToRenderLength },
						() => {
							this[scrolling] = false;
							this[previousTouchMove] = null;
						});
				}, this.props.animationTimer + ANIMATION_TIMER_BUFFER)

			} else if (!this[scrolling] && !isNil(children[number])) {
				for (let i = componentsToRenderLength; i <= number; i++) {
					newComponentsToRenderLength++;
				}

				if (!isNil(children[number + 1])) {
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


	[keyPress] = (event) => {
		if (isEqual(event.keyCode, KEY_UP)) {
			this[scrollWindowUp]();
		}
		if (isEqual(event.keyCode, KEY_DOWN)) {
			this[scrollWindowDown]();
		}
	};

	[onWindowResize] = () => {
		this.forceUpdate();
	};

	[setRenderComponents] = () => {
		const newComponentsToRender = [];

		for (let i = 0; i < this.state.componentsToRenderLength; i++) {
			if (!isNil(this.props.children[i])) {
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

	[scrollWindowDown] = () => {
		if (!this[scrolling] && !this.props.blockScrollDown) {
			if (!isNil(this["container_" + (this.state.componentIndex + 1)])) {
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


}
