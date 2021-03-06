import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import PropTypes from "prop-types";

import * as Events from "./Events";
import { isNil, isNull, isPositiveNumber } from "./utils";
import usePrevious from "./usePrevValue";

if (!global._babelPolyfill) {
  require("babel-polyfill");
}

const DEFAULT_ANIMATION_TIMER = 1000;
const DEFAULT_ANIMATION = "ease-in-out";
const DEFAULT_CONTAINER_HEIGHT = "100vh";
const DEFAULT_CONTAINER_WIDTH = "100vw";
const DEFAULT_COMPONENT_INDEX = 0;
const DEFAULT_COMPONENTS_TO_RENDER_LENGTH = 0;

const DEFAULT_ANIMATION_TIMER_BUFFER = 200;
const KEY_UP = 38;
const KEY_DOWN = 40;
const MINIMAL_DELTA_Y_DIFFERENCE = 1;
const DISABLED_CLASS_NAME = "rps-scroll--disabled";

let previousTouchMove = null;
let isScrolling = false;
let isMounted = false;
let isBodyScrollEnabled = true;
let isTransitionAfterComponentsToRenderChanged = false;
const containers = [];

const ReactPageScroller = ({
  animationTimer,
  animationTimerBuffer,
  blockScrollDown,
  blockScrollUp,
  children,
  containerHeight,
  containerWidth,
  customPageNumber,
  handleScrollUnavailable,
  onBeforePageScroll,
  pageOnChange,
  renderAllPagesOnFirstRender,
  transitionTimingFunction,
}) => {
  const [componentIndex, setComponentIndex] = useState(DEFAULT_COMPONENT_INDEX);
  const [componentsToRenderLength, setComponentsToRenderLength] = useState(
    DEFAULT_COMPONENTS_TO_RENDER_LENGTH,
  );
  const prevComponentIndex = usePrevious(componentIndex);
  const scrollContainer = useRef(null);
  const pageContainer = useRef(null);
  const lastScrolledElement = useRef(null);
  children = useMemo(() => React.Children.toArray(children), [children]);

  const scrollPage = useCallback(
    nextComponentIndex => {
      if (onBeforePageScroll) {
        onBeforePageScroll(nextComponentIndex);
      }

      pageContainer.current.style.transform = `translate3d(0, ${nextComponentIndex *
        -100}%, 0)`;
    },
    [onBeforePageScroll],
  );

  const addNextComponent = useCallback(
    componentsToRenderOnMountLength => {
      let tempComponentsToRenderLength = 0;

      if (!isNil(componentsToRenderOnMountLength)) {
        tempComponentsToRenderLength = componentsToRenderOnMountLength;
      }

      tempComponentsToRenderLength = Math.max(
        tempComponentsToRenderLength,
        componentsToRenderLength,
      );

      if (tempComponentsToRenderLength <= componentIndex + 1) {
        if (!isNil(children[componentIndex + 1])) {
          tempComponentsToRenderLength++;
        }
      }

      setComponentsToRenderLength(tempComponentsToRenderLength);
    },
    [children, componentIndex, componentsToRenderLength],
  );

  const checkRenderOnMount = useCallback(() => {
    if (renderAllPagesOnFirstRender) {
      setComponentsToRenderLength(React.Children.count(children));
    } else if (!isNil(children[DEFAULT_COMPONENT_INDEX + 1])) {
      addNextComponent(DEFAULT_COMPONENTS_TO_RENDER_LENGTH + 1);
    }
  }, [addNextComponent, children, renderAllPagesOnFirstRender]);

  const disableScroll = useCallback(() => {
    if (isBodyScrollEnabled) {
      isBodyScrollEnabled = false;
      window.scrollTo({
        left: 0,
        top: 0,
        behavior: "smooth",
      });
      document.body.classList.add(DISABLED_CLASS_NAME);
      document.documentElement.classList.add(DISABLED_CLASS_NAME);
    }
  }, []);

  const enableDocumentScroll = useCallback(() => {
    if (!isBodyScrollEnabled) {
      isBodyScrollEnabled = true;
      document.body.classList.remove(DISABLED_CLASS_NAME);
      document.documentElement.classList.remove(DISABLED_CLASS_NAME);
    }
  }, []);

  const setRenderComponents = useCallback(() => {
    const newComponentsToRender = [];

    let i = 0;

    while (i < componentsToRenderLength && !isNil(children[i])) {
      containers[i] = true;
      newComponentsToRender.push(
        <div key={i} style={{ height: "100%", width: "100%" }}>
          {React.cloneElement(children[i], { ...children[i].props })}
        </div>,
      );
      i++;
    }

    return newComponentsToRender;
  }, [children, componentsToRenderLength]);

  const scrollWindowDown = useCallback(() => {
    if (!isScrolling && !blockScrollDown) {
      if (!isNil(containers[componentIndex + 1])) {
        disableScroll();
        isScrolling = true;
        scrollPage(componentIndex + 1);

        setTimeout(() => {
          if (isMounted) {
            setComponentIndex(prevState => prevState + 1);
          }
        }, animationTimer + animationTimerBuffer);
      } else {
        enableDocumentScroll();
        if (handleScrollUnavailable) {
          handleScrollUnavailable();
        }
      }
    }
  }, [
    animationTimer,
    animationTimerBuffer,
    blockScrollDown,
    componentIndex,
    disableScroll,
    enableDocumentScroll,
    handleScrollUnavailable,
    scrollPage,
  ]);

  const scrollWindowUp = useCallback(() => {
    if (!isScrolling && !blockScrollUp) {
      if (!isNil(containers[componentIndex - 1])) {
        disableScroll();
        isScrolling = true;
        scrollPage(componentIndex - 1);

        setTimeout(() => {
          if (isMounted) {
            setComponentIndex(prevState => prevState - 1);
          }
        }, animationTimer + animationTimerBuffer);
      } else {
        enableDocumentScroll();
        if (handleScrollUnavailable) {
          handleScrollUnavailable();
        }
      }
    }
  }, [
    animationTimer,
    animationTimerBuffer,
    blockScrollUp,
    componentIndex,
    disableScroll,
    enableDocumentScroll,
    handleScrollUnavailable,
    scrollPage,
  ]);

  const touchMove = useCallback(
    event => {
      if (!isNull(previousTouchMove)) {
        if (event.touches[0].clientY > previousTouchMove) {
          scrollWindowUp();
        } else {
          scrollWindowDown();
        }
      } else {
        previousTouchMove = event.touches[0].clientY;
      }
    },
    [scrollWindowDown, scrollWindowUp],
  );

  const wheelScroll = useCallback(
    event => {
      if (Math.abs(event.deltaY) > MINIMAL_DELTA_Y_DIFFERENCE) {
        if (isPositiveNumber(event.deltaY)) {
          lastScrolledElement.current = event.target;
          scrollWindowDown();
        } else {
          lastScrolledElement.current = event.target;
          scrollWindowUp();
        }
      }
    },
    [scrollWindowDown, scrollWindowUp],
  );

  const keyPress = useCallback(
    event => {
      if (event.keyCode === KEY_UP) {
        scrollWindowUp();
      }
      if (event.keyCode === KEY_DOWN) {
        scrollWindowDown();
      }
    },
    [scrollWindowDown, scrollWindowUp],
  );

  useEffect(() => {
    scrollContainer.current.addEventListener(Events.TOUCHMOVE, touchMove);
    scrollContainer.current.addEventListener(Events.KEYDOWN, keyPress);
    return () => {
      scrollContainer.current.removeEventListener(Events.TOUCHMOVE, touchMove);
      scrollContainer.current.removeEventListener(Events.KEYDOWN, keyPress);
    };
  }, [touchMove, keyPress]);

  useEffect(() => {
    isMounted = true;

    checkRenderOnMount();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    isScrolling = false;
    previousTouchMove = null;
    if (componentIndex > prevComponentIndex) {
      addNextComponent();
    }
  }, [addNextComponent, componentIndex, prevComponentIndex]);

  useEffect(() => {
    if (pageOnChange) {
      pageOnChange(componentIndex);
    }
  }, [pageOnChange, componentIndex]);

  useEffect(() => {
    if (!isNil(customPageNumber) && customPageNumber !== componentIndex) {
      let newComponentsToRenderLength = componentsToRenderLength;

      if (customPageNumber !== componentIndex) {
        if (!isNil(containers[customPageNumber]) && !isScrolling) {
          isScrolling = true;
          // eslint-disable-next-line max-len
          scrollPage(customPageNumber);

          if (
            isNil(containers[customPageNumber]) &&
            !isNil(children[customPageNumber])
          ) {
            newComponentsToRenderLength++;
          }

          setTimeout(() => {
            setComponentIndex(customPageNumber);
            setComponentsToRenderLength(newComponentsToRenderLength);
          }, animationTimer + animationTimerBuffer);
        } else if (!isScrolling && !isNil(children[customPageNumber])) {
          for (let i = componentsToRenderLength; i <= customPageNumber; i++) {
            newComponentsToRenderLength++;
          }

          if (!isNil(children[customPageNumber])) {
            newComponentsToRenderLength++;
          }

          isScrolling = true;
          isTransitionAfterComponentsToRenderChanged = true;
          setComponentsToRenderLength(newComponentsToRenderLength);
        }
      }
    }
  }, [customPageNumber, scrollPage]);

  useEffect(() => {
    if (isTransitionAfterComponentsToRenderChanged) {
      isTransitionAfterComponentsToRenderChanged = false;

      scrollPage(customPageNumber);

      setTimeout(() => {
        setComponentIndex(customPageNumber);
      }, animationTimer + animationTimerBuffer);
    }
  }, [
    animationTimer,
    animationTimerBuffer,
    componentsToRenderLength,
    customPageNumber,
    scrollPage,
  ]);

  return (
    <div
      ref={scrollContainer}
      style={{
        height: containerHeight,
        width: containerWidth,
        overflow: "hidden",
      }}
    >
      <div
        ref={pageContainer}
        onWheel={wheelScroll}
        style={{
          height: "100%",
          width: "100%",
          transition: `transform ${animationTimer}ms ${transitionTimingFunction}`,
          outline: "none",
        }}
        tabIndex={0}
      >
        {setRenderComponents()}
      </div>
    </div>
  );
};

ReactPageScroller.propTypes = {
  animationTimer: PropTypes.number,
  animationTimerBuffer: PropTypes.number,
  blockScrollDown: PropTypes.bool,
  blockScrollUp: PropTypes.bool,
  children: PropTypes.any,
  containerHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  containerWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  customPageNumber: PropTypes.number,
  handleScrollUnavailable: PropTypes.func,
  onBeforePageScroll: PropTypes.func,
  pageOnChange: PropTypes.func,
  renderAllPagesOnFirstRender: PropTypes.bool,
  transitionTimingFunction: PropTypes.string,
};

ReactPageScroller.defaultProps = {
  animationTimer: DEFAULT_ANIMATION_TIMER,
  animationTimerBuffer: DEFAULT_ANIMATION_TIMER_BUFFER,
  transitionTimingFunction: DEFAULT_ANIMATION,
  containerHeight: DEFAULT_CONTAINER_HEIGHT,
  containerWidth: DEFAULT_CONTAINER_WIDTH,
  blockScrollUp: false,
  blockScrollDown: false,
};

export default ReactPageScroller;
