import React, { Component, ChangeEvent } from "react";
import "./add-vacation.css";
import { VacationModel } from "../../models/vacation-model";
import { DestinationModel } from "../../models/destination-model";
import axios from "axios";
import { Config } from "../../config";
import { storeVacation } from "../../redux/store";
import { ActionType } from "../../redux/action-type";
import { getCurrentDate } from "../../helper/get-date-time";
import { endTimeBiggerThenStartTime } from "../../helper/valid-end-bigger-start-time";
import moment from 'moment';

// material UI
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import SendIcon from '@material-ui/icons/Send';
import FormHelperText from '@material-ui/core/FormHelperText';
import Typography from '@material-ui/core/Typography';


interface AddVacationProps {
    classes: any;
    closeModalAddVacation?: any
}

interface AddVacationState {
    vacation: VacationModel;
    destination: DestinationModel;
    destinations: DestinationModel [];
    errors: {   descriptionError: string, 
                destinationIdError: string,
                imgError: string,
                dateError: string,
                priceError: string
    },
    previewFileSelect: string;
    currentDate: string;
    setValidForm: boolean
}

const styles = {
    root: {
        '& .MuiTextField-root': {
            margin: 4,
            width: '25ch',
        }
    },
    input: {
        display: 'none',
    },
    formControl: {
        margin: 4,
        minWidth: 120,
    },
    button: {
        margin: 4,
        minWidth: 122,
    }
}


class AddVacation extends Component<AddVacationProps, AddVacationState> {

    public constructor(props: AddVacationProps) {
        super(props);
        this.state = {
            vacation: new VacationModel(),
            destination: new DestinationModel(),
            destinations: [],
            errors: {   descriptionError: "", 
                        destinationIdError: "",
                        imgError: "",
                        dateError: "",
                        priceError: ""
            },
            previewFileSelect: "",
            currentDate: getCurrentDate(),
            setValidForm: false
        }
    }


    public async componentDidMount() {

        try {
            // Get list location
            const response = await axios.get<DestinationModel[]>( Config.serverUrl + "/api/destinations");
            const destinations = response.data;
            this.setState({ destinations });
        }
        catch (err) {
            alert("Error: " + err.message);
        }

    }


    private handleDestination = (args: ChangeEvent<{ value: unknown }>) => {
        const destinationId = +args.target.value
        const vacation = { ...this.state.vacation };
        vacation.destinationId = destinationId;
        this.setState({ vacation })
    }

    private handleDescription = (args: ChangeEvent<HTMLInputElement>) => {
        const description = args.target.value === "" ? undefined : args.target.value;
        let descriptionError = ""

        // validation
        if(description === undefined){
            descriptionError = "Please fill the textarea"
        }

        const errors = { ...this.state.errors };
        errors.descriptionError = descriptionError;
        this.setState({ errors })

        const vacation = { ...this.state.vacation };
        vacation.description = description;
        this.setState({ vacation });
    }

    private handleImg = (event) => {
        const img = (event.target.files[0] as File) === null ? undefined : (event.target.files[0] as File);
        const vacation = { ...this.state.vacation }
        vacation.img = img
        this.setState({ vacation, previewFileSelect: img.name })
    }

    private handleStartTime = (args: ChangeEvent<{ value: string }>) => {
        const startTime = args.target.value as string
        const vacation = { ...this.state.vacation };
        vacation.startTime = startTime;
        this.setState({ vacation })
    }

    private handleEndTime = (args: ChangeEvent<{ value: unknown }>) => {
        const endTime = args.target.value as string
        const vacation = { ...this.state.vacation };
        vacation.endTime = endTime; 
        this.setState({ vacation })
    }

