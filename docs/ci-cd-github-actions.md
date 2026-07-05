# Luong CI/CD GitHub Actions cho StudyMate tren hosting FTPS

## 1. Hieu nhanh quy trinh

Du an StudyMate dang co backend PHP va frontend React/Vite. Khi lam CI/CD, ban khong upload code thu cong nua. Luong lam viec se la:

1. Ban sua code tren may.
2. Ban commit va push code len GitHub.
3. GitHub Actions tu dong kiem tra code.
4. Neu kiem tra thanh cong, GitHub build file React trong `public/build/react`.
5. GitHub dang nhap vao hosting bang FTPS va upload code len domain.
6. Hosting chay code PHP va ket noi MySQL bang file cau hinh local tren server.

Voi thong tin hosting ban duoc cap, chung ta dung FTPS port `21`, khong dung SSH.

## 2. Viec can lam ngay truoc khi cau hinh

Thong tin FTP va MySQL da tung xuat hien trong anh chup man hinh. De an toan, hay doi lai mat khau FTP va MySQL trong trang quan tri hosting truoc khi dua website len production. Sau do chi luu mat khau moi trong GitHub Secrets, khong ghi vao source code.

## 3. Chuan bi database tren hosting

1. Dang nhap trang quan tri hosting/phpMyAdmin.
2. Chon database MySQL duoc cap cho domain StudyMate.
3. Import file [studymate.sql](C:/xampp/htdocs/StudyMate/studymate.sql).
4. Neu co file migration moi trong [database/migrations](C:/xampp/htdocs/StudyMate/database/migrations), chay them cac file do theo thu tu.
5. Khong de GitHub Actions tu dong import lai `studymate.sql`, vi viec nay co the ghi de du lieu that.

## 4. Tao file cau hinh rieng tren hosting

Vao FTP, trong thu muc source tren hosting, tao file:

```text
config/database.local.php
```

Noi dung mau:

```php
<?php

return [
    'host' => '127.0.0.1',
    'port' => '3306',
    'database' => 'ten_database_duoc_cap',
    'username' => 'ten_user_mysql_duoc_cap',
    'password' => 'mat_khau_mysql_moi',
    'charset' => 'utf8mb4',
];
```

Tao them file:

```text
config/app.local.php
```

Noi dung mau:

```php
<?php

return [
    'jwt_secret' => 'mot_chuoi_bi_mat_dai_va_khac_mat_dinh',
    'jwt_ttl' => 86400,
];
```

Hai file `*.local.php` da duoc dua vao `.gitignore` va workflow cung khong upload de tranh lo thong tin production.

## 5. Xac dinh thu muc upload cua domain

Dung FileZilla hoac trinh quan ly file cua hosting:

1. Dang nhap bang FTP/FTPS duoc cap.
2. Tim thu muc web root cua domain, thuong la `/public_html/`, `/domains/<domain>/public_html/`, hoac thu muc co san cua subdomain.
3. Mo thu muc do, neu co file test cua hosting thi do la noi can upload website.
4. Gia tri nay se duoc luu vao secret `FTP_SERVER_DIR`.

Vi moi hosting dat duong dan khac nhau, khong nen doan. Hay kiem tra truc tiep bang FTP truoc.

## 6. Tao GitHub Secrets

Vao repository tren GitHub:

```text
Settings > Secrets and variables > Actions > New repository secret
```

Tao cac secret sau:

```text
FTP_SERVER=ten_ftp_server_duoc_cap
FTP_USERNAME=ten_tai_khoan_ftp_duoc_cap
FTP_PASSWORD=mat_khau_ftp_moi
FTP_SERVER_DIR=/duong/dan/web-root-cua-domain/
```

Luu y:

- `FTP_SERVER` chi la host, khong them `ftp://`.
- `FTP_SERVER_DIR` nen ket thuc bang dau `/`.
- Neu upload nham thu muc, website se khong hien tren domain du da deploy thanh cong.
- Vi thong tin dang nhap da tung xuat hien trong anh chup man hinh, nen doi mat khau truoc khi tao secret.
- Xem checklist bat dau tai [production-deploy-checklist.md](C:/xampp/htdocs/StudyMate/docs/production-deploy-checklist.md).

## 7. Luong lam viec hang ngay

1. Sua code trong `C:\xampp\htdocs\StudyMate`.
2. Chay local neu can:

```bash
npm run build
```

3. Commit code.
4. Push len nhanh rieng va tao pull request vao `main`, hoac push truc tiep vao `main` neu dang lam bai/du an ca nhan.
5. Vao tab `Actions` tren GitHub de xem workflow `StudyMate CI/CD`.
6. Neu job `Quality gate` xanh, code da qua kiem tra.
7. Khi code vao `main` hoac `master`, job `Deploy production by FTPS` se upload len hosting.
8. Mo domain tren trinh duyet va kiem tra cac man hinh chinh: login, dashboard, danh sach mon hoc, danh sach sinh vien.

## 8. Neu workflow bi loi

Hay doc loi trong tab `Actions`.

Cac loi thuong gap:

- Sai FTP secret: kiem tra lai `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.
- Sai `FTP_SERVER_DIR`: workflow xanh nhung domain khong thay doi, nghia la upload sai thu muc.
- React build loi: chay `npm run build` tren may de xem loi chi tiet.
- PHP syntax loi: xem file va dong loi trong job `Lint PHP syntax`.
- Ket noi database loi tren website: kiem tra `config/database.local.php` tren hosting.

## 9. Nhung thu pipeline khong lam

Pipeline hien tai khong tu dong:

- Tao database.
- Import database production.
- Doi cau hinh DNS/domain.
- Tao file `config/database.local.php` tren hosting.
- Xoa file upload cua nguoi dung trong `public/uploads`.

Cac viec nay can lam thu cong de tranh mat du lieu va tranh ghi de cau hinh production.
