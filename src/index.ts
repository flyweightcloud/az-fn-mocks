/* eslint-disable @typescript-eslint/no-empty-function */
import {
    BindingDefinition,
    Context,
    ContextBindingData,
    ContextBindings,
    Cookie,
    ExecutionContext,
    Form,
    FormPart,
    HttpMethod,
    HttpRequest,
    HttpRequestHeaders,
    HttpRequestParams,
    HttpRequestQuery,
    HttpRequestUser,
    HttpResponseHeaders,
    HttpResponseSimple, 
    Logger,
    TraceContext
} from "@azure/functions";

const suppressedLogger: Logger = Object.assign(
    (..._args: any[]) => { },
    {
        error: (..._args: any[]) => { },
        warn: (..._args: any[]) => { },
        info: (..._args: any[]) => { },
        verbose: (..._args: any[]) => { },
    }
)

const defaultLogger = Object.assign(console.log, {
    error: console.error,
    warn: console.warn,
    info: console.info,
    verbose: console.info,
})

export type AzureContextMockOptions = {
    log?: "console" | "suppressed" | Logger
    req?: HttpRequest
}

export class AzureContextMock implements Context {
    invocationId = "";
    executionContext: ExecutionContext = {
        functionName: "",
        invocationId: "",
        functionDirectory: "",
        retryContext: null,
    };
    bindings: ContextBindings = {};
    bindingData: ContextBindingData = {
        invocationId: ""
    };
    traceContext: TraceContext = {
        attributes: {},
        traceparent: null,
        tracestate: null,
    };
    bindingDefinitions: BindingDefinition[] = [];
    log: Logger = defaultLogger
    constructor(opts?: AzureContextMockOptions) {
        if (opts?.req) {
            this.req = opts.req
        }
        if (opts?.log) {
            if (opts.log === "console") this.log = defaultLogger
            else if (opts.log === "suppressed") this.log = suppressedLogger
            else this.log = opts.log
        }
    }
    done(_err?: string | Error, _result?: any): void {
        throw new Error("context.done should no longer be used in Azure Functions > 2.x");
    }
    req?: HttpRequest = new TestHttpRequest();
    res?: { [key: string]: any; } = new TestHttpResponse();
}

export type TestHttpRequestOptions = {
    method?: HttpMethod
    url?: string
    headers?: HttpRequestHeaders
    query?: HttpRequestQuery
    params?: HttpRequestParams
    body?: any
}

export class TestHttpRequest implements HttpRequest {
    method: HttpMethod | null = "GET";
    url = "";
    originalUrl = "";
    headers: HttpRequestHeaders = {};
    query: HttpRequestQuery = {};
    params: HttpRequestParams = {};
    body?: any;
    rawBody?: any;
    bufferBody?: Buffer;
    user: HttpRequestUser | null = null;

    constructor(opts?: TestHttpRequestOptions) {
        if (opts) {
            Object.assign(this, opts);
        }
    }

    get(field: string): string | undefined {
        return this.headers && this.headers[field.toLowerCase()];
    }

    parseFormBody(): Form {
        // Todo: Provide a mock Form
        throw new Error("This should be mocked using MockForm")
    }
}

export class TestHttpResponse implements HttpResponseSimple {
    headers: HttpResponseHeaders = {};
    cookies: Cookie[] = [];
    body: any = "";
    /**
     * HTTP response status code.
     * This property takes precedence over the `status` property
     * @default 200
     */
    statusCode: number | string = 200;
    /**
     * HTTP response status code
     * The same as `statusCode`. This property is ignored if `statusCode` is set
     * @default 200
     */
    status: number | string = 200;
    enableContentNegotiation?: boolean = false;
}

/**
 * Taken mostly verbatim from https://github.com/Azure/azure-functions-nodejs-library/blob/949472a6aad0858cbf146079d1e724aa20c2ff94/src/parsers/parseForm.ts#L36
 * This isn't available yet in the stable @azure/functions, so we just use a copy
 * Example use:
 * ```
 * const form = new MockForm([['name', 'Mark'],['city', 'Atlanta']])
 * context.req.parseFormBody = jest.fn().mockReturnValue(form)
 * ```
 */
export class MockForm implements Form {
    #parts: [string, FormPart][];
    constructor(parts: [string, FormPart | string][]) {
        this.#parts = parts.map(([key, val]) => {
            if (typeof val === "string") {
                return [key, { value: Buffer.from(val) }]
            }
            return [key, val] as [string, FormPart]
        })
    }

    get(name: string): FormPart | null {
        for (const [key, value] of this.#parts) {
            if (key === name) {
                return value;
            }
        }
        return null;
    }

    getAll(name: string): FormPart[] {
        const result: FormPart[] = [];
        for (const [key, value] of this.#parts) {
            if (key === name) {
                result.push(value);
            }
        }
        return result;
    }

    has(name: string): boolean {
        for (const [key] of this.#parts) {
            if (key === name) {
                return true;
            }
        }
        return false;
    }

    [Symbol.iterator](): Iterator<[string, FormPart]> {
        return this.#parts[Symbol.iterator]();
    }

    get length(): number {
        return this.#parts.length;
    }
}
