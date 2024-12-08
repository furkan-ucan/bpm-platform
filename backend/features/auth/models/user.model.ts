import bcrypt from 'bcryptjs';
import mongoose, { type Document, type Model, Schema } from 'mongoose';

interface IUserDocument extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'user' | 'manager';
    isActive: boolean;
    lastLogin?: Date;
    loginAttempts: number;
    lockUntil?: Date;
}

interface IUserMethods {
    // eslint-disable-next-line no-unused-vars
    comparePassword(password: string): Promise<boolean>;
}

export interface IUser extends IUserDocument {
    // eslint-disable-next-line no-unused-vars
    comparePassword(password: string): Promise<boolean>;
}

type UserModel = Model<IUser, object, IUserMethods>;

const UserSchema = new Schema<IUser, UserModel>({
    email: {
        type: String,
        required: [true, 'Email adresi gereklidir'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Geçerli bir email adresi giriniz']
    },
    password: {
        type: String,
        required: [true, 'Şifre gereklidir'],
        minlength: [8, 'Şifre en az 8 karakter olmalıdır'],
        select: false
    },
    firstName: {
        type: String,
        required: [true, 'Ad gereklidir'],
        trim: true,
        minlength: [2, 'Ad en az 2 karakter olmalıdır'],
        maxlength: [50, 'Ad en fazla 50 karakter olabilir']
    },
    lastName: {
        type: String,
        required: [true, 'Soyad gereklidir'],
        trim: true,
        minlength: [2, 'Soyad en az 2 karakter olmalıdır'],
        maxlength: [50, 'Soyad en fazla 50 karakter olabilir']
    },
    role: {
        type: String,
        enum: {
            values: ['admin', 'user', 'manager'] as const,
            message: '{VALUE} geçerli bir rol değil'
        },
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    loginAttempts: {
        type: Number,
        default: 0,
        min: [0, 'Giriş denemesi 0\'dan küçük olamaz'],
        max: [5, 'Maksimum giriş denemesi aşıldı']
    },
    lockUntil: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function(_doc: IUser, ret: Record<string, unknown>): void {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            delete ret.password;
        }
    }
});

UserSchema.pre('save', async function(next): Promise<void> {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (_error) {
        next(new Error('Şifre hashleme hatası'));
    }
});

UserSchema.methods.comparePassword = async function(
    this: IUser,
    password: string
): Promise<boolean> {
    if (typeof password !== 'string') {
        throw new Error('Şifre string tipinde olmalıdır');
    }

    try {
        const isMatch = await bcrypt.compare(password, this.password);
        return isMatch;
    } catch (_error) {
        throw new Error('Şifre karşılaştırma hatası');
    }
};

export const User = mongoose.model<IUser, UserModel>('User', UserSchema);