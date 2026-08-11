# StudyMate SRS Testing Agent

Agent này dùng để gom context source code StudyMate và tạo prompt sinh tài liệu SRS phục vụ kiểm thử.

## Lệnh sử dụng

Tạo context bundle và prompt chạy AI thủ công:

```bash
npm run srs:agent
```

Gọi AI để sinh draft vào `docs/srs-testing/generated/agent-output.md`:

```bash
npm run srs:agent:generate
```

Render diagram trong `05-diagrams.md` ra SVG, PNG và XML:

```bash
npm run srs:diagrams
```

Use case và diagram tách theo từng chức năng nằm ở:

```text
docs/srs-testing/by-function-usecases.md
docs/srs-testing/diagrams/by-function/
```

## Cấu hình API

Agent đọc API key từ `.env` hoặc biến môi trường:

```text
AI_PROVIDER=openai
AI_API_KEY=your_key_here
AI_MODEL=your_model_here
```

Hoặc:

```text
OPENAI_API_KEY=your_key_here
```

Nếu chưa có API key, dùng `npm run srs:agent` để tạo prompt/context rồi dán vào công cụ AI bạn muốn dùng.

## Output

| File | Ý nghĩa |
|---|---|
| `generated/context-bundle.md` | Source code liên quan đã được gom lại |
| `generated/run-prompt.md` | Prompt hoàn chỉnh để đưa cho AI |
| `generated/agent-output.md` | Draft do AI sinh ra khi chạy chế độ generate |
| `diagrams/*.svg` | Ảnh diagram dạng vector |
| `diagrams/*.png` | Ảnh diagram dạng bitmap để chèn vào Word/PowerPoint |
| `diagrams/*.xml` | Bản XML của SVG diagram |

## Quy trình đề xuất

1. Chạy `npm run srs:agent`.
2. Kiểm tra `generated/run-prompt.md`.
3. Nếu có API key, chạy `npm run srs:agent:generate`.
4. Review draft trong `generated/agent-output.md`.
5. Cập nhật lại các file chính từ `02-system-analysis.md` đến `08-traceability-matrix.md`.
