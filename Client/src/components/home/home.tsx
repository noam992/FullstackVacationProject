import React,{ Component } from "react";
import "./home.css";

// import Models
import { VacationModel } from "../../models/vacation-model";
import { UserModel } from "../../models/user-model";
import { DestinationModel } from "../../models/destination-model";
import { FollowVacationModel } from "../../models/follow-vacation-model";

import axios from "axios";
import { Config } from "../../config";
import moment from 'moment';
import AddVacation from "../add-vacation/add-vacation";
import EditVacation from "../edit-vacation/edit-vacation";
import { VacationDescriptionButton } from "../vacation-description-button/vacation-description-button";
import { Report } from "../report/report";
import io from 'socket.io-client';

// Redux
import { Unsubscribe } from "redux";
import { storeVacation } from "../../redux/store";
import { storeUser } from "../../redux/store";
import { ActionType } from "../../redux/action-type";

// Material UI
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CancelIcon from '@material-ui/icons/Cancel';
import Edit from '@material-ui/icons/Edit';
import Delete from '@material-ui/icons/Delete';
import StarsIcon from '@material-ui/icons/Stars';
import theme from "../../modules/theme";
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import Drawer from '@material-ui/core/Drawer';
import { Container } from "@material-ui/core";
import Hidden from '@material-ui/core/Hidden';
import Button from '@material-ui/core/Button';

// Modal imports
import Modal from '@material-ui/core/Modal';
import Fade from '@material-ui/core/Fade';

interface HomeProps {
    classes: any; 
}

interface HomeState {
    vacations: VacationModel [];
    vacation: VacationModel;
    user: UserModel [];
    destinations: DestinationModel [];
    followVacation: FollowVacationModel;
    clickCollapse: number;
    open: boolean;
    setOpen: boolean;
    setOpenEditModal: boolean;
    setOpenReportModal: boolean;
    materialUIclasses: any;
    currentVacationId: number;
    currentVacation: VacationModel;
    isFollow: number;
    mobileOpen: boolean;
    isNotAdmin: boolean;
    isNotUser: boolean;
    followVacationIcon: number[];
    currentDrawerVacationId: number;
    noVacationList: boolean;
}


const styles = {
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
        minHeight: 200,
        maxHeight: 500,
        overflow: 'auto'
    },
    iconContainer: {
        [theme.breakpoints.down("sm")]: {
            display: 'none',
        }
    },
    menuButton: {
        [theme.breakpoints.up('md')]: {
          display: 'none',
        },
    },
}


class Home extends Component<HomeProps, HomeState>{

    private socket = io.connect(Config.serverUrl, { withCredentials: true })
    private unsubscribeStore: Unsubscribe;
    
