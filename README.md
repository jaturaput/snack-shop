# ร้านขนม · ระบบบัญชี

เว็บแอปบันทึกบัญชีร้านขนม เชื่อมกับ Google Sheets เป็น database  
ใช้ได้ทุก device — คอม มือถือ tablet เปิดพร้อมกันได้ข้อมูลตรงกันหมด

## วิธี Setup (ทำครั้งเดียว ~10 นาที)

### ขั้นที่ 1 — สร้าง Google Sheet

1. ไปที่ [sheets.google.com](https://sheets.google.com)
2. สร้าง Spreadsheet ใหม่ ตั้งชื่อ เช่น `ร้านขนม DB`

### ขั้นที่ 2 — วาง Apps Script

1. ใน Sheet → เมนู **Extensions → Apps Script**
2. ลบโค้ดเดิมออกทั้งหมด
3. วางโค้ดจากไฟล์ `Code.gs` ในโปรเจกต์นี้
4. กด **Save** (Ctrl+S)

### ขั้นที่ 3 — Deploy เป็น Web App

1. กด **Deploy → New deployment**
2. กด ⚙ (gear icon) → เลือก **Web app**
3. ตั้งค่า:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. กด **Deploy**
5. ครั้งแรก Google จะขอ permission → **Review permissions → Allow**
6. **Copy URL** ที่ได้ (หน้าตาแบบนี้: `https://script.google.com/macros/s/AKfyc.../exec`)

### ขั้นที่ 4 — เชื่อมกับเว็บ

1. เปิดหน้าเว็บ → กด **ตั้งค่า API** (มุมขวาบน)
2. วาง URL จากขั้นที่ 3
3. กด **บันทึก & ทดสอบ**
4. ถ้าขึ้น ✓ เชื่อมต่อสำเร็จ — พร้อมใช้งาน!

## Deploy บน GitHub Pages

```bash
# 1. สร้าง repo บน GitHub ชื่อ snack-shop
# 2. push ไฟล์ขึ้น
git init
git add .
git commit -m "init"
git remote add origin https://github.com/[username]/snack-shop.git
git push -u origin main

# 3. ไปที่ Settings → Pages → Source: main → / (root) → Save
# 4. เข้าได้ที่ https://[username].github.io/snack-shop
```

## โครงสร้างไฟล์

```
index.html   ← เว็บแอปทั้งหมด (HTML + CSS + JS ในไฟล์เดียว)
Code.gs      ← Google Apps Script (วางใน Apps Script Editor)
README.md
```

## การทำงาน

```
Browser (GitHub Pages)
       ↕ fetch (HTTPS)
Google Apps Script (Web App URL)
       ↕ SpreadsheetApp API
Google Sheets (database)
```

- ข้อมูลเก็บใน Google Sheets — ไม่หายแม้ล้าง browser
- เปิดได้ทุก device พร้อมกัน ข้อมูล sync ทันที
- API URL เก็บใน localStorage ของแต่ละ browser (ใส่ครั้งเดียว)
- ไม่มีค่าใช้จ่าย — Google Apps Script ฟรีสำหรับการใช้งานส่วนตัว

## Features

- บันทึก ซื้อของ / รับเงินจากร้าน / เบิกเงินเดือน / เบิกเงินปันผล
- หักคืนหนี้เงินร้านอัตโนมัติเมื่อรับเงิน
- ติดตาม Cloud Pocket 3 กระเป๋า (เงินร้าน 40% / เงินเดือน 40% / เงินปันผล 20%)
- แสดงยอดสะสม หนี้ร้าน กำไรพร้อมแบ่ง แบบ real-time
