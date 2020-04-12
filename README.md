# React Page Scroller (Beta)

Simple React component for smoothy full-page scolling.

### New beta version 2.0.6-beta released!!!

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

Example is in demo/src.

# Properties

|    Property    | Type |          Description          | Default Value |
| -------------  | ---- |          -----------          | ------- |
| animationTimer  | number | Animation duration in milliseconds | 1000 |
| blockScrollUp | bool | block scroll up | false |
| blockScrollDown | bool | block scroll up | false |
| containerHeight | number/string | height of react-page-scroller element | 100vh |
| containerWidth | number/string | width of react-page-scroller element | 100vw |
| customPageNumber | number | external selected page, number of pages should start from 0, should be combined with pageOnChange usage (see example in demo/src/FullPage.js for more information). This prop was introduced as a replacement for "goToPage" method from legacy version | |
| handleScrollUnavailable  | function | callback, is calling when someone tries to scroll over last or first child component | |
| pageOnChange  | function | callback after page was scrolled | |
| renderAllPagesOnFirstRender  | bool | flag for render all pages at first render of component | |
| transitionTimingFunction | String | CSS transition timing function name | ease-in-out |
| animationTimerBuffer | number | Animation buffer timing | 200 |

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
