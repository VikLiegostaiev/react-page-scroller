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

Example is in demo/src.

```js
import ReactPageScroller from "react-page-scroller";

goToPage = (pageNumber) => {
  this.reactPageScroller.goToPage(pageNumber);
}

<ReactPageScroller ref={c => this.reactPageScroller = c}>
  (your components here)
</ReactPageScroller>
```
# Properties

|    Property    | Type |          Description          | Default Value |
| -------------  | ---- |          -----------          | ------- |
| animationTimer  | number | Animation duration in milliseconds | 1000 |
| transitionTimingFunction      | String | CSS transition timing function name | ease-in-out |
| pageOnChange  | function | callback on page scroll | |
| goToPage  | function | using with ref, go to selected page, number of pages must start from 0 | |
| scrollUnavailable  | function | callback, is calling when someone tries to scroll over last or first child component | |
| containerHeight | number/string | height of react-page-scroller element | 100vh |
| containerWidth | number/string | width of react-page-scroller element | 100vw |

## Dependencies

react-page-scroller requires:

  - React
  - lodash
  - Prop Types
