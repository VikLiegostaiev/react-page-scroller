# React Page Scroller

Simple React component for smoothy full-page scolling.

### Demo

You can scroll the page using mouse wheel, touch scroll or keyboard arrows.

Live demo: [vikliegostaiev.github.io/react-page-scroller](https://vikliegostaiev.github.io/react-page-scroller/)

To run demo app locally:

```
npm install
npm start
```

App will start on localhost:3000.

# Installation

via npm:

```
npm install react-page-scroller --save
```

## Usage

```
import ReactPageScroller from 'react-page-scroller';
```

Example is in demo/src.

# Properties

|    Property    | Type |          Description          | Default Value |
| -------------  | ---- |          -----------          | ------- |
| animationTimer  | number | Animation duration in milliseconds | 1000 |
| animationTimerBuffer | number | Animation buffer timing | 200 |
| blockScrollUp | bool | block scroll up | false |
| blockScrollDown | bool | block scroll down | false |
| containerHeight | number/string | height of react-page-scroller element | 100vh |
| containerWidth | number/string | width of react-page-scroller element | 100vw |
| customPageNumber | number | external selected page, number of pages should start from 0, should be combined with pageOnChange usage (see example in demo/src/FullPage.js for more information). This prop was introduced as a replacement for "goToPage" method from legacy version | |
| renderAllPagesOnFirstRender  | bool | flag for render all pages at first render of component | |
| transitionTimingFunction | String | CSS transition timing function name | ease-in-out |
| handleScrollUnavailable  | function | callback, is calling when someone tries to scroll over last or first child component | |
| onBeforePageScroll  | function | callback before page scroll occured (passes the index of next page in argument) | |
| pageOnChange  | function | callback after page was scrolled | |


### SectionContainer component

| Property | Type | Description                        | Default Value |
|----------| ---- |------------------------------------|---------------|
| height   | number | height in percentage (i.e. 20, 50) | 100           |


## Dependencies

react-page-scroller requires:

  - React
  - lodash
  - Prop Types


# Legacy Properties

|    Property    | Type |          Description          | Default Value |
| -------------  | ---- |          -----------          | ------- |
| animationTimer  | number | Animation duration in milliseconds | 1000 |
| transitionTimingFunction      | String | CSS transition timing function name | ease-in-out |
| pageOnChange  | function | callback on page scroll | |
| goToPage  | function | using with ref, go to selected page, number of pages must start from 0 | |
| scrollUnavailable  | function | callback, is calling when someone tries to scroll over last or first child component | |
| containerHeight | number/string | height of react-page-scroller element | 100vh |
| containerWidth | number/string | width of react-page-scroller element | 100vw |
| blockScrollUp | bool | block scroll up | false |
| blockScrollDown | bool | block scroll up | false |