    private handlePrice = (args: ChangeEvent<{ value: unknown }>) => {
        const price = +args.target.value as number
        let priceError = ""

        // validation
        if(price < 0 || price < 9999999){
            priceError = "Number between 0 to 9999999"
        }
        if (price > 0 || price > 9999999) {
            priceError = ""
        }

        const errors = { ...this.state.errors };
        errors.priceError = priceError;
        this.setState({ errors })

        const vacation = { ...this.state.vacation };
        vacation.price = price;
        this.setState({ vacation })
    }


    private sendForm = async () => {
        try {

            //validation
            const errors = { ...this.state.errors };
            let destinationIdError = "";
            let descriptionError = "";
            let imageError = "";
            let validDateError = "";
            let priceError = "";

            // validation - destination
            if(this.state.vacation.destinationId === undefined){
                destinationIdError = "Please choose destination"
            }

            // validation - description
            if(this.state.vacation.description === undefined){
                descriptionError = "Please insert description"
            }

            // validation - file
            if(this.state.vacation.img === undefined){
                imageError = "Please select image"
            } 
            else {
                const extension = this.state.vacation.img.name.substr(this.state.vacation.img.name.lastIndexOf("."));
                if(extension !== ".jpg" && extension !== ".png" && extension !== ".gif"){
                    imageError = "Accept only .jpg/.png/.gif file"
                }
            }

            // validation - Date and time
            if(this.state.vacation.startTime === undefined || this.state.vacation.endTime === undefined){
                validDateError = "Please insert start/end date"
            }
            if (this.state.vacation.startTime && this.state.vacation.endTime) {
                const validDate = endTimeBiggerThenStartTime(this.state.vacation.startTime, this.state.vacation.endTime)

                if (validDate !== "") {
                    validDateError = validDate;
                }
            }

            // validation - price
            if(this.state.vacation.price === undefined){
                priceError = "Please press price"
            } else if (this.state.vacation.price < 0 || this.state.vacation.price > 9999999){
                priceError = "Number between 0 to 9999999"
            } else if (this.state.vacation.price > 0 || this.state.vacation.price < 9999999) {
                priceError = ""
            }

            errors.destinationIdError = destinationIdError;
            errors.descriptionError = descriptionError;
            errors.imgError = imageError
            errors.dateError = validDateError
            errors.priceError = priceError
            this.setState({ errors })

            // Go out if there have any error form
            for (const prop in this.state.errors) {
                if (this.state.errors[prop].toString() !== "") {
                    return false;
                }
            }

            // convert to data format 
            const myFormData = new FormData();

            myFormData.append("description", this.state.vacation.description);
            myFormData.append("destinationId", this.state.vacation.destinationId.toString());
            myFormData.append("img", this.state.vacation.img, this.state.vacation.img.name);
            if (this.state.vacation.endTime === undefined) {
                myFormData.append("startTime", getCurrentDate());           
            } else {
                myFormData.append("startTime", this.state.vacation.startTime);           
            }
            if (this.state.vacation.endTime === undefined) {
                myFormData.append("endTime", getCurrentDate());           
            }else{
                myFormData.append("endTime", this.state.vacation.endTime);           
            }
            myFormData.append("price", this.state.vacation.price.toString());

            const response = await axios.post<VacationModel>( Config.serverUrl + "/api/vacations", myFormData, { withCredentials: true });
            const addedVacation = response.data;

            // Change same variables of response's object before save it into redux store
            // Use format to display time
            const startDate = moment(addedVacation.startTime).format('YYYY-MM-DD');
            const endDate = moment(addedVacation.endTime).format('YYYY-MM-DD');
            addedVacation.startTime = startDate
            addedVacation.endTime = endDate

            const destination = this.state.destinations.filter( d => d.destinationId === addedVacation.destinationId )
            for (const item of destination) {
                addedVacation.destinationName = item.destinationName
            }
            addedVacation.numFollowers = 0

            storeVacation.dispatch({ type: ActionType.AddVacation, payload: addedVacation });

            // success process
            this.setState({ setValidForm: true })
            this.props.closeModalAddVacation(false)

        } catch (err) {
            console.log(err.message)
        }
    }