    public constructor(props: HomeProps){
        super(props);
        this.state = {
            vacations: storeVacation.getState().vacations,
            vacation: new VacationModel(),
            user: storeUser.getState().user,
            destinations: [],
            followVacation: new FollowVacationModel(),
            clickCollapse: null,
            open: false,
            setOpen: false,
            setOpenEditModal: false,
            setOpenReportModal: false,
            materialUIclasses: {},
            currentVacationId: null,
            currentVacation: new VacationModel(),
            isFollow: undefined,
            mobileOpen: false,
            isNotAdmin: true,
            isNotUser: true,
            followVacationIcon: [],
            currentDrawerVacationId: undefined,
            noVacationList: false
        }

        // Listen to redux changes
        this.unsubscribeStore = storeUser.subscribe(() => {

            // Check if user is host/user/admin
            this.initializingDisplayAccordingAuthitication();

        });

        this.unsubscribeStore = storeVacation.subscribe(() => {
            const vacations = storeVacation.getState().vacations;
            this.setState({ vacations });    
        });


        // Registering to a "admin-change" event 
        this.socket.on("admin-change", vacationsFromSocket => {
            let vacations = { ...this.state.vacations }
            vacations = vacationsFromSocket

            // Convert date that it got from data to format's display 
            for (const vacation of vacations) {
                const startDate = moment(vacation.startTime).format('YYYY-MM-DD');
                const endDate = moment(vacation.endTime).format('YYYY-MM-DD');
                vacation.startTime = startDate
                vacation.endTime = endDate
            }
            
            // Check if user is host/user/admin
            this.setState({ vacations })
            this.initializingDisplayAccordingAuthitication();
        });
        
    }
    
    
    public async componentDidMount() {

        //Don't get vacations from server if you have them already!
        if (storeVacation.getState().vacations.length > 0) {

            // Check if user is host/user/admin
            this.initializingDisplayAccordingAuthitication();
            return;
        }

        try {

            // Get vacations
            const vacationsResponse = await axios.get<VacationModel[]>( Config.serverUrl + "/api/vacations");
            const vacations = vacationsResponse.data;

            // Convert date that it got from data to format's display 
            for (const vacation of vacations) {
                const startDate = moment(vacation.startTime).format('YYYY-MM-DD');
                const endDate = moment(vacation.endTime).format('YYYY-MM-DD');
                vacation.startTime = startDate
                vacation.endTime = endDate
            }

            // Store vacation into redux
            storeVacation.dispatch({ type: ActionType.GetAllVacations, payload: vacations });

            // Get destination list
            const destinationsResponse = await axios.get<DestinationModel[]>( Config.serverUrl + "/api/destinations");
            const destinations = destinationsResponse.data;
            this.setState({ destinations });
            
            // Check if user is host/user/admin
            this.initializingDisplayAccordingAuthitication();

        }
        catch (err) {
            alert("Error: " + err.message);
        }
    }

    public initializingDisplayAccordingAuthitication = () => {

        // Check if user is host/user/admin
        if (sessionStorage.getItem('user')) {
            const userJson = sessionStorage.getItem('user')   
            const user = JSON.parse(userJson)
            
            if (user.isAdmin === 1) {
                this.setState({ isNotAdmin: false });
            } 
            else if (user.isAdmin === 0) {
                this.setState({ isNotUser: false });
                const userArr = [];
                userArr.push(user)
                
                // Get follow vacation of current user
                this.getFollowVacationPerUser(userArr)
            }
            else {
                this.setState({ isNotAdmin: true, isNotUser: true });
            }
        }

        // If key of sessionStorage that called "user" is not exist, turn all operations off  
        if (!sessionStorage.getItem('user')) {
            this.setState({ isNotAdmin: true, isNotUser: true });
        }
        
        // After initialization or update vacations if there have no vacation, so show text about that
        if (this.state.vacations.length === 0) {
            this.setState({ noVacationList: true })
        } else {
            this.setState({ noVacationList: false })
        }

    }

    // Get follow vacation of current user and put them on top of vacation list
    public getFollowVacationPerUser = async (user?: UserModel[]) =>{

        // Get user id
        let userId = user[0].userId

        if (userId === undefined) {
            const userJson = sessionStorage.getItem('user')   
            const user = JSON.parse(userJson)
            userId = user.userId
        }

        // Get from server follow vacation by current user
        const response = await axios.get<FollowVacationModel[]>( Config.serverUrl + `/api/vacations/follow/${userId}`, { withCredentials: true })
        const followVacations = response.data;


        // Order vacations according to follow vacation by user on top of list 
        const vacations = this.state.vacations
        let followVacationIcon = this.state.followVacationIcon
        const newFollowVacationIcon = []

        for (let i = 0; i < followVacations.length; i++) {

            vacations.forEach(function(item,index){
                if(item.vacationId === followVacations[i].vacationId){
                    vacations.splice(index, 1);
                    vacations.unshift(item);

                    newFollowVacationIcon.push(item.vacationId)
                }
            });
            
        }

        // Paint bt of follow vacations
        followVacationIcon = newFollowVacationIcon
        this.setState({ followVacationIcon })

        // Insert new order vacation into vacation variable
        this.setState({ vacations })
    }

