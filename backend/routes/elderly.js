const express = require('express');
const router = express.Router();
const db = require('../db/database');
const multer = require('multer');
const path = require('path');

// Cấu hình multer để upload ảnh
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // giới hạn 5MB
  }
});

// Lấy tất cả thông tin người cao tuổi
router.get('/', (req, res) => {
  db.all('SELECT * FROM elderly', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Thêm thông tin người cao tuổi
router.post('/', upload.single('photo'), (req, res) => {
  const { 
    name, 
    dateOfBirth, 
    gender, 
    address,
    hometown,    // Thêm trường quê quán
    phone, 
    joinDate, 
    cardNumber, 
    cardIssueDate,
    status = 'alive',
    deathDate = null
  } = req.body;

  const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

  db.run(
    `INSERT INTO elderly (
      name, dateOfBirth, gender, address, hometown, phone, 
      joinDate, cardNumber, cardIssueDate, photoUrl, 
      status, deathDate
    ) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, dateOfBirth, gender, address, hometown, phone, joinDate, cardNumber, cardIssueDate, photoUrl, status, deathDate],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(201).json({ id: this.lastID });
    }
  );
});

// Cập nhật trạng thái người cao tuổi
router.patch('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, deathDate } = req.body;

  if (!['alive', 'deceased'].includes(status)) {
    return res.status(400).json({ error: 'Trạng thái không hợp lệ' });
  }

  db.run(
    `UPDATE elderly SET status = ?, deathDate = ? WHERE id = ?`,
    [status, deathDate, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Không tìm thấy người cao tuổi' });
        return;
      }
      res.json({ message: 'Cập nhật trạng thái thành công' });
    }
  );
});

// Cập nhật ảnh người cao tuổi
router.patch('/:id/photo', upload.single('photo'), (req, res) => {
  const { id } = req.params;
  
  if (!req.file) {
    return res.status(400).json({ error: 'Không có file ảnh được gửi lên' });
  }

  const photoUrl = `/uploads/${req.file.filename}`;

  db.run(
    `UPDATE elderly SET photoUrl = ? WHERE id = ?`,
    [photoUrl, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Không tìm thấy người cao tuổi' });
        return;
      }
      res.json({ message: 'Cập nhật ảnh thành công', photoUrl });
    }
  );
});

// Cập nhật thông tin người cao tuổi
router.put('/:id', upload.single('photo'), (req, res) => {
  const { id } = req.params;
  const { 
    name, 
    dateOfBirth, 
    gender, 
    address,
    hometown,
    phone, 
    joinDate, 
    cardNumber, 
    cardIssueDate,
    status,
    deathDate
  } = req.body;

  const photoUrl = req.file ? `/uploads/${req.file.filename}` : req.body.photoUrl;

  db.run(
    `UPDATE elderly SET 
      name = ?, 
      dateOfBirth = ?, 
      gender = ?, 
      address = ?, 
      hometown = ?, 
      phone = ?,
      joinDate = ?, 
      cardNumber = ?, 
      cardIssueDate = ?, 
      photoUrl = ?,
      status = ?,
      deathDate = ?
    WHERE id = ?`,
    [name, dateOfBirth, gender, address, hometown, phone, joinDate, cardNumber, cardIssueDate, photoUrl, status, deathDate, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Không tìm thấy người cao tuổi' });
        return;
      }
      res.json({ message: 'Cập nhật thông tin thành công' });
    }
  );
});

// Xóa thông tin người cao tuổi
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM elderly WHERE id = ?`, id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.status(204).send();
  });
});

module.exports = router;