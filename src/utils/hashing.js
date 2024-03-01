import bcrypt from "bcrypt";
const hashingPassword = (password, saltRounds) => {
  const passHashing = bcrypt.hashSync(password, saltRounds);
  return passHashing;
};

const comparePassword = (password, userPass) => {
  const match = bcrypt.compareSync(password, userPass);
  return match;
};
export { hashingPassword, comparePassword };