    // follow button - add or remove follow vacation by user
    private onSelectAddFollow = async (vacationIdOfBtIcon: number) => {
        try {

            // Get user id
            const userJson = sessionStorage.getItem('user')   
            const user = JSON.parse(userJson)
            const userId = user.userId

            // Insert details to object "follow vacation" for sending to server
            const followVacation = { ...this.state.followVacation };
            followVacation.vacationId = vacationIdOfBtIcon;
            followVacation.userId = userId;

            // Add or remove follow vacation by current user
            const response = await axios.post<FollowVacationModel>( Config.serverUrl + "/api/vacations/follow", followVacation, { withCredentials: true });
            const addedFollow = response.data;

            // Call function that order follow vacations of current user
            const userFollow = []
            userFollow.push(addedFollow)
            this.getFollowVacationPerUser(userFollow)

            // Update redux at number of general followers
            const vacation = { ...this.state.vacation }
            vacation.vacationId = vacationIdOfBtIcon

            if (addedFollow) {
                vacation.numFollowers = 1
            } else {
                vacation.numFollowers = 0
            }
            
            storeVacation.dispatch({ type: ActionType.UpdateVacation, payload: vacation });
            
        } catch (err) {
            console.log(err.message)
        }
    }

    // Stop listening to Store
    public componentWillUnmount(): void {
        this.unsubscribeStore(); 
    }

    // Button to open collapse
    private handleClickCollapse = (value: number) => {
        this.setState({ clickCollapse: value });
    }

    // Button to open add vacation modal
    private handleOpen = () => {
        this.setState({ setOpen: true })
    };

    // Button to close add vacation modal
    private handleClose = () => {
        this.setState({ setOpen: false })
    };

    // Button to open edit vacation modal
    public onSelectEdit = (vacationId: number) => {
        const currentVacation = this.state.vacations.find( v => v.vacationId === vacationId )       
        this.setState({ currentVacation, setOpenEditModal: true })
    }

    // Button to close edit vacation modal
    private handleCloseEditModal = () => {
        this.setState({ setOpenEditModal: false })
    };

    // Button to open add vacation modal
    private handleOpenReport = () => {
        this.setState({ setOpenReportModal: true })
    };

    // Button to close add vacation modal
    private handleCloseReport = () => {
        this.setState({ setOpenReportModal: false })
    };

    private onSelectDelete = async (id: number) => {
        try {
            let result = window.confirm("Are you sure?");
            if (!result) {
                return
            }
            await axios.delete( Config.serverUrl + `/api/vacations/${id}`, { withCredentials: true });
            storeVacation.dispatch({ type: ActionType.DeleteVacation, payload: id });

        } catch (err) {
            alert(err.message)
        }
    }


    public handleDrawerToggle = (open?: boolean) => (        
        event: React.KeyboardEvent | React.MouseEvent,
        ) => {
            if (
                event.type === 'keydown' &&
                ((event as React.KeyboardEvent).key === 'Tab' ||
                (event as React.KeyboardEvent).key === 'Shift')
            ) {
            return;
            }

            // By click get vacation Id and insert to edit/delete drawer
            if (open === true) {
                const currentDrawerVacationId = parseInt(event.currentTarget.attributes[4].value)
                this.setState({ currentDrawerVacationId });
            }
      
            this.setState({ mobileOpen: open});
                                
    };

