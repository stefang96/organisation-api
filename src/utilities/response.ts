import { Response } from "express";

export interface IJSONError {
  code?: number;
  help_url?: string;
  message?: string;
}

export interface IJSONMetaResponse {
  limit?: number;
  offset?: number;
  fields?: string;
  sort?: string;
  search?: string;
  total?: number;
  page?: number;
}

export interface IJSONBuilder<T> {
  setData(data: T): this;

  setStatus(status: boolean): this;

  setMeta(...metaEntry: IJSONMetaResponse[]): this;

  setError(errors: IJSONError[]): this;

  build(): Response;

  setResponse(response: Response): this;

  setResponseStatus(status: number): this;
}

// tslint:disable
export class JSONResponse<T> {
  private status: boolean;
  private result?: T;
  private meta?: IJSONMetaResponse;
  private errors?: IJSONError[];

  constructor() {
    this.status = true;
    this.meta = {};
  }
}

export class ResponseBuilder<T> implements IJSONBuilder<T> {
  private responseObject: JSONResponse<T>;
  private response: Response;

  constructor() {
    this.responseObject = new JSONResponse<T>();
  }

  public setData(data: T) {
    Object.assign(this.responseObject, {
      result: data,
    });

    return this;
  }

  public setStatus(status: boolean) {
    Object.assign(this.responseObject, {
      status,
    });

    return this;
  }

  public setMeta(...metaEntry: IJSONMetaResponse[]) {
    Object.assign(this.responseObject, {
      meta: Object.assign({}, ...this.clearEntry(metaEntry)),
    });
    return this;
  }

  public setError(errors: IJSONError[]) {
    Object.assign(this.responseObject, {
      errors,
    });

    return this;
  }

  public setResponse(response: Response) {
    this.response = response;

    return this;
  }

  public setResponseStatus(status: number) {
    this.response.status(status);

    return this;
  }

  public build() {
    return this.response.json(this.responseObject);
  }

  private clearEntry(metaData: IJSONMetaResponse[]) {
    return metaData.map((meta) => {
      for (const key in meta) {
        if (typeof meta[key] === "undefined") {
          delete meta[key];
        }
      }

      return meta;
    });
  }
}

/* tslint:disable */
