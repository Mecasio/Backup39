import React, { useEffect, useState, useContext, useMemo } from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Radio,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { SettingsContext } from "../App";
import API_BASE_URL from "../apiConfig";
import SearchIcon from "@mui/icons-material/Search";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import ListOutlinedIcon from "@mui/icons-material/ListOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import BusinessIcon from "@mui/icons-material/Business";
import { DeleteOutline } from "@mui/icons-material";
import axios from "axios";

// ── Constants ──────────────────────────────────────────────────────────────
const REASONS = [
  "Financial",
  "Academics",
  "Change of residence",
  "Residence too far from school",
  "Health",
  "Work",
  "Abroad",
  "Personal",
  "Others",
];

const SUBJECT_HEADERS_FULL = [
  "",
  "Subject Code",
  "Description",
  "Adjustment",
  "Credited Units",
  "Schedule",
  "Enrolled By",
  "Registered By",
  "Adjusted By",
];
const SUBJECT_HEADERS_NO_RADIO = SUBJECT_HEADERS_FULL.slice(1);

// ── Helpers ────────────────────────────────────────────────────────────────
const getInitials = (name = "") =>
  name.trim()
    ? name
        .trim()
        .split(/\s+/)
        .map((w) => w[0].toUpperCase())
        .slice(0, 2)
        .join("")
    : "?";

const hCell = (extraColor) => ({
  fontSize: "10px !important",
  py: "7px !important",
  px: "12px !important",
  bgcolor: "#fafafa",
  whiteSpace: "nowrap",
  ...(extraColor ? { color: `${extraColor} !important` } : {}),
});

const bCell = { fontSize: "12px !important", px: "12px !important" };

// ── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ label, value, accent, color }) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 110,
      bgcolor: accent ? alpha(color, 0.06) : "#f8fafc",
      border: `1px solid ${accent ? alpha(color, 0.2) : "#e2e8f0"}`,
      borderRadius: 2,
      px: 2,
      py: 1.25,
    }}
  >
    <Typography
      sx={{
        fontSize: 10,
        fontWeight: 700,
        color: "#94a3b8",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: 14,
        fontWeight: 700,
        color: accent ? color : "text.primary",
        mt: 0.25,
      }}
    >
      {value || "—"}
    </Typography>
  </Box>
);

// ── Section Card ──────────────────────────────────────────────────────────
const SectionCard = ({ label, accentColor, headerBg, children }) => (
  <Paper
    variant="outlined"
    sx={{
      borderRadius: 2,
      border: `1.5px solid ${alpha(accentColor, 0.3)}`,
      overflow: "hidden",
    }}
  >
    <Box
      sx={{
        px: 2,
        py: 1.25,
        bgcolor: headerBg,
        borderBottom: `1.5px solid ${alpha(accentColor, 0.2)}`,
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          bgcolor: accentColor,
          flexShrink: 0,
        }}
      />
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          color: accentColor,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </Typography>
    </Box>
    {children}
  </Paper>
);

