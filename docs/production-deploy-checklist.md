# Checklist bat dau CI/CD StudyMate

## Trang thai hien tai

- Repository GitHub: `https://github.com/myle2006/StudyMate.git`
- Domain production: `studymate.plt.pro.vn`
- Kieu deploy phu hop voi hosting da cap: FTPS port `21`
- Workflow GitHub Actions: `.github/workflows/studymate-ci-cd.yml`
- File huong dan day du: `docs/ci-cd-github-actions.md`

## Buoc 1: Doi mat khau da bi chup man hinh

Thong tin FTP/MySQL da nam trong anh chup man hinh nen nen xem nhu da lo. Truoc khi deploy that:

1. Vao trang quan tri hosting.
2. Doi mat khau FTP.
3. Doi mat khau MySQL.
4. Dung mat khau moi cho cac buoc tiep theo.

## Buoc 2: Import database

1. Vao phpMyAdmin cua hosting.
2. Chon database production duoc cap cho StudyMate.
3. Import file `studymate.sql`.
4. Neu sau nay co file SQL moi trong `database/migrations/`, chay them theo thu tu.

## Buoc 3: Tim dung thu muc web root

Dang nhap FTPS bang FileZilla:

- Host: FTP server duoc cap.
- Protocol: FTP - File Transfer Protocol.
- Encryption: Require explicit FTP over TLS.
- Port: `21`.

Sau khi dang nhap, tim thu muc dang hien tren domain `studymate.plt.pro.vn`. Thu muc nay thuong co ten nhu:

```text
/public_html/
/domains/studymate.plt.pro.vn/public_html/
/studymate.plt.pro.vn/
```

Duong dan chinh xac nay se la gia tri cua GitHub Secret `FTP_SERVER_DIR`.

## Buoc 4: Tao GitHub Secrets

Vao GitHub repo:

```text
Settings > Secrets and variables > Actions > New repository secret
```

Tao 4 secret:

```text
FTP_SERVER
FTP_USERNAME
FTP_PASSWORD
FTP_SERVER_DIR
```

Khong them `ftp://` vao `FTP_SERVER`.

## Buoc 5: Tao file cau hinh tren hosting

Sau khi code duoc upload lan dau, vao FTPS va tao:

```text
config/database.local.php
config/app.local.php
```

Co the dua theo mau:

```text
config/database.local.example.php
config/app.local.example.php
```

Hai file local nay chua thong tin production nen khong commit len GitHub.

## Buoc 6: Push code va chay workflow

1. Cai Git neu may chua co lenh `git`.
2. Trong thu muc du an, commit cac file CI/CD.
3. Push len nhanh `main`.
4. Vao tab `Actions` tren GitHub.
5. Mo workflow `StudyMate CI/CD`.
6. Kiem tra job `Quality gate`.
7. Neu push vao `main`, kiem tra tiep job `Deploy production by FTPS`.

## Buoc 7: Kiem tra website

Mo domain:

```text
https://studymate.plt.pro.vn
```

Kiem tra nhanh:

- Trang chu co hien thi.
- Trang dang nhap/dang ky hoat dong.
- Ket noi database khong loi.
- React assets trong `public/build/react` duoc load.
- Upload file cu khong bi mat trong `public/uploads`.

## Khi bi loi

- Workflow loi o buoc deploy: kiem tra lai FTP secret va `FTP_SERVER_DIR`.
- Domain khong thay doi du workflow xanh: kha nang cao upload sai thu muc.
- Website loi database: kiem tra `config/database.local.php` tren hosting.
- Website loi trang trang hoac mat JS/CSS: kiem tra `public/build/react/.vite/manifest.json` da co tren hosting.
