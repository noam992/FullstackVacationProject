import React, { Component } from "react";
import "./header.css"
import axios from "axios";
import { Config } from "../../config";
import { UserModel } from "../../models/user-model";
import LogIn from "../credentials/log-in/log-in";
import Register from "../credentials/register/register";

// Redux
import { Unsubscribe } from "redux";
import { storeUser } from "../../redux/store";
import { ActionType } from "../../redux/action-type";


// Material UI
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Hidden from '@material-ui/core/Hidden';
import CardContent from '@material-ui/core/CardContent';
import theme from "../../modules/theme";
import Drawer from '@material-ui/core/Drawer';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import IconButton from '@material-ui/core/IconButton';
import CancelIcon from '@material-ui/icons/Cancel';


interface HeaderProps {
    classes?: any; 
}

interface HeaderState {
    user: UserModel [];
    userName: string;
    isNotLogInUser: boolean;
    isLogInUser: boolean;
    setLogInDrawerBt: boolean;
    setRegisterDrawerBt: boolean;
    setSuccessRegisterDrawerBt: boolean;
    validText: boolean
}

const styles = {

}

class Header extends Component<HeaderProps, HeaderState> {

    private unsubscribeStore: Unsubscribe;

    public constructor(props: HeaderProps) {
        super(props)
        this.state ={
            user: storeUser.getState().user,
            userName: this.getUsername(),
            isNotLogInUser: true,
            isLogInUser: false,
            setLogInDrawerBt: false,
            setRegisterDrawerBt: false,
            setSuccessRegisterDrawerBt: false,
            validText: false
        }

    }

    public componentDidMount() {

        // Listen to redux changes
        this.unsubscribeStore = storeUser.subscribe(() => {
            const user = storeUser.getState().user
            this.setState({ user });    

            // Remove button of login/ register and display button user logout
            if (storeUser.getState().user.length > 0) {
                this.setState({ isNotLogInUser: false, isLogInUser: true });
            }
        });

        // Don't get vacations from server if you have them already!
        if (storeUser.getState().user.length > 0) {
            this.setState({ isNotLogInUser: false, isLogInUser: true });
            return;
        }
        
        if (sessionStorage.getItem('user')) {

            const userJson = sessionStorage.getItem('user')   
            const userOne = JSON.parse(userJson)
            const user = []
            user.push(userOne)
            this.setState({ isNotLogInUser: false, isLogInUser: true });
            this.setState({ user });
            return

        }

    }

    public componentWillUnmount(): void {
        this.unsubscribeStore(); // Stop listening to Store
    }

    // Open log in drawer
    private openLogInDrawer = () => {

        this.setState({ setLogInDrawerBt: true,
                        setSuccessRegisterDrawerBt: false,
                        setRegisterDrawerBt: false
        });
    }
    
    // Open register drawer
    private openRegisterDrawer = () => {

        this.setState({ setRegisterDrawerBt: true,
                        setLogInDrawerBt: false
        });

    }

        
    // Open register drawer
    private openSuccessDrawer = () => {
        this.setState({ setSuccessRegisterDrawerBt: true });
    }
    

    // Logout button - delete session
    private logOutBt = async () => {
        try {
            const response = await axios.post( Config.serverUrl + "/api/auth/logout", { withCredentials: true });

            // Delete session storage - user
            if (response.status === 200) {
                sessionStorage.removeItem('user');

                // Remove button user logout and display button of login/ register
                this.setState({ isNotLogInUser: true, isLogInUser: false });

                // Remove user details from redux
                storeUser.dispatch({ type: ActionType.DeleteUserDetails });

            }

        } catch (err) {
            alert(err.message)
        }
    }

    // Display username into header when user log in
    private getUsername = (): string => {
        if (sessionStorage.getItem('user') === null) {        
            return "Host"
        } else {
            const userJson = sessionStorage.getItem('user')   
            const user = JSON.parse(userJson) 
            return user.username
        }
    }

    // Close modal login
    public closeModalLogIn(item?: boolean) {
        this.setState({ setLogInDrawerBt: item })
    }

    // Close modal register
    public closeModalRegister(item?: boolean) {
        this.setState({ setRegisterDrawerBt: item })
    }

