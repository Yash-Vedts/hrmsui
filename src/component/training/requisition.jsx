import { useEffect, useState } from "react";
import Datatable from "../../datatable/Datatable";
import Navbar from "../navbar/Navbar";
import { useNavigate } from "react-router-dom";
import { forwardRequisition, getFeedbackList, getRequisitionPrint, getRequisitions, revokeRequisition } from "../../service/training.service";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { Tooltip } from "react-tooltip";
import { MdFeedback } from "react-icons/md";
import { FaEdit } from "react-icons/fa";
import RequisitionPrint from "../print/requisition";
import { FaArrowLeft, FaEye, FaForward } from "react-icons/fa6";
import { handleApiError } from "../../service/master.service";
import AlertConfirmation from "../../common/AlertConfirmation.component";
import { usePermission } from "../../common/usePermission";
import RequisitionPreview from "./requisitionPreview";
import TrainingStepper from "./trainingStepper";
import PaidTrainingFlow from "./paidTrainingFlow";


const Requisition = () => {

    const { canView, canAdd, canEdit, canDelete } = usePermission("Requisition");

    const [requisitionList, setRequisitionList] = useState([]);
    const [feedbackList, setFeedbackList] = useState([]);
    const navigate = useNavigate();
    const empId = localStorage.getItem("empId");
    const roleName = localStorage.getItem("roleName");
    const [showModal, setShowModal] = useState(false);
    const [reqData, setShowReqData] = useState(null);


    useEffect(() => {
        fetchRequisitions();
        fetchFeedbacks();
    }, []);

    const fetchRequisitions = async () => {
        try {
            const response = await getRequisitions(empId, roleName);
            setRequisitionList(response?.data || []);
        } catch (error) {
            console.error("Error fetching requisitions:", error);
            Swal.fire("Error", "Failed to fetch requisition data. Please try again later.", "error");
        }
    };

    const fetchFeedbacks = async () => {
        let apiEmpId = 0;
        let apiRole = roleName;

        if (roleName !== "ROLE_USER") {
            apiRole = "ROLE_ADMIN";
        }

        if (roleName === "ROLE_USER") {
            apiEmpId = empId;
            apiRole = roleName;
        }

        try {
            const response = await getFeedbackList(apiEmpId, apiRole);
            setFeedbackList(response?.data || []);
        } catch (error) {
            console.error("Error fetching requisitions:", error);
        }
    };


    const getTextColor = (bg) => {
        if (!bg) return "#000";
        const color = bg.substring(1);
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 150 ? "#000" : "#fff";
    };

    const columns = [
        { name: "SN", selector: (row) => row.sn, sortable: true, align: 'text-center' },
        { name: "Requisition No", selector: (row) => row.requisitionNumber, sortable: true, align: 'text-left' },
        { name: "Course", selector: (row) => row.courseName, sortable: true, align: 'text-left' },
        { name: "Organizer", selector: (row) => row.organizer, sortable: true, align: 'text-left' },
        { name: "Duration (Day)", selector: (row) => row.duration, sortable: true, align: 'text-center' },
        { name: "From Date", selector: (row) => row.fromDate, sortable: true, align: 'text-center' },
        { name: "To Date", selector: (row) => row.toDate, sortable: true, align: 'text-center' },
        { name: "Participant", selector: (row) => row.initiatingOfficer, sortable: true, align: 'text-left' },
        { name: "Designation", selector: (row) => row.designation, sortable: true, align: 'text-center' },
        { name: "Status", selector: (row) => row.status, sortable: true, align: 'text-left' },
        { name: "Action", selector: (row) => row.action, sortable: true, align: 'text-center' },
    ];

    const mappedData = () => {
        return requisitionList.map((item, index) => {

            const feedbackExists = feedbackList?.some(
                feedback => Number(feedback?.requisitionId) === Number(item?.requisitionId)
            );

            return {
                sn: index + 1,
                requisitionNumber: (
                    <button
                        className="btn btn-sm btn-outline-primary fw-semibold"
                        onClick={() => handlePreview(item)}
                    >
                        {item.requisitionNumber}
                    </button>
                ),
                courseName: item.courseName || "-",
                organizer: item.organizer || "-",
                duration: item.duration || "-",
                fromDate: item.fromDate ? format(new Date(item.fromDate), "dd-MM-yyyy") : "-",
                toDate: item.toDate ? format(new Date(item.toDate), "dd-MM-yyyy") : "-",
                initiatingOfficer: item.initiatingOfficerName || "-",
                designation: item.empDesigName || "-",
                status:
                    <span
                        className="status-badge-modern"
                        onClick={() => handleView(item)}
                        style={{
                            backgroundColor: item.statusColor || "#cceaff",
                            color: getTextColor(item.statusColor),
                            borderColor: item.statusColor || "#dee2e6"
                        }}
                    >
                        {item.statusName || "Unknown"}
                    </span>,
                action: (
                    <>
                        <Tooltip id="Tooltip" className='text-white' />

                        {canEdit &&
                            <>
                                {(item.status === 'AA' || item.status === 'REV'
                                    || item.status === 'RR' || item.status === 'RV') && (
                                        <>
                                            <button
                                                className="btn btn-sm btn-warning me-2"
                                                onClick={() => handleEdit(item)}
                                                data-tooltip-id="Tooltip"
                                                data-tooltip-content="Edit"
                                                data-tooltip-place="top"
                                            >
                                                <FaEdit className="fs-6" />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-primary me-2"
                                                onClick={() => handleForward(item)}
                                                data-tooltip-id="Tooltip"
                                                data-tooltip-content="Forward"
                                                data-tooltip-place="top"
                                            >
                                                <FaForward className="fs-6" />
                                            </button>
                                        </>
                                    )}

                                {Number(item.initiatingOfficer) === Number(empId) && item.status === 'AF' && (
                                    <button
                                        className="btn btn-sm btn-info me-2"
                                        onClick={() => handleRevoke(item)}
                                        data-tooltip-id="Tooltip"
                                        data-tooltip-content="Revoke"
                                        data-tooltip-place="top"
                                    >
                                        <FaArrowLeft className="fs-6" />
                                    </button>
                                )}

                                {Number(item.initiatingOfficer) === Number(empId) &&
                                    !feedbackExists && item.status === 'AV' && (
                                        <button
                                            className="btn btn-sm btn-secondary me-2"
                                            onClick={() => handleFeedbackClick(item)}
                                            data-tooltip-id="Tooltip"
                                            data-tooltip-content="Feedback"
                                            data-tooltip-place="top"
                                        >
                                            <MdFeedback className="fs-6" />
                                        </button>
                                    )}
                            </>
                        }

                        {canView && <button
                            className="print"
                            onClick={() => handlePrint(item)}
                            data-tooltip-id="Tooltip"
                            data-tooltip-content="Print"
                            data-tooltip-place="top"
                        >
                            <FaEye className="fs-6" />
                        </button>
                        }
                    </>
                )
            };
        });
    };

    const handlePreview = (item) => {
        setShowModal(true);
        setShowReqData(item);
    };

    const handleView = (item) => {
        const dto = {
            requisitionId: item.requisitionId,
            requisitionNumber: item.requisitionNumber,
            programName: item.programName,
            fromDate: item.fromDate,
            toDate: item.toDate
        }
        localStorage.setItem('transactionData', JSON.stringify(dto));
        window.open('/transaction', '_blank');
    }

    const handleAdd = () => {
        navigate("/req-add-edit");
    };

    const handleEdit = async (item) => {
        navigate("/req-add-edit", { state: { requisitionId: item.requisitionId } });
    };

    const handleFeedbackClick = (item) => {
        navigate("/feedback-add", { state: item });
    }

    const handlePrint = async (item) => {
        const response = await getRequisitionPrint(item.requisitionId);
        await RequisitionPrint(response?.data);
    };

    const handleForward = async (item) => {
        try {
            const dto = {
                ...item,
                actionBy: empId
            }

            const confirm = await AlertConfirmation({ title: "Are you sure to forward!", message: '' });
            if (!confirm) {
                return;
            }
            const response = await forwardRequisition(dto);
            if (response && response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                fetchRequisitions();
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        }
    };


    const handleRevoke = async (item) => {
        try {
            const dto = {
                ...item,
                actionBy: empId
            }

            const confirm = await AlertConfirmation({ title: "Are you sure to revoke!", message: '' });
            if (!confirm) {
                return;
            }
            const response = await revokeRequisition(dto);
            if (response && response.success) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.message,
                    showConfirmButton: false,
                    timer: 1500,
                });
                fetchRequisitions();
            } else {
                Swal.fire("Warning", response.message, "warning");
            }
        } catch (error) {
            Swal.fire("Warning", handleApiError(error), "warning");
        }
    };


    const freeSteps = ["Created by user", "Recommended by DH", "Verified By SA-HRT", "Approved by AD-HRT", "Approved By Director"];
    const [flowType, setFlowType] = useState("within");

    return (
        <div>
            <Navbar />

            <h3 className="fancy-heading mt-3">
                Requisition List
                <span className="underline-glow">
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                    <span className="pulse-dot"></span>
                </span>
            </h3>

            <div id="card-body" className="p-2 mt-2">
                {<Datatable columns={columns} data={mappedData()} />}
            </div>

            <div>
                {canAdd && <button
                    className="add"
                    onClick={handleAdd}>
                    ADD NEW
                </button>
                }
            </div>

            <div className="container-fluid mt-4">
                <div className="d-flex justify-content-end align-items-center mb-1 approval-header">

                    <div className="approval-tabs">
                        <button
                            className={`tab-btn ${flowType === "within" ? "active-tab" : ""}`}
                            onClick={() => setFlowType("within")}
                        >
                            Within Director's Power
                        </button>

                        <button
                            className={`tab-btn ${flowType === "beyond" ? "active-tab" : ""}`}
                            onClick={() => setFlowType("beyond")}
                        >
                            Beyond Director's Power
                        </button>
                    </div>
                </div>

                <div className="row g-4">
                    <div className="col-md-5">
                        <TrainingStepper
                            title="Free Training : Approval Flow"
                            steps={freeSteps}
                            currentStep={5}
                        />
                    </div>

                    <div className="col-md-7">
                        <PaidTrainingFlow
                            flowType={flowType}
                        />
                    </div>
                </div>
            </div>

            {showModal &&
                <RequisitionPreview
                    reqData={reqData}
                    setShowModal={setShowModal}
                />
            }

        </div>
    )
}

export default Requisition;