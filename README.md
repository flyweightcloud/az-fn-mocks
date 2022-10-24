# A lightweight and opinionated tool for mocking Azure Function Contexts

The goal of this library is to provide a very simple way to unit test Azure Functions.

Unit testing of Azure Functions should simply exercise the functions use of the context object,
but not involve the bindings or function.json. This is better handled at the intergration testing
level, which will likely involve the use of the Azure Function CLI.

## Gettings started

`npm install --dev @flyweightcloud/azure-fn-context-mocks`

With Yarn

`yarn add --dev @flyweightcloud/azure-fn-context-mocks`

## A simple mocking example

```javascript
import { AzureFunction, Context } from "@azure/functions"
import { AzureContextMock, MockForm, TestHttpRequest } from "..";

const testFn: AzureFunction = (context: Context) => {
    context.log.info("test function")
    const form = context.req?.parseFormBody()
    context.res = {
        status: 200,
        body: {
            name: form?.get("name")?.value.toString(),
            city: context.req?.query.city
        }
    };
}

describe("Basic HTTP Context Test object", () => {
    it("Should work with just the simple Context object passed in", async () => {
        const req = new TestHttpRequest({method: "POST", query: {"city": "Atlanta"}})
        req.parseFormBody = jest.fn().mockReturnValue(new MockForm([["name", "Mark"]]))
        const context = new AzureContextMock({ req, log: "suppressed"})
        await testFn(context, req)
        const res = context.res
        if (!res) throw fail("Context did not have a response object")
        expect(res.body.name).toEqual("Mark")
        expect(res.body.city).toEqual("Atlanta")
        expect(res.status).toEqual(200)
    })
})
```



