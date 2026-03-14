import { useEffect, useState } from "react";
import Navbar from "../navbar/Navbar";
import { getCourseDashboardCount, getRequisitionDashboardCount } from "../../service/dashboard.service";
import "./dashboard.css";
import { BiSolidBookmarkStar } from "react-icons/bi";
import { FaBookReader, FaCheckCircle, FaClock, FaDatabase, FaList, FaShare, FaThumbsUp, FaUniversity } from "react-icons/fa";

export const getCurrentFinancialYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    if (month >= 4) {
        return `${year}-${year + 1}`;
    } else {
        return `${year - 1}-${year}`;
    }
};

export const generateFinancialYears = () => {
    const years = [];
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < 6; i++) {
        const start = currentYear - i;
        years.push(`${start}-${start + 1}`);
    }

    return years;
};

const Dashboard = () => {

    const [financialYear, setFinancialYear] = useState(getCurrentFinancialYear());
    const [courseData, setCourseData] = useState([]);
    const [requisitionData, setRequisitionData] = useState([]);

    const financialYears = generateFinancialYears();

    useEffect(() => {
        fetchCourseDashboard();
        fetchReqDashboard();
    }, [financialYear]);

    const fetchCourseDashboard = async () => {

        const [start, end] = financialYear.split("-");

        const startDate = `${start}-04-01`;
        const endDate = `${end}-03-31`;

        const res = await getCourseDashboardCount(startDate, endDate);
        setCourseData(res);
    };

    const fetchReqDashboard = async () => {

        const [start, end] = financialYear.split("-");

        const startDate = `${start}-04-01`;
        const endDate = `${end}-03-31`;

        const res = await getRequisitionDashboardCount(startDate, endDate);
        setRequisitionData(res);
    };

    return (
        <div>
            <Navbar />

            <div className="dashboard-container container mt-4">

                {/* HEADER */}
                <div className="dashboard-header d-flex justify-content-between align-items-center mb-4">

                    <h4 className="dashboard-title">
                        Training Dashboard
                    </h4>

                    <select
                        className="form-select dashboard-select"
                        value={financialYear}
                        onChange={(e) => setFinancialYear(e.target.value)}
                    >
                        {financialYears.map((fy) => (
                            <option key={fy} value={fy}>
                                FY {fy}
                            </option>
                        ))}
                    </select>

                </div>


                {/* ================= COURSE DASHBOARD ================= */}

                <div className="dashboard-section">

                    <h5 className="section-title">
                        <FaBookReader className="me-2" />
                        Organizer Wise Courses
                    </h5>

                    <div className="row g-4">

                        {courseData.length > 0 ? (

                            courseData.map((item) => (

                                <div className="col-xl-3 col-lg-4 col-md-6" key={item.organizerId}>

                                    <div className="dashboard-card course-card">
                                        <div className="card-body text-center">

                                            <div className="dashboard-icon">
                                                <BiSolidBookmarkStar />
                                            </div>

                                            <h6 className="dashboard-label">
                                                {item.organizerName}
                                            </h6>

                                            <h2 className="dashboard-count">
                                                {item.courseCount}
                                            </h2>

                                            <p className="dashboard-subtext">
                                                Total Courses
                                            </p>

                                        </div>
                                    </div>

                                </div>

                            ))

                        ) : (

                            <div className="no-data-container">
                                <FaDatabase className="no-data-icon" />
                                <p>No Courses Available</p>
                            </div>

                        )}

                    </div>

                </div>


                {/* ================= REQUISITION DASHBOARD ================= */}

                <div className="dashboard-section mt-5">

                    <h5 className="section-title">
                        <FaUniversity className="me-2" /> Organizer Wise Requisitions
                    </h5>

                    <div className="requisition-table-wrapper">

                        <table className="table requisition-table">

                            <thead>

                                <tr>

                                    <th>Organizer</th>

                                    <th>
                                        <FaList className="me-1" /> Total
                                    </th>

                                    <th>
                                        <FaClock className="me-1" /> Pending
                                    </th>

                                    <th>
                                        <FaShare className="me-1" /> Forwarded
                                    </th>

                                    <th>
                                        <FaThumbsUp className="me-1" /> Recommended
                                    </th>

                                    <th>
                                        <FaCheckCircle className="me-1" /> Approved
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {requisitionData.length > 0 ? (

                                    requisitionData.map((item, index) => (

                                        <tr
                                            key={item.organizerId}
                                            style={{ animationDelay: `${index * 0.08}s` }}
                                            className="table-row-animate"
                                        >

                                            <td className="org-name text-center">
                                                {item.organizerName}
                                            </td>

                                            <td className="text-center">
                                                <span className="badge badge-total">{item.total}</span>
                                            </td>

                                            <td className="text-center">
                                                <span className="badge badge-pending">{item.pending}</span>
                                            </td>

                                            <td className="text-center">
                                                <span className="badge badge-forwarded">{item.forwarded}</span>
                                            </td>

                                            <td className="text-center">
                                                <span className="badge badge-recommended">{item.recommended}</span>
                                            </td>

                                            <td className="text-center">
                                                <span className="badge badge-approved">{item.approved}</span>
                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>
                                        <td colSpan="6">
                                            <div className="no-data-container">
                                                <FaDatabase className="no-data-icon" />
                                                <p>No Requisition Data Available</p>
                                            </div>
                                        </td>
                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>
    )
}

export default Dashboard;