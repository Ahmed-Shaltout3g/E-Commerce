import { userModel } from "../../../DB/Models/user.model.js";
import { sendEmail } from "../../services/sendEmail.js";
import { comparePassword, hashingPassword } from "../../utils/hashing.js";
import { decodeToken, generateToken } from "../../utils/tokenFunctions.js";
import bcrypt from "bcrypt";
import { emailTemplate } from "./../../utils/emailTemplate.js";
import { nanoid } from "nanoid";
import { decryptText, encryptText } from "../../utils/encryptionFunction.js";

export const signUp = async (req, res, next) => {
  const { userName, email, password, age, repassword, phone, gender, address } =
    req.body;
  if (password == repassword) {
    const user = await userModel.findOne({ email });
    if (user) {
      next(new Error("Email Already Exist", { cause: 401 }));
    } else {
      // const newUser = await new userModel({

      // });
      const encryptPassword = encryptText(
        password,
        process.env.CRYPTO_SECRET_KEY
      );

      const token = generateToken({
        payload: {
          userName,
          email,
          password: encryptPassword,
          gender,
          age,
          phone,
          address,
        },
      });
      if (token) {
        const confirmationLink = `${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}`;

        // const message = `<a href=${confirmationLink}>click here</a>`;
        const emailSent = await sendEmail({
          to: email,
          subject: "Confirmation email",
          message: emailTemplate({
            link: confirmationLink,
            linkData: "Click to Confirm",
            subject: "confirmation email ",
          }),
        });
        console.log(emailSent);
        if (emailSent) {
          // await newUser.save();
          return res
            .status(201)
            .json({ message: "Sign up success please confirm email" });
        } else {
          next(new Error("Send Email Fail please try again", { cause: 500 }));
        }
      } else {
        next(new Error("Token generastion fail", { cause: 400 }));
      }
    }
  } else {
    next(new Error("password must match repassword", { cause: 401 }));
  }
};

// _____________________confirmEmail________________________

export const confirmEmail = async (req, res, next) => {
  const { token } = req.params;
  const decode = decodeToken({ payload: token });
  if (decode) {
    const decryptPass = decryptText(
      decode?.password,
      process.env.CRYPTO_SECRET_KEY
    );
    decode.isConfirmed = true;
    decode.password = decryptPass;
    const confirmUser = new userModel({
      ...decode,
    });
    await confirmUser.save();
    res
      .status(200)
      .json({ message: "Confirmation success ,please try to Login" });
  } else {
    next(new Error("unknown error ,please try again", { cause: 500 }));
  }
};

// ______________________________login________________________________

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email, isConfirmed: true });
  if (!user) {
    return next(new Error("In-valid email or password", { cause: 400 }));
  }
  const match = bcrypt.compareSync(password, user.password);
  if (!match) {
    return next(new Error("In-valid email or password", { cause: 401 }));
  }
  const token = generateToken({
    payload: {
      _id: user._id,
      userName: user.userName,
      phone: user.phone,
      role: user.role,
      email: user.email,
      address: user.address,
      isLogedIn: true,
      isConfirmed: user.isConfirmed,
    },
  });
  const Loggenin = await userModel.findByIdAndUpdate(
    { _id: user._id },
    { isLogedIn: true }
  );
  if (!Loggenin) {
    return next(new Error("please logged in again "));
  }
  res.status(200).json({ message: "login success", token });
};

// ________________________forgetPassword_______________________________--

export const forgetPass = async (req, res, next) => {
  const { email } = req.body;
  const emailExist = await userModel.findOne({ email });
  if (!emailExist) {
    return next(new Error("In-valid Email ", { cause: 401 }));
  }
  const code = nanoid(5);
  const codeHash = hashingPassword(code, parseInt(process.env.SALT_ROUNDS));
  const token = generateToken({
    payload: { email: emailExist.email, codeHash },
  });

  if (!token) {
    return next(
      new Error("Token generastion fail plrase try again", { cause: 500 })
    );
  }
  const restPasswordURL = `${req.protocol}://${req.headers.host}/auth/resetPass/${token}`;

  const emailSent = await sendEmail({
    to: emailExist.email,
    subject: "Reset Password",
    message: emailTemplate({
      link: restPasswordURL,
      linkData: "Click To Reset",
      subject: "Reset Password",
    }),
  });

  if (!emailSent) {
    return next(
      new Error(" Fail send email ! please try again", { cause: 409 })
    );
  }
  const userUpdate = await userModel.findOneAndUpdate(
    { email },
    { code: codeHash },
    { new: true }
  );
  res.status(201).json({ message: "Please check your email" });
};

// ________________________ResetPassword_______________________________--

export const resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const decode = decodeToken({ payload: token });
  if (!decode?.codeHash) {
    return next(new Error("decode fail ,please try again", { cause: 500 }));
  }
  const user = await userModel.findOne({
    email: decode?.email,
    code: decode?.codeHash,
    changePassAt: Date.now(),
  });
  if (!user) {
    return next(
      new Error("You Already Reset Password , Please Try To Login  ", {
        cause: 401,
      })
    );
  }

  user.password = newPassword;
  user.code = null;
  const userSave = await user.save();

  if (!userSave) {
    return next(
      new Error(" fail to reset your password ,please try again", {
        cause: 500,
      })
    );
  }
  res.status(200).json({ message: "Done , please try to login" });
};
