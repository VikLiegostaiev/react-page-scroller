// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef } from "react";

export default function usePrevious(value) {
  const ref = useRef({});

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}
