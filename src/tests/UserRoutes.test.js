// Import supertest
const request = require("supertest");
const app = require("../server")

describe("allow user to sign up", () => {
    test("Responds with 200 status code", async () => {
        const response = (await request(app).post("/users/signup")).send({
            firstName: "test",
            lastName: "test",
            email: "testemail@email.com",
            username: "randomUsername",
            password: "123456678"
        })
        expect(response.statusCode).toBe(200)
    })
})