    public render() {

        return (
            
            <div className="home">
                <Container maxWidth="lg">
                    <Typography className="header-app" variant="h4">
                        Find your deal
                    </Typography>

                    {/* Add vacation modal */}                    
                    <Hidden xsUp={this.state.isNotAdmin}>
                        <Button 
                            variant="contained" 
                            color="primary"
                            type="button"
                            className="addVacationBt"
                            onClick={this.handleOpen}
                        >
                            Add vacation
                        </Button>
                    </Hidden>
                    
                    <Modal
                        aria-labelledby="transition-modal-title"
                        aria-describedby="transition-modal-description"
                        className={this.props.classes.modal}
                        open={this.state.setOpen}
                        onClose={this.handleClose}
                        disableEscapeKeyDown={false}
                        disableBackdropClick={true}
                        closeAfterTransition
                    >
                        <Fade in={this.state.setOpen}>
                            <div className={this.props.classes.paper}>

                                <IconButton className="cancelButton" onClick={ () => { this.setState({ setOpen: false }) }}>
                                    <CancelIcon fontSize="small" />
                                </IconButton>

                                <h2 id="transition-modal-title">Add new vacation</h2>

                                <AddVacation 
                                    closeModalAddVacation={this.handleClose}
                                />

                            </div>
                        </Fade>
                    </Modal>

                    {/* Report vacation modal */}
                    <Hidden xsUp={this.state.isNotAdmin}>
                        <Button 
                            variant="contained" 
                            color="primary"
                            type="button"
                            className="reportBt"
                            onClick={this.handleOpenReport}
                        >
                            Report
                        </Button>
                    </Hidden>

                    <Modal
                        aria-labelledby="transition-modal-title"
                        aria-describedby="transition-modal-description"
                        className={this.props.classes.modal}
                        open={this.state.setOpenReportModal}
                        onClose={this.handleCloseReport}
                        disableEscapeKeyDown={false}
                        disableBackdropClick={true}
                        closeAfterTransition
                    >
                        <Fade in={this.state.setOpenReportModal}>
                            <div className={this.props.classes.paper}>

                                <IconButton className="cancelButton" onClick={ () => { this.setState({ setOpenReportModal: false }) }}>
                                    <CancelIcon fontSize="small" />
                                </IconButton>

                                <h2 id="transition-modal-title">Report vacations</h2>

                                <Report />

                            </div>
                        </Fade>
                    </Modal>

                    {/* Edit vacation modal */}
                    <Modal
                        aria-labelledby="transition-modal-title"
                        aria-describedby="transition-modal-description"
                        className={this.props.classes.modal}
                        open={this.state.setOpenEditModal}
                        onClose={this.handleCloseEditModal}
                        disableEscapeKeyDown={false}
                        disableBackdropClick={true}
                        closeAfterTransition
                    >
                        <Fade in={this.state.setOpenEditModal}>
                            <div className={this.props.classes.paper}>

                                <IconButton className="cancelButton" onClick={ () => { this.setState({ setOpenEditModal: false }) }}>
                                    <CancelIcon fontSize="small" />
                                </IconButton>

                                <h2 id="transition-modal-title">Edit vacation</h2>

                                <EditVacation vacationId={this.state.currentVacation.vacationId}
                                                description={this.state.currentVacation.description}
                                                destinationName={this.state.currentVacation.destinationName}
                                                destinationId={this.state.currentVacation.destinationId}
                                                img={this.state.currentVacation.img}
                                                startTime={this.state.currentVacation.startTime}
                                                endTime={this.state.currentVacation.endTime}
                                                price={this.state.currentVacation.price}
                                                closeModalEditVacation={this.handleCloseEditModal}
                                                closeSlideModalVacation={this.handleDrawerToggle(false)}
                                />

                            </div>
                        </Fade>
                    </Modal>

                    {/* vacations box */}
                    <div className="vacationsBox">

                    {/* loading vacation gif */}
                    { this.state.noVacationList === false ?
                        <div> 
                            { this.state.vacations.length === 0 && <img src={`${Config.serverUrl}/upload/flight-loading-gif-smaller.gif`} alt="loading-flight-gif"/>}
                        </div>
                    :
                        <div>
                            <h1>
                                Sorry, We have no vacations right now 
                            </h1>
                        </div>
                    }

                    { this.state.vacations.length > 0 &&
                    <React.Fragment>
                        {this.state.vacations.map( v => 
                            <Card raised={true} className="vacationBox" key={v.vacationId}>

                                <CardContent className="titleCardBox">
                                    <Typography variant="h4">
                                        <span>{v.destinationName}</span>
                                    </Typography>
                                    <Typography color="textSecondary" className="vacation-time">
                                        <span>{v.startTime}</span>&nbsp;&nbsp;
                                        <span>{v.endTime}</span>
                                    </Typography>
                                    <VacationDescriptionButton
                                        value={v.vacationId}
                                        clickMe={this.handleClickCollapse}
                                    />
                                </CardContent>

                                <CardContent className="priceCardBox">
                                    <div>{v.price} &#8362;</div>
                                </CardContent>

                                <div className="numFollowersBox">{v.numFollowers}</div>

                                {/* Follow bt */}
                                <Hidden xsUp={this.state.isNotUser}>

                                    <IconButton onClick={() => this.onSelectAddFollow(v.vacationId)}>
                                        {this.state.isNotUser ? null : 
                                        <StarsIcon
                                            style={{ color: this.state.followVacationIcon.find( f => f === v.vacationId ) ? "yellow" : "blue" }}
                                        />
                                        }
                                    </IconButton>

                                </Hidden>

                                {/* Operator bt - edit and delete */}
                                <Hidden xsUp={this.state.isNotAdmin}>

                                    <IconButton
                                          color="inherit"
                                          aria-label="open drawer"
                                          edge="start"
                                          value={v.vacationId}
                                          onClick={this.handleDrawerToggle(true)}
                                          className={this.props.classes.menuButton}
                                    >
                                        <MoreHorizIcon />
                                    </IconButton>

                                    <Drawer
                                        container={this.props.classes.container}
                                        variant="temporary"
                                        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
                                        onClose={this.handleDrawerToggle(false)}
                                        open={this.state.mobileOpen}
                                        classes={{
                                          paper: this.props.classes.drawerPaper,
                                        }}
                                        ModalProps={{
                                          keepMounted: true, // Better open performance on mobile.
                                        }}
                                    >
                                        <CardContent className="operatorsCardBoxEditAndDelete" >
                                            <CardActions disableSpacing >

                                                <IconButton onClick={() => this.onSelectEdit(this.state.currentDrawerVacationId)}>
                                                    <Edit />
                                                </IconButton>

                                                <IconButton onClick={() => this.onSelectDelete(this.state.currentDrawerVacationId)}>
                                                    <Delete />
                                                </IconButton>

                                            </CardActions>
                                        </CardContent>
                                    </Drawer>
                                    
                                    <Container className={this.props.classes.iconContainer}>
                                        <CardContent className="operatorsCardBox" >
                                            <CardActions disableSpacing className="CardBox" >

                                                <IconButton onClick={() => this.onSelectEdit(v.vacationId)}>
                                                    <Edit />
                                                </IconButton>

                                                <IconButton onClick={() => this.onSelectDelete(v.vacationId)}>
                                                    <Delete />
                                                </IconButton>

                                            </CardActions>
                                        </CardContent>
                                    </Container>

                                </Hidden>

                                <CardContent className="imgCardBox">
                                    <img src={`${Config.serverUrl}/upload/${v.img}`} alt={`${v.img}`}/>
                                </CardContent>
                                    
                                {/* Description vacation - collapse area */}
                                <CardContent className="descriptionCardBox">
                                    <Collapse in={this.state.clickCollapse === v.vacationId} timeout="auto" unmountOnExit>
                                        <Typography className="textCardBox" variant="caption" display="block">
                                            {v.description}
                                        </Typography>
                                    </Collapse>
                                </CardContent>
                            </Card>
                        )}
                    </React.Fragment>
                    }
                    </div>
                    <br/><br/><br/>
                </Container>
                
            </div>
        );
    }

}

export default withStyles(styles)(Home);
