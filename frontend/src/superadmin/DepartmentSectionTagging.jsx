import React, { useState, useEffect, useContext } from "react";
import { SettingsContext } from "../App";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Chip,
  Divider,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  Search as SearchIcon,
  PersonAdd as EnrollIcon,
  PersonRemove as UnenrollIcon,
  GroupAdd as EnrollAllIcon,
  GroupRemove as UnenrollAllIcon,
  CheckCircle as EnrolledIcon,
} from "@mui/icons-material";
import API_BASE_URL from "../apiConfig";
import Unauthorized from "../components/Unauthorized";
import LoadingOverlay from "../components/LoadingOverlay";

const DepartmentSectionTagging = () => {
  const settings = useContext(SettingsContext);

  // ── Theme ─────────────────────────────────────────────────────────────────
  const [mainButtonColor, setMainButtonColor] = useState("#1976d2");
  const [headerColor,     setHeaderColor]     = useState("#1976d2");
  const [borderColor,     setBorderColor]     = useState("#c8d8f0");
  const [titleColor,      setTitleColor]      = useState("#1976d2");

  useEffect(() => {
    if (!settings) return;
    if (settings.main_button_color) setMainButtonColor(settings.main_button_color);
    if (settings.header_color)      setHeaderColor(settings.header_color);
    if (settings.border_color)      setBorderColor(settings.border_color);
    if (settings.title_color)       setTitleColor(settings.title_color);
  }, [settings]);

  // ── Auth / access ─────────────────────────────────────────────────────────
  const [hasAccess,  setHasAccess]  = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [employeeID, setEmployeeID] = useState("");
  const pageId = 121; // update to correct page id

  useEffect(() => {
    const storedRole       = localStorage.getItem("role");
    const storedID         = localStorage.getItem("person_id");
    const storedEmployeeID = localStorage.getItem("employee_id");

    if (storedRole && storedID) {
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

  const checkAccess = async (empID) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/page_access/${empID}/${pageId}`);
      setHasAccess(res.data?.page_privilege === 1);
    } catch {
      setHasAccess(false);
    }
  };

  // ── Dropdown data ─────────────────────────────────────────────────────────
  const [departments,       setDepartments]       = useState([]);
  const [allCurriculums,    setAllCurriculums]    = useState([]); // full list, filtered client-side
  const [filteredCurriculums, setFilteredCurriculums] = useState([]);
  const [departmentSections,  setDepartmentSections]  = useState([]);
  const [schoolYears,         setSchoolYears]         = useState([]);
  const [semesters,           setSemesters]           = useState([]);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCurriculum, setSelectedCurriculum] = useState("");
  const [selectedSection,    setSelectedSection]    = useState("");
  const [selectedYear,       setSelectedYear]       = useState("");
  const [selectedSemester,   setSelectedSemester]   = useState("");

  // ── Load all dropdowns once on mount ─────────────────────────────────────
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [deptRes, currRes, secRes, yrRes, semRes, activeRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/get_department`),
          axios.get(`${API_BASE_URL}/api/applied_program`).catch(() => ({ data: [] })),
          axios.get(`${API_BASE_URL}/department_section`),
          axios.get(`${API_BASE_URL}/get_school_year`),
          axios.get(`${API_BASE_URL}/get_school_semester`),
          axios.get(`${API_BASE_URL}/active_school_year`),
        ]);

        const depts = deptRes.data || [];
        const currs = Array.isArray(currRes.data) ? currRes.data : [];
        const secs  = secRes.data || [];
        const yrs   = yrRes.data || [];
        const sems  = semRes.data || [];

        setDepartments(depts);
        setAllCurriculums(currs);
        setDepartmentSections(secs);
        setSchoolYears(yrs);
        setSemesters(sems);

        // Pre-select active school year/semester
        if (activeRes.data?.length > 0) {
          const active = activeRes.data[0];
          setSelectedYear(active.year_id);
          setSelectedSemester(active.semester_id);
        }

        // Pre-select first department
        if (depts.length > 0) {
          const firstDept = String(depts[0].dprtmnt_id ?? depts[0].id ?? "");
          setSelectedDepartment(firstDept);
        }
      } catch (err) {
        console.error("Failed to fetch dropdowns:", err);
      }
    };
    fetchDropdowns();
  }, []);

  // ── Filter curriculums when department changes ────────────────────────────
  useEffect(() => {
    if (!selectedDepartment) {
      setFilteredCurriculums([]);
      setSelectedCurriculum("");
      return;
    }

    const filtered = allCurriculums.filter(
      (c) => String(c.dprtmnt_id) === String(selectedDepartment)
    );
    setFilteredCurriculums(filtered);

    // Auto-select first curriculum
    if (filtered.length > 0) {
      setSelectedCurriculum(String(filtered[0].curriculum_id ?? ""));
    } else {
      setSelectedCurriculum("");
    }
  }, [selectedDepartment, allCurriculums]);

  // ── Filter sections when curriculum changes ───────────────────────────────
  // Sections are filtered by matching curriculum_id in department_section records
  const filteredSections = departmentSections.filter(
    (s) => String(s.curriculum_id) === String(selectedCurriculum)
  );

  // Auto-select first section when filtered list changes
  useEffect(() => {
    if (filteredSections.length > 0) {
      setSelectedSection(String(filteredSections[0].department_section_id ?? ""));
    } else {
      setSelectedSection("");
    }
  }, [selectedCurriculum]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Resolve active_school_year_id ─────────────────────────────────────────
  const [activeSYID, setActiveSYID] = useState("");

  useEffect(() => {
    if (!selectedYear || !selectedSemester) return;
    axios
      .get(`${API_BASE_URL}/get_selecterd_year/${selectedYear}/${selectedSemester}`)
      .then((res) => {
        if (res.data?.length > 0) setActiveSYID(res.data[0].school_year_id);
      })
      .catch(() => {});
  }, [selectedYear, selectedSemester]);

  // ── Table data ────────────────────────────────────────────────────────────
  // allCurriculumStudents — full student list, never filtered out of left panel
  const [allCurriculumStudents, setAllCurriculumStudents] = useState([]);
  const [enrolledStudents,      setEnrolledStudents]      = useState([]);
  // enrolledNumbers — Set<string> for O(1) button state lookup
  const [enrolledNumbers,       setEnrolledNumbers]       = useState(new Set());

  const [searched,  setSearched]  = useState(false);
  const [searching, setSearching] = useState(false);

  // ── Fetch all students under the curriculum ───────────────────────────────
  const fetchCurriculumStudents = async () => {
    const res = await axios.get(`${API_BASE_URL}/get_student_per_curriculum`, {
      params: {
        curriculum_id:        selectedCurriculum,
        active_school_year_id: activeSYID,
      },
    });
    setAllCurriculumStudents(Array.isArray(res.data) ? res.data : []);
  };

  // ── Fetch already-enrolled students — right panel + enrolledNumbers set ───
  // Backend may return 404 when none enrolled — treat as empty
  const fetchEnrolledStudents = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get_student_already_tagged`, {
        params: {
          curriculum_id:        selectedCurriculum,
          active_school_year_id: activeSYID,
        },
      });
      const enrolled = Array.isArray(res.data) ? res.data : [];
      setEnrolledStudents(enrolled);
      setEnrolledNumbers(new Set(enrolled.map((s) => String(s.student_number))));
    } catch (err) {
      if (err.response?.status === 404) {
        setEnrolledStudents([]);
        setEnrolledNumbers(new Set());
      } else {
        console.error("Failed to fetch enrolled students:", err);
      }
    }
  };

  // ── Fetch both panels — used after bulk actions ───────────────────────────
  const fetchBothPanels = async () => {
    await Promise.all([
      fetchCurriculumStudents(),
      fetchEnrolledStudents(),
    ]);
  };

  // ── Search — fetch both panels so enrolled students show immediately ───────
  const handleSearch = async () => {
    if (!selectedCurriculum || !activeSYID) {
      setSnackbar({
        open: true,
        message: "Please select all filters before searching.",
        severity: "warning",
      });
      return;
    }
    setSearching(true);
    try {
      await Promise.all([
        fetchCurriculumStudents(),
        fetchEnrolledStudents(),
      ]);
      setSearched(true);
    } catch (err) {
      console.error("Search error:", err);
      setSnackbar({
        open: true,
        message: "Failed to fetch students.",
        severity: "error",
      });
    } finally {
      setSearching(false);
    }
  };

  // ── Enroll / Unenroll ─────────────────────────────────────────────────────
  const [actionLoading, setActionLoading] = useState(false);

  const getEnrollMeta = () => ({
    curriculum_id:        selectedCurriculum,
    active_school_year_id: activeSYID,
    department_section_id: selectedSection,
  });

  // ── Enroll All ────────────────────────────────────────────────────────────
  const handleEnrollAll = async () => {
    if (!selectedSection) {
      setSnackbar({
        open: true,
        message: "Please select a section before enrolling.",
        severity: "warning",
      });
      return;
    }
    setActionLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/enrolled_student_in_section`, getEnrollMeta());
      setSnackbar({
        open: true,
        message: "All students enrolled successfully.",
        severity: "success",
      });
      await fetchBothPanels();
    } catch (err) {
      setSnackbar({ open: true, message: "Enroll all failed.", severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  // ── Unenroll All ──────────────────────────────────────────────────────────
  const handleUnenrollAll = async () => {
    if (!selectedSection) {
      setSnackbar({
        open: true,
        message: "Please select a section before unenrolling.",
        severity: "warning",
      });
      return;
    }
    setActionLoading(true);
    try {
      await axios.put(`${API_BASE_URL}/unenrolled_student_in_section`, getEnrollMeta());
      setSnackbar({
        open: true,
        message: "All students unenrolled successfully.",
        severity: "success",
      });
      await fetchBothPanels();
    } catch (err) {
      setSnackbar({ open: true, message: "Unenroll all failed.", severity: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  // ── Enroll Single — only refreshes enrolled panel ─────────────────────────
  const handleEnrollSingle = async (studentNumber) => {
    if (!selectedSection) {
      setSnackbar({
        open: true,
        message: "Please select a section before enrolling.",
        severity: "warning",
      });
      return;
    }
    try {
      await axios.put(
        `${API_BASE_URL}/enrolled_student_in_section/${studentNumber}`,
        getEnrollMeta()
      );
      setSnackbar({
        open: true,
        message: `Student ${studentNumber} enrolled successfully.`,
        severity: "success",
      });
      await fetchEnrolledStudents();
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Failed to enroll ${studentNumber}.`,
        severity: "error",
      });
    }
  };

  // ── Unenroll Single — only refreshes enrolled panel ──────────────────────
  const handleUnenrollSingle = async (studentNumber) => {
    try {
      await axios.put(
        `${API_BASE_URL}/unenrolled_student_in_section/${studentNumber}`,
        getEnrollMeta()
      );
      setSnackbar({
        open: true,
        message: `Student ${studentNumber} unenrolled successfully.`,
        severity: "success",
      });
      await fetchEnrolledStudents();
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Failed to unenroll ${studentNumber}.`,
        severity: "error",
      });
    }
  };

  // ── Snackbar ──────────────────────────────────────────────────────────────
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (loading || hasAccess === null) return <LoadingOverlay open={loading} message="Loading..." />;
  if (!hasAccess) return <Unauthorized />;

  // ── Shared table styles ───────────────────────────────────────────────────
  const thStyle = {
    backgroundColor: headerColor || "#1976d2",
    color: "#fff",
    fontWeight: 600,
    fontSize: "13px",
    padding: "10px 12px",
    border: "none",
    whiteSpace: "nowrap",
  };

  const tdStyle = {
    fontSize: "13px",
    padding: "9px 12px",
    borderBottom: `1px solid ${borderColor}`,
  };

  const canManageStudents = Boolean(selectedCurriculum && selectedSection && activeSYID);

  // ── Helper: get selected section label ───────────────────────────────────
  const selectedSectionLabel = (() => {
    const sec = filteredSections.find(
      (s) => String(s.department_section_id) === String(selectedSection)
    );
    if (!sec) return "—";
    return `${sec.program_code || ""} — ${sec.section_description || ""}`;
  })();

  return (
    <Box
      sx={{
        height: "calc(100vh - 150px)",
        overflowY: "auto",
        backgroundColor: "transparent",
        mt: 1,
        padding: "16px 20px",
      }}
    >
      {/* ── Page Title ────────────────────────────────────────────────────── */}
      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ color: titleColor, fontSize: "28px", mb: 0.5 }}
      >
        DEPARTMENT SECTION TAGGING
      </Typography>
      <Typography sx={{ fontSize: "13px", color: "#666", mb: 2 }}>
        Enroll students into a department section by filtering by department, curriculum, section, and school year.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* ── Filter Bar ───────────────────────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${borderColor}`,
          borderRadius: "10px",
          p: 2.5,
          mb: 3,
          backgroundColor: "#fff",
        }}
      >
        <Typography
          sx={{
            fontSize: "12px",
            fontWeight: 600,
            color: "#888",
            letterSpacing: "0.08em",
            mb: 1.5,
            textTransform: "uppercase",
          }}
        >
          Filter
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-end" }}>

          {/* Department */}
          <FormControl size="small" sx={{ minWidth: 200, flex: "1 1 200px" }}>
            <InputLabel>Department</InputLabel>
            <Select
              value={String(selectedDepartment || "")}
              label="Department"
              onChange={(e) => setSelectedDepartment(e.target.value)}
            >
              <MenuItem value="" disabled>Select Department</MenuItem>
              {departments.map((d) => {
                const val = String(d.dprtmnt_id ?? d.id ?? "");
                return (
                  <MenuItem key={val} value={val}>
                    {d.dprtmnt_name || d.name}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* Curriculum — filtered by selected department */}
          <FormControl size="small" sx={{ minWidth: 260, flex: "1 1 260px" }}>
            <InputLabel>Curriculum</InputLabel>
            <Select
              value={String(selectedCurriculum || "")}
              label="Curriculum"
              onChange={(e) => setSelectedCurriculum(e.target.value)}
              disabled={filteredCurriculums.length === 0}
            >
              <MenuItem value="" disabled>Select Curriculum</MenuItem>
              {filteredCurriculums.map((c) => {
                const val = String(c.curriculum_id ?? "");
                return (
                  <MenuItem key={val} value={val}>
                    ({c.program_code}) {c.program_description} {c.major ? `- ${c.major}` : ""} [{c.year_description}]
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* Section — filtered by selected curriculum */}
          <FormControl size="small" sx={{ minWidth: 200, flex: "1 1 200px" }}>
            <InputLabel>Section</InputLabel>
            <Select
              value={String(selectedSection || "")}
              label="Section"
              onChange={(e) => setSelectedSection(e.target.value)}
              disabled={filteredSections.length === 0}
            >
              <MenuItem value="" disabled>Select Section</MenuItem>
              {filteredSections.map((s) => {
                const val = String(s.department_section_id ?? "");
                return (
                  <MenuItem key={val} value={val}>
                    {s.program_code} — {s.section_description}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          {/* School Year */}
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>School Year</InputLabel>
            <Select
              value={selectedYear}
              label="School Year"
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <MenuItem value="" disabled>Select Year</MenuItem>
              {schoolYears.map((yr) => (
                <MenuItem key={yr.year_id} value={yr.year_id}>
                  {yr.current_year} – {yr.next_year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Semester */}
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Semester</InputLabel>
            <Select
              value={selectedSemester}
              label="Semester"
              onChange={(e) => setSelectedSemester(e.target.value)}
            >
              <MenuItem value="" disabled>Select Semester</MenuItem>
              {semesters.map((sem) => (
                <MenuItem key={sem.semester_id} value={sem.semester_id}>
                  {sem.semester_description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Search Button */}
          <Button
            variant="contained"
            startIcon={
              searching
                ? <CircularProgress size={16} color="inherit" />
                : <SearchIcon />
            }
            disabled={searching}
            onClick={handleSearch}
            sx={{
              backgroundColor: mainButtonColor,
              color: "#fff",
              fontWeight: 600,
              height: "40px",
              px: 3,
              borderRadius: "8px",
              textTransform: "none",
              "&:hover": { backgroundColor: mainButtonColor, opacity: 0.88 },
            }}
          >
            {searching ? "Searching…" : "Search"}
          </Button>
        </Box>

        {/* Selected section info */}
        {selectedSection && (
          <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
            <Typography sx={{ fontSize: "12px", color: "#666" }}>
              Selected Section:
            </Typography>
            <Chip
              label={selectedSectionLabel}
              size="small"
              sx={{
                backgroundColor: "#e3f2fd",
                color: "#1565c0",
                fontWeight: 600,
                fontSize: "11px",
                height: "20px",
              }}
            />
          </Box>
        )}
      </Paper>

      {/* ── Enroll All / Unenroll All ─────────────────────────────────────── */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mb: 2, flexWrap: "wrap" }}>

        {/* Enroll All */}
        <Tooltip
          title={
            canManageStudents
              ? `Enroll all students into ${selectedSectionLabel}`
              : "Please select department, curriculum, section, and school year first"
          }
        >
          <span>
            <Button
              variant="contained"
              startIcon={
                actionLoading
                  ? <CircularProgress size={14} color="inherit" />
                  : <EnrollAllIcon />
              }
              disabled={actionLoading || !canManageStudents}
              onClick={handleEnrollAll}
              sx={{
                backgroundColor: mainButtonColor,
                color: "#fff",
                fontWeight: 600,
                fontSize: "12px",
                height: "36px",
                px: 2,
                borderRadius: "8px",
                textTransform: "none",
                "&:hover": { backgroundColor: mainButtonColor, opacity: 0.85 },
              }}
            >
              Enroll All
            </Button>
          </span>
        </Tooltip>

        {/* Unenroll All */}
        <Tooltip
          title={
            canManageStudents
              ? "Unenroll all enrolled students from this section"
              : "Please select department, curriculum, section, and school year first"
          }
        >
          <span>
            <Button
              variant="outlined"
              startIcon={<UnenrollAllIcon />}
              disabled={actionLoading || !canManageStudents}
              onClick={handleUnenrollAll}
              sx={{
                fontWeight: 600,
                fontSize: "12px",
                height: "36px",
                px: 2,
                borderRadius: "8px",
                textTransform: "none",
                border: "2px solid #c62828",
                color: "#c62828",
                "&:hover": { backgroundColor: "#ffebee", border: "2px solid #c62828" },
              }}
            >
              Unenroll All
            </Button>
          </span>
        </Tooltip>
      </Box>

      {/* ── Two-panel table layout ────────────────────────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5 }}>

        {/* ── LEFT: All Curriculum Students ────────────────────────────── */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography fontWeight={600} fontSize="14px" color="#333">
              Curriculum Students
            </Typography>
            <Chip
              label={allCurriculumStudents.length}
              size="small"
              sx={{
                backgroundColor: "#e8f5e9",
                color: "#2e7d32",
                fontWeight: 700,
                fontSize: "11px",
                height: "20px",
              }}
            />
          </Box>

          <Paper
            elevation={0}
            sx={{ border: `1px solid ${borderColor}`, borderRadius: "10px", overflow: "hidden" }}
          >
            <TableContainer sx={{ maxHeight: 480 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {["#", "Student No.", "Student Name", "Program", "Year Level", "Action"].map((h) => (
                      <TableCell key={h} sx={thStyle}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allCurriculumStudents.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        sx={{ textAlign: "center", py: 4, color: "#aaa", fontSize: "13px" }}
                      >
                        {searched
                          ? "No students found for this curriculum"
                          : "Select filters and search to load students"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    allCurriculumStudents.map((s, idx) => {
                      const isEnrolled = enrolledNumbers.has(String(s.student_number));
                      return (
                        <TableRow
                          key={s.student_number}
                          sx={{
                            backgroundColor: isEnrolled ? "#f1f8f1" : "inherit",
                            "&:hover": { backgroundColor: isEnrolled ? "#e8f5e9" : "#f9fbe7" },
                          }}
                        >
                          <TableCell sx={{ ...tdStyle, color: "#888", width: "36px" }}>
                            {idx + 1}
                          </TableCell>
                          <TableCell sx={tdStyle}>{s.student_number}</TableCell>
                          <TableCell sx={tdStyle}>
                            {s.last_name}, {s.first_name} {s.middle_name || ""}
                          </TableCell>
                          <TableCell sx={tdStyle}>{s.program_code}</TableCell>
                          <TableCell sx={tdStyle}>
                            {s.year_level_description || s.year_level}
                          </TableCell>
                          <TableCell sx={tdStyle}>
                            {isEnrolled ? (
                              <Button
                                size="small"
                                variant="outlined"
                                disabled
                                startIcon={<EnrolledIcon sx={{ fontSize: "14px !important" }} />}
                                sx={{
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  height: "28px",
                                  px: 1.5,
                                  borderRadius: "6px",
                                  textTransform: "none",
                                  minWidth: "unset",
                                  color: "#2e7d32 !important",
                                  borderColor: "#2e7d32 !important",
                                  opacity: 0.7,
                                }}
                              >
                                Enrolled
                              </Button>
                            ) : (
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<EnrollIcon sx={{ fontSize: "14px !important" }} />}
                                onClick={() => handleEnrollSingle(s.student_number)}
                                disabled={!selectedSection}
                                sx={{
                                  backgroundColor: mainButtonColor,
                                  color: "#fff",
                                  fontSize: "11px",
                                  fontWeight: 600,
                                  height: "28px",
                                  px: 1.5,
                                  borderRadius: "6px",
                                  textTransform: "none",
                                  minWidth: "unset",
                                  "&:hover": { backgroundColor: mainButtonColor, opacity: 0.85 },
                                }}
                              >
                                Enroll
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        {/* ── RIGHT: Enrolled Students ──────────────────────────────────── */}
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography fontWeight={600} fontSize="14px" color="#333">
              Enrolled Students
            </Typography>
            <Chip
              label={enrolledStudents.length}
              size="small"
              sx={{
                backgroundColor: "#e3f2fd",
                color: "#1565c0",
                fontWeight: 700,
                fontSize: "11px",
                height: "20px",
              }}
            />
          </Box>

          <Paper
            elevation={0}
            sx={{ border: `1px solid ${borderColor}`, borderRadius: "10px", overflow: "hidden" }}
          >
            <TableContainer sx={{ maxHeight: 480 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {["#", "Student No.", "Student Name", "Program", "Year Level", "Section", "Action"].map((h) => (
                      <TableCell key={h} sx={thStyle}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enrolledStudents.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        sx={{ textAlign: "center", py: 4, color: "#aaa", fontSize: "13px" }}
                      >
                        No enrolled students yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    enrolledStudents.map((s, idx) => (
                      <TableRow
                        key={s.student_number}
                        sx={{ "&:hover": { backgroundColor: "#fff8e1" } }}
                      >
                        <TableCell sx={{ ...tdStyle, color: "#888", width: "36px" }}>
                          {idx + 1}
                        </TableCell>
                        <TableCell sx={tdStyle}>{s.student_number}</TableCell>
                        <TableCell sx={tdStyle}>
                          {s.last_name}, {s.first_name} {s.middle_name || ""}
                        </TableCell>
                        <TableCell sx={tdStyle}>{s.program_code}</TableCell>
                        <TableCell sx={tdStyle}>
                          {s.year_level_description || s.year_level}
                        </TableCell>
                        <TableCell sx={tdStyle}>
                          <Chip
                            label={s.section_description || s.section || "—"}
                            size="small"
                            sx={{
                              backgroundColor: "#e3f2fd",
                              color: "#1565c0",
                              fontWeight: 600,
                              fontSize: "11px",
                              height: "22px",
                              border: "1px solid #1565c0",
                            }}
                          />
                        </TableCell>
                        <TableCell sx={tdStyle}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<UnenrollIcon sx={{ fontSize: "14px !important" }} />}
                            onClick={() => handleUnenrollSingle(s.student_number)}
                            sx={{
                              fontSize: "11px",
                              fontWeight: 600,
                              height: "28px",
                              px: 1.5,
                              borderRadius: "6px",
                              textTransform: "none",
                              minWidth: "unset",
                              border: "1.5px solid #c62828",
                              color: "#c62828",
                              "&:hover": {
                                backgroundColor: "#ffebee",
                                border: "1.5px solid #c62828",
                              },
                            }}
                          >
                            Unenroll
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      </Box>

      {/* ── Snackbar ───────────────────────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DepartmentSectionTagging;