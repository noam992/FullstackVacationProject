import React, { Component, ChangeEvent } from "react";
import "./edit-vacation.css";
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
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';


interface EditVacationProps {
    classes: any;
    vacationId?: number;
    description?: string;
    destinationName?: string;
    destinationId?: number;
    img?: File;
    startTime?: string;
    endTime?: string;
    price?: number;
    closeModalEditVacation?: any;
    closeSlideModalVacation?: any;
}

interface EditVacationState {
    vacations: VacationModel [];
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
    setEditValidForm: boolean;
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


class EditVacation extends Component<EditVacationProps, EditVacationState> {
    
    public constructor(props: EditVacationProps) {
        super(props);
        this.state = {
            vacations: storeVacation.getState().vacations,
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
            setEditValidForm: false
        }
    }

    public async componentDidMount() {
        try {
            // Get list location
            const response = await axios.get<DestinationModel[]>( Config.serverUrl + "/api/destinations");
            const destinations = response.data;
            this.setState({ destinations});
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
        const description = args.target.value === "" ? null : args.target.value;
        let descriptionError = ""

        // validation
        if(description === null){
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
        let imageName = ""
        const vacation = { ...this.state.vacation }
        
        vacation.img = img
        
        if (img === null || img === undefined) {
            imageName = ""
        }else {
            imageName = img.name
        }
        
        this.setState({ vacation, previewFileSelect: imageName })
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
        const price = +args.target.value === this.props.price ? this.props.price : +args.target.value;
        let priceError = ""

        // validation
        if(price < 0 || price < 9999999){
            priceError = "Number between 0 to 9999999"
        }
        if (price > 0 || price > 9999999) {
            priceError = ""
        }
        if (price) {
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
            const extraErrorsBeforeSending = {
                destinationIdError: "",
                imageError: "",
                validDateError: "",
                priceError: ""
            }

            // validation - file
            if(this.state.vacation.img !== undefined){
                const extension = this.state.vacation.img.name.substr(this.state.vacation.img.name.lastIndexOf("."));
                if(extension !== ".jpg" && extension !== ".png" && extension !== ".gif"){
                    extraErrorsBeforeSending.imageError = "Accept only .jpg/.png/.gif file"
                }
            } 

            // validation - Date and time
            const newStartDate = this.state.vacation.startTime
            const newEndDate = this.state.vacation.endTime
            const oldStartDate = this.props.startTime
            const oldEndDate = this.props.endTime

            if (newStartDate !== undefined || newEndDate  !== undefined) {
                const validDate = endTimeBiggerThenStartTime(newStartDate || oldStartDate, newEndDate || oldEndDate)

                if (validDate !== "") {
                    extraErrorsBeforeSending.validDateError = validDate;
                }
            }

            // validation - price
            if(this.state.vacation.price === this.props.price){
                this.state.vacation.price = undefined
            }

            errors.destinationIdError = extraErrorsBeforeSending.destinationIdError;
            errors.imgError = extraErrorsBeforeSending.imageError;
            errors.dateError = extraErrorsBeforeSending.validDateError;
            errors.priceError = extraErrorsBeforeSending.priceError;
            this.setState({ errors })

            // Go out if there have any error form
            for (const prop in this.state.errors) {
                if (this.state.errors[prop].toString() !== "") {
                    return;
                }
            }

            for (const prop in extraErrorsBeforeSending) {
                if (extraErrorsBeforeSending[prop].toString() !== "") {
                    return;
                }
            }

            // convert to data format 
            const myFormData = new FormData();

            if (this.state.vacation.description !== undefined) {
                myFormData.append("description", this.state.vacation.description);
            }
            if (this.state.vacation.destinationId !== undefined) {
                myFormData.append("destinationId", this.state.vacation.destinationId.toString());
            }
            if (this.state.vacation.img !== undefined) {
                myFormData.append("img", this.state.vacation.img, this.state.vacation.img.name);
            }
            if (this.state.vacation.endTime === undefined) {
                myFormData.append("startTime", this.props.startTime);           
            } else {
                myFormData.append("startTime", this.state.vacation.startTime);           
            }
            if (this.state.vacation.endTime === undefined) {
                myFormData.append("endTime", this.props.endTime);           
            }else{
                myFormData.append("endTime", this.state.vacation.endTime);           
            }
            if (this.state.vacation.price !== undefined) {
                myFormData.append("price", this.state.vacation.price.toString());
            }

            const response = await axios.patch<VacationModel>( Config.serverUrl + `/api/vacations/${this.props.vacationId}`, myFormData, { withCredentials: true });
            const patchedVacation = response.data;

            // Change same variables of response's object before save it into redux store
            // Use format to display time
            const startDate = moment(patchedVacation.startTime).format('YYYY-MM-DD');
            const endDate = moment(patchedVacation.endTime).format('YYYY-MM-DD');
            patchedVacation.startTime = startDate
            patchedVacation.endTime = endDate

            // Add destination name for redux
            if(this.state.vacation.destinationId !== undefined){
                const destination = this.state.destinations.find( d => d.destinationId === this.state.vacation.destinationId );
                patchedVacation.destinationName = destination.destinationName
            }

            storeVacation.dispatch({ type: ActionType.UpdateVacation, payload: patchedVacation });

            // success process
            this.setState({ setEditValidForm: true })
            this.props.closeModalEditVacation(false)
            this.props.closeSlideModalVacation(false)

        } catch (err) {
            alert(err.message)
        }
    }

    public render() {
        return (
            <div className="add-vacation">
                <Container maxWidth="xs">
                    <form className={this.props.classes.root}>

                        <FormControl className={this.props.classes.formControl} style={{minWidth: 175}}>
                            <InputLabel shrink id="currentVacation-simple-select-label">Destination</InputLabel>
                            <Select
                                labelId="currentVacation-simple-select-label"
                                id="currentVacation-simple-select"
                                value={this.state.vacation.destinationId || ""}
                                onChange={this.handleDestination}
                                displayEmpty
                                error={(this.state.errors.destinationIdError === "" ? false : true)}
                            >
                                <MenuItem value="">
                                    <em>{this.props.destinationName}</em>
                                </MenuItem>
                                {this.state.destinations.map( d =>  
                                <MenuItem 
                                    key={d.destinationId} 
                                    value={d.destinationId}
                                >
                                    {d.destinationName}
                                </MenuItem>    
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
                                defaultValue={this.props.description}
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
                        <div style={{ display: this.props.img ? "block" : "none" }} 
                            className="displaySelectedFile">
                            {this.state.previewFileSelect || this.props.img }
                        </div >
                        <br/>
                                
                        <FormControl>
                            <TextField
                                id="start-date-local"
                                label="Start Time"
                                type="date"
                                className={this.props.classes.textField}
                                defaultValue={this.props.startTime}
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
                                defaultValue={this.props.endTime}
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
                                value={this.state.vacation.price || this.props.price}
                                onChange={this.handlePrice}
                                error={(this.state.errors.priceError === "" ? false : true)}
                            />
                            <FormHelperText id="price-helper-text" error>{this.state.errors.priceError}</FormHelperText>
                        </FormControl>
                        <br/>
                        {this.state.setEditValidForm === false ? null
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
                </Container>
            </div>
        );
    }
}

export default withStyles(styles)(EditVacation);

