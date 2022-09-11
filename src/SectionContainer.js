import React from "react";

export const SectionContainer = ({ children, height }) => {
  return (
    <div
      style={{
        height: height || "100%",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
};
