"use client";

import { useEffect, useState } from "react";
import { Button, Modal, ModalBody, ModalHeader, Select } from "flowbite-react";
import { HiOutlinePlus } from "react-icons/hi";
import { getAllDepartments } from "@/app/router/department.router";
import { useDepartmentCourses } from "@/hooks/useDepartmentCourses"; // department-scoped hook
import { useProfessors } from "@/hooks/useProfessors";
import { MultiSelect, Option } from "react-multi-select-component";
import { getProfessorList } from "@/app/router/student-courses.router"; // <- added: fetch professors by course
import type { Course } from "@/lib/schemas/course.schema";
import { getStudentsByDepartment } from "@/app/router/department-student.router";
import { addStudentsToCourse } from "@/app/router/department-student.router";

interface AddDepartmentProps {
  refetch?: () => void;
  buttonWidth?: string;
}

const AddDepartmentStudent = ({ refetch, buttonWidth }: AddDepartmentProps) => {
  const [formModal, setFormModal] = useState(false);

  // departments list from API
  const [departments, setDepartments] = useState<Array<any>>([]);
  const [loadingDept, setLoadingDept] = useState(false);
  const [errorDept, setErrorDept] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | number | "">("");

  // courses via department-scoped hook (updates when selectedDept changes)
  const deptIdForHook = selectedDept ? Number(selectedDept) : undefined;
  const { courses, loading: loadingCourses, error: errorCourses } = useDepartmentCourses(deptIdForHook);

  const [selectedCourse, setSelectedCourse] = useState<string | number | "">("");

  // professors via global hook (kept) — still available if you need it
  const professorsQuery = useProfessors();
  const professors = professorsQuery.data?.data ?? [];
  const loadingProfessors = professorsQuery.isLoading;
  const errorProfessors = professorsQuery.isError
    ? (professorsQuery.error as any)?.message ?? "Error loading professors"
    : null;
  const [selectedProfessor, setSelectedProfessor] = useState<string | number | "">("");

  // course-specific professors (fetched when a course is selected)
  const [courseProfessors, setCourseProfessors] = useState<any[]>([]);
  const [loadingCourseProfessors, setLoadingCourseProfessors] = useState(false);
  const [errorCourseProfessors, setErrorCourseProfessors] = useState<string | null>(null);

  // students multi-select
  const [studentOptions, setStudentOptions] = useState<Option[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<Option[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [errorStudents, setErrorStudents] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // load departments
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoadingDept(true);
        setErrorDept(null);
        const res = await getAllDepartments();
        if (!mounted) return;
        setDepartments(res?.data ?? []);
      } catch (err: any) {
        console.error("Failed to load departments", err);
        setErrorDept(err?.message ?? "Failed to load departments");
      } finally {
        if (mounted) setLoadingDept(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // load students for multiselect
  useEffect(() => {
    let mounted = true;

    const loadStudents = async (deptId: number) => {
      try {
        setLoadingStudents(true);
        setErrorStudents(null);
        setStudentOptions([]);
        setSelectedStudents([]);

        const res = await getStudentsByDepartment(deptId);
        // expect shape: { success: boolean, data: Student[] }
        const rows = Array.isArray(res?.data) ? res.data : [];

        if (!mounted) return;

        const opts: Option[] = rows.map((s: any) => {
          const label = `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim() || s.email || `Student ${s.id ?? "?"}`;
          const value = s.id ?? s._id ?? label;
          return { label, value };
        });

        setStudentOptions(opts);
      } catch (err: any) {
        if (!mounted) return;
        console.error("Failed to load students by department", err);
        setErrorStudents(err?.message ?? "Failed to load students for department");
        setStudentOptions([]);
      } finally {
        if (mounted) setLoadingStudents(false);
      }
    };

    const n = Number(selectedDept);
    if (selectedDept && !Number.isNaN(n)) {
      loadStudents(n);
    } else {
      // no department picked: clear list to avoid stale junk
      setStudentOptions([]);
      setSelectedStudents([]);
      setErrorStudents(null);
      setLoadingStudents(false);
    }

    return () => {
      mounted = false;
    };
  }, [selectedDept]);

  // Reset course selection when department changes (so stale course doesn't remain)
  useEffect(() => {
    setSelectedCourse("");
    // also clear course-specific professors when department changes
    setCourseProfessors([]);
    setSelectedProfessor("");
    setErrorCourseProfessors(null);
    setLoadingCourseProfessors(false);
  }, [selectedDept]);

  // When a course is selected, fetch professors for that course and preselect the first one
  useEffect(() => {
    let mounted = true;
    const abortable = { aborted: false };

    const loadCourseProfessors = async (courseId: number | string) => {
      try {
        setLoadingCourseProfessors(true);
        setErrorCourseProfessors(null);
        setCourseProfessors([]);
        setSelectedProfessor("");

        const res = await getProfessorList(Number(courseId));
        if (!mounted || abortable.aborted) return;

        const data = Array.isArray(res?.data) ? res.data : [];
        setCourseProfessors(data);

        if (data.length > 0) {
          // defensive: check nested shape
          const first = data[0];
          const profId = first?.professor?.id ?? first?.id ?? null;
          if (profId != null) {
            setSelectedProfessor(profId);
          } else {
            // fallback: try to pick some identifier
            setSelectedProfessor(first?.professor?._id ?? first?._id ?? "");
          }
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error("Failed to load course professors", err);
        if (!mounted) return;
        setErrorCourseProfessors(err?.message ?? "Failed to load professors for course");
        setCourseProfessors([]);
      } finally {
        if (mounted) setLoadingCourseProfessors(false);
      }
    };

    if (selectedCourse) {
      loadCourseProfessors(selectedCourse);
    } else {
      // nothing selected: clear state
      setCourseProfessors([]);
      setSelectedProfessor("");
      setErrorCourseProfessors(null);
      setLoadingCourseProfessors(false);
    }

    return () => {
      mounted = false;
      abortable.aborted = true;
    };
  }, [selectedCourse]);

  // reset selections when modal toggles closed
  useEffect(() => {
    if (!formModal) {
      setSelectedDept("");
      setSelectedCourse("");
      setSelectedProfessor("");
      setSelectedStudents([]);
      setCourseProfessors([]);
      setErrorCourseProfessors(null);
      setLoadingCourseProfessors(false);
    }
  }, [formModal]);

  function onCloseModal() {
    setFormModal(false);
    setSelectedDept("");
    setSelectedCourse("");
    setSelectedProfessor("");
    setSelectedStudents([]);
    setCourseProfessors([]);
    setErrorCourseProfessors(null);
    setLoadingCourseProfessors(false);
  }

  // If no department is chosen, course select should be disabled.
  const shouldDisableCourseSelect = !selectedDept || loadingCourses;

  // Only show courses when a department is selected. Keeps the UI clean and predictable.
  const visibleCourses = selectedDept ? courses : [];

  const isDoneDisabled =
    isSubmitting ||
    loadingDept ||
    loadingCourses ||
    loadingProfessors ||
    loadingStudents ||
    loadingCourseProfessors ||
    !!errorDept ||
    !!errorCourses ||
    !!errorProfessors ||
    !!errorStudents ||
    !!errorCourseProfessors ||
    selectedDept === "" ||
    selectedCourse === "" ||
    selectedProfessor === "" ||
    selectedStudents.length === 0;


    const handleSubmit = async () => {
  try {
    setIsSubmitting(true);

    const course_id = Number(selectedCourse);
    const professor_id = Number(selectedProfessor);
    const student_ids = selectedStudents
      .map((s) => Number(s.value))
      .filter((n) => Number.isFinite(n) && n > 0);

    if (
      !Number.isFinite(course_id) ||
      !Number.isFinite(professor_id) ||
      student_ids.length === 0
    ) {
      console.error("Invalid payload", { course_id, professor_id, student_ids });
      return;
    }

    await addStudentsToCourse({ course_id, professor_id, student_ids });

    refetch?.();
    onCloseModal();
  } catch (err: any) {
    console.error(
      "Failed to add students to course:",
      err?.message || err
    );
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div>
      <Button onClick={() => setFormModal(true)} color="primary" className={buttonWidth}>
        <HiOutlinePlus className="mr-2" />
        Add Students
      </Button>

      <Modal show={formModal} size="lg" onClose={onCloseModal} popup>
        <ModalHeader className="p-6">Add Students</ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            {/* Department select */}
            {loadingDept ? (
              <div className="text-center py-6">Loading departments...</div>
            ) : errorDept ? (
              <div className="text-center py-6 text-red-500">Error: {errorDept}</div>
            ) : (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Department <span className="text-red-500">*</span>
                </label>
                <Select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                  <option value="">Select Department</option>
                  {departments.map((d: any) => (
                    <option key={d.id ?? d._id ?? JSON.stringify(d)} value={d.id ?? d._id ?? d.name}>
                      {d.name ?? d.title ?? d.displayName ?? `Dept ${d.id ?? "?"}`}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Course select */}
            {loadingCourses ? (
              <div className="text-center py-6">Loading courses...</div>
            ) : errorCourses ? (
              <div className="text-center py-6 text-red-500">Error loading courses</div>
            ) : (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Course <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  disabled={shouldDisableCourseSelect}
                >
                  <option value="">
                    {!selectedDept
                      ? "Select department first"
                      : visibleCourses.length === 0
                        ? "No courses found for department"
                        : "Select Course"}
                  </option>
                  {visibleCourses.map((c: Course) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Professor select (course-scoped) */}
            {loadingCourseProfessors ? (
              <div className="text-center py-6">Loading professors for selected course...</div>
            ) : errorCourseProfessors ? (
              <div className="text-center py-6 text-red-500">{errorCourseProfessors}</div>
            ) : (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Professor <span className="text-red-500">*</span>
                </label>
                <Select
                  value={selectedProfessor}
                  onChange={(e) => setSelectedProfessor(e.target.value)}
                  disabled={!selectedCourse || courseProfessors.length === 0}
                >
                  <option value="">
                    {!selectedCourse ? "Select course first" : courseProfessors.length === 0 ? "No professors for this course" : "Select Professor"}
                  </option>
                  {courseProfessors.map((item: any) => {
                    const prof = item?.professor ?? item;
                    const id = prof?.id ?? prof?._id ?? null;
                    if (id == null) return null;
                    const label = `${prof.first_name ?? ""} ${prof.last_name ?? ""}`.trim() || `Prof ${id}`;
                    return (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    );
                  })}
                </Select>
              </div>
            )}

            {/* Students multi-select */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Students <span className="text-red-500">*</span>
              </label>

              {!selectedDept ? (
                <div className="text-sm text-gray-500 py-2">Select a department to load students.</div>
              ) : loadingStudents ? (
                <div className="text-center py-4">Loading students...</div>
              ) : errorStudents ? (
                <div className="text-sm text-red-500 py-2">{errorStudents}</div>
              ) : studentOptions.length === 0 ? (
                <div className="text-sm text-gray-500 py-2">No students found for this department.</div>
              ) : (
                <MultiSelect
                  options={studentOptions}
                  value={selectedStudents}
                  onChange={setSelectedStudents}
                  labelledBy="Select"
                  hasSelectAll={true}
                  disabled={!selectedDept} // belt and suspenders
                  overrideStrings={{
                    selectSomeItems: "Select students...",
                    allItemsAreSelected: "All students selected",
                    selectAll: "Select all",
                  }}
                />
              )}
            </div>

            {/* Footer actions */}
            <div className="flex justify-end gap-2">
              <Button
                color="primary"
                onClick={handleSubmit}
                disabled={isDoneDisabled}
              >
                {isSubmitting ? "Saving..." : "Done"}
              </Button>

            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default AddDepartmentStudent;
