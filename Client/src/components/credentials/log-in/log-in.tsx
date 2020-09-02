import React, { Component, ChangeEvent } from "react";
import "./log-in.css";
import { UserModel } from "../../../models/user-model";
import axios from "axios";
import { Config } from "../../../config";

// Redux
import { storeUser } from "../../../redux/store";
import { ActionType } from "../../../redux/action-type";
 
// Material UI
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';



interface LogInProps {
    classes?: any;
    history?: any;
    changeDrawerStatus?: any;
    moveToRegister?: any;
}

interface LogInState {
    materialUIclasses: any;
    user: UserModel;
    displayError: string;
}

const styles = {
    paper: {
        marginTop: 64
    }
}

class LogIn extends Component<LogInProps, LogInState> {


    public constructor(props: LogInProps){
        super(props);
        this.state = {
            materialUIclasses: {},
            user: new UserModel(),
            displayError: "*"
        }

    }

    private logInBt = async () => {
        try {
            let user = this.state.user
            const response = await axios.post<UserModel>( Config.serverUrl + "/api/auth/login", user, { withCredentials: true });
            const userDetails = response.data

            // Save user info into session storage
            sessionStorage.setItem("user", JSON.stringify(userDetails));
            
            // Store user detail into redux
            storeUser.dispatch({ type: ActionType.GetUserDetails, payload: userDetails });
            
            // Clean input text
            user.password = ""
            user.username = ""
            this.setState({ user })

            // Trigger function in header component 
            this.props.changeDrawerStatus(false)

        } catch (err) {
            const displayError = "Illegal username or password"
            this.setState({ displayError }) 
        }

    }

    public moveToRegisterModal = () => {
        this.props.moveToRegister(false);
    }

    private setUsername = (args: ChangeEvent<{ value: string }>) => {
        const username = args.target.value as string;
        const user = { ...this.state.user }
        user.username = username
        this.setState({ user })
    }

    private setPassword = (args: ChangeEvent<{ value: string }>) => {
        const password = args.target.value as string;
        const user = { ...this.state.user }
        user.password = password
        this.setState({ user })
    }

    public render() {
        return (
            <div className="log-in">
                    <Container component="main" maxWidth="xs">
                        <CssBaseline />
                        <div className={this.props.classes.paper}>
                            <Typography component="h1" variant="h5">
                                Sign in
                            </Typography>
                            <form>
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="username-log-in"
                                    label="username"
                                    name="username"
                                    autoComplete="username"
                                    autoFocus
                                    onChange={this.setUsername}
                                />
                                <TextField
                                    variant="outlined"
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password-log-in"
                                    autoComplete="current-password"
                                    onChange={this.setPassword}
                                />
                                <div style={{ display: this.state.displayError ? "block" : "none" }} 
                                    className="validError">
                                    {this.state.displayError}
                                </div >
                                <Button
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    onClick={this.logInBt}
                                >
                                  Sign In
                                </Button>
                                <Grid container>
                                    <Grid item>
                                        <Link href="#"
                                            color="primary"
                                            onClick={this.moveToRegisterModal}
                                        >
                                            {"Don't have an account? Sign Up"}
                                        </Link>
                                    </Grid>
                                </Grid>
                            </form>
                        </div>
                    </Container>
            </div>
        );
    }
}

export default withStyles(styles)(LogIn);