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

<ReactPageScroller>
  (your components hear)
</ReactPageScroller>
```
# Properties

|    Property    | Type |          Description          | Default Value |
| -------------  | ---- |          -----------          | ------- |
| animationTimer  | number | Animation duration in milliseconds | 1000 |
| transitionTimingFunction      | String | CSS transition timing function name | ease-in-out |

## Dependencies

react-page-scroller requires:

  - React
  - lodash
  - Prop Types
