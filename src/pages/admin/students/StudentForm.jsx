import React, { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Card, Field, Input, LoadingState, PageHeader, Select, useToast } from "../../../components/ui";
import { createStudent, getStudentById, updateStudent } from "../../../services/studentService";

const initialForm = {
  full_name: "",
  email: "",
  phone: "",
  student_code: "",
  password: "",
  status: "active",
};

function validate(form, isEdit) {
  const errors = {};

  if (!form.full_name.trim()) {
    errors.full_name = "Họ tên là bắt buộc.";
  } else if (form.full_name.trim().length < 3) {
    errors.full_name = "Họ tên phải có ít nhất 3 ký tự.";
  } else if (form.full_name.trim().length > 150) {
    errors.full_name = "Họ tên không được vượt quá 150 ký tự.";
  }

  if (!form.email.trim()) {
    errors.email = "Email là bắt buộc.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Email không đúng định dạng.";
  }

  if (form.phone && !/^(0|\+84)?[0-9]{8,11}$/.test(form.phone)) {
    errors.phone = "Số điện thoại không hợp lệ.";
  }

  if (!form.student_code.trim()) {
    errors.student_code = "Mã sinh viên là bắt buộc.";
  } else if (form.student_code.trim().length > 50) {
    errors.student_code = "Mã sinh viên không được vượt quá 50 ký tự.";
  }

  if (!isEdit && form.password && form.password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
  }

  if (!["active", "inactive", "locked"].includes(form.status)) {
    errors.status = "Trạng thái không hợp lệ.";
  }

  return errors;
}

export default function StudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    async function loadStudent() {
      setLoading(true);
      setMessage("");

      try {
        const response = await getStudentById(id);
        setForm({
          full_name: response.data?.full_name || "",
          email: response.data?.email || "",
          phone: response.data?.phone || "",
          student_code: response.data?.student_code || "",
          password: "",
          status: response.data?.status || "active",
        });
      } catch (err) {
        setMessage(err.message || "Không thể tải thông tin sinh viên.");
      } finally {
        setLoading(false);
      }
    }

    loadStudent();
  }, [id, isEdit]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(form, isEdit);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setMessage("");

    try {
      if (isEdit) {
        const { password, ...payload } = form;
        await updateStudent(id, payload);
        toast.success("Đã cập nhật thông tin sinh viên.");
      } else {
        await createStudent(form);
        toast.success("Đã thêm sinh viên mới.");
      }
      navigate("/admin/students");
    } catch (err) {
      setErrors(err.errors || {});
      setMessage(err.message || "Không thể lưu sinh viên.");
    } finally {
      setLoading(false);
    }
  }

  if (loading && isEdit && !form.email) {
    return <LoadingState label="Đang tải thông tin sinh viên..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Quản lý sinh viên"
        title={isEdit ? "Cập nhật sinh viên" : "Thêm sinh viên"}
        description={isEdit ? "Chỉnh sửa thông tin tài khoản sinh viên." : "Tạo tài khoản sinh viên mới với role student."}
        actions={
          <Button to="/admin/students" variant="secondary">
            <ArrowLeft size={16} /> Quay lại
          </Button>
        }
      />

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert tone="error">{message}</Alert>

          <div className="grid gap-5 lg:grid-cols-2">
            <Field label="Họ tên" error={errors.full_name}>
              <Input value={form.full_name} onChange={(event) => updateField("full_name", event.target.value)} />
            </Field>

            <Field label="Email" error={errors.email}>
              <Input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} />
            </Field>

            <Field label="Mã sinh viên" error={errors.student_code}>
              <Input value={form.student_code} onChange={(event) => updateField("student_code", event.target.value)} />
            </Field>

            <Field label="Số điện thoại" error={errors.phone}>
              <Input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
            </Field>

            {!isEdit && (
              <Field label="Mật khẩu" error={errors.password}>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  placeholder="Để trống để dùng mã sinh viên"
                />
              </Field>
            )}

            <Field label="Trạng thái" error={errors.status}>
              <Select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Vô hiệu hóa</option>
                <option value="locked">Bị khóa</option>
              </Select>
            </Field>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-end">
            <Button type="button" to="/admin/students" variant="secondary">
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              <Save size={16} /> {loading ? "Đang lưu..." : isEdit ? "Cập nhật" : "Thêm sinh viên"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
