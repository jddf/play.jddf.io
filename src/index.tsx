import React from "react";
import ReactDOM from "react-dom";
import { PlayApp } from "./PlayApp";
import { Router } from "@reach/router";

const component = (
  <Router>
    <PlayApp path="/" />
    <PlayApp path="/p/:shareId" />
  </Router>
);

const container = document.createElement("div");
ReactDOM.render(component, container);

document.body.appendChild(container);
