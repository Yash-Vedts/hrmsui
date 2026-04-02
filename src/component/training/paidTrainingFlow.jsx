import React from "react";
import TrainingStepper from "./trainingStepper";

const PaidTrainingFlow = ({flowType}) => {

    const paidWithinSteps = [
        "Created by User",
        "Recommended by DH",
        "Verified by SA-HRT",
        "Approved by AD-HRT",
        "Approved by Director"
    ];

    const paidBeyondSteps = [
        "Created by User",
        "Recommended by DH",
        "Verified by SA-HRT",
        "Approved by AD-HRT",
        "Approved by Director",
        "Financial Concurrence",
        "Final Approval"
    ];


    const steps = flowType === "within" ? paidWithinSteps : paidBeyondSteps;

    const currentStep = flowType === "within" ? 5 : 7; // example

    return (
        <div>
            <TrainingStepper
                title="Paid Training : Approval Flow"
                steps={steps}
                currentStep={currentStep}
            />
        </div>
    );
};

export default PaidTrainingFlow;