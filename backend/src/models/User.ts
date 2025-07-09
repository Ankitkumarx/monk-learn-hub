import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
}, { timestamps: true });

export default mongoose.model('User', userSchema); 