    public render() {
        return (
            <div className="add-vacation">

                <form className={this.props.classes.root}>

                    <FormControl className={this.props.classes.formControl} style={{minWidth: 175}}>
                        <InputLabel id="simple-select-label">Destination</InputLabel>
                        <Select
                            labelId="simple-select-label"
                            id="simple-select"
                            value={this.state.vacation.destinationId || ""}
                            onChange={this.handleDestination}
                            error={(this.state.errors.destinationIdError === "" ? false : true)}
                        >
                            {this.state.destinations.map( d =>  
                            <MenuItem key={d.destinationId} value={d.destinationId}>{d.destinationName}</MenuItem>    
                            )}
                        </Select>
                        <FormHelperText id="destination-helper-text" error>{this.state.errors.destinationIdError}</FormHelperText>
                    </FormControl>
                    <br/>
                    
                    <FormControl>
                        <TextField
                            id="outlined-multiline-static"
                            label="Description"
                            multiline
                            rows={4}
                            variant="outlined"
                            value={this.state.vacation.description}
                            onChange={this.handleDescription}
                            error={(this.state.errors.descriptionError === "" ? false : true)}
                        />
                        <FormHelperText id="description-helper-text" error>{this.state.errors.descriptionError}</FormHelperText>
                    </FormControl>
                    <br/>
                    
                    <FormControl>
                        <label htmlFor="contained-button-file">
                            <Button variant="contained" color="primary" component="span">
                                Upload
                            </Button>
                        </label>
                        <input
                            accept=".jpg,.png,.gif,.jpeg"
                            className={this.props.classes.input}
                            id="contained-button-file"
                            multiple
                            type="file"
                            name="vacationImg"
                            onChange={this.handleImg}
                        />
                        <FormHelperText id="image-helper-text" error>{this.state.errors.imgError}</FormHelperText>
                    </FormControl>
                    <div style={{ display: this.state.previewFileSelect ? "block" : "none" }} 
                        className="displaySelectedFile">
                        {this.state.previewFileSelect}
                    </div >
                    <br/>
                    
                    <FormControl>
                        <TextField
                            id="start-date-local"
                            label="Start Time"
                            type="date"
                            className={this.props.classes.textField}
                            defaultValue={this.state.currentDate}
                            InputLabelProps={{
                              shrink: true
                            }}
                            onChange={this.handleStartTime}
                            error={(this.state.errors.dateError === "" ? false : true)}
                        />
                    </FormControl>
                    <br/>

                    <FormControl>
                        <TextField
                            id="end-date-local"
                            label="End Time"
                            type="date"
                            className={this.props.classes.textField}
                            defaultValue={this.state.currentDate}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            onChange={this.handleEndTime}
                            error={(this.state.errors.dateError === "" ? false : true)}
                        />
                    </FormControl>
                    <FormHelperText id="date-helper-text" error>{this.state.errors.dateError}</FormHelperText>
                    <br/>

                    <FormControl>
                        <TextField 
                            id="outlined-basic" 
                            label="Price"
                            type="number"
                            variant="outlined"
                            value={this.state.vacation.price || ""}
                            onChange={this.handlePrice}
                            error={(this.state.errors.priceError === "" ? false : true)}
                        />
                        <FormHelperText id="price-helper-text" error>{this.state.errors.priceError}</FormHelperText>
                    </FormControl>
                    <br/>
                    {this.state.setValidForm === false ? null
                    :
                    <div>
                        <Typography color="primary">
                            successfully Processed
                        </Typography>
                    </div>
                    }
                    <Button
                        variant="contained" 
                        color="primary"
                        className={this.props.classes.button}
                        endIcon={<SendIcon>send</SendIcon>}
                        onClick={this.sendForm}
                    >
                      Send
                    </Button>

                </form>

            </div>
        );
    }
}

export default withStyles(styles)(AddVacation);

