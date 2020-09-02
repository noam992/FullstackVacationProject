import React, { Component } from "react";
import "./vacation-description-button.css";

// Material UI
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';


interface vacationDescriptionButtonProps {
    value: number;
    clickMe?(value: number): void; // ? = Optional Parameter
}

interface vacationDescriptionButtonState {
    setValue: number;

}

export class VacationDescriptionButton extends Component<vacationDescriptionButtonProps, vacationDescriptionButtonState> {

    public constructor(props: vacationDescriptionButtonProps) {
        super(props);
        this.state ={
            setValue: null
        }
    }

    private mouseEnter = () => {
        if(this.props.clickMe) {
            if (this.state.setValue === this.props.value) {
                this.props.clickMe(null);
                this.setState({ setValue: null } )
            } else { 
                this.props.clickMe(this.props.value);
                this.setState({ setValue: this.props.value } )
            }
        }
    }

    public render() {
        return (
            <div className="descriptionButton" onClick={this.mouseEnter}>

                <IconButton className="arrowCardBox" 
                    aria-label="show more"
                    value={this.props.value}
                >
                    <ExpandMoreIcon />
                </IconButton>

            </div>
        );
    }
}