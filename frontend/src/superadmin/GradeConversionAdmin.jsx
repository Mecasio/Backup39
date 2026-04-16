import React, { useState, useEffect, useContext } from "react";
import { SettingsContext } from "../App";
import axios from "axios";
import {
    Box, Button, TextField, Table, TableHead, TableRow,
    TableCell, TableBody, MenuItem,
    TableContainer,
    Paper, Typography
} from "@mui/material";
import API_BASE_URL from "../apiConfig"
import Unauthorized from "../components/Unauthorized";
import LoadingOverlay from "../components/LoadingOverlay";
import EaristLogo from "../assets/EaristLogo.png";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const GradeConversionAdmin = () => {
    const settings = useContext(SettingsContext);

    const [titleColor, setTitleColor] = useState("#000000");
    const [subtitleColor, setSubtitleColor] = useState("#555555");
    const [borderColor, setBorderColor] = useState("#000000");
    const [mainButtonColor, setMainButtonColor] = useState("#1976d2");
    const [subButtonColor, setSubButtonColor] = useState("#ffffff"); // ✅ NEW
    const [stepperColor, setStepperColor] = useState("#000000"); // ✅ NEW

    const [fetchedLogo, setFetchedLogo] = useState(null);
    const [companyName, setCompanyName] = useState("");
    const [shortTerm, setShortTerm] = useState("");
    const [campusAddress, setCampusAddress] = useState("");
    const [branches, setBranches] = useState([]);

    useEffect(() => {
        if (!settings) return;

        // 🎨 Colors
        if (settings.title_color) setTitleColor(settings.title_color);
        if (settings.subtitle_color) setSubtitleColor(settings.subtitle_color);
        if (settings.border_color) setBorderColor(settings.border_color);
        if (settings.main_button_color)
            setMainButtonColor(settings.main_button_color);
        if (settings.sub_button_color) setSubButtonColor(settings.sub_button_color);
        if (settings.stepper_color) setStepperColor(settings.stepper_color);

        // 🏫 Logo
        if (settings.logo_url) {
            setFetchedLogo(`${API_BASE_URL}${settings.logo_url}`);
        } else {
            setFetchedLogo(EaristLogo);
        }

        // 🏷️ School Info
        if (settings.company_name) setCompanyName(settings.company_name);
        if (settings.short_term) setShortTerm(settings.short_term);
        if (settings.campus_address) setCampusAddress(settings.campus_address);

        // ✅ Branches (JSON stored in DB)
        if (settings?.branches) {
            try {
                const parsed =
                    typeof settings.branches === "string"
                        ? JSON.parse(settings.branches)
                        : settings.branches;

                setBranches(parsed);
            } catch (err) {
                console.error("Failed to parse branches:", err);
                setBranches([]);
            }
        }
    }, [settings]);



    const [userID, setUserID] = useState("");
    const [user, setUser] = useState("");
    const [userRole, setUserRole] = useState("");
    const [hasAccess, setHasAccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const pageId = 144;

    const [employeeID, setEmployeeID] = useState("");

    useEffect(() => {

        const storedUser = localStorage.getItem("email");
        const storedRole = localStorage.getItem("role");
        const storedID = localStorage.getItem("person_id");
        const storedEmployeeID = localStorage.getItem("employee_id");

        if (storedUser && storedRole && storedID) {
            setUser(storedUser);
            setUserRole(storedRole);
            setUserID(storedID);
            setEmployeeID(storedEmployeeID);

            if (storedRole === "registrar") {
                checkAccess(storedEmployeeID);
            } else {
                window.location.href = "/login";
            }
        } else {
            window.location.href = "/login";
        }
    }, []);

    const checkAccess = async (employeeID) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/page_access/${employeeID}/${pageId}`);
            if (response.data && response.data.page_privilege === 1) {
                setHasAccess(true);
            } else {
                setHasAccess(false);
            }
        } catch (error) {
            console.error('Error checking access:', error);
            setHasAccess(false);
            if (error.response && error.response.data.message) {
                console.log(error.response.data.message);
            } else {
                console.log("An unexpected error occurred.");
            }
            setLoading(false);
        }
    };

    const [rows, setRows] = useState([]);
    const [form, setForm] = useState({
        id: null,
        min_score: "",
        max_score: "",
        equivalent_grade: "",
        descriptive_rating: "" // ✅ ADD THIS
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/admin/grade-conversion`);
            setRows(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (hasAccess) {
            fetchData();
        }
    }, [hasAccess]);


    const handleSave = async () => {
        try {
            await axios.post(`${API_BASE_URL}/admin/grade-conversion`, form);
            setForm({
                id: null,
                min_score: "",
                max_score: "",
                equivalent_grade: "",
                descriptive_rating: "" // ✅ ADD THIS
            });
            fetchData();
        } catch (err) {
            console.error(err);
            alert("Save failed");
        }
    };

    const handleEdit = (row) => setForm(row);

    const handleDelete = async (id) => {
        await axios.delete(`${API_BASE_URL}/admin/grade-conversion/${id}`);
        fetchData();

    };


    const [honors, setHonors] = useState([]);
    const [honorForm, setHonorForm] = useState({
        id: null,
        title: "",
        min_grade: "",
        max_allowed_grade: "",
        type: "semester"
    });
    const fetchHonors = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/admin/honors-rules`);
            setHonors(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (hasAccess) {
            fetchData();
            fetchHonors(); // 🔥 ADD THIS
        }
    }, [hasAccess]);


    const handleSaveHonor = async () => {
        try {
            await axios.post(`${API_BASE_URL}/admin/honors-rules`, honorForm);
            setHonorForm({
                id: null,
                title: "",
                min_grade: "",
                max_allowed_grade: "",
                type: "semester"
            });
            fetchHonors();
        } catch (err) {
            alert("Save failed");
        }
    };

    const handleDeleteHonor = async (id) => {
        await axios.delete(`${API_BASE_URL}/admin/honors-rules/${id}`);
        fetchHonors();
    };


    if (loading || hasAccess === null) {
        return <LoadingOverlay open={loading} message="Loading..." />;
    }

    if (!hasAccess) {
        return <Unauthorized />;
    }


    return (
        <Box sx={{ height: "calc(100vh - 150px)", overflowY: "auto", paddingRight: 1, backgroundColor: "transparent", mt: 1, padding: 2 }}>
            <Typography
                variant="h4"
                sx={{
                    fontWeight: "bold",
                    color: titleColor,
                    fontSize: "36px",
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                GRADE MANAGEMENT / ACADEMIC'S AWARD
            </Typography>

            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />
            <br />



            {/* GRADE CONVERSION CARD */}
            <Box sx={{
                p: 3,
                mb: 4,

                borderRadius: 3,
                boxShadow: 3,
                border: `1px solid ${borderColor}`
            }}>
                <h3>Grade Conversion</h3>

                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <TextField label="Min Score" size="small"
                        value={form.min_score}
                        onChange={(e) => setForm({ ...form, min_score: e.target.value })}
                    />
                    <TextField label="Max Score" size="small"
                        value={form.max_score}
                        onChange={(e) => setForm({ ...form, max_score: e.target.value })}
                    />
                    <TextField label="Equivalent Grade" size="small"
                        value={form.equivalent_grade}
                        onChange={(e) => setForm({ ...form, equivalent_grade: e.target.value })}
                    />
                    <TextField label="Descriptive Rating" size="small"
                        value={form.descriptive_rating}
                        onChange={(e) => setForm({ ...form, descriptive_rating: e.target.value })}
                    />


                    <Button variant="contained" onClick={handleSave}>
                        {form.id ? "Update" : "Add"}
                    </Button>
                </Box>

                <Table size="small">
                    <TableHead sx={{
                        py: 0.5,
                        backgroundColor: settings?.header_color || "#1976d2",
                        color: "white",
                    }}>
                        <TableRow >
                            <TableCell sx={{
                                color: "white",
                                textAlign: "center",
                                width: "2%",
                                py: 0.5,
                                fontSize: "12px",
                                border: `1px solid ${borderColor}`,
                            }}>Min</TableCell>
                            <TableCell sx={{
                                color: "white",
                                textAlign: "center",
                                width: "2%",
                                py: 0.5,
                                fontSize: "12px",
                                border: `1px solid ${borderColor}`,
                            }}>Max</TableCell>
                            <TableCell sx={{
                                color: "white",
                                textAlign: "center",
                                width: "2%",
                                py: 0.5,
                                fontSize: "12px",
                                border: `1px solid ${borderColor}`,
                            }}>Equivalent</TableCell>
                            <TableCell sx={{
                                color: "white",
                                textAlign: "center",
                                width: "2%",
                                py: 0.5,
                                fontSize: "12px",
                                border: `1px solid ${borderColor}`,
                            }}>Descriptive</TableCell>
                            <TableCell sx={{
                                color: "white",
                                textAlign: "center",
                                width: "2%",
                                py: 0.5,
                                fontSize: "12px",
                                border: `1px solid ${borderColor}`,
                            }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {rows.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell sx={{
                                    textAlign: "center",
                                    border: `1px solid ${borderColor}`,
                                }}>{row.min_score}</TableCell>
                                <TableCell sx={{
                                    textAlign: "center",
                                    border: `1px solid ${borderColor}`,
                                }}>{row.max_score}</TableCell>
                                <TableCell sx={{
                                    textAlign: "center",
                                    border: `1px solid ${borderColor}`,
                                }}>{row.equivalent_grade}</TableCell>
                                <TableCell sx={{
                                    textAlign: "center",
                                    border: `1px solid ${borderColor}`,
                                }}>{row.descriptive_rating}</TableCell>
                                <TableCell
                                    sx={{
                                        border: `1px solid ${borderColor}`,
                                        padding: "8px 12px",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center", // keeps both in the middle
                                            alignItems: "center",
                                            gap: 1, // space between buttons
                                        }}
                                    >
                                        <Button
                                            variant="contained"
                                            size="small"
                                            sx={{
                                                backgroundColor: "green",
                                                color: "white",
                                                borderRadius: "5px",
                                                padding: "8px 14px",
                                                width: "100px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "5px",
                                            }}
                                            onClick={() => handleEdit(row)}
                                        >
                                            <EditIcon fontSize="small" /> Edit
                                        </Button>

                                        <Button
                                            variant="contained"
                                            size="small"
                                            sx={{
                                                backgroundColor: "#9E0000",
                                                color: "white",
                                                borderRadius: "5px",
                                                padding: "8px 14px",
                                                width: "100px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "5px",
                                            }}
                                            onClick={() => handleDelete(row.id)}
                                        >
                                            <DeleteIcon fontSize="small" /> Delete
                                        </Button>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>

            {/* HONORS RULES CARD */}
            <Box sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: 3,
                border: `1px solid ${borderColor}`
            }}>
                <h3>Honors Rules</h3>

                <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <TextField label="Title (e.g. Dean Lister)" size="small"
                        value={honorForm.title}
                        onChange={(e) => setHonorForm({ ...honorForm, title: e.target.value })}
                    />

                    <TextField label="Max Allowed Grade" size="small"
                        value={honorForm.max_allowed_grade}
                        onChange={(e) => setHonorForm({ ...honorForm, max_allowed_grade: e.target.value })}
                    />
                    <TextField
                        label="Min Grade (for Latin Honors)"
                        size="small"
                        value={honorForm.min_grade}
                        onChange={(e) =>
                            setHonorForm({ ...honorForm, min_grade: e.target.value })
                        }
                    />

                    <TextField
                        label="Max Grade"
                        size="small"
                        value={honorForm.max_allowed_grade}
                        onChange={(e) =>
                            setHonorForm({ ...honorForm, max_allowed_grade: e.target.value })
                        }
                    />

                    <TextField
                        select
                        label="Type"
                        size="small"
                        value={honorForm.type}
                        onChange={(e) =>
                            setHonorForm({ ...honorForm, type: e.target.value })
                        }
                    >
                        <MenuItem value="semester">Semester</MenuItem>
                        <MenuItem value="graduation">Graduation</MenuItem>
                    </TextField>

                    <Button variant="contained" onClick={handleSaveHonor}>
                        {honorForm.id ? "Update" : "Add"}
                    </Button>
                </Box>

                <Table size="small">
                    <TableHead sx={{
                        py: 0.5,
                        backgroundColor: settings?.header_color || "#1976d2",
                        color: "white",
                    }}>
                        <TableRow>
                            <TableCell sx={{
                                color: "white",
                                textAlign: "center",
                                width: "2%",
                                py: 0.5,
                                fontSize: "12px",
                                border: `1px solid ${borderColor}`,
                            }}>Title</TableCell>
                            <TableCell sx={{
                                color: "white",
                                textAlign: "center",
                                width: "2%",
                                py: 0.5,
                                fontSize: "12px",
                                border: `1px solid ${borderColor}`,
                            }}>Max Grade</TableCell>
                            <TableCell sx={{
                                color: "white",
                                textAlign: "center",
                                width: "2%",
                                py: 0.5,
                                fontSize: "12px",
                                border: `1px solid ${borderColor}`,
                            }}>Min</TableCell>
                            <TableCell sx={{
                                color: "white",
                                textAlign: "center",
                                width: "2%",
                                py: 0.5,
                                fontSize: "12px",
                                border: `1px solid ${borderColor}`,
                            }}>Type</TableCell>
                            <TableCell sx={{
                                color: "white",
                                textAlign: "center",
                                width: "2%",
                                py: 0.5,
                                fontSize: "12px",
                                border: `1px solid ${borderColor}`,
                            }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {honors.map((row) => (
                            <TableRow key={row.id}>
                                <TableCell sx={{
                                    textAlign: "center",
                                    border: `1px solid ${borderColor}`,
                                }}>{row.title}</TableCell>
                                <TableCell sx={{
                                    textAlign: "center",
                                    border: `1px solid ${borderColor}`,
                                }}>{row.max_allowed_grade}</TableCell>
                                <TableCell sx={{
                                    textAlign: "center",
                                    border: `1px solid ${borderColor}`,
                                }}>{row.min_grade}</TableCell>
                                <TableCell sx={{
                                    textAlign: "center",
                                    border: `1px solid ${borderColor}`,
                                }}>{row.type}</TableCell>
                                <TableCell
                                    sx={{
                                        border: `1px solid ${borderColor}`,
                                        padding: "8px 12px",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            gap: 1,
                                            width: "100%",
                                        }}
                                    >
                                        <Button
                                            variant="contained"
                                            size="small"
                                            sx={{
                                                backgroundColor: "green",
                                                color: "white",
                                                borderRadius: "5px",
                                                padding: "8px 14px",
                                                width: "100px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "5px",
                                            }}
                                            onClick={() => setHonorForm(row)}
                                        >
                                            <EditIcon fontSize="small" /> Edit
                                        </Button>

                                        <Button
                                            variant="contained"
                                            size="small"
                                            sx={{
                                                backgroundColor: "#9E0000",
                                                color: "white",
                                                borderRadius: "5px",
                                                padding: "8px 14px",
                                                width: "100px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: "5px",
                                            }}
                                            onClick={() => handleDeleteHonor(row.id)}
                                        >
                                            <DeleteIcon fontSize="small" /> Delete
                                        </Button>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>

        </Box>
    );
};

export default GradeConversionAdmin;
