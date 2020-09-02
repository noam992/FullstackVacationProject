import React, { Component } from "react";
import "./page-not-found.css";

export class PageNotFound extends Component {
    public render() {
        return (
            <div className="page-not-found">

                <h2>The page you are looking for doesn't exist.</h2>
                
                <iframe width="560" height="315" src="https://www.youtube.com/embed/t3otBjVZzT0?autoplay=1" allow="autoplay" title="Page not Found"></iframe>
                
            </div>
        );
    }
}