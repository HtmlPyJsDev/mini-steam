const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    downloads: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Game',
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

userSchema.methods.toSafeJSON = function toSafeJSON() {
  const obj = this.toObject({ versionKey: false });
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
