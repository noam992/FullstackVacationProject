import React, { Component, ChangeEvent } from "react";
import "./register.css";
import { UserModel } from "../../../models/user-model";
import axios from "axios";
import { Config } from "../../../config";

// Material UI
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { FormControl, FormHelperText } from "@material-ui/core";
import Link from '@material-ui/core/Link';

interface RegisterProps {
    classes: any;
    moveToLogIn?: any;
    changeDrawerRegisterStatus?: any;
    successRegister?: any;
    removeValidText?: boolean;
    
}

interface RegisterState {
    user: UserModel;
    materialUIclasses: any;
    errors: { firstNameError: string, 
      lastNameError: string,
      usernameError: string,
      passwordError: string
    },
    isUsernameExist: boolean;
}

const styles = {
    paper: {
        marginTop: 64
    }
}

class Register extends Component<RegisterProps, RegisterState>{

    public constructor(props: RegisterProps){
        super(props);
        this.state = {
            materialUIclasses: {},
            user: new UserModel(),
            errors: { firstNameError: "*", 
              lastNameError: "*",
              usernameError: "*",
              passwordError: "*"
            },
            isUsernameExist: false
        }
    }

    // Toggle drawer will clear the form
    public componentDidUpdate(prevProps) {
        if (this.props.removeValidText !== prevProps.removeValidText) {
            const errors = { ...this.state.errors }
            errors.firstNameError = "*"
            errors.lastNameError = "*"
            errors.usernameError = "*"
            errors.passwordError = "*"
            this.setState({ isUsernameExist: false,
                            errors
            });
        }
    }

    // Send details of user to server
    private RegisterBt = async () => {
        try {
            let user = this.state.user
            await axios.post<UserModel>( Config.serverUrl + "/api/auth/register", user, { withCredentials: true });


            // Clean input text
            for (const prop in user) {
                user[prop] = ""
            }
            this.setState({ user })
            
            // Trigger function in header component 
            this.props.changeDrawerRegisterStatus(false)
            this.props.successRegister(true);     
            

        } catch (err) {
            console.log("err: " + err.message)
            this.setState({ isUsernameExist: true })    
        }
    }

    // Move to log in modal
    public moveToLogInModal = () => {
        this.props.moveToLogIn(false);
    }

    // Set first name
    private setFirstName = (args: ChangeEvent<{ value: string }>) => {
        const firstName = args.target.value
        let firstNameError = ""

        // validation
        if (firstName === "") {
            firstNameError = "Require field"
        }

        if (firstName.length > 25) {
            firstNameError = "too long"
        }

        const errors = { ...this.state.errors };
        errors.firstNameError = firstNameError;
        this.setState({ errors })

        const user = { ...this.state.user }
        user.firstName = firstName
        this.setState({ user })
    }

    // Set last name
    private setLastName= (args: ChangeEvent<{ value: string }>) => {
        const lastName = args.target.value
        let lastNameError = ""

        // validation
        if (lastName === "") {
            lastNameError = "Require field"
        }
      
        if (lastName.length > 25) {
            lastNameError = "too long"
        }
  
        const errors = { ...this.state.errors };
        errors.lastNameError = lastNameError;
        this.setState({ errors })

        const user = { ...this.state.user }
        user.lastName = lastName
        this.setState({ user })
    }
    
    // Set username
    private setUsername = (args: ChangeEvent<{ value: string }>) => {
        const username = args.target.value
        let usernameError = ""

        // validation
        if (username === "") {
            usernameError = "Require field"
        }
      
        if (username.length > 25) {
            usernameError = "too long"
        }

        const errors = { ...this.state.errors };
        errors.usernameError = usernameError;
        this.setState({ errors })

        const user = { ...this.state.user }
        user.username = username
        this.setState({ user })
    }

    // Set password
    private setPassword = (args: ChangeEvent<{ value: string }>) => {
        const password = args.target.value
        let passwordError = ""

        // validation
        if (password === "") {
            passwordError = "Require field"
        }
      
        if (password.length > 25) {
            passwordError = "too long"
        }

        const errors = { ...this.state.errors };
        errors.passwordError = passwordError;
        this.setState({ errors })

        const user = { ...this.state.user }
        user.password = password
        this.setState({ user })
    }
    
    // Validation for all inputs to make button "send" accessible
    private isFormLegal = () => {
        for (const prop in this.state.errors) {
            if (this.state.errors[prop].toString() !== "") {
                return false;
            }
        }
        return true;
    }

    public render() {
        return (
            <div className="register">
                <Container component="main" maxWidth="xs">
                  <CssBaseline />
                  <div className={this.props.classes.paper}>
                    <Typography component="h1" variant="h5">
                      Sign up
                    </Typography>
                    <form className={this.props.classes.form} noValidate>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <FormControl>
                                <TextField
                                    autoComplete="firstName"
                                    name="firstName"
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="firstName"
                                    label="First Name"
                                    autoFocus
                                    value={this.state.user.firstName || ""}
                                    onChange={this.setFirstName}
                                />
                                <FormHelperText id="firstName-helper-text" error>{this.state.errors.firstNameError}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="lastName"
                                    label="Last Name"
                                    name="lastName"
                                    autoComplete="lastName"
                                    value={this.state.user.lastName || ""}
                                    onChange={this.setLastName}
                                />
                                <FormHelperText id="lastName-helper-text" error>{this.state.errors.lastNameError}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="username"
                                    label="username"
                                    name="username"
                                    autoComplete="username"
                                    value={this.state.user.username || ""}
                                    onChange={this.setUsername}
                                />
                                <FormHelperText id="username-helper-text" error>{this.state.errors.usernameError}</FormHelperText>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl>
                                <TextField
                                    variant="outlined"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                    value={this.state.user.password || ""}
                                    onChange={this.setPassword}
                                />
                                <FormHelperText id="password-helper-text" error>{this.state.errors.passwordError}</FormHelperText>
                            </FormControl>
                        </Grid>
                      </Grid>
                      <Button
                          fullWidth
                          variant="contained"
                          color="primary"
                          disabled={!this.isFormLegal()}
                          onClick={this.RegisterBt}
                      >
                        Sign Up
                      </Button>
                      <Grid container>
                        <Grid item>
                            {this.state.isUsernameExist === false ? null 
                            : 
                            <Typography color="error" className="usernameExistError">
                                Username all ready existing in the system 
                            </Typography>
                            }
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item>
                            <Link href="#"
                                color="primary"
                                onClick={this.moveToLogInModal}
                            >
                                {"Already have an account? Sign in"}
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

export default withStyles(styles)(Register);
