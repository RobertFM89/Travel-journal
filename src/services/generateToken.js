import crypto from 'crypto';

export default function generateToken() {
    const token = crypto.randomBytes(15).toString('hex');
    return token

}
