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
      enum: ['user', 'developer', 'security', 'admin'],
      default: 'user',
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 40,
      default: '',
    },
    bio: {
      type: String,
      maxlength: 280,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    avatarKey: {
      type: String,
      default: '',
    },
    banned: {
      type: Boolean,
      default: false,
    },
    bannedReason: {
      type: String,
      default: '',
      maxlength: 200,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    friendRequestsIn: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    friendRequestsOut: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    developerGameId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Game',
      default: null,
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

userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    _id: this._id,
    email: this.email,
    role: this.role,
    displayName: this.displayName || '',
    bio: this.bio || '',
    avatarUrl: this.avatarUrl || '',
    banned: !!this.banned,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
