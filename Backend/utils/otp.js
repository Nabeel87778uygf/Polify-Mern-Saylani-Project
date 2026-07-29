export const generateOTP = () => {
    return String(Math.floor(100000 + Math.random() * 900000));
};

export const otpExpiry = () => {
    return new Date(Date.now() + 10 * 60 * 1000);
};

export const optvalid = (user, otp) => {
    if (!user.otp || !user.otpExpiry) {
        return false;
    }
    return user.otp === otp && user.otpExpiry > new Date();
};