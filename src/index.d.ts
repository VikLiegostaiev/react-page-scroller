// Type definitions for react-page-scroller 2.0
// Project: https://vikliegostaiev.github.io/react-page-scroller/
// Definitions by: Sergei Morozov <https://github.com/morozserge1st>

import * as React from "react";

export interface ReactPageScrollerProps {
  /**
   * Animation duration in milliseconds.
   */
  animationTimer?: number;
  /**
   * Animation buffer timing in milliseconds.
   */
  animationTimerBuffer?: number;
  /**
   * If `true`, scrolling down will be blocked.
   */
  blockScrollDown?: boolean;
  /**
   * If `true`, scrolling up will be blocked.
   */
  blockScrollUp?: boolean;
  /**
   * The children of the component.
   */
  children?: React.ReactNode;
  /**
   * The height of react-page-scroller child.
   */
  containerHeight?: number | string;
  /**
   * The width of react-page-scroller child.
   */
  containerWidth?: number | string;
  /**
   * The index of the selected page.
   *
   * The index of pages should start with 0.
   */
  customPageNumber?: number;
  /**
   * Callback fired when someone tries to scroll over last or first child component.
   */
  handleScrollUnavailable?: () => void;
  /**
   * Callback fired before new page started scrolling into view.
   *
   * @param {number} page The number of next page.
   */
  onBeforePageScroll?: (nextPage: number) => void;
  /**
   * Callback fired when the selected page changes.
   *
   * @param {number} page The number of next page.
   */
  pageOnChange?: (page: number) => void;
  /**
   * 	If `true`, all pages will be rendered at the first rendering component.
   */
  renderAllPagesOnFirstRender?: boolean;
  /**
   * CSS transition timing function name.
   */
  transitionTimingFunction?: string;
}

export default function ReactPageScroller(
  props: ReactPageScrollerProps,
): JSX.Element;

export interface SectionContainerProps {
  children: React.ReactNode;
  height: number;
}

export function SectionContainer(props: SectionContainerProps): JSX.Element;
