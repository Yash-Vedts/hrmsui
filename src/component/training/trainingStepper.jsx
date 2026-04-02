
const TrainingStepper = ({ title, steps, currentStep }) => {
    return (
        <div className="card approval-card p-3 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 approval-title">{title}</h6>
                <span className="badge bg-light text-dark small">
                    Step {currentStep}/{steps.length}
                </span>
            </div>

            <div className="d-flex justify-content-between position-relative approval-wrapper">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber <= currentStep;

                    return (
                        <div key={index} className="text-center flex-fill position-relative">
                            <div
                                className={`approval-step-sm mx-auto ${isActive ? "active-step-sm" : ""}`}
                            >
                                {stepNumber}
                            </div>
                            <div className="step-label">{step}</div>
                        </div>
                    );
                })}

                <div
                    className="approval-progress-sm"
                    style={{
                        width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                    }}
                />
            </div>
        </div>
    );
};

export default TrainingStepper;