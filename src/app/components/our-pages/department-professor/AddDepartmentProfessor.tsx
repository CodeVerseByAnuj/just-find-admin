"use client";

import { useEffect, useState } from "react";
import { Button, Modal, ModalBody, ModalHeader, Select } from "flowbite-react";
import { HiOutlinePlus } from "react-icons/hi";
import { getAllDepartments } from "@/app/router/department.router";
import { useDepartmentCourses } from "@/hooks/useDepartmentCourses";
import { MultiSelect, Option } from "react-multi-select-component";
import type { Course } from "@/lib/schemas/course.schema";
import { getProfessorByDepartment } from "@/app/router/department-professor.router";
import { createMultipleCourseProfessors } from '@/app/router/department-professor.router'

interface AddDepartmentProps {
  refetch?: () => void;
  buttonWidth?: string;
}

const AddDepartmentProfessor = ({ refetch, buttonWidth }: AddDepartmentProps) => {
  const [formModal, setFormModal] = useState(false);

  // Departments
  const [departments, setDepartments] = useState<Array<any>>([]);
  const [loadingDept, setLoadingDept] = useState(false);
  const [errorDept, setErrorDept] = useState<string | null>(null);
  const [selectedDept, setSelectedDept] = useState<string | number | "">("");

  // Courses (scoped to department)
  const deptIdForHook = selectedDept ? Number(selectedDept) : undefined;
  const { courses, loading: loadingCourses, error: errorCourses } = useDepartmentCourses(deptIdForHook);
  const [selectedCourse, setSelectedCourse] = useState<string | number | "">("");

  // Department-scoped professors
  const [loadingDeptProfessors, setLoadingDeptProfessors] = useState(false);
  const [errorDeptProfessors, setErrorDeptProfessors] = useState<string | null>(null);
  const [professorOptions, setProfessorOptions] = useState<Option[]>([]);
  const [selectedProfessors, setSelectedProfessors] = useState<Option[]>([]);

  const [submitting, setSubmitting] = useState(false);

  // Load departments on mount
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
        if (!mounted) return;
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

  // Reset course and professor selection when department changes
  useEffect(() => {
    setSelectedCourse("");
    setSelectedProfessors([]);
    setProfessorOptions([]);
    setErrorDeptProfessors(null);
    setLoadingDeptProfessors(false);
  }, [selectedDept]);

  // Fetch professors by department whenever a department is selected
  useEffect(() => {
    let mounted = true;

    const loadDeptProfessors = async (departmentId: number) => {
      try {
        setLoadingDeptProfessors(true);
        setErrorDeptProfessors(null);
        setProfessorOptions([]);
        setSelectedProfessors([]);

        const res = await getProfessorByDepartment(departmentId);
        console.log(res, "Prof Data")
        if (!mounted) return;

        // Expected shape: { success: true, data: [{ id, professor: {...}, created, modified }, ...] }
        const data = Array.isArray(res?.data) ? res.data : [];

        const opts: Option[] = data
          .map((item: any) => {
            const prof = item?.professor ?? item; // in case your wrapper changes
            const id = prof?.id ?? prof?._id ?? null;
            if (id == null) return null;
            const name = `${prof.first_name ?? ""} ${prof.last_name ?? ""}`.trim();
            const label = name || prof?.email || `Professor ${id}`;
            return { label, value: id };
          })
          .filter(Boolean) as Option[];

        setProfessorOptions(opts);
      } catch (err: any) {
        if (!mounted) return;
        setErrorDeptProfessors(err?.message ?? "Failed to load professors for department");
        setProfessorOptions([]);
      } finally {
        if (mounted) setLoadingDeptProfessors(false);
      }
    };

    if (selectedDept) {
      const deptIdNum = typeof selectedDept === "string" ? Number(selectedDept) : selectedDept;
      if (!Number.isNaN(Number(deptIdNum))) {
        loadDeptProfessors(Number(deptIdNum));
      }
    }

    return () => {
      mounted = false;
    };
  }, [selectedDept]);

  // Reset everything when modal closes
  useEffect(() => {
    if (!formModal) {
      setSelectedDept("");
      setSelectedCourse("");
      setSelectedProfessors([]);
      setProfessorOptions([]);
      setErrorDeptProfessors(null);
      setLoadingDeptProfessors(false);
    }
  }, [formModal]);

  function onCloseModal() {
    setFormModal(false);
    setSelectedDept("");
    setSelectedCourse("");
    setSelectedProfessors([]);
    setProfessorOptions([]);
    setErrorDeptProfessors(null);
    setLoadingDeptProfessors(false);
  }

  const shouldDisableCourseSelect = !selectedDept || loadingCourses;
  const visibleCourses = selectedDept ? courses : [];

  const isDoneDisabled =
    loadingDept ||
    loadingCourses ||
    loadingDeptProfessors ||
    !!errorDept ||
    !!errorCourses ||
    !!errorDeptProfessors ||
    selectedDept === "" ||
    selectedCourse === "" ||
    selectedProfessors.length === 0;

  const handleSubmit = async () => {

    // guard rails in case someone bypassed the disabled button
    const courseIdNum =
      typeof selectedCourse === "string" ? Number(selectedCourse) : Number(selectedCourse);
    const professorIds = Array.from(
      new Set(
        (selectedProfessors || [])
          .map(p => Number(p.value))
          .filter(n => Number.isFinite(n) && n > 0)
      )
    );

    if (!courseIdNum || professorIds.length === 0) return;

    try {
      setSubmitting(true);
      await createMultipleCourseProfessors({
        course_id: courseIdNum,
        professor_ids: professorIds,
      });

      // success: optionally refresh upstream lists
      refetch?.();

      // reset and close
      onCloseModal();
    } catch (err) {
      // swap this for your toast/snackbar/modal
      console.error("❌ Failed to assign professors:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Button
        onClick={() => setFormModal(true)}
        color="primary"
        className={buttonWidth}
        aria-label="Add professors to course"
      >
        <HiOutlinePlus className="mr-2" />
        Assign course
      </Button>

      <Modal show={formModal} size="lg" onClose={onCloseModal} popup>
        <ModalHeader className="p-6">Add Course to Professor</ModalHeader>
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

            {/* Course select (still scoped by department via your hook) */}
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

            {/* Professors multiselect (populated by department) */}
            {loadingDeptProfessors ? (
              <div className="text-center py-6">Loading professors for selected department...</div>
            ) : errorDeptProfessors ? (
              <div className="text-center py-6 text-red-500">{errorDeptProfessors}</div>
            ) : (
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Professors <span className="text-red-500">*</span>
                </label>
                <MultiSelect
                  options={professorOptions}
                  value={selectedProfessors}
                  onChange={setSelectedProfessors}
                  labelledBy="Select professors"
                  hasSelectAll={true}
                  overrideStrings={{
                    selectSomeItems: "Select professors...",
                    allItemsAreSelected: "All professors selected",
                    selectAll: "Select all",
                  }}
                  disabled={!selectedDept || professorOptions.length === 0}
                />
              </div>
            )}

            {/* Footer actions */}
            <div className="flex justify-end gap-2">
              <Button
                color="primary"
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  isDoneDisabled
                }
              >
                {submitting ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default AddDepartmentProfessor;
