import React from "react";
import ReactDOM from "react-dom";
import { PlayApp } from "./PlayApp";

const container = document.createElement("div");
ReactDOM.render(<PlayApp />, container);

document.body.appendChild(container);
