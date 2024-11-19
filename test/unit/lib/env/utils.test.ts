import {
    getOsEnv,
    getOsEnvNumber,
    getOsEnvArray,
    getOsEnvBoolean,
    formErrorResponseObject,
    getPath,
    getPaths,
    getOsPath,
    getOsPaths,
    toBool,
} from "../../../../src/lib/env/utils";
import sinon from "sinon";
import { join } from "path";

describe("Utils functions", () => {
    const originalEnv = process.env;
    afterEach(() => {
        sinon.restore();
    });
    beforeEach(() => {
        process.env = {
            ...originalEnv
        };
    })

    it("should return environment variable as string", () => {
        process.env.TEST_ENV = "testValue";
        const result = getOsEnv("TEST_ENV");
        expect(result).toBe("testValue");
    });

    it("should return environment variable as number", () => {
        process.env.TEST_ENV = "10";
        const result = getOsEnvNumber("TEST_ENV");
        expect(result).toBe(10);
    });

    it("should return environment variable as array", () => {
        process.env.TEST_ENV = "a,b,c";
        const result = getOsEnvArray("TEST_ENV");
        expect(result).toEqual(["a", "b", "c"]);
    });

    it("should return environment variable as boolean", () => {
        process.env.TEST_ENV = "true";
        const result = getOsEnvBoolean("TEST_ENV");
        expect(result).toBe(true);
    });

    it("should convert string to boolean", () => {
        expect(toBool("true")).toBe(true);
        expect(toBool("false")).toBe(false);
    });

    it("should form an error response object", () => {
        const result = formErrorResponseObject("type", "code", "message");
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]).toEqual(
            expect.objectContaining({
                type: "type",
                code: "code",
                message: "message",
            })
        );
    });

    it("should return correct path based on environment", () => {
        sinon.stub(process, "cwd").returns("/project");
        sinon.stub(process.env, "NODE_ENV").value("development");
        const result = getPath("src/utils.ts");
        expect(result).toBe(join("/project", "src/utils.ts"));
    });

    it("should return production path when NODE_ENV is production", () => {
        sinon.stub(process, "cwd").returns("/project");
        sinon.stub(process.env, "NODE_ENV").value("production");
        const result = getPath("src/utils.ts");
        expect(result).toBe(join("/project", "dist/utils.js"));
    });

    it("should return paths array", () => {
        sinon.stub(process, "cwd").returns("/project");
        sinon.stub(process.env, "NODE_ENV").value("development");
        const result = getPaths(["src/utils.ts", "src/index.ts"]);
        expect(result).toEqual([
            join("/project", "src/utils.ts"),
            join("/project", "src/index.ts"),
        ]);
    });

    it("should return OS path", () => {
        process.env.TEST_ENV = "src/utils.ts";
        sinon.stub(process, "cwd").returns("/project");
        const result = getOsPath("TEST_ENV");
        expect(result).toBe(join("/project", "src/utils.ts"));
    });

    it("should return OS paths array", () => {
        process.env.TEST_ENV="src/utils.ts,src/index.ts";
        sinon.stub(process, "cwd").returns("/project");
        const result = getOsPaths("TEST_ENV");
        expect(result).toEqual([
            join("/project", "src/utils.ts"),
            join("/project", "src/index.ts"),
        ]);
    });
});
