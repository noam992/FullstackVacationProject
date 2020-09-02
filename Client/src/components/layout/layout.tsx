import React, { Component } from "react";
import "./layout.css"
import Header from "../header/header";
import Home from "../home/home";
import LogIn from "../credentials/log-in/log-in";
import Register from "../credentials/register/register";
import { Route, Redirect, Switch } from "react-router-dom";
import { PageNotFound } from "../page-not-found/page-not-found"
import { Report } from "../report/report";


export class Layout extends Component {

    public render() {
        return (
            <div className="layout">

                <header>
                    <Header />
                </header>

                <main>
                    <Switch>
                        <Route path="/home" component={Home} exact />
                        <Route path="/Report" component={Report} exact />
                        <Route path="/log-in" component={LogIn} exact />
                        <Route path="/register" component={Register} exact />
                        <Redirect from="/"  to="/home" exact />
                        <Route component={PageNotFound} />
                    </Switch>
                </main>

            </div>
        );
    }
}