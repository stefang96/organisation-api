import { app } from "../app";
import { createConnection } from "typeorm";
import request from "supertest";
import * as appConfig from "../config";

const signUpData = {
  email: "admin@gmail.com",
  firstName: "Stefan",
  lastName: "Grujicic",
  name: "Organisation 1",
  address: "Address",
  type: "Type organisation",
  numberOfEmployees: 8,
};

describe("/POST login", () => {
  beforeAll(async (done) => {
    await createConnection(appConfig.dbOptions)
      .then(async (connection) => {
        console.log("Connected to DB");
      })
      .catch((error) => console.log("TypeORM connection error: ", error));

    done();
  });

  it("test bad request login", async (done) => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: signUpData.email, password: "1234" });

    console.log(res.body);
    expect(res.status).toBe(400);
    expect(res.body.status).toBe(false);
    done();
  });
  it("test success login", async (done) => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "stefangrujicic996@gmail.com", password: "87ac2baa2728" });

    console.log(res.body);
    console.log(res.status);
    expect(res.status).toBe(201);
    expect(res.body.status).toBe(true);
    done();
  });
});
/*
describe("/GET members", () => {
  it("get members success request", async (done) => {
    const res = await request(app).put("/api/member");

    console.log(res.body);
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    done();
  });  
});*/