    // Close modals by mouse || keyboard
    public toggleDrawer = (open?: boolean) => (
        event: React.KeyboardEvent | React.MouseEvent,
      ) => {
        if (
          event.type === 'keydown' &&
          ((event as React.KeyboardEvent).key === 'Tab' ||
            (event as React.KeyboardEvent).key === 'Shift')
        ) {
          return;
        }
    
        this.setState({ setLogInDrawerBt: open,
                        setRegisterDrawerBt: open,
                        setSuccessRegisterDrawerBt:open
        });

        // Clear valid text from register
        if (this.state.validText === true) {
            this.setState({ validText: false })
        } else {
            this.setState({validText: true})
        }
    };

    public render() {
        return (
            <div className="header">

                <div className="logoBox">
                    <img src="/assets/logo/logo.png" alt=""/>
                </div>

                <div className="authBox">

                    {this.state.user.length > 0 ?

                        <div>
                        {this.state.user.map( m => 
                            <Typography variant="h6" key={m.userId}>
                               Hello {m.username}
                            </Typography>
                        )}</div> :

                            <Typography variant="h6" >
                                Hello Host
                            </Typography>

                    }

                    <Hidden xsUp={this.state.isNotLogInUser}>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={this.logOutBt}
                        >
                            logout
                        </Button>
                    </Hidden>

                    <Hidden xsUp={this.state.isLogInUser}>
                        <Button
                            className="registerButton"
                            variant="contained" 
                            color="primary"
                            onClick={this.openRegisterDrawer}
                        >
                            register
                        </Button>
                    </Hidden>

                    <Drawer
                        container={this.props.classes.container}
                        variant="temporary"
                        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                        onClose={this.toggleDrawer(false)}
                        open={this.state.setRegisterDrawerBt}
                        classes={{
                          paper: this.props.classes.drawerPaper,
                        }}
                        ModalProps={{
                          keepMounted: true, // Better open performance on mobile.
                        }}
                    >
                        <CardContent className="operatorsCardBox">

                            <IconButton className="cancelButton" onClick={this.toggleDrawer(false)}>
                                    <CancelIcon fontSize="small" />
                            </IconButton>

                            <Register
                                moveToLogIn={this.openLogInDrawer.bind(this)}
                                changeDrawerRegisterStatus={this.closeModalRegister.bind(this)}
                                successRegister={this.openSuccessDrawer.bind(this)}
                                removeValidText={this.state.validText}
                            />
                        </CardContent>
                    </Drawer>

                    <Hidden xsUp={this.state.isLogInUser}>
                        <Button
                            className="logInButton"
                            variant="contained" 
                            color="primary"
                            onClick={this.openLogInDrawer}
                        >
                            log-in
                        </Button>
                    </Hidden>

                    <Drawer
                        container={this.props.classes.container}
                        variant="temporary"
                        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                        onClose={this.toggleDrawer(false)}
                        open={this.state.setLogInDrawerBt}
                        classes={{
                            paper: this.props.classes.drawerPaper,
                        }}
                        ModalProps={{
                            keepMounted: true, // Better open performance on mobile.
                        }}
                    >
                        <CardContent className="operatorsCardBox">

                            <IconButton className="cancelButton" onClick={this.toggleDrawer(false)}>
                                    <CancelIcon fontSize="small" />
                            </IconButton>
                            
                            <LogIn 
                                changeDrawerStatus={this.closeModalLogIn.bind(this)}
                                moveToRegister={this.openRegisterDrawer.bind(this)}
                            />
                        </CardContent>
                    </Drawer>

                    <Drawer
                        container={this.props.classes.container}
                        variant="temporary"
                        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                        onClose={this.toggleDrawer(false)}
                        open={this.state.setSuccessRegisterDrawerBt}
                        classes={{
                          paper: this.props.classes.drawerPaper,
                        }}
                        ModalProps={{
                          keepMounted: true, // Better open performance on mobile.
                        }}
                    >
                        <CardContent className="operatorsCardBox">
                            <Typography>
                                Success subscribe!
                            </Typography>
                            <Grid container>
                                <Grid item>
                                    <Link href="#"
                                        className="success-register-drawer"
                                        color="primary"
                                        onClick={this.openLogInDrawer}
                                    >
                                        {"Press to move to Sign in"}
                                    </Link>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Drawer>

                </div>

            </div>
        );
    }
}

export default withStyles(styles)(Header);