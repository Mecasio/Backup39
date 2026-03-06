import React, { useEffect, useState } from "react";
import { Box, Typography, TableContainer, Table, TableHead, TableRow, TableCell, Paper, Select, MenuItem, Button } from "@mui/material";
import API_BASE_URL from "../apiConfig";
import axios from "axios";

const SectionSlotMonitoring = () => {
    const [schoolYears, setSchoolYears] = useState([]);
    const [semesters, setSchoolSemester] = useState([]);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState('');
    const [selectedSchoolSemester, setSelectedSchoolSemester] = useState('');
    const [selectedActiveSchoolYear, setSelectedActiveSchoolYear] = useState('');
    const [department, setDepartment] = useState([]);
    const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState("");
    const [programs, setPrograms] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState("");
    const [yearLevels, setYearLevels] = useState([]);
    const [selectedYearLevel, setSelectedYearLevel] = useState("");
    const [campusFilter, setCampusFilter] = useState("1");
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [sections, setSections] = useState([]);
    const [selectedDepartmentSection, setSelectedDepartmentSection] = useState("");

    useEffect(() => {
        axios
            .get(`${API_BASE_URL}/get_school_year/`)
            .then((res) => setSchoolYears(res.data))
            .catch((err) => console.error(err));
    }, [])

    useEffect(() => {
        axios
            .get(`${API_BASE_URL}/get_school_semester/`)
            .then((res) => setSchoolSemester(res.data))
            .catch((err) => console.error(err));
    }, [])

    useEffect(() => {
        axios
            .get(`${API_BASE_URL}/get_year_level`)
            .then((res) => setYearLevels(res.data))
            .catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        axios
            .get(`${API_BASE_URL}/active_school_year`)
            .then((res) => {
                if (res.data.length > 0) {
                    setSelectedSchoolYear(res.data[0].year_id);
                    setSelectedSchoolSemester(res.data[0].semester_id);
                }
            })
            .catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        if (selectedSchoolYear && selectedSchoolSemester) {
            axios
                .get(`${API_BASE_URL}/get_selecterd_year/${selectedSchoolYear}/${selectedSchoolSemester}`)
                .then((res) => {
                    if (res.data.length > 0) {
                        setSelectedActiveSchoolYear(res.data[0].school_year_id);
                    }
                })
                .catch((err) => console.error(err));
        }
    }, [selectedSchoolYear, selectedSchoolSemester]);

    useEffect(() => {
        fetchDepartments();
    }, [])

    useEffect(() => {
        if (department.length > 0 && !selectedDepartmentFilter) {
            const firstDeptId = department[0].dprtmnt_id;
            setSelectedDepartmentFilter(firstDeptId);
            fetchPrograms(firstDeptId);
        }
    }, [department, selectedDepartmentFilter]);

    useEffect(() => {
        if (programs.length > 0 && !selectedProgram) {
            setSelectedProgram(programs[0].program_id);
        }
    }, [programs, selectedProgram]);

    useEffect(() => {
        if (yearLevels.length > 0 && !selectedYearLevel) {
            setSelectedYearLevel(yearLevels[0].year_level_id);
        }
    }, [yearLevels, selectedYearLevel]);

    const fetchDepartments = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/get_department`);
            setDepartment(res.data);
            console.log(res.data);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    const fetchDepartmentSections = async (departmentId) => {
        if (!departmentId) {
            setSections([]);
            return;
        }
        try {
            const response = await axios.get(`${API_BASE_URL}/api/department-sections`, {
                params: { departmentId },
            });
            setSections(response.data || []);
        } catch (err) {
            console.error("Error fetching department sections:", err);
            setSections([]);
        }
    };

    const fetchPrograms = async (dprtmnt_id) => {
        if (!dprtmnt_id) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/api/applied_program/${dprtmnt_id}`);
            setPrograms(res.data);
        } catch (err) {
            console.error("❌ Department fetch error:", err);
        }
    };

    const selectedProgramMeta = programs.find(
        (prog) => String(prog.program_id) === String(selectedProgram),
    );
    const selectedCurriculumId = selectedProgramMeta?.curriculum_id;

    useEffect(() => {
        fetchDepartmentSections(selectedDepartmentFilter);
    }, [selectedDepartmentFilter]);

    useEffect(() => {
        if (!selectedCurriculumId) {
            setCourses([]);
            setSelectedCourse("");
            return;
        }
        axios
            .get(`${API_BASE_URL}/courses/${selectedCurriculumId}`)
            .then((res) => setCourses(res.data || []))
            .catch((err) => {
                console.error(err);
                setCourses([]);
            });
    }, [selectedCurriculumId]);

    useEffect(() => {
        if (courses.length > 0 && !selectedCourse) {
            setSelectedCourse(courses[0].course_id);
        }
    }, [courses, selectedCourse]);

    const filteredSections = sections.filter((section) => {
        if (!selectedCurriculumId) return true;
        return String(section.curriculum_id) === String(selectedCurriculumId);
    });

    useEffect(() => {
        if (filteredSections.length > 0 && !selectedDepartmentSection) {
            setSelectedDepartmentSection(filteredSections[0].department_and_program_section_id);
        }
        if (filteredSections.length === 0) {
            setSelectedDepartmentSection("");
        }
    }, [filteredSections, selectedDepartmentSection]);

    const handleSchoolYearChange = (event) => {
        setSelectedSchoolYear(event.target.value);
    };

    const handleSchoolSemesterChange = (event) => {
        setSelectedSchoolSemester(event.target.value);
    };

    const handleCollegeChange = (e) => {
        const selectedId = e.target.value;

        setSelectedDepartmentFilter(selectedId);
        setSelectedProgram("");
        setPrograms([]);
        setCourses([]);
        setSelectedCourse("");
        setSections([]);
        setSelectedDepartmentSection("");
        fetchPrograms(selectedId);
        fetchDepartmentSections(selectedId);
    };

    return (
        <Box sx={{ height: "calc(100vh - 150px)", overflowY: "auto", paddingRight: 1, backgroundColor: "transparent", mt: 1, padding: 2 }}>
            <Typography
                variant="h4"
                sx={{
                    fontWeight: "bold",
                    color: "maroon", //titleColor
                    fontSize: "36px",
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                SLOT MONITORING
            </Typography>

            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />

            <TableContainer component={Paper} sx={{ width: '100%', border: `2px solid maroon`, }}>
                <Table>
                    <TableHead sx={{ backgroundColor: "maroon" }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', textAlign: "Center" }}>FILTER OPTIONS</TableCell>
                        </TableRow>
                    </TableHead>
                </Table>
            </TableContainer>

            <TableContainer component={Paper} sx={{ width: '100%', border: `2px solid maroon`, }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ display: "flex", alignItems: "center", gap: "1rem", justifyContent: "space-between", borderBottom: "none" }}>
                                <Box>
                                    <Box sx={{ textAlign: "Center", display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <Typography sx={{ width: "100px", textAlign: "left" }}>
                                            Campus:
                                        </Typography>
                                        <Select
                                            name="campus"
                                            value={campusFilter}
                                            onChange={(e) => setCampusFilter(e.target.value)}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        marginTop: "8px"
                                                    },
                                                },
                                            }}
                                            sx={{ width: "200px", textAlign: "left" }}
                                        >
                                            <MenuItem value={1}>Manila</MenuItem>
                                            <MenuItem value={2}>Cavite</MenuItem>
                                        </Select>
                                    </Box>

                                    <Box sx={{ textAlign: "Center", display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
                                        <Typography sx={{ width: "100px", textAlign: "left" }}>
                                            Year Level:
                                        </Typography>
                                        <Select
                                            name="yearLevel"
                                            value={selectedYearLevel}
                                            onChange={(e) => setSelectedYearLevel(e.target.value)}
                                            sx={{ width: "200px", textAlign: "left" }}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        maxHeight: 410,
                                                        marginTop: "8px"
                                                    },
                                                },
                                            }}
                                        >
                                            {yearLevels.map((yl) => (
                                                <MenuItem key={yl.year_level_id} value={yl.year_level_id}>
                                                    {yl.year_level_description}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Box>
                                </Box>

                                <Box>
                                    <Box sx={{ textAlign: "Center", display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <Typography sx={{ width: "100px", textAlign: "left" }}>
                                            Course:
                                        </Typography>
                                        <Select
                                            name="course"
                                            value={selectedCourse}
                                            onChange={(e) => setSelectedCourse(e.target.value)}
                                            sx={{ width: "230px", textAlign: "left" }}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        marginTop: "8px",
                                                        height: "265px"
                                                    },
                                                },
                                            }}
                                        >
                                            {courses.map((course) => (
                                                <MenuItem key={course.course_id} value={course.course_id}>
                                                    {course.course_code} - {course.course_description}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Box>
                                    <Box sx={{ textAlign: "Center", display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
                                        <Typography sx={{ width: "100px", textAlign: "left" }}>
                                            Section:
                                        </Typography>
                                        <Select
                                            name="departmentSection"
                                            value={selectedDepartmentSection}
                                            onChange={(e) => setSelectedDepartmentSection(e.target.value)}
                                            sx={{ width: "230px", textAlign: "left" }}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        maxHeight: 410,
                                                        marginTop: "8px"
                                                    },
                                                },
                                            }}
                                        >
                                            {filteredSections.map((section) => (
                                                <MenuItem
                                                    key={section.department_and_program_section_id}
                                                    value={section.department_and_program_section_id}
                                                >
                                                    ({section.program_code}) - {section.description}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Box>
                                </Box>

                                <Box>
                                    <Box sx={{ textAlign: "Center", display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <Typography sx={{ width: "100px", textAlign: "left" }}>
                                            College:
                                        </Typography>
                                        <Select
                                            name="college"
                                            value={selectedDepartmentFilter}
                                            onChange={handleCollegeChange}
                                            sx={{ width: "485px", textAlign: "left" }}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        marginTop: "8px",
                                                        height: "265px"
                                                    },
                                                },
                                            }}
                                        >
                                            {department.map((dep) => (
                                                <MenuItem key={dep.dprtmnt_id} value={dep.dprtmnt_id}>
                                                    {dep.dprtmnt_name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Box>
                                    <Box sx={{ textAlign: "Center", display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
                                        <Typography sx={{ width: "100px", textAlign: "left" }}>
                                            Program:
                                        </Typography>
                                        <Select
                                            name="program"
                                            value={selectedProgram}
                                            onChange={(e) => setSelectedProgram(e.target.value)}
                                            sx={{ width: "485px", textAlign: "left" }}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        maxHeight: 410,
                                                        marginTop: "8px"
                                                    },
                                                },
                                            }}
                                        >
                                            {programs.map((prog) => (
                                                <MenuItem key={prog.program_id} value={prog.program_id}>
                                                    {prog.program_description} {prog.major}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Box>
                                </Box>

                                <Box>
                                    <Box sx={{ textAlign: "Center", display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <Typography sx={{ width: "100px", textAlign: "left" }}>
                                            School Year:
                                        </Typography>
                                        <Select
                                            name="schoolYear"
                                            value={selectedSchoolYear}
                                            onChange={handleSchoolYearChange}
                                            sx={{ width: "200px", textAlign: "left" }}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        maxHeight: 410,
                                                        marginTop: "8px"
                                                    },
                                                },
                                            }}
                                        >
                                            {schoolYears.map((sy) => (
                                                <MenuItem key={sy.year_id} value={sy.year_id}>
                                                    {sy.current_year}-{sy.next_year}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Box>
                                    <Box sx={{ textAlign: "Center", display: "flex", alignItems: "center", gap: "1rem", marginTop: "1rem" }}>
                                        <Typography sx={{ width: "100px", textAlign: "left" }}>
                                            Semester:
                                        </Typography>
                                        <Select
                                            name="semester"
                                            value={selectedSchoolSemester}
                                            onChange={handleSchoolSemesterChange}
                                            sx={{ width: "200px", textAlign: "left" }}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        maxHeight: 410,
                                                        marginTop: "8px"
                                                    },
                                                },
                                            }}
                                        >
                                            {semesters.map((sem) => (
                                                <MenuItem key={sem.semester_id} value={sem.semester_id}>
                                                    {sem.semester_description}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Box>
                                </Box>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell sx={{ display: "flex", alignItems: "center", gap: "1rem", border: "none", justifyContent: "end"}}>
                                <Button sx={{backgroundColor: "maroon", color: "white"}}>Actual Size</Button>
                                <Button sx={{backgroundColor: "maroon", color: "white"}}>List of Subjects</Button>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                </Table>
            </TableContainer>
        </Box>
    )
}

export default SectionSlotMonitoring;
