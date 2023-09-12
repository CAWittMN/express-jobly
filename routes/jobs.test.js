"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  u3Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /job */
describe("POST /jobs", function () {
  const newJob = {
    title: "new",
    salary: 100,
    equity: "0.1",
    companyHandle: "c1",
  };

  test("ok for admins", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "new",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      },
    });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "new",
        salary: 100,
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("unauth for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.statusCode).toEqual(401);
  });

  test("works for logged in users", async function () {
    const resp = await request(app)
      .get("/jobs")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "j1",
          salary: 100,
          equity: "0.1",
          companyHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j2",
          salary: 200,
          equity: "0.2",
          companyHandle: "c2",
        },
        {
          id: expect.any(Number),
          title: "j3",
          salary: 300,
          equity: null,
          companyHandle: "c3",
        },
      ],
    });
  });

  test("works: filtering on title", async function () {
    const resp = await request(app)
      .get("/jobs?title=j1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "j1",
          salary: 100,
          equity: "0.1",
          companyHandle: "c1",
        },
      ],
    });
  });

  test("works: filtering on minSalary", async function () {
    const resp = await request(app)
      .get("/jobs?minSalary=250")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "j3",
          salary: 300,
          equity: null,
          companyHandle: "c3",
        },
      ],
    });
  });

  test("works: filtering on hasEquity", async function () {
    const resp = await request(app)
      .get("/jobs?hasEquity=true")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "j1",
          salary: 100,
          equity: "0.1",
          companyHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j2",
          salary: 200,
          equity: "0.2",
          companyHandle: "c2",
        },
      ],
    });
  });

  test("works: filtering on title and minSalary", async function () {
    const resp = await request(app)
      .get("/jobs?title=j1&minSalary=50")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "j1",
          salary: 100,
          equity: "0.1",
          companyHandle: "c1",
        },
      ],
    });
  });

  test("works: filtering on title and hasEquity", async function () {
    const resp = await request(app)
      .get("/jobs?title=j1&hasEquity=true")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "j1",
          salary: 100,
          equity: "0.1",
          companyHandle: "c1",
        },
      ],
    });
  });

  test("works: filtering on minSalary and hasEquity", async function () {
    const resp = await request(app)
      .get("/jobs?minSalary=50&hasEquity=true")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "j1",
          salary: 100,
          equity: "0.1",
          companyHandle: "c1",
        },
        {
          id: expect.any(Number),
          title: "j2",
          salary: 200,
          equity: "0.2",
          companyHandle: "c2",
        },
      ],
    });
  });

  test("works: filtering on title, minSalary, and hasEquity", async function () {
    const resp = await request(app)
      .get("/jobs?title=j1&minSalary=50&hasEquity=true")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "j1",
          salary: 100,
          equity: "0.1",
          companyHandle: "c1",
        },
      ],
    });
  });

  test("work: ignores other query string keys", async function () {
    const resp = await request(app)
      .get("/jobs?title=j1&minSalary=50&hasEquity=true&other=thing")
      .set("authorization", `Bearer ${u1Token}`);

    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "j1",
          salary: 100,
          equity: "0.1",
          companyHandle: "c1",
        },
      ],
    });
  });

  test("bad request if minSalary is not a number", async function () {
    const resp = await request(app)
      .get("/jobs?minSalary=not-a-number")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });

  test("bad request if hasEquity is not a boolean", async function () {
    const resp = await request(app)
      .get("/jobs?hasEquity=not-a-boolean")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });

  test("bad request if title is not a string", async function () {
    const resp = await request(app)
      .get("/jobs?title=23")
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for logged in users", async function () {
    const resp = await request(app)
      .get(`/jobs/${1}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "j1",
        salary: 100,
        equity: "0.1",
        company: {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img",
        },
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get(`/jobs/${1}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .get(`/jobs/${999}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .patch(`/jobs/${1}`)
      .send({
        title: "new",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "new",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      },
    });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
      .patch(`/jobs/${1}`)
      .send({
        title: "new",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
      .patch(`/jobs/${999}`)
      .send({
        title: "new",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const resp = await request(app)
      .patch(`/jobs/${1}`)
      .send({
        id: 999,
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/${1}`)
      .send({
        salary: "not-a-number",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .delete(`/jobs/${1}`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.body).toEqual({ deleted: `${1}` });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
      .delete(`/jobs/${1}`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .delete(`/jobs/${999}`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
