import { Router } from "express";
import bcrypt from "bcrypt";
import { UserModel } from "../models/user.mjs";
const router = Router();

async function hashPassword(password) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(password, salt);
}

router.get("/", async (req, res) => {
  const users = await UserModel.find();
  res.send(
    users.map((user) => {
      return { username: user.username, role: user.role };
    })
  );
});
router.post("/create", async (req, res) => {
  if (req.body.length != undefined) {
    const users = await Promise.all([
      ...req.body.map(async (i) => {
        const newPassword = await hashPassword(i.password);
        return { ...i, password: newPassword };
      }),
    ]);

    const createdUsers = await UserModel.create(users);
    res.send(createdUsers);
    return;
  }

  const newPassword = await hashPassword(req.body.password);
  const newUser = await UserModel.create({
    ...req.body,
    password: newPassword,
  });
  res.send(newUser);
});
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await UserModel.findOne({ username: username });
  if ((user == undefined) | (user == null)) {
    res.send({ result: null, error: "invalid username or password" });
    return;
  }
  const isUser = await bcrypt.compare(password, user.password);
  if (isUser) {
    res.send({ result: { username, role: user.role }, error: null });
    return;
  }
  res.send({ result: null, error: "invalid username or password" });
});
export default router;
