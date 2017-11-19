import React from "react";

export default ({goToPage}) => {

    const selectPage = (number) => {
        let pageNumber = +prompt("Enter page number(1 - 5)");
        goToPage(pageNumber);
    };

    return (
        <div className="component fourth-component">
            <h2 style={{margin: "auto"}}>Fourth Component</h2>
        </div>
    )
}