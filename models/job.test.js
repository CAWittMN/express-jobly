"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    title: "new",
    salary: 100,
    equity: 0.1,
    companyHandle: "c1",
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      title: "new",
      id: expect.any(Number),
      salary: 100,
      equity: "0.1",
      companyHandle: "c1",
    });

    const result = await db.query(
      `SELECT title, salary, equity, company_handle
            FROM jobs
            WHERE title = 'new'`
    );
    expect(result.rows).toEqual([
      {
        title: "new",
        salary: 100,
        equity: "0.1",
        company_handle: "c1",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        title: "j1",
        id: expect.any(Number),
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
    ]);
  });
});

/************************************** filter */

describe("filter", function () {
  test("works: filter by title", async function () {
    let jobs = await Job.filter({ title: "j1" });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      },
    ]);
  });

  test("works: filter by minSalary", async function () {
    let jobs = await Job.filter({ minSalary: 150 });
    expect(jobs).toEqual([
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
    ]);
  });

  test("works: filter by hasEquity", async function () {
    let jobs = await Job.filter({ hasEquity: true });
    expect(jobs).toEqual([
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
    ]);
  });

  test("works: filter by title and minSalary", async function () {
    let jobs = await Job.filter({ title: "j1", minSalary: 50 });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      },
    ]);
  });

  test("works: filter by title and hasEquity", async function () {
    let jobs = await Job.filter({ title: "j1", hasEquity: true });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      },
    ]);
  });

  test("works: filter by minSalary and hasEquity", async function () {
    let jobs = await Job.filter({ minSalary: 50, hasEquity: true });
    expect(jobs).toEqual([
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
    ]);
  });

  test("works: ignores other filters", async function () {
    let jobs = await Job.filter({ title: "j1", otherVal: "foo" });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      },
    ]);
  });

  test("works: filter by all", async function () {
    let jobs = await Job.filter({
      title: "j1",
      minSalary: 50,
      hasEquity: true,
    });
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "j1",
        salary: 100,
        equity: "0.1",
        companyHandle: "c1",
      },
    ]);
  });

  test("works: filter by none", async function () {
    let jobs = await Job.filter({});
    expect(jobs).toEqual([
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
    ]);
  });

  test("not found if no matching jobs", async function () {
    try {
      await Job.filter({ title: "nope" });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(1);
    expect(job).toEqual({
      id: 1,
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
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
