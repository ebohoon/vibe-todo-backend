const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '할일 제목은 필수입니다.'],
    trim: true,
    maxlength: [200, '제목은 200자 이하여야 합니다.']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, '설명은 1000자 이하여야 합니다.']
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // createdAt과 updatedAt 자동 생성
});

module.exports = mongoose.model('Todo', todoSchema);