// ── In-List Table ─────────────────────────────────────────────────────────
const InListTable = ({ subjects, selectedSubject, onSelect, color }) => (
  <SectionCard
    label="In List"
    accentColor={color}
    headerBg={alpha(color, 0.06)}
  >
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {SUBJECT_HEADERS_FULL.map((h) => (
              <TableCell key={h} sx={hCell(color)}>
                {h}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {subjects.length > 0 ? (
            subjects.map((s) => (
              <TableRow
                key={s.code}
                hover
                selected={selectedSubject === s.code}
                onClick={() => onSelect(s.code)}
                sx={{
                  cursor: "pointer",
                  "&.Mui-selected": { bgcolor: alpha(color, 0.05) },
                }}
              >
                <TableCell padding="checkbox" sx={{ pl: 1.5 }}>
                  <Radio
                    size="small"
                    checked={selectedSubject === s.code}
                    onChange={() => onSelect(s.code)}
                    sx={{ color: "#cbd5e1", "&.Mui-checked": { color: color } }}
                  />
                </TableCell>
                <TableCell sx={{ ...bCell, fontWeight: 700, color: color }}>
                  {s.code}
                </TableCell>
                <TableCell sx={bCell}>{s.description}</TableCell>
                <TableCell sx={bCell}>{s.adjustment || "—"}</TableCell>
                <TableCell align="center" sx={{ ...bCell, fontWeight: 700 }}>
                  {s.creditedUnits}
                </TableCell>
                <TableCell sx={{ ...bCell, color: "text.secondary" }}>
                  {s.schedule}
                </TableCell>
                <TableCell sx={bCell}>{s.enrolledBy || "—"}</TableCell>
                <TableCell sx={bCell}>{s.registeredBy || "—"}</TableCell>
                <TableCell sx={bCell}>{s.adjustedBy || "—"}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={9}
                align="center"
                sx={{ py: 3, color: "text.secondary", fontStyle: "italic" }}
              >
                No subjects
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </SectionCard>
);

// ── Enrollment Status Chip ────────────────────────────────────────────────
const EnrollmentStatusChip = ({ status, hasSubjects }) => {
  const isVerified = !!status && hasSubjects;
  return (
    <Chip
      icon={
        isVerified ? (
          <VerifiedOutlinedIcon
            sx={{ fontSize: "12px !important", color: "#166534 !important" }}
          />
        ) : (
          <ErrorOutlineIcon
            sx={{ fontSize: "12px !important", color: "#92400e !important" }}
          />
        )
      }
      label={isVerified ? status : "Unverified"}
      size="small"
      sx={{
        bgcolor: isVerified ? "#f0fdf4" : "#fffbeb",
        color: isVerified ? "#166534" : "#92400e",
        border: `1px solid ${isVerified ? "#bbf7d0" : "#fcd34d"}`,
        height: 20,
        fontWeight: 600,
        fontSize: 11,
      }}
    />
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const StudentEnrollment = () => {
  const settings = useContext(SettingsContext);

  const [tab, setTab] = useState(0);
  const [reasonAnchor, setReasonAnchor] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [form137, setForm137] = useState(false);
  const [transcriptRec, setTranscriptRec] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [addChecked, setAddChecked] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const [studentCourses, setStudentCourses] = useState([]);
  const [selectedStudentNumber, setSelectedStudentNumber] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [isLoadingStudentDirectory, setIsLoadingStudentDirectory] = useState(false);
  const [isLoadingStudentRecord, setIsLoadingStudentRecord] = useState(false);

  const [titleColor, setTitleColor] = useState("#7f1d1d");
  const [mainButtonColor, setMainButtonColor] = useState("#7f1d1d");
  const [subtitleColor, setSubtitleColor] = useState("#555555");
  const [borderColor, setBorderColor] = useState("#e2e8f0");
  const [subButtonColor, setSubButtonColor] = useState("#ffffff");
  const [stepperColor, setStepperColor] = useState("#7f1d1d");
  const [fetchedLogo, setFetchedLogo] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [shortTerm, setShortTerm] = useState("");
  const [campusAddress, setCampusAddress] = useState("");
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    if (!settings) return;
    if (settings.title_color) setTitleColor(settings.title_color);
    if (settings.subtitle_color) setSubtitleColor(settings.subtitle_color);
    if (settings.border_color) setBorderColor(settings.border_color);
    if (settings.main_button_color)
      setMainButtonColor(settings.main_button_color);
    if (settings.sub_button_color) setSubButtonColor(settings.sub_button_color);
    if (settings.stepper_color) setStepperColor(settings.stepper_color);
    if (settings.logo_url)
      setFetchedLogo(`${API_BASE_URL}${settings.logo_url}`);
    if (settings.company_name) setCompanyName(settings.company_name);
    if (settings.short_term) setShortTerm(settings.short_term);
    if (settings.campus_address) setCampusAddress(settings.campus_address);
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

  const fetchAllStudents = async () => {
    try {
      setIsLoadingStudentDirectory(true);
      const res = await axios.get(`${API_BASE_URL}/student_enrollment`);
      setAllStudents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error preloading students:", err);
      setAllStudents([]);
      setSearchStatus("Failed to preload student directory");
    } finally {
      setIsLoadingStudentDirectory(false);
    }
  };

  const fetchStudentEnrollment = async (student_number) => {
    if (!student_number) {
      setStudentData([]);
      return;
    }

    try {
      const res = await axios.get(
        `${API_BASE_URL}/student_enrollment/${student_number}`,
      );
      setStudentData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching student enrollment information:", err);
      setStudentData([]);
      setSearchStatus("Failed to fetch student enrollment information");
    }
  };

  const fetchStudentCourses = async (student_number) => {
    if (!student_number) {
      setStudentCourses([]);
      return;
    }

    try {
      const res = await axios.get(
        `${API_BASE_URL}/student-info/${student_number}`,
      );

      const normalizedCourses = Array.isArray(res.data)
        ? res.data.map((course) => ({
            ...course,
            code: course.course_code,
            description: course.course_description,
            creditedUnits: course.course_unit,
            adjustment: course.remarks || "",
            schedule:
              course.current_year && course.semester_description
                ? `${course.current_year}-${Number(course.current_year) + 1} ${course.semester_description}`
                : "—",
            enrolledBy: course.enrolledBy || "",
            registeredBy: course.registeredBy || "",
            adjustedBy: course.adjustedBy || "",
          }))
        : [];

      setStudentCourses(normalizedCourses);
    } catch (err) {
      console.error("Error fetching student courses:", err);
      setStudentCourses([]);
    }
  };

  const handleSelectStudent = (student) => {
    if (!student) return;

    setSelectedStudentNumber(student.student_number);
    setGlobalSearch(student.student_number);
    setSelectedSubject(null);
    setSearchStatus(`Selected ${student.student_number}`);
  };

  useEffect(() => {
    fetchAllStudents();
  }, []);

  useEffect(() => {
    if (selectedStudentNumber) {
      const loadStudentRecord = async () => {
        setIsLoadingStudentRecord(true);
        await Promise.all([
          fetchStudentEnrollment(selectedStudentNumber),
          fetchStudentCourses(selectedStudentNumber),
        ]);
        setIsLoadingStudentRecord(false);
      };

      loadStudentRecord();
    } else {
      setStudentData([]);
      setStudentCourses([]);
    }
  }, [selectedStudentNumber]);

  const filteredStudents = useMemo(() => {
    const trimmedQuery = globalSearch.trim().toLowerCase();

    if (trimmedQuery.length < 2) return [];

    return allStudents
      .filter((student) => {
        const fullName = `${student.first_name || ""} ${student.middle_name || ""} ${student.last_name || ""}`
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();

        return (
          String(student.student_number || "").toLowerCase().includes(trimmedQuery) ||
          fullName.includes(trimmedQuery)
        );
      })
      .slice(0, 10);
  }, [allStudents, globalSearch]);

  useEffect(() => {
    const trimmedQuery = globalSearch.trim();

    if (trimmedQuery.length === 0) {
      setSearchStatus("");
      return;
    }

    if (trimmedQuery.length < 2) {
      setSearchStatus("Type at least 2 characters to search");
      return;
    }

    setSearchStatus(
      filteredStudents.length
        ? `Showing ${filteredStudents.length} matching student${filteredStudents.length > 1 ? "s" : ""}`
        : "No students found",
    );
  }, [filteredStudents, globalSearch]);

  const s = studentData[0] || {};
  const displaySubjects = useMemo(() => studentCourses, [studentCourses]);
  const fullName = s.first_name
    ? `${s.first_name} ${s.middle_name ? s.middle_name.charAt(0).toUpperCase() + ". " : ""}${s.last_name}`
    : "Student Name";
  const program =
    s.program_code && s.program_description
      ? `(${s.program_code}) ${s.program_description}`
      : "Program";
  const address = s.presentStreet
    ? `${s.presentStreet}, ${s.presentBarangay} ${s.presentMunicipality}, ${s.presentProvince}`
    : "Address";
  const campusName = (() => {
    const branch = branches.find((b) => String(b?.id) === String(s.campus));
    return branch?.branch || s.campus || "Campus";
  })();

  return (
    <Box
      sx={{
        height: "calc(100vh - 150px)",
        overflowY: "auto",
        paddingRight: 1,
        backgroundColor: "transparent",
        mt: 1,
        padding: 2,
      }}
    >
      {/* ── Page Header ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2.5,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
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
          SLOT MONITORING
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Autocomplete
            freeSolo
            filterOptions={(options) => options}
            options={filteredStudents}
            loading={isLoadingStudentDirectory}
            inputValue={globalSearch}
            value={
              allStudents.find(
                (student) => student.student_number === selectedStudentNumber,
              ) || null
            }
            onInputChange={(event, newInputValue, reason) => {
              if (reason === "input" || reason === "clear") {
                setGlobalSearch(newInputValue);
                setSelectedStudentNumber("");
                if (reason === "clear") {
                  setStudentData([]);
                  setStudentCourses([]);
                }
                setSelectedSubject(null);
              }
            }}
            onChange={(event, selectedOption) => {
              if (selectedOption && typeof selectedOption !== "string") {
                handleSelectStudent(selectedOption);
              }
            }}
            getOptionLabel={(option) => {
              if (typeof option === "string") return option;

              const middleInitial = option.middle_name
                ? `${option.middle_name.charAt(0).toUpperCase()}. `
                : "";
              const fullName =
                `${option.first_name || ""} ${middleInitial}${option.last_name || ""}`.trim();

              return option.student_number
                ? `${option.student_number} - ${fullName}`
                : fullName;
            }}
            isOptionEqualToValue={(option, value) =>
              option.student_number === value.student_number
            }
            noOptionsText={
              globalSearch.trim().length >= 2 ? "No students found" : "Type at least 2 characters"
            }
            loadingText="Loading students..."
            sx={{
              width: 420,
              bgcolor: "#fff",
              "& .MuiOutlinedInput-root": { borderRadius: 2 },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                placeholder="Search by name, email, or student number..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && filteredStudents.length > 0) {
                    e.preventDefault();
                    handleSelectStudent(filteredStudents[0]);
                  }
                }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 17, color: "#94a3b8" }} />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                  endAdornment: (
                    <>
                      {isLoadingStudentDirectory ? (
                        <CircularProgress color="inherit" size={16} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, option) => {
              const middleInitial = option.middle_name
                ? `${option.middle_name.charAt(0).toUpperCase()}. `
                : "";
              const fullName =
                `${option.first_name || ""} ${middleInitial}${option.last_name || ""}`.trim();

              return (
                <Box component="li" {...props} key={option.student_number}>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                      {option.student_number}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      {fullName}
                    </Typography>
                  </Box>
                </Box>
              );
            }}
          />
          {[
            {
              label: "View History",
              icon: <HistoryOutlinedIcon sx={{ fontSize: 14 }} />,
            },
            {
              label: "Certificate of Registration",
              icon: <ArticleOutlinedIcon sx={{ fontSize: 14 }} />,
            },
            {
              label: "View List",
              icon: <ListOutlinedIcon sx={{ fontSize: 14 }} />,
            },
          ].map(({ label, icon }) => (
            <Button
              key={label}
              variant="contained"
              size="small"
              startIcon={icon}
              sx={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: "none",
                bgcolor: mainButtonColor,
                color: "#fff",
                borderRadius: 2,
                boxShadow: "none",
                "&:hover": {
                  bgcolor: alpha(mainButtonColor, 0.85),
                  boxShadow: "none",
                },
              }}
            >
              {label}
            </Button>
          ))}
        </Box>
      </Box>
      {(searchStatus || isLoadingStudentRecord) && (
        <Typography
          sx={{
            fontSize: 12,
            color:
              searchStatus === "No students found" ||
              searchStatus === "Failed to fetch student enrollment information" ||
              searchStatus === "Failed to preload student directory" ||
              searchStatus === "Type at least 2 characters to search"
                ? "#b91c1c"
                : "text.secondary",
            mb: 1.5,
          }}
        >
          {isLoadingStudentRecord ? "Loading student enrollment information..." : searchStatus}
        </Typography>
      )}

      {/* ── Student Banner Card ── */}
      <Paper
        variant="outlined"
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: 2,
          mb: 2,
          overflow: "hidden",
        }}
      >
        <Box sx={{ height: 4, bgcolor: mainButtonColor }} />

        <Box
          sx={{
            p: "16px 20px",
            display: "flex",
            gap: 2.5,
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          {/* Avatar + identity */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              flex: 1,
              minWidth: 260,
            }}
          >
            <Avatar
              sx={{
                width: 52,
                height: 52,
                bgcolor: mainButtonColor,
                borderRadius: 2,
                fontSize: 20,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {getInitials(
                s.first_name ? `${s.first_name} ${s.last_name}` : "",
              )}
            </Avatar>
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 16,
                  color: "text.primary",
                  lineHeight: 1.2,
                }}
              >
                {fullName}
              </Typography>
              <Typography
                sx={{ fontSize: 12, color: "text.secondary", mt: 0.3 }}
              >
                {program}
              </Typography>
              <Box
                sx={{ display: "flex", gap: 0.75, mt: 0.75, flexWrap: "wrap" }}
              >
                <Chip
                  icon={
                    <BusinessIcon
                      sx={{
                        fontSize: "12px !important",
                        color: `${mainButtonColor} !important`,
                      }}
                    />
                  }
                  label={campusName}
                  size="small"
                  sx={{
                    bgcolor: alpha(mainButtonColor, 0.08),
                    color: mainButtonColor,
                    height: 20,
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                />
                <Chip
                  icon={
                    <VerifiedOutlinedIcon
                      sx={{
                        fontSize: "12px !important",
                        color: "#166534 !important",
                      }}
                    />
                  }
                  label={s.status || "Student Status"}
                  size="small"
                  sx={{
                    bgcolor: "#f0fdf4",
                    color: "#166534",
                    border: "1px solid #bbf7d0",
                    height: 20,
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                />
                {/* ── Enrollment Status — Unverified when no subjects or undefined ── */}
                <EnrollmentStatusChip
                  status={s.enrollment_status}
                  hasSubjects={displaySubjects.length > 0}
                />
              </Box>
            </Box>
          </Box>

          {/* Stat cards */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              flex: 2,
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            <StatCard
              label="Student No."
              value={s.student_number}
              color={mainButtonColor}
            />
            <StatCard
              label="Year Level"
              value={s.year_level_description}
              color={mainButtonColor}
            />
            <StatCard
              label="Section"
              value={s.section_description}
              color={mainButtonColor}
            />
            <StatCard
              label="Semester"
              value={s.semester_description}
              color={mainButtonColor}
            />
            <StatCard
              label="School Year"
              value={s.current_academic_year}
              color={mainButtonColor}
            />
            <StatCard
              label="Units"
              value={s.units}
              accent
              color={mainButtonColor}
            />
          </Box>
        </Box>

        {/* Bottom meta row */}
        <Box
          sx={{
            px: "20px",
            py: 1,
            bgcolor: "#fafafa",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            gap: 3,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            📧 {s.emailAddress || "Email Address"}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            📞 {s.cellphoneNumber || "Contact Number"}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
            📍 {address}
          </Typography>
          <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={form137}
                  onChange={(e) => setForm137(e.target.checked)}
                  sx={{
                    color: "#cbd5e1",
                    "&.Mui-checked": { color: mainButtonColor },
                    p: 0.5,
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  Form 137-A
                </Typography>
              }
              sx={{ mr: 0 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={transcriptRec}
                  onChange={(e) => setTranscriptRec(e.target.checked)}
                  sx={{
                    color: "#cbd5e1",
                    "&.Mui-checked": { color: mainButtonColor },
                    p: 0.5,
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  Transcript of Records
                </Typography>
              }
              sx={{ mr: 0 }}
            />
          </Box>
        </Box>
      </Paper>

      {/* ── Tabbed Subject Area ── */}
      <Paper
        variant="outlined"
        sx={{
          border: "1px solid #e2e8f0",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Tab bar */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #e2e8f0",
            px: 1,
            bgcolor: "#fff",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => {
              setTab(v);
              setSelectedSubject(null);
              setAddChecked(false);
            }}
            sx={{
              "& .MuiTabs-indicator": {
                bgcolor: mainButtonColor,
                height: 2.5,
                borderRadius: "2px 2px 0 0",
              },
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 500,
                fontSize: 13,
                minHeight: 46,
                color: "text.secondary",
              },
              "& .MuiTab-root.Mui-selected": {
                fontWeight: 700,
                color: mainButtonColor,
              },
            }}
          >
            <Tab
              icon={<SwapHorizIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
              label="Change Courses"
            />
            <Tab
              icon={<AddCircleOutlineIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
              label="Add Courses"
            />
            <Tab
              icon={<RemoveCircleOutlineIcon sx={{ fontSize: 16 }} />}
              iconPosition="start"
              label="Drop Courses"
            />
            <Tab
              icon={<DeleteOutline sx={{ fontSize: 16 }} />}
              iconPosition="start"
              label="Delete Courses"
            />
          </Tabs>

          <Box sx={{ pr: 1.5 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={
                <LogoutOutlinedIcon sx={{ fontSize: "14px !important" }} />
              }
              endIcon={
                <KeyboardArrowDownIcon sx={{ fontSize: "14px !important" }} />
              }
              onClick={(e) => setReasonAnchor(e.currentTarget)}
              sx={{
                fontSize: 12,
                fontWeight: 600,
                textTransform: "none",
                px: 1.75,
                bgcolor: mainButtonColor,
                color: "#fff",
                borderRadius: 2,
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                "&:hover": {
                  bgcolor: alpha(mainButtonColor, 0.85),
                  boxShadow: "none",
                },
              }}
            >
              {selectedReason || "Withdraw Enrollment"}
            </Button>
            <Menu
              anchorEl={reasonAnchor}
              open={Boolean(reasonAnchor)}
              onClose={() => setReasonAnchor(null)}
              PaperProps={{
                sx: {
                  borderRadius: 2,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                  minWidth: 220,
                  mt: 0.5,
                },
              }}
            >
              <MenuItem
                disabled
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "text.secondary",
                  letterSpacing: "0.07em",
                  textTransform: "uppercase",
                  opacity: "1 !important",
                }}
              >
                Reason for Withdrawal
              </MenuItem>
              <Divider />
              {REASONS.map((r) => (
                <MenuItem
                  key={r}
                  selected={selectedReason === r}
                  onClick={() => {
                    setSelectedReason(r);
                    setReasonAnchor(null);
                  }}
                  sx={{
                    fontSize: 13,
                    "&.Mui-selected": {
                      color: mainButtonColor,
                      fontWeight: 600,
                      bgcolor: alpha(mainButtonColor, 0.06),
                    },
                  }}
                >
                  {r}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>

        {/* ── Tab 0: Change Courses ── */}
        {tab === 0 && (
          <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <InListTable
              subjects={displaySubjects}
              selectedSubject={selectedSubject}
              onSelect={setSelectedSubject}
              color={mainButtonColor}
            />

            {/* FROM */}
            <SectionCard label="From" accentColor="#b45309" headerBg="#fffbeb">
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {SUBJECT_HEADERS_NO_RADIO.map((h) => (
                        <TableCell key={h} sx={hCell("#b45309")}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedSubject ? (
                      displaySubjects
                        .filter((s) => s.code === selectedSubject)
                        .map((s) => (
                          <TableRow key={s.code}>
                            <TableCell
                              sx={{
                                ...bCell,
                                fontWeight: 700,
                                color: "#b45309",
                              }}
                            >
                              {s.code}
                            </TableCell>
                            <TableCell sx={bCell}>{s.description}</TableCell>
                            <TableCell sx={bCell}>
                              {s.adjustment || "—"}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ ...bCell, fontWeight: 700 }}
                            >
                              {s.creditedUnits}
                            </TableCell>
                            <TableCell
                              sx={{ ...bCell, color: "text.secondary" }}
                            >
                              {s.schedule}
                            </TableCell>
                            <TableCell sx={bCell}>
                              {s.enrolledBy || "—"}
                            </TableCell>
                            <TableCell sx={bCell}>
                              {s.registeredBy || "—"}
                            </TableCell>
                            <TableCell sx={bCell}>
                              {s.adjustedBy || "—"}
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          align="center"
                          sx={{
                            py: 3,
                            color: "text.secondary",
                            fontStyle: "italic",
                          }}
                        >
                          Select a subject from In List above
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </SectionCard>

            {/* TO */}
            <SectionCard label="To" accentColor="#166534" headerBg="#f0fdf4">
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {SUBJECT_HEADERS_NO_RADIO.map((h) => (
                        <TableCell key={h} sx={hCell("#166534")}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        align="center"
                        sx={{
                          py: 3,
                          color: "text.secondary",
                          fontStyle: "italic",
                        }}
                      >
                        No replacement selected
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </SectionCard>
          </Box>
        )}

        {/* ── Tabs 1 / 2 / 3 ── */}
        {tab === 1 && (
          <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <InListTable
              subjects={displaySubjects}
              selectedSubject={selectedSubject}
              onSelect={setSelectedSubject}
              color={mainButtonColor}
            />

            <SectionCard label="From" accentColor="#166534" headerBg="#f0fdf4">
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {SUBJECT_HEADERS_NO_RADIO.map((h) => (
                        <TableCell key={h} sx={hCell("#166534")}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedSubject ? (
                      displaySubjects
                        .filter((s) => s.code === selectedSubject)
                        .map((s) => (
                          <TableRow key={s.code}>
                            <TableCell
                              sx={{
                                ...bCell,
                                fontWeight: 700,
                                color: "#166534",
                              }}
                            >
                              {s.code}
                            </TableCell>
                            <TableCell sx={bCell}>{s.description}</TableCell>
                            <TableCell sx={bCell}>
                              {s.adjustment || "—"}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ ...bCell, fontWeight: 700 }}
                            >
                              {s.creditedUnits}
                            </TableCell>
                            <TableCell
                              sx={{ ...bCell, color: "text.secondary" }}
                            >
                              {s.schedule}
                            </TableCell>
                            <TableCell sx={bCell}>
                              {s.enrolledBy || "—"}
                            </TableCell>
                            <TableCell sx={bCell}>
                              {s.registeredBy || "—"}
                            </TableCell>
                            <TableCell sx={bCell}>
                              {s.adjustedBy || "—"}
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          align="center"
                          sx={{
                            py: 3,
                            color: "text.secondary",
                            fontStyle: "italic",
                          }}
                        >
                          Select a subject from In List above
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </SectionCard>

            <SectionCard label="To" accentColor="#166534" headerBg="#f0fdf4">
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {SUBJECT_HEADERS_NO_RADIO.map((h) => (
                        <TableCell key={h} sx={hCell("#166534")}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        align="center"
                        sx={{
                          py: 3,
                          color: "text.secondary",
                          fontStyle: "italic",
                        }}
                      >
                        No subject selected to add
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </SectionCard>
          </Box>
        )}
        {tab === 2 && (
          <Box sx={{ p: 2 }}>
            <InListTable
              subjects={displaySubjects}
              selectedSubject={selectedSubject}
              onSelect={setSelectedSubject}
              color={mainButtonColor}
            />
          </Box>
        )}
        {tab === 3 && (
          <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <InListTable
              subjects={displaySubjects}
              selectedSubject={selectedSubject}
              onSelect={setSelectedSubject}
              color={mainButtonColor}
            />

            <SectionCard label="From" accentColor="#991b1b" headerBg="#fef2f2">
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {SUBJECT_HEADERS_NO_RADIO.map((h) => (
                        <TableCell key={h} sx={hCell("#991b1b")}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedSubject ? (
                      displaySubjects
                        .filter((s) => s.code === selectedSubject)
                        .map((s) => (
                          <TableRow key={s.code}>
                            <TableCell
                              sx={{
                                ...bCell,
                                fontWeight: 700,
                                color: "#991b1b",
                              }}
                            >
                              {s.code}
                            </TableCell>
                            <TableCell sx={bCell}>{s.description}</TableCell>
                            <TableCell sx={bCell}>
                              {s.adjustment || "—"}
                            </TableCell>
                            <TableCell
                              align="center"
                              sx={{ ...bCell, fontWeight: 700 }}
                            >
                              {s.creditedUnits}
                            </TableCell>
                            <TableCell
                              sx={{ ...bCell, color: "text.secondary" }}
                            >
                              {s.schedule}
                            </TableCell>
                            <TableCell sx={bCell}>
                              {s.enrolledBy || "—"}
                            </TableCell>
                            <TableCell sx={bCell}>
                              {s.registeredBy || "—"}
                            </TableCell>
                            <TableCell sx={bCell}>
                              {s.adjustedBy || "—"}
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          align="center"
                          sx={{
                            py: 3,
                            color: "text.secondary",
                            fontStyle: "italic",
                          }}
                        >
                          Select a subject from In List above
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </SectionCard>

            <SectionCard label="To" accentColor="#991b1b" headerBg="#fef2f2">
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {SUBJECT_HEADERS_NO_RADIO.map((h) => (
                        <TableCell key={h} sx={hCell("#991b1b")}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        align="center"
                        sx={{
                          py: 3,
                          color: "text.secondary",
                          fontStyle: "italic",
                        }}
                      >
                        No destination subject for delete action
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </SectionCard>
          </Box>
        )}

        {/* ── Footer ── */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            px: 2,
            py: 1.5,
            borderTop: "1px solid #f1f5f9",
            bgcolor: "#fafafa",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<RefreshIcon sx={{ fontSize: "16px !important" }} />}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: "text.secondary",
              borderColor: "#e2e8f0",
              borderRadius: 2,
              bgcolor: "white",
              "&:hover": { borderColor: "#94a3b8", bgcolor: "#f8fafc" },
            }}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            startIcon={
              <SaveOutlinedIcon sx={{ fontSize: "16px !important" }} />
            }
            sx={{
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              borderRadius: 2,
              bgcolor: mainButtonColor,
              color: "#fff",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              "&:hover": {
                bgcolor: alpha(mainButtonColor, 0.85),
                boxShadow: "none",
              },
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default StudentEnrollment;