import React, { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { isEqual, isNil, isNull } from "lodash";
import * as Events from "./Events";
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

const ANIMATION_TIMER_BUFFER = 200;
const KEY_UP = 38;
const KEY_DOWN = 40;
const DISABLED_CLASS_NAME = "rps-scroll--disabled";

let previousTouchMove = null;
let isScrolling = false;
let isMounted = false;
let isBodyScrollEnabled = true;
let isTransitionAfterComponentsToRenderChanged = false;
const containers = [];

const ReactPageScroller = ({
  animationTimer,
  blockScrollDown,
  blockScrollUp,
  children,
  containerHeight,
  containerWidth,
  customPageNumber,
  handleScrollUnavailable,
  pageOnChange,
  renderAllPagesOnFirstRender,
  transitionTimingFunction,
}) => {
  const [componentIndex, setComponentIndex] = useState(DEFAULT_COMPONENT_INDEX);
  const [componentsToRenderLength, setComponentsToRenderLength] = useState(
    DEFAULT_COMPONENTS_TO_RENDER_LENGTH,
  );
  const prevComponentIndex = usePrevious(componentIndex);
  const pageContainer = useRef(null);

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
        pageContainer.current.style.transform = `translate3d(0, ${(componentIndex +
          1) *
          -100}%, 0)`;

        setTimeout(() => {
          if (isMounted) {
            setComponentIndex(prevState => prevState + 1);
          }
        }, animationTimer + ANIMATION_TIMER_BUFFER);
      } else {
        enableDocumentScroll();
        if (handleScrollUnavailable) {
          handleScrollUnavailable();
        }
      }
    }
  }, [
    animationTimer,
    blockScrollDown,
    componentIndex,
    disableScroll,
    enableDocumentScroll,
    handleScrollUnavailable,
  ]);

  const scrollWindowUp = useCallback(() => {
    if (!isScrolling && !blockScrollUp) {
      if (!isNil(containers[componentIndex - 1])) {
        disableScroll();
        isScrolling = true;
        pageContainer.current.style.transform = `translate3d(0, ${(componentIndex -
          1) *
          -100}%, 0)`;

        setTimeout(() => {
          if (isMounted) {
            setComponentIndex(prevState => prevState - 1);
          }
        }, animationTimer + ANIMATION_TIMER_BUFFER);
      } else {
        enableDocumentScroll();
        if (handleScrollUnavailable) {
          handleScrollUnavailable();
        }
      }
    }
  }, [
    animationTimer,
    blockScrollUp,
    componentIndex,
    disableScroll,
    enableDocumentScroll,
    handleScrollUnavailable,
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
      if (event.deltaY < 0) {
        scrollWindowUp();
      } else {
        scrollWindowDown();
      }
    },
    [scrollWindowDown, scrollWindowUp],
  );

  const keyPress = useCallback(
    event => {
      if (isEqual(event.keyCode, KEY_UP)) {
        scrollWindowUp();
      }
      if (isEqual(event.keyCode, KEY_DOWN)) {
        scrollWindowDown();
      }
    },
    [scrollWindowDown, scrollWindowUp],
  );

  useEffect(() => {
    pageContainer.current.addEventListener(Events.TOUCHMOVE, touchMove);
    pageContainer.current.addEventListener(Events.KEYDOWN, keyPress);
    return () => {
      pageContainer.current.removeEventListener(Events.TOUCHMOVE, touchMove);
      pageContainer.current.removeEventListener(Events.KEYDOWN, keyPress);
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
    if (
      !isNil(customPageNumber) &&
      !isEqual(customPageNumber, componentIndex)
    ) {
      let newComponentsToRenderLength = componentsToRenderLength;

      if (!isEqual(componentIndex, customPageNumber)) {
        if (!isNil(containers[customPageNumber]) && !isScrolling) {
          isScrolling = true;
          // eslint-disable-next-line max-len
          pageContainer.current.style.transform = `translate3d(0, ${customPageNumber *
            -100}%, 0)`;

          if (
            isNil(containers[customPageNumber]) &&
            !isNil(children[customPageNumber])
          ) {
            newComponentsToRenderLength++;
          }

          setTimeout(() => {
            setComponentIndex(customPageNumber);
            setComponentsToRenderLength(newComponentsToRenderLength);
          }, animationTimer + ANIMATION_TIMER_BUFFER);
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
  }, [customPageNumber]);

  useEffect(() => {
    if (isTransitionAfterComponentsToRenderChanged) {
      isTransitionAfterComponentsToRenderChanged = false;

      pageContainer.current.style.transform = `translate3d(0, ${customPageNumber *
        -100}%, 0)`;

      setTimeout(() => {
        setComponentIndex(customPageNumber);
      }, animationTimer + ANIMATION_TIMER_BUFFER);
    }
  }, [animationTimer, componentsToRenderLength, customPageNumber]);

  return (
    <div
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
  blockScrollDown: PropTypes.bool,
  blockScrollUp: PropTypes.bool,
  children: PropTypes.any,
  containerHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  containerWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  customPageNumber: PropTypes.number,
  handleScrollUnavailable: PropTypes.func,
  pageOnChange: PropTypes.func,
  renderAllPagesOnFirstRender: PropTypes.bool,
  transitionTimingFunction: PropTypes.string,
};

ReactPageScroller.defaultProps = {
  animationTimer: DEFAULT_ANIMATION_TIMER,
  transitionTimingFunction: DEFAULT_ANIMATION,
  containerHeight: DEFAULT_CONTAINER_HEIGHT,
  containerWidth: DEFAULT_CONTAINER_WIDTH,
  blockScrollUp: false,
  blockScrollDown: false,
};

export default ReactPageScroller;
