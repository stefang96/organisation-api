import { Response } from "express";
import { MemberHelper } from "../utilities/member";

export const getToken = async (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.toString().split(" ")[1];
    if (token) {
      req.body.token = token;
    }
  }

  next();
};

export const checkMemberEmail = async (req, res: Response, next) => {
  try {
    const email = req.body.email;
    console.log(req.body);
    const ifExist = await MemberHelper.memberEmailExist(email);

    console.log(ifExist);
    if (ifExist) {
      throw new Error();
    }

    next();
  } catch (error) {
    return res
      .status(404)
      .send({ status: false, message: "User with this email already exist" });
  }
};
