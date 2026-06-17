const { Schema, model } = require('mongoose');

const generatePublicId = (prefix) => {
  return prefix + '-' + Math.random().toString(36).substring(2, 8).toUpperCase() + Math.floor(Math.random() * 1000);
};

const baseUserSchemaFields = {
  publicId: {
    type: String,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
};

const userSchema = new Schema(baseUserSchemaFields, { timestamps: true });
const adminSchema = new Schema(baseUserSchemaFields, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.publicId) {
    this.publicId = generatePublicId('USR');
  }
});

adminSchema.pre('save', async function () {
  if (!this.publicId) {
    this.publicId = generatePublicId('ADM');
  }
});

const User = model('User', userSchema);
const Admin = model('Admin', adminSchema);

module.exports = {
  User,
  Admin,
};
