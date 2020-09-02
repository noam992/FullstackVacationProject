import React, { Component } from "react";
import "./report.css"
import { Bar } from 'react-chartjs-2';
import { VacationModel } from "../../models/vacation-model";
import { getRandomColor } from "../../helper/random-number";
import { Config } from "../../config";

// Redux
import { storeVacation } from "../../redux/store";

// Material UI
import { Container } from "@material-ui/core";

interface ReportState {
    vacations: VacationModel [];
    chartData: {
        labels: string[],
        datasets: [
            {
                label: string,
                data: number[],
                backgroundColor: string[]
            }
        ]
    }
}


export class Report extends Component<any, ReportState> {

    public constructor(props: any){
        super(props);
        this.state = {
            vacations: [],
            chartData: {
                labels: [],
                datasets: [
                    {
                        label: "vacations",
                        data: [],
                        backgroundColor: []
                    }
                ]
            }
        }
    }

    public componentDidMount() {
        
        const chartData = this.state.chartData
        const vacations = storeVacation.getState().vacations
        const labelX = chartData.labels
        let dataY = chartData.datasets


        // Only vacation with followers 
        vacations.forEach( v => {
            if (v.numFollowers === 0) {
                const zeroFollowers = vacations.findIndex( f => f.numFollowers === 0 )
                vacations.splice(zeroFollowers, 1)
            }
        });


        // Insert vacations into chart
        vacations.forEach( v => {
            labelX.push(v.destinationName)
            dataY[0].data.push(v.numFollowers)
            dataY[0].backgroundColor.push(getRandomColor())
        });

        this.setState({ chartData })

    }

    public render() {
        return (
            <div className="report">


                {/* loading vacation gif */} 
                { this.state.chartData.labels.length === 0 && 
                    <img src={`${Config.serverUrl}/upload/flight-loading-gif-smaller.gif`} alt="loading-flight-gif"/>
                }

                { this.state.chartData.labels.length > 0 &&
                <React.Fragment>

                    <Container maxWidth="lg">
                        
                        <div>
                            <Bar
                                data={this.state.chartData}
                                options={{ maintainAspectRatio: false }}
                            />
                        </div>

                    </Container>

                </React.Fragment>
                }

            </div>
        );
    }
}